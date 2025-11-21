import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkAndTrackUsage } from '@/lib/usage';

// Vercel runtime hints
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds

export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Please sign in to generate UGC prompts' },
                { status: 401 }
            );
        }

        const { brand, category, creator, length, platform, message, image, imageType } = await request.json();

        const usage = await checkAndTrackUsage(userId, 'ugc');
        if (!usage.allowed) {
            const res = NextResponse.json(
                {
                    error: usage.isPro
                        ? `Monthly UGC limit reached (${usage.limit}/month). Contact support for enterprise plans.`
                        : `Daily UGC limit reached (${usage.limit}/day). Upgrade to Pro for 200 UGC prompts per month!`,
                    upgrade: !usage.isPro,
                },
                { status: 429 }
            );
            res.headers.set('X-RateLimit-Limit', String(usage.limit === -1 ? '∞' : String(usage.limit)));
            res.headers.set('X-RateLimit-Remaining', String(usage.remaining === -1 ? '∞' : String(usage.remaining)));
            res.headers.set('X-RateLimit-Used', String(usage.used));
            return res;
        }


        const creatorMap = {
            'female-20s': 'female creator in her 20s, energetic and relatable',
            'male-20s': 'male creator in his 20s, authentic and engaging',
            'female-30s': 'female creator in her 30s, professional and trustworthy',
            'male-30s': 'male creator in his 30s, confident and credible',
            'diverse': 'diverse creator, inclusive and authentic'
        };

        const creatorDesc = creatorMap[creator] || 'creator';

        // Build content array - add image if provided
        const content = [];

        if (image) {
            // Add image first for Claude to analyze
            content.push({
                type: "image",
                source: {
                    type: "base64",
                    media_type: imageType || "image/jpeg",
                    data: image
                }
            });
            content.push({
                type: "text",
                text: `Analyze this product image and note key visual details for the prompt:
- Overall packaging design and shape
- Primary colors and color scheme
- Brand name/logo (if clearly visible)
- Key visual elements that make it recognizable
- Material/texture (glossy, matte, glass, plastic, etc.)

Focus on what makes the product visually distinctive, not tiny details.

Then generate 3 professional Sora 2 UGC prompts.`
            });
        }

        // Add the main prompt
        content.push({
            type: "text",
            text: `You are an expert UGC (user-generated content) video prompt engineer specializing in Sora 2 prompts for ${platform.toUpperCase()}.

${image ? 'Based on the product image provided above, ' : ''}Generate 3 professional Sora 2 prompts for a UGC-style video.

PRODUCT DETAILS:
- Brand: ${brand}
- Category: ${category}
- Creator: ${creatorDesc}
- Video Length: ${length} seconds
- Platform: ${platform}
${message ? `- Key Message: ${message}` : ''}
${image ? '- Product Visual Details: [Describe what you see in the image - colors, packaging, style]' : ''}

CRITICAL UGC REQUIREMENTS:
1. ALWAYS start with "9:16 vertical aspect ratio" for ${platform}
2. Include shot composition: "handheld", "eye-level", "close-up", "medium shot"
3. Specify lighting: "natural lighting", "ring light", "soft window light"
4. Creator authenticity markers: "casual setting", "home environment", "genuine reaction"
5. Camera movement: "slight shake", "zoom in", "slow pan"
6. UGC aesthetic: "smartphone quality", "authentic", "relatable", "unpolished but professional"
7. ${image ? 'Reference key product visuals from the image (main colors, packaging style, brand name if visible). Keep it natural - example: "holding sleek white bottle with mint green accents" rather than obsessing over tiny label text.' : 'Describe generic product appearance'}
8. Break down into timeline segments (0-3s, 3-8s, etc.)

🚫 CRITICAL SAFETY REQUIREMENTS:
🚫 NEVER include celebrity names, public figures, or famous people in any content
🚫 NEVER reference actors, musicians, influencers, politicians, or any public personalities
🚫 NEVER use names like "Taylor Swift", "Kim Kardashian", "Elon Musk", "Oprah", etc.
🚫 NEVER create content that could be mistaken for celebrity endorsement
✅ Use generic terms like "creator", "user", "person", "someone", "people"
✅ Focus on authentic everyday people and relatable scenarios
✅ Keep all content original and non-celebrity focused

STRUCTURE FOR ${length}-SECOND VIDEO:
${length === '10' ? `
- 0-2s: Quick hook (bold claim or problem)
- 2-6s: Product showcase and key benefit
- 6-10s: Result/transformation with CTA
` : length === '15' ? `
- 0-3s: Hook (problem/pain point or bold claim)
- 3-10s: Product showcase with testimonial
- 10-15s: Result/benefit with CTA
` : length === '30' ? `
- 0-3s: Hook (attention-grabbing intro)
- 3-10s: Product introduction and demonstration
- 10-20s: Benefits and testimonial/reaction
- 20-30s: Results and call-to-action
` : `
- 0-5s: Hook (strong opening)
- 5-15s: Problem identification
- 15-35s: Product demonstration and benefits
- 35-50s: Transformation/results
- 50-60s: Testimonial and CTA
`}

GOOD EXAMPLE:
"9:16 vertical handheld shot, natural lighting, ${creatorDesc} in cozy home kitchen, holding ${brand}${image ? ' [describe specific product colors/packaging from image]' : ''} at eye level, enthusiastic expression, 0-3s: quick hook showing product and excited reaction, 3-8s: medium close-up explaining key benefit while gesturing, 8-12s: demonstrating product use with genuine smile, 12-15s: final testimonial looking directly at camera, shallow depth of field, warm color grading, authentic smartphone aesthetic"

Generate 3 unique variations with different angles/approaches. Each should include:
1. Full Sora 2 prompt (detailed, technical, ${image ? 'referencing actual product appearance' : 'describing generic product'})
2. Timeline breakdown with specific shots

Respond ONLY with valid JSON:
{
  "prompts": [
    {
      "title": "Variation name (e.g., 'Kitchen Testimonial', 'Morning Routine', 'Before/After')",
      "prompt": "Complete Sora 2 prompt with all technical details",
      "timeline": [
        {"time": "0-3s", "description": "Specific shot description"},
        {"time": "3-8s", "description": "Specific shot description"}
      ]
    }
  ]
}

DO NOT include markdown. ONLY return valid JSON.
DO NOT use quotation marks for emphasis within prompt strings (they break JSON).
Instead of "synthwave" style, use: synthwave style
Instead of "magical girl" costume, use: magical girl costume`
        });

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 3000,
                messages: [
                    {
                        role: "user",
                        content: content
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic API Error:', errorText);
            throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        let responseText = data.content[0].text.trim();

        // Robust JSON extraction function
        function extractAndParseJSON(text) {
            try {
                // First try direct parse
                return JSON.parse(text);
            } catch (e) {
                // If that fails, try to fix common issues
                let cleaned = text;
                
                // Remove markdown code blocks if present
                cleaned = cleaned.replace(/```json\n?/gi, '').replace(/```\n?/g, '').replace(/`/g, '').trim();
                
                // Find JSON object
                const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    // Try to find JSON array
                    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
                    if (arrayMatch) {
                        cleaned = `{"prompts": ${arrayMatch[0]}}`;
                    } else {
                        throw new Error('No JSON structure found');
                    }
                } else {
                    cleaned = jsonMatch[0];
                }
                
                // Fix escaped quotes within strings (the main issue)
                // Remove escaped quotes from emphasis: \"word\" becomes word
                cleaned = cleaned.replace(/\\"([^"]*?)\\"/g, (match, p1) => {
                    return p1;
                });
                
                // Try parsing again
                try {
                    return JSON.parse(cleaned);
                } catch (e2) {
                    console.error('Failed to parse JSON after cleaning:', e2);
                    console.error('Cleaned JSON:', cleaned.substring(0, 500));
                    throw new Error('Invalid JSON from Claude after cleaning attempts');
                }
            }
        }

        const parsed = extractAndParseJSON(responseText);
        const res = NextResponse.json(parsed);
        res.headers.set('X-RateLimit-Limit', String(usage.limit === -1 ? '∞' : String(usage.limit)));
        res.headers.set('X-RateLimit-Remaining', String(usage.remaining === -1 ? '∞' : String(usage.remaining)));
        res.headers.set('X-RateLimit-Used', String(usage.used));
        return res;

    } catch (error) {
        console.error('UGC API Error:', error);
        const res = NextResponse.json(
            { error: 'Failed to generate UGC prompts', details: error.message },
            { status: 500 }
        );
        return res;
    }
}
