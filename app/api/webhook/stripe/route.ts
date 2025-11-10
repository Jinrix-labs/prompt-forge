import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`)
        return NextResponse.json({ error: err.message }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.clerk_user_id

                if (userId && session.subscription) {
                    await supabase
                        .from('users')
                        .upsert({
                            id: userId,
                            subscription_status: 'pro',
                            stripe_subscription_id: session.subscription as string,
                            updated_at: new Date().toISOString(),
                        })
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                const status = subscription.status === 'active' ? 'pro' : 'free'

                // First get the user by customer ID to get their user ID
                const { data: user } = await supabase
                    .from('users')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (user) {
                    await supabase
                        .from('users')
                        .update({
                            subscription_status: status,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', user.id)
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                // First get the user by customer ID to get their user ID
                const { data: user } = await supabase
                    .from('users')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (user) {
                    await supabase
                        .from('users')
                        .update({
                            subscription_status: 'free',
                            stripe_subscription_id: null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', user.id)
                }
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                const customerId = invoice.customer as string

                console.log(`Payment failed for customer: ${customerId}`)
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('Webhook handler error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}


