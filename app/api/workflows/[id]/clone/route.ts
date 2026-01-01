import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Clone a public workflow
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Get the workflow to clone
        const { data: original, error: fetchError } = await supabaseAdmin
            .from('workflows')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !original) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
        }

        // Can only clone public workflows (unless it's your own)
        if (!original.is_public && original.user_id !== userId) {
            return NextResponse.json({ error: 'Cannot clone private workflow' }, { status: 403 });
        }

        // Create cloned workflow
        const { data, error } = await supabaseAdmin
            .from('workflows')
            .insert({
                user_id: userId,
                name: `${original.name} (Copy)`,
                description: original.description,
                steps: original.steps,
                is_public: false, // Clones are private by default
            })
            .select()
            .single();

        if (error) {
            console.error('Error cloning workflow:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ workflow: data }, { status: 201 });

    } catch (error: any) {
        console.error('Workflow clone error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

