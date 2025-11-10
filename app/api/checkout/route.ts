import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(_req: Request) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (userError && userError.code !== 'PGRST116') {
            return NextResponse.json({ error: userError.message }, { status: 500 })
        }

        let stripeCustomerId = user?.stripe_customer_id as string | undefined

        if (!stripeCustomerId) {
            const clerkUser = await clerkClient.users.getUser(userId)

            const customer = await stripe.customers.create({
                email: clerkUser.emailAddresses[0]?.emailAddress,
                metadata: {
                    clerk_user_id: userId,
                },
            })

            stripeCustomerId = customer.id

            await supabase
                .from('users')
                .upsert({
                    id: userId,
                    email: clerkUser.emailAddresses[0]?.emailAddress,
                    stripe_customer_id: stripeCustomerId,
                    subscription_status: user?.subscription_status || 'free',
                })
        }

        const successBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            line_items: [
                {
                    price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${successBase}/dashboard?success=true`,
            cancel_url: `${successBase}/pricing?canceled=true`,
            metadata: { clerk_user_id: userId },
        })

        return NextResponse.json({ url: session.url })
    } catch (error: any) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}


