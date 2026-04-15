import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { publishPost, type ConnectedAccount, type Platform } from '@/lib/publisher';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function mapConnectedAccounts(
    rows: {
        platform: string;
        platform_user_id: string;
        access_token: string;
        refresh_token: string | null;
    }[]
): ConnectedAccount[] {
    return rows.map((row) => ({
        platform: row.platform as Platform,
        platform_user_id: row.platform_user_id,
        access_token: row.access_token,
        ...(row.refresh_token ? { refresh_token: row.refresh_token } : {}),
    }));
}

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: duePosts, error } = await supabaseAdmin
        .from('posts')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

    if (error) {
        console.error('Cron: failed to fetch due posts', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!duePosts || duePosts.length === 0) {
        return NextResponse.json({ message: 'No posts due', processed: 0 });
    }

    let processed = 0;
    let failed = 0;

    for (const post of duePosts) {
        const platforms = post.platforms as Platform[];

        const { data: accounts } = await supabaseAdmin
            .from('connected_accounts')
            .select('platform, platform_user_id, access_token, refresh_token')
            .eq('user_id', post.user_id)
            .in('platform', post.platforms);

        if (!accounts || accounts.length === 0) {
            await supabaseAdmin
                .from('posts')
                .update({
                    status: 'failed',
                    error_message: 'No connected accounts found',
                })
                .eq('id', post.id);
            failed++;
            continue;
        }

        const results = await publishPost(
            mapConnectedAccounts(accounts),
            platforms,
            post.content,
            post.image_url || undefined
        );

        const failures = results.filter((r) => !r.success);

        if (failures.length === post.platforms.length) {
            await supabaseAdmin
                .from('posts')
                .update({
                    status: 'failed',
                    error_message: failures.map((f) => `${f.platform}: ${f.error}`).join(', '),
                })
                .eq('id', post.id);
            failed++;
        } else {
            await supabaseAdmin
                .from('posts')
                .update({
                    status: 'published',
                    published_at: new Date().toISOString(),
                    error_message:
                        failures.length > 0
                            ? `Partial: ${failures.map((f) => `${f.platform}: ${f.error}`).join(', ')}`
                            : null,
                })
                .eq('id', post.id);
            processed++;
        }
    }

    return NextResponse.json({
        message: 'Cron complete',
        processed,
        failed,
        total: duePosts.length,
    });
}
