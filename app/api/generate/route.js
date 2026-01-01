import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkAndTrackUsage } from '@/lib/usage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function POST(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Please sign in to generate prompts' },
                { status: 401 }
            );
        }

        const { userInput, contentType, platform, creativeMode = false, outputFormat = 'text' } = await request.json();

        if (!userInput || !contentType || !platform) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const usage = await checkAndTrackUsage(userId, 'regular');
        if (!usage.allowed) {
            const res = NextResponse.json(
                {
                    error: usage.isPro
                        ? 'Monthly limit reached'
                        : 'Daily limit reached. Upgrade to Pro for unlimited regular prompts!',
                    upgrade: !usage.isPro,
                },
                { status: 429 }
            );
            res.headers.set('X-RateLimit-Limit', String(usage.limit));
            res.headers.set('X-RateLimit-Remaining', String(usage.remaining));
            res.headers.set('X-RateLimit-Used', String(usage.used));
            return res;
        }

        const useClaude = !creativeMode;

        if (useClaude && !process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json({ error: 'Server configuration error - Claude API key required' }, { status: 500 });
        }
        if (!useClaude && !process.env.GROQ_API_KEY) {
            return NextResponse.json({ error: 'Server configuration error - Groq API key required' }, { status: 500 });
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

        let systemPrompt;

        // THREE FORMAT OPTIONS
        // Support both 'json' and 'variations' for backward compatibility
        const isVariationsFormat = outputFormat === 'variations' || outputFormat === 'json';

        if (outputFormat === 'structured') {
            // STRUCTURED JSON FORMAT (Best for Leonardo/Midjourney)
            systemPrompt = `You are an expert prompt engineer. Generate ONE structured JSON prompt for ${contentType} generation on ${platform}.

${safetyGuidelines}

CRITICAL: Generate a STRUCTURED JSON object that breaks down the prompt into logical components.

For IMAGE generation, use this structure:
{
  "scene": "overall environment and setting",
  "subject": "main character/object description",
  "pose": "positioning and body language (if applicable)",
  "expression": "facial expression or mood (if applicable)",
  "attire": {
    "top": "upper clothing description",
    "bottom": "lower clothing description",
    "accessories": "jewelry, items, etc"
  },
  "details": {
    "specific_feature_1": "description",
    "specific_feature_2": "description"
  },
  "lighting": "light source, quality, direction, mood",
  "background": "environment details, objects, atmosphere",
  "style": "art style, aesthetic, technical specifications",
  "camera": "angle, framing, composition (optional)"
}

For VIDEO generation, use this structure:
{
  "scene": "overall environment and setting",
  "subject": "main character/object description",
  "action": "what is happening, movement, progression",
  "camera_movement": "pan, zoom, tracking, static, etc",
  "lighting": "light source, quality, changes over time",
  "background": "environment details",
  "style": "visual aesthetic, mood",
  "duration": "pacing and timing notes",
  "audio_suggestion": "sound design notes (optional)"
}

REQUIREMENTS:
- Be SPECIFIC and DETAILED in each field (75-150 words total across all fields)
- DO NOT use quotation marks for emphasis within values
- Each field should contain rich, vivid descriptive language
- Include technical/quality specifications in the "style" field
- For images: add comprehensive details about pose, expression, clothing
- For videos: include camera movements and scene progression
- Balance technical precision with creative description

CRITICAL OUTPUT RULES:
- Your response must be ONLY valid JSON
- DO NOT use markdown code blocks
- DO NOT use backticks
- DO NOT add text before or after the JSON
- Just raw JSON starting with { and ending with }

Example for IMAGE:
{
  "scene": "bright modern living room bathed in morning sunlight",
  "subject": "woman in her mid-20s with shoulder-length wavy auburn hair and warm olive skin tone",
  "pose": "sitting cross-legged on cream linen sofa, body angled toward camera, relaxed posture",
  "expression": "genuine warm smile, eyes slightly crinkled with joy, natural and candid",
  "attire": {
    "top": "oversized white cotton button-up shirt, sleeves rolled to elbows",
    "bottom": "light blue high-waisted denim jeans",
    "accessories": "delicate gold chain necklace, small hoop earrings, simple watch"
  },
  "details": {
    "hands": "holding ceramic coffee mug with both hands, natural manicure",
    "environment_interaction": "sunlight casting soft shadows across the scene"
  },
  "lighting": "soft natural morning light streaming through large windows, creating warm highlights on hair and skin, gentle diffused quality",
  "background": "white walls with minimalist framed art, potted fiddle leaf fig plant in corner, light wooden floor, modern clean aesthetic",
  "style": "lifestyle photography, natural and candid feel, soft color palette with cream and earth tones, 35mm lens aesthetic, shallow depth of field, 8k, highly detailed, professional composition",
  "camera": "eye-level angle, slight Dutch tilt for dynamic composition, subject fills two-thirds of frame"
}`;

        } else if (isVariationsFormat) {
            // MULTIPLE VARIATIONS FORMAT - Simple text prompts
            systemPrompt = `You are an expert prompt engineer. Generate EXACTLY 4 optimized text prompts for ${contentType} generation on ${platform}.

${safetyGuidelines}

Requirements:
- Make prompts DETAILED but not flowery (75-100 words is perfect)
- Paint a complete picture with specific visual details
- DO NOT use quotation marks for emphasis within prompt text
- Include rich descriptive terms: colors, lighting, atmosphere, composition
- ALWAYS include technical/quality terms at the end: "detailed illustration, vibrant colors, cinematic lighting, 8k, highly detailed"
- Structure: [subject with action], [environment], [lighting], [art style], [quality tags]
- For images: add comprehensive negative prompts
- For videos: include camera movements and progression
- Each prompt should feel complete and vivid
- NO generic phrases - be specific

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON
- DO NOT use markdown or backticks
- DO NOT use quotation marks for emphasis within strings
- Just raw JSON starting with { and ending with }

Respond with this format (MUST include exactly 4 prompts):
{
  "prompts": [
    {
      "title": "Short descriptive title",
      "prompt": "The enhanced prompt here with details",
      "negative": "negative prompt here (images only)"
    },
    {
      "title": "Second variation title",
      "prompt": "Another detailed prompt variation with different style",
      "negative": "negative prompt here"
    },
    {
      "title": "Third variation title",
      "prompt": "Third detailed prompt variation with unique approach",
      "negative": "negative prompt here"
    },
    {
      "title": "Fourth variation title",
      "prompt": "Fourth detailed prompt variation with distinct perspective",
      "negative": "negative prompt here"
    }
  ]
}

CRITICAL: You MUST return exactly 4 prompts in the array. Each prompt should be unique and offer a different variation of the user's idea.`;

        } else {
            // TEXT FORMAT (Default) - Returns 4 simple text prompts
            systemPrompt = `You are an expert prompt engineer. Generate EXACTLY 4 optimized text prompts for ${contentType} generation on ${platform}.

${safetyGuidelines}

Requirements:
- Make prompts DETAILED but not flowery (75-100 words is perfect)
- Paint a complete picture with specific visual details
- DO NOT use quotation marks for emphasis within prompt text
- Include rich descriptive terms: colors, lighting, atmosphere, composition
- ALWAYS include technical/quality terms at the end: "detailed illustration, vibrant colors, cinematic lighting, 8k, highly detailed"
- Structure: [subject with action], [environment], [lighting], [art style], [quality tags]
- For images: add comprehensive negative prompts
- For videos: include camera movements and progression
- Each prompt should feel complete and vivid
- NO generic phrases - be specific

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON
- DO NOT use markdown or backticks
- DO NOT use quotation marks for emphasis within strings
- Just raw JSON starting with { and ending with }

Respond with this format (MUST include exactly 4 prompts):
{
  "prompts": [
    {
      "title": "Short descriptive title",
      "prompt": "The enhanced prompt here with details",
      "negative": "negative prompt here (images only)"
    },
    {
      "title": "Second variation title",
      "prompt": "Another detailed prompt variation with different style",
      "negative": "negative prompt here"
    },
    {
      "title": "Third variation title",
      "prompt": "Third detailed prompt variation with unique approach",
      "negative": "negative prompt here"
    },
    {
      "title": "Fourth variation title",
      "prompt": "Fourth detailed prompt variation with distinct perspective",
      "negative": "negative prompt here"
    }
  ]
}

CRITICAL: You MUST return exactly 4 prompts in the array. Each prompt should be unique and offer a different variation of the user's idea.`;
        }

        // Make API call
        let response;

        if (useClaude) {
            const requestBody = {
                model: 'claude-3-haiku-20240307',
                max_tokens: outputFormat === 'structured' ? 1500 : 1000,
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
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify(requestBody),
            });
        } else {
            const requestBody = {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `User's basic idea: "${userInput}"` },
                ],
                max_tokens: outputFormat === 'structured' ? 1500 : 1000,
                temperature: 0.7,
            };

            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                },
                body: JSON.stringify(requestBody),
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error:', errorText);
            const res = NextResponse.json(
                { error: 'Failed to generate prompts', details: errorText },
                { status: 502 }
            );
            res.headers.set('X-RateLimit-Limit', String(usage.limit));
            res.headers.set('X-RateLimit-Remaining', String(usage.remaining));
            res.headers.set('X-RateLimit-Used', String(usage.used));
            return res;
        }

        const data = await response.json();

        // Extract text
        let responseText = '';
        if (useClaude) {
            for (const block of data.content || []) {
                if (block.type === 'text') {
                    responseText = block.text.trim();
                    break;
                }
            }
        } else {
            responseText = data.choices?.[0]?.message?.content?.trim() || '';
        }

        if (!responseText) {
            const res = NextResponse.json({ error: 'No content received from AI' }, { status: 502 });
            res.headers.set('X-RateLimit-Limit', String(usage.limit));
            res.headers.set('X-RateLimit-Remaining', String(usage.remaining));
            res.headers.set('X-RateLimit-Used', String(usage.used));
            return res;
        }

        // Robust JSON parsing
        function extractAndParseJSON(text) {
            try {
                return JSON.parse(text);
            } catch (_e) {
                let cleaned = text
                    .replace(/```json\n?/gi, '')
                    .replace(/```\n?/g, '')
                    .replace(/`/g, '')
                    .trim();

                const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    cleaned = jsonMatch[0];
                }

                cleaned = cleaned.replace(/\\"([^"]*?)\\"/g, (match, p1) => p1);

                try {
                    return JSON.parse(cleaned);
                } catch (_e2) {
                    throw new Error('Invalid JSON from AI');
                }
            }
        }

        const parsed = extractAndParseJSON(responseText);

        const res = NextResponse.json(parsed);
        res.headers.set('X-RateLimit-Limit', String(usage.limit));
        res.headers.set('X-RateLimit-Remaining', String(usage.remaining));
        res.headers.set('X-RateLimit-Used', String(usage.used));
        return res;

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error?.message },
            { status: 500 }
        );
    }
}
