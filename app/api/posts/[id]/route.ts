import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
        }

        // Verify the post belongs to this user before deleting
        const { data: post, error: fetchError } = await supabaseAdmin
            .from('posts')
            .select('id, status, user_id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (fetchError || !post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Published posts are already live so deletion is just a record cleanup
        const { error: deleteError } = await supabaseAdmin
            .from('posts')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('DELETE /api/posts/[id]:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
