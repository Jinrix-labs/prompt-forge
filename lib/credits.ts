import { createClient } from '@supabase/supabase-js'
import { checkAndTrackUsage } from './usage'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type CreditCheckResult =
    | { allowed: true; usedCredits: boolean }
    | {
          allowed: false
          code: 'INSUFFICIENT_CREDITS' | 'LIMIT_REACHED'
          error: string
          upgrade: boolean
          buyCredits: boolean
          creditsRemaining: number
      }

/**
 * Check plan usage first, then fall back to credits if over limit.
 * Atomically deducts 1 credit to prevent double-spend.
 */
export async function checkUsageOrSpendCredit(
    userId: string,
    promptType: 'regular' | 'ugc' | 'improve'
): Promise<CreditCheckResult> {
    const usage = await checkAndTrackUsage(userId, promptType)

    if (usage.allowed) {
        return { allowed: true, usedCredits: false }
    }

    const { data, error } = await supabaseAdmin.rpc('spend_credit', {
        p_user_id: userId,
        p_amount: 1,
    })

    if (error) {
        console.error('Failed to spend credit:', error)
    }

    if (data) {
        return { allowed: true, usedCredits: true }
    }

    const { data: creditsRow } = await supabaseAdmin
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single()

    const balance = creditsRow?.credits ?? 0

    return {
        allowed: false,
        code: 'INSUFFICIENT_CREDITS',
        error:
            balance === 0
                ? "You've reached your plan limit and have no credits remaining. Buy credits or upgrade your plan to continue."
                : 'Not enough credits for this action.',
        upgrade: true,
        buyCredits: true,
        creditsRemaining: balance,
    }
}
