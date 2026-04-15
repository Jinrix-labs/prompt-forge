import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('connected_accounts')
            .select('platform, platform_username, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('connected_accounts list error:', error);
            return NextResponse.json({ error: 'Failed to load accounts' }, { status: 500 });
        }

        const accounts = (data || []).map((row) => ({
            platform: row.platform,
            platform_username: row.platform_username ?? '',
            created_at: row.created_at,
        }));

        return NextResponse.json({ accounts });
    } catch (e) {
        console.error('GET /api/connected-accounts:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
