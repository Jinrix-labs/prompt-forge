import { auth } from '@clerk/nextjs/server';
import { TwitterApi } from 'twitter-api-v2';
import { NextResponse } from 'next/server';
import {
    getTwitterRedirectUri,
    TWITTER_OAUTH_TOKEN_COOKIE,
    TWITTER_OAUTH_TOKEN_SECRET_COOKIE,
} from '@/lib/twitter-oauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appKey = process.env.TWITTER_CONSUMER_KEY;
    const appSecret = process.env.TWITTER_CONSUMER_SECRET;
    if (!appKey || !appSecret) {
        console.error('TWITTER_CONSUMER_KEY or TWITTER_CONSUMER_SECRET is not set');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const redirectUri = getTwitterRedirectUri();
    const client = new TwitterApi({ appKey, appSecret });

    const { url, oauth_token, oauth_token_secret } = await client.generateAuthLink(redirectUri, {
        linkMode: 'authorize',
    });

    const res = NextResponse.redirect(url);
    const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 600,
    };
    res.cookies.set(TWITTER_OAUTH_TOKEN_COOKIE, oauth_token, cookieOpts);
    res.cookies.set(TWITTER_OAUTH_TOKEN_SECRET_COOKIE, oauth_token_secret, cookieOpts);
    return res;
}
