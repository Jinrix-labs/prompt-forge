import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
    getAppBaseUrl,
    getInstagramRedirectUri,
    INSTAGRAM_OAUTH_STATE_COOKIE,
} from '@/lib/instagram-oauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function redirectWithCookieClear(pathWithQuery: string): NextResponse {
    const base = getAppBaseUrl();
    const target = pathWithQuery.startsWith('http')
        ? pathWithQuery
        : `${base}${pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`}`;
    const res = NextResponse.redirect(target);
    res.cookies.set(INSTAGRAM_OAUTH_STATE_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });
    return res;
}

export async function GET(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const oauthError = searchParams.get('error');
    const oauthErrorReason = searchParams.get('error_reason');
    if (oauthError) {
        const q = new URLSearchParams({
            error: 'instagram_oauth_denied',
            ...(oauthErrorReason ? { reason: oauthErrorReason } : {}),
        });
        return redirectWithCookieClear(`/dashboard?${q.toString()}`);
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const cookieState = request.cookies.get(INSTAGRAM_OAUTH_STATE_COOKIE)?.value;

    if (!code) {
        return redirectWithCookieClear('/dashboard?error=no_code');
    }

    if (!state || !cookieState || state !== cookieState) {
        return redirectWithCookieClear('/dashboard?error=invalid_state');
    }

    const clientId = process.env.NEXT_PUBLIC_META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;
    if (!clientId || !clientSecret) {
        console.error('Instagram OAuth: missing NEXT_PUBLIC_META_APP_ID or META_APP_SECRET');
        return redirectWithCookieClear('/dashboard?error=server_config');
    }

    const redirectUri = getInstagramRedirectUri();

    try {
        const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
                code,
            }),
        });

        const tokenData = (await tokenRes.json()) as {
            access_token?: string;
            user_id?: number | string;
            error_message?: string;
        };

        if (!tokenRes.ok || !tokenData.access_token) {
            console.error('Instagram token exchange failed:', tokenData);
            return redirectWithCookieClear('/dashboard?error=instagram_connect_failed');
        }

        const { access_token: shortToken, user_id: igUserId } = tokenData;

        const longLivedUrl = new URL('https://graph.instagram.com/access_token');
        longLivedUrl.searchParams.set('grant_type', 'ig_exchange_token');
        longLivedUrl.searchParams.set('client_secret', clientSecret);
        longLivedUrl.searchParams.set('access_token', shortToken);

        const longLivedRes = await fetch(longLivedUrl.toString());
        const longLivedData = (await longLivedRes.json()) as {
            access_token?: string;
            expires_in?: number;
            error?: { message?: string };
        };

        if (!longLivedRes.ok || !longLivedData.access_token) {
            console.error('Instagram long-lived token failed:', longLivedData);
            return redirectWithCookieClear('/dashboard?error=instagram_connect_failed');
        }

        const longLivedToken = longLivedData.access_token;
        const expiresIn = longLivedData.expires_in ?? 60 * 24 * 60 * 60;

        const profileUrl = new URL('https://graph.instagram.com/me');
        profileUrl.searchParams.set('fields', 'id,username');
        profileUrl.searchParams.set('access_token', longLivedToken);

        const profileRes = await fetch(profileUrl.toString());
        const profileData = (await profileRes.json()) as {
            id?: string;
            username?: string;
            error?: { message?: string };
        };

        if (!profileRes.ok || profileData.username == null) {
            console.error('Instagram profile fetch failed:', profileData);
            return redirectWithCookieClear('/dashboard?error=instagram_connect_failed');
        }

        const now = new Date().toISOString();
        const { error: upsertError } = await supabaseAdmin.from('connected_accounts').upsert(
            {
                user_id: userId,
                platform: 'instagram',
                platform_user_id: String(igUserId ?? profileData.id ?? ''),
                platform_username: profileData.username,
                access_token: longLivedToken,
                token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
                updated_at: now,
            },
            { onConflict: 'user_id,platform' }
        );

        if (upsertError) {
            console.error('connected_accounts upsert error:', upsertError);
            return redirectWithCookieClear('/dashboard?error=db_error');
        }

        return redirectWithCookieClear('/dashboard?instagram=connected');
    } catch (err) {
        console.error('Instagram callback error:', err);
        return redirectWithCookieClear('/dashboard?error=instagram_connect_failed');
    }
}
