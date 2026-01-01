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

        // Check if user is a developer (free Pro access)
        const devUserIds = process.env.DEV_USER_IDS?.split(',').map(id => id.trim()) || [];
        if (devUserIds.includes(userId)) {
            return NextResponse.json({ tier: 'pro', isDev: true });
        }

        // Get subscription from user_subscriptions table
        const { data: subscription } = await supabaseAdmin
            .from('user_subscriptions')
            .select('tier, status, current_period_end')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

        if (subscription) {
            return NextResponse.json({
                tier: subscription.tier,
                status: subscription.status,
                current_period_end: subscription.current_period_end,
            });
        }

        // Fallback: check users table for backward compatibility
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('subscription_status')
            .eq('id', userId)
            .single();

        const tier = user?.subscription_status === 'pro' || user?.subscription_status === 'premium'
            ? user.subscription_status
            : 'free';

        return NextResponse.json({ tier });
    } catch (error: any) {
        console.error('Subscription API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

