import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TwitterApi } from 'twitter-api-v2';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Refresh tokens expiring within 7 days.
const REFRESH_THRESHOLD_DAYS = 7;

type RefreshResult = {
    platform: string;
    user_id: string;
    success: boolean;
    error?: string;
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function refreshInstagramToken(
    accountId: string,
    accessToken: string
): Promise<{ access_token: string; expires_in: number } | null> {
    try {
        const res = await fetch(
            `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
        );

        if (!res.ok) {
            const err = (await res.json()) as { error?: { message?: string } };
            throw new Error(err?.error?.message || 'Instagram refresh failed');
        }

        const data = (await res.json()) as { access_token: string; expires_in: number };
        return {
            access_token: data.access_token,
            expires_in: data.expires_in,
        };
    } catch (err: unknown) {
        console.error(`Instagram refresh failed for account ${accountId}:`, err);
        return null;
    }
}

async function refreshTwitterToken(
    accountId: string,
    refreshToken: string
): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
} | null> {
    try {
        const client = new TwitterApi({
            clientId: process.env.TWITTER_CLIENT_ID!,
            clientSecret: process.env.TWITTER_CLIENT_SECRET!,
        });

        const {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn,
        } = await client.refreshOAuth2Token(refreshToken);

        return {
            access_token: accessToken,
            refresh_token: newRefreshToken ?? refreshToken,
            expires_in: expiresIn,
        };
    } catch (err: unknown) {
        console.error(`Twitter refresh failed for account ${accountId}:`, err);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + REFRESH_THRESHOLD_DAYS);

        const { data: accounts, error } = await supabaseAdmin
            .from('connected_accounts')
            .select('id, user_id, platform, access_token, refresh_token, token_expires_at')
            .in('platform', ['instagram', 'twitter'])
            .lt('token_expires_at', thresholdDate.toISOString())
            .not('token_expires_at', 'is', null);

        if (error) {
            console.error('Failed to fetch expiring accounts:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!accounts || accounts.length === 0) {
            return NextResponse.json({
                message: 'No tokens need refreshing',
                refreshed: 0,
            });
        }

        const results: RefreshResult[] = [];

        for (const account of accounts) {
            if (account.platform === 'instagram') {
                const refreshed = await refreshInstagramToken(account.id, account.access_token);

                if (refreshed) {
                    const { error: updateError } = await supabaseAdmin
                        .from('connected_accounts')
                        .update({
                            access_token: refreshed.access_token,
                            token_expires_at: new Date(
                                Date.now() + refreshed.expires_in * 1000
                            ).toISOString(),
                        })
                        .eq('id', account.id);

                    if (updateError) {
                        results.push({
                            platform: 'instagram',
                            user_id: account.user_id,
                            success: false,
                            error: updateError.message,
                        });
                        continue;
                    }

                    results.push({
                        platform: 'instagram',
                        user_id: account.user_id,
                        success: true,
                    });
                } else {
                    results.push({
                        platform: 'instagram',
                        user_id: account.user_id,
                        success: false,
                        error: 'Refresh failed',
                    });
                }
            }

            if (account.platform === 'twitter') {
                if (!account.refresh_token) {
                    results.push({
                        platform: 'twitter',
                        user_id: account.user_id,
                        success: false,
                        error: 'No refresh token stored',
                    });
                    continue;
                }

                const refreshed = await refreshTwitterToken(account.id, account.refresh_token);

                if (refreshed) {
                    const { error: updateError } = await supabaseAdmin
                        .from('connected_accounts')
                        .update({
                            access_token: refreshed.access_token,
                            refresh_token: refreshed.refresh_token,
                            token_expires_at: new Date(
                                Date.now() + refreshed.expires_in * 1000
                            ).toISOString(),
                        })
                        .eq('id', account.id);

                    if (updateError) {
                        results.push({
                            platform: 'twitter',
                            user_id: account.user_id,
                            success: false,
                            error: updateError.message,
                        });
                        continue;
                    }

                    results.push({
                        platform: 'twitter',
                        user_id: account.user_id,
                        success: true,
                    });
                } else {
                    results.push({
                        platform: 'twitter',
                        user_id: account.user_id,
                        success: false,
                        error: 'Refresh failed',
                    });
                }
            }
        }

        const succeeded = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        return NextResponse.json({
            message: 'Token refresh complete',
            total: accounts.length,
            succeeded,
            failed,
            results,
        });
    } catch (err: unknown) {
        console.error('GET /api/cron/refresh-tokens:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
