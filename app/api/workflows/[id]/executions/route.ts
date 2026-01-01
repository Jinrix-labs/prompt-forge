import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify user owns the workflow
        const { data: workflow } = await supabaseAdmin
            .from('workflows')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!workflow || workflow.user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get executions for this workflow
        const { data: executions, error } = await supabaseAdmin
            .from('workflow_executions')
            .select('*')
            .eq('workflow_id', id)
            .eq('user_id', userId)
            .order('started_at', { ascending: false })
            .limit(50); // Limit to last 50 executions

        if (error) {
            console.error('Error fetching executions:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ executions: executions || [] });
    } catch (error: any) {
        console.error('Executions API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

