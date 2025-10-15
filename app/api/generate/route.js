import { NextResponse } from 'next/server';
import { checkAndIncrementDailyLimit } from '../../../lib/rateLimit';

// Vercel runtime hints
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds

export async function POST(request) {
    try {
        const { userInput, contentType, platform, creativeMode = false } = await request.json();

        if (!userInput || !contentType || !platform) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log('Request params:', { userInput, contentType, platform, creativeMode });

        // Basic per-IP rate limit for regular prompts (e.g., 10/day)
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const rl = checkAndIncrementDailyLimit(`regular:${ip}`, 10);
        if (!rl.allowed) {
            const res = NextResponse.json({ message: 'Daily limit reached for free tier.' }, { status: 429 });
            res.headers.set('X-RateLimit-Limit', String(rl.limit));
            res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
            res.headers.set('X-RateLimit-Used', String(rl.used));
            return res;
        }

        // Choose API based on creative mode
        const useClaude = !creativeMode;

        if (useClaude) {
            const claudeApiKey = process.env.ANTHROPIC_API_KEY;
            if (!claudeApiKey) {
                console.error('ANTHROPIC_API_KEY not found for safe mode');
                return NextResponse.json({ error: 'Server configuration error - Claude API key required for safe mode' }, { status: 500 });
            }
            console.log('Using Claude Haiku for safe mode');
        } else {
            const groqApiKey = process.env.GROQ_API_KEY;
            if (!groqApiKey) {
                console.error('GROQ_API_KEY not found for creative mode');
                return NextResponse.json({ error: 'Server configuration error - Groq API key required for creative mode' }, { status: 500 });
            }
            console.log('Using Groq for creative mode');
        }

        const safetyGuidelines = !creativeMode
            ? `IMPORTANT SAFETY GUIDELINES:
- Avoid terms like "young", "girl", "boy", "child", "teen", "teenage"
- Avoid "moe", "kawaii", "loli", "shota" or similar anime terms
- Use "woman", "man", "person", "character" instead of age-specific terms
- Focus on artistic style, composition, and technical quality
- Keep all content appropriate for all audiences`
            : `CREATIVE FREEDOM:
- You have more creative freedom for artistic expression
- Can use more varied descriptive terms
- Focus on artistic vision and creative concepts
- Still maintain general appropriateness`;


        const systemPrompt = `You are an expert prompt engineer. Generate 4 optimized prompts for ${contentType} generation on ${platform}.

${safetyGuidelines}

Requirements:
- Make prompts DETAILED but not flowery (75-100 words is perfect)
- Paint a complete picture with specific visual details
- Use emphasis with quotes for important elements: "keyword"
- Include rich descriptive terms: colors, lighting, atmosphere, composition
- ALWAYS include technical/quality terms at the end: "detailed illustration, vibrant colors, cinematic lighting, 8k, highly detailed"
- Structure: [detailed subject with action], [environment details], [lighting/atmosphere], [art style], [quality tags]
- For images: add comprehensive negative prompts (what to avoid)
- For videos: include camera movements and scene progression
- Each prompt should feel complete and vivid
- Balance technical precision with creative description
- NO generic phrases like "person" - be specific about appearance, clothing, pose

CRITICAL OUTPUT RULES:
Your response must be ONLY a single valid JSON object.
DO NOT use markdown code blocks.
DO NOT use backticks.
DO NOT add any text before or after the JSON.
Just the raw JSON starting with { and ending with }.

GOOD EXAMPLE:
"Adult woman with short purple hair sitting at futuristic ramen shop counter, neon pink and blue signs reflecting off wet surfaces, steam rising from bowl, holographic menu displays, rain visible through window, cyberpunk aesthetic, detailed anime art style, cinematic composition, vibrant colors, 8k, highly detailed"

BAD EXAMPLE (too short):
"woman eating ramen, cyberpunk, neon lights, 4k"

BAD EXAMPLE (too flowery):
"Imagine a beautiful woman gracefully enjoying a magnificent bowl of ramen in a stunning cyberpunk wonderland..."

NEGATIVE PROMPT EXAMPLE:
"blurry, low quality, distorted, ugly, deformed, extra limbs, bad anatomy, watermark, signature, text, low resolution, pixelated"

Respond ONLY with valid JSON in this exact format:
{
  "prompts": [
    {
      "title": "Short descriptive title",
      "prompt": "The enhanced prompt here with (emphasis) and details",
      "negative": "negative prompt here (only for images, empty string for videos)"
    }
  ]
}

DO NOT include any text outside the JSON. DO NOT use markdown code blocks.`;

        let response;

        if (useClaude) {
            // Claude Haiku for strict mode
            const claudeApiKey = process.env.ANTHROPIC_API_KEY;
            const requestBody = {
                model: 'claude-3-haiku-20240307',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: `${systemPrompt}\n\nUser's basic idea: "${userInput}"`,
                    },
                ],
            };

            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': claudeApiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify(requestBody),
            });
        } else {
            // Groq for relaxed mode
            const groqApiKey = process.env.GROQ_API_KEY;
            const requestBody = {
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: `User's basic idea: "${userInput}"`,
                    },
                ],
                max_tokens: 1000,
                temperature: 0.7,
            };

            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqApiKey}`,
                },
                body: JSON.stringify(requestBody),
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
                api: useClaude ? 'Claude' : 'Groq'
            });
            const res = NextResponse.json(
                { error: 'Failed to generate prompts', details: errorText, status: response.status },
                { status: 502 }
            );
            res.headers.set('X-RateLimit-Limit', String(rl.limit));
            res.headers.set('X-RateLimit-Remaining', String(Math.max(0, rl.remaining)));
            res.headers.set('X-RateLimit-Used', String(rl.used));
            return res;
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('Failed to parse API response:', jsonError);
            return NextResponse.json({ error: 'Invalid response from AI service' }, { status: 502 });
        }

        // Extract text content from the response (different formats for Claude vs Groq)
        let responseText = '';
        if (useClaude) {
            // Claude format
            for (const block of data.content || []) {
                if (block.type === 'text' && typeof block.text === 'string') {
                    responseText = block.text.trim();
                    break;
                }
            }
        } else {
            // Groq format
            if (data.choices && data.choices[0] && data.choices[0].message) {
                responseText = data.choices[0].message.content.trim();
            }
        }

        if (!responseText) {
            const res = NextResponse.json({ error: 'No content received from AI' }, { status: 502 });
            res.headers.set('X-RateLimit-Limit', String(rl.limit));
            res.headers.set('X-RateLimit-Remaining', String(Math.max(0, rl.remaining)));
            res.headers.set('X-RateLimit-Used', String(rl.used));
            return res;
        }

        // Clean up and aggressively extract the JSON object for Claude
        if (useClaude) {
            responseText = responseText
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/g, '')
                .replace(/`/g, '')
                .trim();

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('No valid JSON found in Claude response:', responseText);
                const res = NextResponse.json({ error: 'Invalid response format from Claude' }, { status: 502 });
                res.headers.set('X-RateLimit-Limit', String(rl.limit));
                res.headers.set('X-RateLimit-Remaining', String(Math.max(0, rl.remaining)));
                res.headers.set('X-RateLimit-Used', String(rl.used));
                return res;
            }
            const cleanJson = jsonMatch[0];
            console.log('Cleaned Claude JSON:', cleanJson);
            try {
                var parsed = JSON.parse(cleanJson);
            } catch (parseError) {
                console.error('Failed to parse cleaned Claude JSON:', cleanJson, parseError);
                const res = NextResponse.json({ error: 'Invalid JSON from Claude' }, { status: 502 });
                res.headers.set('X-RateLimit-Limit', String(rl.limit));
                res.headers.set('X-RateLimit-Remaining', String(Math.max(0, rl.remaining)));
                res.headers.set('X-RateLimit-Used', String(rl.used));
                return res;
            }
            const res = NextResponse.json({ prompts: parsed.prompts || [] });
            res.headers.set('X-RateLimit-Limit', String(rl.limit));
            res.headers.set('X-RateLimit-Remaining', String(Math.max(0, rl.remaining)));
            res.headers.set('X-RateLimit-Used', String(rl.used));
            return res;
        }

        // For Groq path, keep original parsing
        let parsed;
        try {
            parsed = JSON.parse(responseText);
        } catch (parseError) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}$/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                console.error('Failed to parse JSON:', responseText);
                const res = NextResponse.json({ error: 'Invalid response format' }, { status: 502 });
                res.headers.set('X-RateLimit-Limit', String(rl.limit));
                res.headers.set('X-RateLimit-Remaining', String(Math.max(0, rl.remaining)));
                res.headers.set('X-RateLimit-Used', String(rl.used));
                return res;
            }
        }

        const res = NextResponse.json({ prompts: parsed.prompts || [] });
        res.headers.set('X-RateLimit-Limit', String(rl.limit));
        res.headers.set('X-RateLimit-Remaining', String(Math.max(0, rl.remaining)));
        res.headers.set('X-RateLimit-Used', String(rl.used));
        return res;
    } catch (error) {
        console.error('Server error:', error);
        const res = NextResponse.json(
            { error: 'Internal server error', details: error?.message },
            { status: 500 }
        );
        // no rl context here on failure before rl init; headers omitted
        return res;
    }
}
