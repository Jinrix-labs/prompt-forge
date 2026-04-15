import { randomBytes } from 'crypto';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
    getLinkedInRedirectUri,
    LINKEDIN_OAUTH_STATE_COOKIE,
} from '@/lib/linkedin-oauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
        console.error('LINKEDIN_CLIENT_ID is not set');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const state = randomBytes(16).toString('hex');
    const redirectUri = getLinkedInRedirectUri();

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        scope: 'openid profile email w_member_social',
    });

    const location = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    const res = NextResponse.redirect(location);

    res.cookies.set(LINKEDIN_OAUTH_STATE_COOKIE, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 600,
    });

    return res;
}
