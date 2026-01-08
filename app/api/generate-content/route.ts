import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkAndTrackUsage } from '@/lib/usage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Please sign in to generate content' },
                { status: 401 }
            );
        }

        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
        }

        const usage = await checkAndTrackUsage(userId, 'regular');
        if (!usage.allowed) {
            return NextResponse.json(
                {
                    error: usage.isPro
                        ? 'Monthly limit reached'
                        : 'Daily limit reached. Upgrade to Pro for unlimited content!',
                    upgrade: !usage.isPro,
                },
                { status: 429 }
            );
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 4096,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to generate content', details: errorText },
                { status: 502 }
            );
        }

        const data = await response.json();

        let output = '';
        for (const block of data.content || []) {
            if (block.type === 'text') {
                output = block.text.trim();
                break;
            }
        }

        if (!output) {
            return NextResponse.json(
                { error: 'No content received from AI' },
                { status: 502 }
            );
        }

        return NextResponse.json({
            output,
            tokensUsed: data.usage?.input_tokens || 0,
        });

    } catch (error: any) {
        console.error('Content generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate content', details: error?.message },
            { status: 500 }
        );
    }
}
