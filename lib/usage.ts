import { supabase } from './supabase'

export interface UsageCheck {
    allowed: boolean
    limit: number
    used: number
    remaining: number
    isPro: boolean
}

export async function checkAndTrackUsage(
    userId: string,
    promptType: 'ugc' | 'regular'
): Promise<UsageCheck> {
    // Check if user is a developer (free Pro access)
    const devUserIds = process.env.DEV_USER_IDS?.split(',').map(id => id.trim()) || []
    if (devUserIds.includes(userId)) {
        // Developers get unlimited access
        await supabase.from('usage').insert({
            user_id: userId,
            prompt_type: promptType,
        })

        return {
            allowed: true,
            limit: -1,
            used: 0,
            remaining: -1,
            isPro: true,
        }
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

        // Continue with the new user (will be free tier)
        const isPro = newUser?.subscription_status === 'pro' || false

        if (promptType === 'regular') {
            if (isPro) {
                await supabase.from('usage').insert({
                    user_id: userId,
                    prompt_type: 'regular',
                })

                return {
                    allowed: true,
                    limit: -1,
                    used: 0,
                    remaining: -1,
                    isPro: true,
                }
            }

            const { count } = await supabase
                .from('usage')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('prompt_type', 'regular')
                .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

            const used = count || 0
            // Free users: daily limit for regular prompts
            const limit = 20
            const allowed = used < limit

            if (allowed) {
                await supabase.from('usage').insert({
                    user_id: userId,
                    prompt_type: 'regular',
                })
            }

            return {
                allowed,
                limit,
                used: allowed ? used + 1 : used,
                remaining: Math.max(0, limit - (allowed ? used + 1 : used)),
                isPro: false,
            }
        }

        if (promptType === 'ugc') {
            if (isPro) {
                const { count } = await supabase
                    .from('usage')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('prompt_type', 'ugc')
                    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

                const used = count || 0
                const limit = 200
                const allowed = used < limit

                if (allowed) {
                    await supabase.from('usage').insert({
                        user_id: userId,
                        prompt_type: 'ugc',
                    })
                }

                return {
                    allowed,
                    limit,
                    used: allowed ? used + 1 : used,
                    remaining: Math.max(0, limit - (allowed ? used + 1 : used)),
                    isPro: true,
                }
            }

            const { count } = await supabase
                .from('usage')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('prompt_type', 'ugc')
                .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

            const used = count || 0
            const limit = 5
            const allowed = used < limit

            if (allowed) {
                await supabase.from('usage').insert({
                    user_id: userId,
                    prompt_type: 'ugc',
                })
            }

            return {
                allowed,
                limit,
                used: allowed ? used + 1 : used,
                remaining: Math.max(0, limit - (allowed ? used + 1 : used)),
                isPro: false,
            }
        }

        return {
            allowed: false,
            limit: 0,
            used: 0,
            remaining: 0,
            isPro: false,
        }
    }

    if (userError) {
        console.error('Error checking user:', userError)
        return {
            allowed: false,
            limit: 0,
            used: 0,
            remaining: 0,
            isPro: false,
        }
    }

    const isPro = user?.subscription_status === 'pro' || false

    if (promptType === 'regular') {
        if (isPro) {
            await supabase.from('usage').insert({
                user_id: userId,
                prompt_type: 'regular',
            })

            return {
                allowed: true,
                limit: -1,
                used: 0,
                remaining: -1,
                isPro: true,
            }
        }

        const { count } = await supabase
            .from('usage')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('prompt_type', 'regular')
            .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

        const used = count || 0
        // Free users: daily limit for regular prompts
        const limit = 20
        const allowed = used < limit

        if (allowed) {
            await supabase.from('usage').insert({
                user_id: userId,
                prompt_type: 'regular',
            })
        }

        return {
            allowed,
            limit,
            used: allowed ? used + 1 : used,
            remaining: Math.max(0, limit - (allowed ? used + 1 : used)),
            isPro: false,
        }
    }

    if (promptType === 'ugc') {
        if (isPro) {
            const { count } = await supabase
                .from('usage')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('prompt_type', 'ugc')
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

            const used = count || 0
            const limit = 200
            const allowed = used < limit

            if (allowed) {
                await supabase.from('usage').insert({
                    user_id: userId,
                    prompt_type: 'ugc',
                })
            }

            return {
                allowed,
                limit,
                used: allowed ? used + 1 : used,
                remaining: Math.max(0, limit - (allowed ? used + 1 : used)),
                isPro: true,
            }
        }

        const { count } = await supabase
            .from('usage')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('prompt_type', 'ugc')
            .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

            const used = count || 0
            // Free users: daily limit for UGC prompts
            const limit = 10
        const used = count || 0
        // Free users: daily limit for UGC prompts
        const limit = 10
        const allowed = used < limit

        if (allowed) {
            await supabase.from('usage').insert({
                user_id: userId,
                prompt_type: 'ugc',
            })
        }

        return {
            allowed,
            limit,
            used: allowed ? used + 1 : used,
            remaining: Math.max(0, limit - (allowed ? used + 1 : used)),
            isPro: false,
        }
    }

    return {
        allowed: false,
        limit: 0,
        used: 0,
        remaining: 0,
        isPro: false,
    }
}


