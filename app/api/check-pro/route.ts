import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ isPro: false })
        }

        // Check if user is a developer (free Pro access)
        const devUserIds = process.env.DEV_USER_IDS?.split(',').map(id => id.trim()) || []
        if (devUserIds.includes(userId)) {
            return NextResponse.json({ isPro: true })
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('subscription_status')
            .eq('id', userId)
            .single()

        // If user doesn't exist, create them as free tier
        if (userError && userError.code === 'PGRST116') {
            const { data: newUser } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    subscription_status: 'free',
                })
                .select('subscription_status')
                .single()

            return NextResponse.json({
                isPro: newUser?.subscription_status === 'pro' || false,
            })
        }

        if (userError) {
            console.error('Error checking pro status:', userError)
            return NextResponse.json({ isPro: false })
        }

        return NextResponse.json({
            isPro: user?.subscription_status === 'pro' || false,
        })
    } catch (error) {
        console.error('Error in check-pro:', error)
        return NextResponse.json({ isPro: false })
    }
}


