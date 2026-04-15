import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ALLOWED = new Set(['twitter', 'instagram', 'linkedin']);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
    _request: Request,
    context: { params: Promise<{ platform: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { platform } = await context.params;
        if (!platform || !ALLOWED.has(platform)) {
            return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('connected_accounts')
            .delete()
            .eq('user_id', userId)
            .eq('platform', platform);

        if (error) {
            console.error('connected_accounts delete error:', error);
            return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('DELETE /api/connected-accounts/[platform]:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
