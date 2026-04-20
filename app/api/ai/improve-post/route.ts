import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkUsageOrSpendCredit } from '@/lib/credits';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: 'AI service is not configured' }, { status: 500 });
    }

    const body = (await request.json()) as { prompt?: unknown };
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const check = await checkUsageOrSpendCredit(userId, 'improve');
    if (!check.allowed) {
        return NextResponse.json(
            {
                error: check.error,
                code: check.code,
                upgrade: check.upgrade,
                buyCredits: check.buyCredits,
                creditsRemaining: check.creditsRemaining,
            },
            { status: 402 }
        );
    }

    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: 'You are a social media copywriter. When asked to improve or rewrite a post, return only the improved post text. No quotes, no explanation, no preamble. Just the post itself.',
            messages: [{ role: 'user', content: prompt }],
        });

        const first = message.content[0];
        const result = first && first.type === 'text' ? first.text.trim() : '';

        if (!result) {
            return NextResponse.json({ error: 'AI returned an empty response' }, { status: 502 });
        }

        return NextResponse.json({
            result,
            usedCredits: check.usedCredits,
        });
    } catch (err: unknown) {
        console.error('Anthropic error:', err);
        return NextResponse.json({ error: 'AI request failed. Please try again.' }, { status: 502 });
    }
}
