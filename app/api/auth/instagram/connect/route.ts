import { randomBytes } from 'crypto';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
    getInstagramRedirectUri,
    INSTAGRAM_OAUTH_STATE_COOKIE,
} from '@/lib/instagram-oauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.NEXT_PUBLIC_META_APP_ID;
    if (!clientId) {
        console.error('NEXT_PUBLIC_META_APP_ID is not set');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const redirectUri = getInstagramRedirectUri();
    const state = randomBytes(16).toString('hex');

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'instagram_basic,instagram_content_publish',
        response_type: 'code',
        state,
    });

    const location = `https://www.facebook.com/dialog/oauth?${params.toString()}`;
    const res = NextResponse.redirect(location);

    res.cookies.set(INSTAGRAM_OAUTH_STATE_COOKIE, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 600,
    });

    return res;
}
