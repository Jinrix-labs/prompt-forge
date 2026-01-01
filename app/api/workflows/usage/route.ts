import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Get current month string
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const month = getCurrentMonth();

        const { data, error } = await supabaseAdmin
            .from('user_usage')
            .select('*')
            .eq('user_id', userId)
            .eq('month', month)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows found
            console.error('Error fetching workflow usage:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            workflow_runs: data?.workflow_runs || 0,
            month,
        });

    } catch (error: any) {
        console.error('Workflow usage error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

