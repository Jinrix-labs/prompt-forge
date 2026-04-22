import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { getAppBaseUrl } from '@/lib/instagram-oauth';
import {
    TWITTER_OAUTH_TOKEN_COOKIE,
    TWITTER_OAUTH_TOKEN_SECRET_COOKIE,
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
    res.cookies.set(TWITTER_OAUTH_TOKEN_COOKIE, '', clear);
    res.cookies.set(TWITTER_OAUTH_TOKEN_SECRET_COOKIE, '', clear);
    return res;
}

export async function GET(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const oauthToken = searchParams.get('oauth_token');
    const oauthVerifier = searchParams.get('oauth_verifier');
    const denied = searchParams.get('denied');

    if (denied) {
        return redirectWithTwitterCookiesCleared('/dashboard?error=twitter_denied');
    }

    if (!oauthToken || !oauthVerifier) {
        return redirectWithTwitterCookiesCleared('/dashboard?error=twitter_missing_params');
    }

    const storedOauthToken = request.cookies.get(TWITTER_OAUTH_TOKEN_COOKIE)?.value;
    const oauthTokenSecret = request.cookies.get(TWITTER_OAUTH_TOKEN_SECRET_COOKIE)?.value;

    if (!oauthTokenSecret || storedOauthToken !== oauthToken) {
        return redirectWithTwitterCookiesCleared('/dashboard?error=twitter_invalid_state');
    }

    const appKey = process.env.TWITTER_CONSUMER_KEY;
    const appSecret = process.env.TWITTER_CONSUMER_SECRET;
    if (!appKey || !appSecret) {
        console.error('Twitter OAuth: missing TWITTER_CONSUMER_KEY or TWITTER_CONSUMER_SECRET');
        return redirectWithTwitterCookiesCleared('/dashboard?error=server_config');
    }

    try {
        try {
            const client = new TwitterApi({
                appKey,
                appSecret,
                accessToken: oauthToken,
                accessSecret: oauthTokenSecret,
            });
            const { accessToken, accessSecret, screenName, userId: twitterUserId } = await client.login(
                oauthVerifier
            );

            const now = new Date().toISOString();
            const { error: dbError } = await supabaseAdmin.from('connected_accounts').upsert(
                {
                    user_id: userId,
                    platform: 'twitter',
                    platform_user_id: String(twitterUserId),
                    platform_username: screenName,
                    access_token: accessToken,
                    refresh_token: accessSecret,
                    token_expires_at: null,
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
            if (err instanceof Error) {
                console.error('Twitter OAuth error:', err.message);
            } else {
                console.error('Twitter OAuth error:', err);
            }
            return redirectWithTwitterCookiesCleared('/dashboard?error=twitter_connect_failed');
        }
    } catch (err) {
        console.error('Twitter OAuth callback error:', err);
        return redirectWithTwitterCookiesCleared('/dashboard?error=twitter_connect_failed');
    }
}
