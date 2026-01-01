import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get a single workflow
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

        const { data, error } = await supabaseAdmin
            .from('workflows')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
        }

        // Check access: owner or public workflow
        if (data.user_id !== userId && !data.is_public) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ workflow: data });

    } catch (error: any) {
        console.error('Workflow GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update a workflow
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, description, steps, is_public } = body;

        // Check ownership
        const { data: existing, error: checkError } = await supabaseAdmin
            .from('workflows')
            .select('user_id')
            .eq('id', id)
            .single();

        if (checkError || !existing) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
        }

        if (existing.user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Validate steps if provided
        if (steps !== undefined) {
            if (!Array.isArray(steps) || steps.length === 0) {
                return NextResponse.json(
                    { error: 'Steps must be a non-empty array' },
                    { status: 400 }
                );
            }
        }

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (steps !== undefined) updateData.steps = steps;
        if (is_public !== undefined) updateData.is_public = is_public;

        const { data, error } = await supabaseAdmin
            .from('workflows')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating workflow:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ workflow: data });

    } catch (error: any) {
        console.error('Workflow PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete a workflow
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check ownership
        const { data: existing, error: checkError } = await supabaseAdmin
            .from('workflows')
            .select('user_id')
            .eq('id', id)
            .single();

        if (checkError || !existing) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
        }

        if (existing.user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('workflows')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting workflow:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Workflow DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

