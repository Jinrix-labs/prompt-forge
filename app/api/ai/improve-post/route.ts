import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkAndTrackUsage } from '@/lib/usage';

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

    const usage = await checkAndTrackUsage(userId, 'improve');

    if (!usage.allowed) {
        return NextResponse.json(
            {
                error: usage.isPro
                    ? 'Monthly AI limit reached. Upgrade to Premium for more.'
                    : `Daily AI improvement limit reached (${usage.limit}/day). Upgrade to Pro for unlimited improvements.`,
                usage: {
                    limit: usage.limit,
                    used: usage.used,
                    remaining: usage.remaining,
                    isPro: usage.isPro,
                },
            },
            { status: 429 }
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
            usage: {
                limit: usage.limit,
                used: usage.used,
                remaining: usage.remaining,
                isPro: usage.isPro,
            },
        });
    } catch (err: unknown) {
        console.error('Anthropic error:', err);
        return NextResponse.json({ error: 'AI request failed. Please try again.' }, { status: 502 });
    }
}
