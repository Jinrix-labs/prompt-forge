import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List all workflows for the user
export async function GET(req: Request) {
    try {
        const { userId } = await auth(); // This will be null if not signed in
        const { searchParams } = new URL(req.url);
        const includePublic = searchParams.get('public') === 'true';

        let query = supabaseAdmin
            .from('workflows')
            .select('*')
            .order('created_at', { ascending: false });

        if (includePublic) {
            // Viewing public templates
            if (!userId) {
                // Not signed in - only show public workflows
                query = query.eq('is_public', true);
            } else {
                // Signed in - show user's workflows + public workflows
                query = query.or(`user_id.eq.${userId},is_public.eq.true`);
            }
        } else {
            // Private view - requires auth
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            // Just user's workflows
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching workflows:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ workflows: data || [] });

    } catch (error: any) {
        console.error('Workflow GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a new workflow
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, steps, requiredInputs, is_public } = body;

        if (!name || !steps) {
            return NextResponse.json(
                { error: 'Name and steps are required' },
                { status: 400 }
            );
        }

        if (!Array.isArray(steps) || steps.length === 0) {
            return NextResponse.json(
                { error: 'Steps must be a non-empty array' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('workflows')
            .insert({
                user_id: userId,
                name,
                description: description || '',
                steps,
                requiredInputs: requiredInputs || [],
                is_public: is_public || false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating workflow:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ workflow: data }, { status: 201 });

    } catch (error: any) {
        console.error('Workflow POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

