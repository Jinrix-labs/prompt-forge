import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { publishPost, type ConnectedAccount, type Platform } from '@/lib/publisher';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_PLATFORMS = ['twitter', 'instagram', 'linkedin'] as const satisfies readonly Platform[];
const VALID_STATUSES = ['published', 'scheduled', 'draft'] as const;
const LIST_STATUSES = ['published', 'scheduled', 'draft', 'failed'] as const;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isPlatform(value: unknown): value is Platform {
    return typeof value === 'string' && (VALID_PLATFORMS as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = (await request.json()) as Record<string, unknown>;
        const { content, platforms, image_url, scheduled_at, status } = body;

        if (typeof content !== 'string' || !content.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const trimmedContent = content.trim();

        if (!Array.isArray(platforms) || platforms.length === 0 || !platforms.every(isPlatform)) {
            return NextResponse.json(
                { error: 'At least one valid platform is required' },
                { status: 400 }
            );
        }

        if (typeof status !== 'string' || !(VALID_STATUSES as readonly string[]).includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        if (status === 'scheduled') {
            if (typeof scheduled_at !== 'string' || !scheduled_at.trim()) {
                return NextResponse.json(
                    { error: 'scheduled_at is required for scheduled posts' },
                    { status: 400 }
                );
            }
        }

        let scheduledAtIso: string | null = null;
        if (typeof scheduled_at === 'string' && scheduled_at.trim()) {
            const d = new Date(scheduled_at);
            if (Number.isNaN(d.getTime())) {
                return NextResponse.json({ error: 'Invalid scheduled_at' }, { status: 400 });
            }
            scheduledAtIso = d.toISOString();
        }

        const imageUrl =
            typeof image_url === 'string' && image_url.trim() ? image_url.trim() : null;

        const { data: post, error: insertError } = await supabaseAdmin
            .from('posts')
            .insert({
                user_id: userId,
                content: trimmedContent,
                platforms,
                image_url: imageUrl,
                scheduled_at: scheduledAtIso,
                status,
            })
            .select()
            .single();

        if (insertError || !post) {
            console.error('posts insert error:', insertError);
            return NextResponse.json(
                { error: insertError?.message ?? 'Failed to save post' },
                { status: 500 }
            );
        }

        if (status === 'published') {
            const { data: accounts, error: accountsError } = await supabaseAdmin
                .from('connected_accounts')
                .select('platform, platform_user_id, access_token, refresh_token')
                .eq('user_id', userId)
                .in('platform', platforms);

            if (accountsError || !accounts || accounts.length === 0) {
                await supabaseAdmin
                    .from('posts')
                    .update({
                        status: 'failed',
                        error_message: accountsError?.message ?? 'No connected accounts found',
                    })
                    .eq('id', post.id);

                return NextResponse.json(
                    { error: 'No connected accounts found for selected platforms' },
                    { status: 400 }
                );
            }

            const mappedAccounts: ConnectedAccount[] = accounts.map((row) => ({
                platform: row.platform as Platform,
                platform_user_id: row.platform_user_id,
                access_token: row.access_token,
                ...(row.refresh_token ? { refresh_token: row.refresh_token } : {}),
            }));

            const results = await publishPost(
                mappedAccounts,
                platforms,
                trimmedContent,
                imageUrl ?? undefined
            );

            const failures = results.filter((r) => !r.success);

            if (failures.length === platforms.length) {
                await supabaseAdmin
                    .from('posts')
                    .update({
                        status: 'failed',
                        error_message: failures.map((f) => `${f.platform}: ${f.error}`).join(', '),
                    })
                    .eq('id', post.id);

                return NextResponse.json(
                    {
                        error: 'Publishing failed on all platforms',
                        details: failures,
                    },
                    { status: 500 }
                );
            }

            if (failures.length > 0) {
                await supabaseAdmin
                    .from('posts')
                    .update({
                        error_message: `Partial failure: ${failures.map((f) => `${f.platform}: ${f.error}`).join(', ')}`,
                    })
                    .eq('id', post.id);
            }

            let postOut = post;
            if (failures.length > 0) {
                const { data: refreshed } = await supabaseAdmin
                    .from('posts')
                    .select()
                    .eq('id', post.id)
                    .single();
                if (refreshed) postOut = refreshed;
            }

            return NextResponse.json(
                {
                    success: true,
                    post: postOut,
                    results,
                    partialFailure: failures.length > 0,
                },
                { status: 201 }
            );
        }

        return NextResponse.json({ success: true, post }, { status: 201 });
    } catch (e) {
        console.error('POST /api/posts:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = supabaseAdmin
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (status) {
            if (!(LIST_STATUSES as readonly string[]).includes(status)) {
                return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
            }
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ posts: data });
    } catch (e) {
        console.error('GET /api/posts:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
