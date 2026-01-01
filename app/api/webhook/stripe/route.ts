import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
})

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
                break

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                await handleSubscriptionChange(event.data.object as Stripe.Subscription)
                break

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object as Stripe.Invoice)
                break
        }

        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('Webhook handler error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id || session.metadata?.userId || session.metadata?.clerk_user_id
    if (!userId) {
        console.error('No userId found in checkout session')
        return
    }

    const type = session.metadata?.type

    if (type === 'subscription' && session.subscription) {
        // Handle subscription
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = subscription.items.data[0].price.id

        // Determine tier based on price
        let tier = 'pro'
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) {
            tier = 'premium'
        }

        // Update user_subscriptions table
        await supabaseAdmin
            .from('user_subscriptions')
            .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription.id,
                tier,
                status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id'
            })

        // Also update users table for backward compatibility
        await supabaseAdmin
            .from('users')
            .update({
                subscription_status: tier,
                stripe_subscription_id: subscription.id,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

    } else if (type === 'credits') {
        // Handle credit purchase
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
        const priceId = lineItems.data[0].price?.id

        // Determine credits based on price
        let credits = 0
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_CREDITS_100_PRICE_ID) {
            credits = 100
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_CREDITS_500_PRICE_ID) {
            credits = 500
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_CREDITS_1500_PRICE_ID) {
            credits = 1500
        }

        if (credits > 0) {
            // Get current credits
            const { data: existing } = await supabaseAdmin
                .from('user_credits')
                .select('credits')
                .eq('user_id', userId)
                .single()

            const currentCredits = existing?.credits || 0

            // Add credits
            await supabaseAdmin
                .from('user_credits')
                .upsert({
                    user_id: userId,
                    credits: currentCredits + credits,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id'
                })
        }
    } else {
        // Legacy: Handle old checkout format (backward compatibility)
        if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
            
            await supabaseAdmin
                .from('users')
                .update({
                    subscription_status: 'pro',
                    stripe_subscription_id: subscription.id,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId)
        }
    }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
    const { data: sub } = await supabaseAdmin
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

    if (!sub) {
        // Fallback: try to find by customer_id
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('stripe_customer_id', subscription.customer as string)
            .single()

        if (!user) return

        const priceId = subscription.items.data[0].price.id
        let tier = 'pro'
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) {
            tier = 'premium'
        }

        const status = subscription.status === 'active' ? tier : 'free'

        await supabaseAdmin
            .from('users')
            .update({
                subscription_status: status,
                stripe_subscription_id: subscription.status === 'active' ? subscription.id : null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        return
    }

    const priceId = subscription.items.data[0].price.id
    let tier = 'pro'
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) {
        tier = 'premium'
    }

    const status = subscription.status === 'active' ? tier : 'free'

    // Update user_subscriptions table
    await supabaseAdmin
        .from('user_subscriptions')
        .update({
            tier: subscription.status === 'active' ? tier : 'free',
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)

    // Also update users table for backward compatibility
    await supabaseAdmin
        .from('users')
        .update({
            subscription_status: status,
            stripe_subscription_id: subscription.status === 'active' ? subscription.id : null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', sub.user_id)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return

    const { data: sub } = await supabaseAdmin
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', invoice.subscription as string)
        .single()

    if (sub) {
        await supabaseAdmin
            .from('user_subscriptions')
            .update({
                status: 'past_due',
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', invoice.subscription as string)
    }
}


