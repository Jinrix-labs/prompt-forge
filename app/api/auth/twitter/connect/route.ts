import { auth } from '@clerk/nextjs/server';
import { TwitterApi } from 'twitter-api-v2';
import { NextResponse } from 'next/server';
import {
    getTwitterRedirectUri,
    TWITTER_CODE_VERIFIER_COOKIE,
    TWITTER_OAUTH_STATE_COOKIE,
} from '@/lib/twitter-oauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        console.error('TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET is not set');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const redirectUri = getTwitterRedirectUri();
    const client = new TwitterApi({ clientId, clientSecret });

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(redirectUri, {
        scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    });

    const res = NextResponse.redirect(url);
    const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 600,
    };
    res.cookies.set(TWITTER_OAUTH_STATE_COOKIE, state, cookieOpts);
    res.cookies.set(TWITTER_CODE_VERIFIER_COOKIE, codeVerifier, cookieOpts);
    return res;
}
