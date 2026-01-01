import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { clerkClient } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-10-29.clover',
});

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { priceId, type } = await req.json(); // type: 'subscription' or 'credits'

        if (!priceId || !type) {
            return NextResponse.json({ error: 'Missing priceId or type' }, { status: 400 });
        }

        // Get or create Stripe customer
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('stripe_customer_id, email')
            .eq('id', userId)
            .single();

        let stripeCustomerId = user?.stripe_customer_id as string | undefined;

        if (!stripeCustomerId) {
            const client = await clerkClient();
            const clerkUser = await client.users.getUser(userId);

            const customer = await stripe.customers.create({
                email: clerkUser.emailAddresses[0]?.emailAddress,
                metadata: {
                    clerk_user_id: userId,
                },
            });

            stripeCustomerId = customer.id;

            await supabaseAdmin
                .from('users')
                .upsert({
                    id: userId,
                    email: clerkUser.emailAddresses[0]?.emailAddress,
                    stripe_customer_id: stripeCustomerId,
                    subscription_status: user?.subscription_status || 'free',
                });
        }

        const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            client_reference_id: userId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: type === 'subscription' ? 'subscription' : 'payment',
            success_url: `${baseUrl}/workflows?success=true`,
            cancel_url: `${baseUrl}/workflows?canceled=true`,
            metadata: {
                userId,
                type,
            },
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

