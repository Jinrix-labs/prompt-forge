import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is a developer (free Pro access)
        const devUserIds = process.env.DEV_USER_IDS?.split(',').map(id => id.trim()) || []
        if (devUserIds.includes(userId)) {
            return NextResponse.json({
                ugc: {
                    used: 0,
                    limit: -1,
                    isPro: true,
                },
                regular: {
                    used: 0,
                    limit: -1,
                    isPro: true,
                },
            });
        }

        // Get user subscription status
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('subscription_status')
            .eq('id', userId)
            .single();

        // If user doesn't exist, create them as free tier
        if (userError && userError.code === 'PGRST116') {
            const { data: newUser } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    subscription_status: 'free',
                })
                .select('subscription_status')
                .single();

            const isPro = newUser?.subscription_status === 'pro' || false;

            return NextResponse.json({
                ugc: {
                    used: 0,
                    limit: isPro ? 200 : 5,
                    isPro,
                },
                regular: {
                    used: 0,
                    limit: isPro ? -1 : 10,
                    isPro,
                },
            });
        }

        if (userError) {
            console.error('Error fetching user:', userError);
            return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
        }

        const isPro = user?.subscription_status === 'pro' || false;

        // Get UGC usage
        const ugcTimeframe = isPro
            ? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString() // Start of month
            : new Date(new Date().setHours(0, 0, 0, 0)).toISOString(); // Start of day

        const { count: ugcCount } = await supabase
            .from('usage')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('prompt_type', 'ugc')
            .gte('created_at', ugcTimeframe);

        // Get regular usage
        const regularTimeframe = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

        const { count: regularCount } = await supabase
            .from('usage')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('prompt_type', 'regular')
            .gte('created_at', regularTimeframe);

        return NextResponse.json({
            ugc: {
                used: ugcCount || 0,
                limit: isPro ? 200 : 5,
                isPro,
            },
            regular: {
                used: isPro ? 0 : (regularCount || 0),
                limit: isPro ? -1 : 10, // -1 = unlimited
                isPro,
            },
        });
    } catch (error: any) {
        console.error('Usage fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
