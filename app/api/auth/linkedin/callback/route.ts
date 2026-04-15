import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/instagram-oauth';
import {
    getLinkedInRedirectUri,
    LINKEDIN_OAUTH_STATE_COOKIE,
} from '@/lib/linkedin-oauth';

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
    res.cookies.set(LINKEDIN_OAUTH_STATE_COOKIE, '', {
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
    const oauthDesc = searchParams.get('error_description');
    if (oauthError) {
        const q = new URLSearchParams({
            error: 'linkedin_oauth_denied',
            ...(oauthDesc ? { reason: oauthDesc } : {}),
        });
        return redirectWithCookieClear(`/dashboard?${q.toString()}`);
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const cookieState = request.cookies.get(LINKEDIN_OAUTH_STATE_COOKIE)?.value;

    if (!code) {
        return redirectWithCookieClear('/dashboard?error=no_code');
    }

    if (!state || !cookieState || state !== cookieState) {
        return redirectWithCookieClear('/dashboard?error=invalid_state');
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        console.error('LinkedIn OAuth: missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET');
        return redirectWithCookieClear('/dashboard?error=server_config');
    }

    const redirectUri = getLinkedInRedirectUri();

    try {
        const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        const tokenData = (await tokenRes.json()) as {
            access_token?: string;
            expires_in?: number;
            error?: string;
            error_description?: string;
        };

        if (!tokenRes.ok || !tokenData.access_token) {
            console.error('LinkedIn token exchange failed:', tokenData);
            return redirectWithCookieClear('/dashboard?error=linkedin_connect_failed');
        }

        const accessToken = tokenData.access_token;
        const expiresIn = tokenData.expires_in ?? 60 * 24 * 60 * 60;

        const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const profileData = (await profileRes.json()) as {
            sub?: string;
            name?: string;
            email?: string;
        };

        if (!profileRes.ok || !profileData.sub) {
            console.error('LinkedIn userinfo failed:', profileData);
            return redirectWithCookieClear('/dashboard?error=linkedin_connect_failed');
        }

        const username =
            profileData.email?.split('@')[0] ||
            profileData.name?.replace(/\s+/g, '_').toLowerCase() ||
            profileData.sub;

        const now = new Date().toISOString();
        const { error: upsertError } = await supabaseAdmin.from('connected_accounts').upsert(
            {
                user_id: userId,
                platform: 'linkedin',
                platform_user_id: profileData.sub,
                platform_username: username,
                access_token: accessToken,
                token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
                updated_at: now,
            },
            { onConflict: 'user_id,platform' }
        );

        if (upsertError) {
            console.error('connected_accounts upsert error:', upsertError);
            return redirectWithCookieClear('/dashboard?error=db_error');
        }

        return redirectWithCookieClear('/dashboard?linkedin=connected');
    } catch (err) {
        console.error('LinkedIn callback error:', err);
        return redirectWithCookieClear('/dashboard?error=linkedin_connect_failed');
    }
}
