import { auth } from '@clerk/nextjs/server';
import { TwitterApi } from 'twitter-api-v2';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/instagram-oauth';
import {
    getTwitterRedirectUri,
    TWITTER_CODE_VERIFIER_COOKIE,
    TWITTER_OAUTH_STATE_COOKIE,
} from '@/lib/twitter-oauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function redirectWithTwitterCookiesCleared(pathWithQuery: string): NextResponse {
    const base = getAppBaseUrl();
    const target = pathWithQuery.startsWith('http')
        ? pathWithQuery
        : `${base}${pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`}`;
    const res = NextResponse.redirect(target);
    const clear = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 0,
    };
    res.cookies.set(TWITTER_OAUTH_STATE_COOKIE, '', clear);
    res.cookies.set(TWITTER_CODE_VERIFIER_COOKIE, '', clear);
    return res;
}

export async function GET(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const oauthError = searchParams.get('error');

    if (oauthError) {
        return redirectWithTwitterCookiesCleared('/dashboard?error=twitter_denied');
    }

    if (!code || !state) {
        return redirectWithTwitterCookiesCleared('/dashboard?error=twitter_missing_params');
    }

    const savedState = request.cookies.get(TWITTER_OAUTH_STATE_COOKIE)?.value;
    const codeVerifier = request.cookies.get(TWITTER_CODE_VERIFIER_COOKIE)?.value;

    if (!savedState || savedState !== state || !codeVerifier) {
        return redirectWithTwitterCookiesCleared('/dashboard?error=twitter_invalid_state');
    }

    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        console.error('Twitter OAuth: missing TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET');
        return redirectWithTwitterCookiesCleared('/dashboard?error=server_config');
    }

    const redirectUri = getTwitterRedirectUri();
    const client = new TwitterApi({ clientId, clientSecret });

    try {
        let accessToken: string;
        let refreshToken: string | undefined;
        let expiresIn: number;

        try {
            console.log('Twitter creds check:', {
                hasClientId: !!process.env.TWITTER_CLIENT_ID,
                hasClientSecret: !!process.env.TWITTER_CLIENT_SECRET,
                clientIdLength: process.env.TWITTER_CLIENT_ID?.length,
            });
            const oauthTokens = await client.loginWithOAuth2({
                code,
                codeVerifier,
                redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
            });
            accessToken = oauthTokens.accessToken;
            refreshToken = oauthTokens.refreshToken;
            expiresIn = oauthTokens.expiresIn;
        } catch (err) {
            console.error('Twitter OAuth error:', JSON.stringify(err, null, 2));
            return redirectWithTwitterCookiesCleared('/dashboard?error=twitter_connect_failed');
        }

        const twitterClient = new TwitterApi(accessToken);
        const { data: twitterUser } = await twitterClient.v2.me();

        const now = new Date().toISOString();
        const { error: dbError } = await supabaseAdmin.from('connected_accounts').upsert(
            {
                user_id: userId,
                platform: 'twitter',
                platform_user_id: String(twitterUser.id),
                platform_username: twitterUser.username,
                access_token: accessToken,
                refresh_token: refreshToken ?? null,
                token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
                updated_at: now,
            },
            { onConflict: 'user_id,platform' }
        );

        if (dbError) {
            console.error('connected_accounts upsert (twitter):', dbError);
            return redirectWithTwitterCookiesCleared('/dashboard?error=twitter_db_error');
        }

        return redirectWithTwitterCookiesCleared('/dashboard?twitter=connected');
    } catch (err) {
        console.error('Twitter OAuth callback error:', err);
        return redirectWithTwitterCookiesCleared('/dashboard?error=twitter_connect_failed');
    }
}
