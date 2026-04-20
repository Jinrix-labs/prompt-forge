import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkUsageOrSpendCredit } from "@/lib/credits";

export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            productName,
            productCategory,
            creatorDemo,
            videoLength,
            platform,
            ctaMessage,
            heroMessage,
            cta,
            tone,
            style,
            // Advanced fields
            promptAdherence,
            promptStyle,
            sceneIntent,
            narrationStyle
        } = body;

        const check = await checkUsageOrSpendCredit(userId, 'ugc');
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

        // Check if this is a suggestion request
        const isSuggestionRequest = heroMessage === 'SUGGEST_HERO' || cta === 'SUGGEST_CTA';

        let prompt;

        if (isSuggestionRequest) {
            // Generate suggestions only
            if (heroMessage === 'SUGGEST_HERO') {
                prompt = `Generate a compelling hero message/benefit for a ${productCategory} product called "${productName}" for a ${platform} UGC video. 

Target audience: ${creatorDemo}
Tone: ${tone || 'friendly'}
Platform: ${platform}

CRITICAL SAFETY REQUIREMENTS:
🚫 NEVER include celebrity names, public figures, or famous people
🚫 NEVER reference actors, musicians, influencers, politicians, or any public personalities
🚫 NEVER use names like "Taylor Swift", "Kim Kardashian", "Elon Musk", "Oprah", etc.
✅ Focus on authentic everyday people and relatable scenarios
✅ Keep all content original and non-celebrity focused

Create a short, punchy hero message that highlights the main benefit. Examples:
- "Hydrates all day without feeling greasy"
- "Gives you energy that lasts 12 hours" 
- "Transforms your skin in just one use"

Return only the hero message, nothing else.`;
            } else {
                prompt = `Generate a compelling call-to-action for a ${productCategory} product called "${productName}" for a ${platform} UGC video.

Target audience: ${creatorDemo}
Tone: ${tone || 'friendly'}
Platform: ${platform}

CRITICAL SAFETY REQUIREMENTS:
🚫 NEVER include celebrity names, public figures, or famous people
🚫 NEVER reference actors, musicians, influencers, politicians, or any public personalities
🚫 NEVER use names like "Taylor Swift", "Kim Kardashian", "Elon Musk", "Oprah", etc.
✅ Focus on authentic everyday people and relatable scenarios
✅ Keep all content original and non-celebrity focused

Create a short, action-oriented CTA. Examples:
- "Try it today – link in bio!"
- "Get yours now – swipe up!"
- "Don't wait – grab it now!"

Return only the CTA message, nothing else.`;
            }
        } else {
            // Full UGC script generation
            prompt = `
You are generating a ${platform}-style UGC video script for a ${productCategory} product.

Product Details:
- Product Name: ${productName}
- Category: ${productCategory}
- Target Audience: ${creatorDemo}
- Platform: ${platform}
- Length: ${videoLength} seconds
- Tone: ${tone || 'friendly'}

Content Strategy:
- Hero Message: "${heroMessage || 'Not specified'}"
- Call to Action: "${cta || ctaMessage || 'Not specified'}"
- Additional Context: "${ctaMessage || 'Not specified'}"
- Style: ${style}`;

            // Add advanced fields if provided
            if (promptStyle || promptAdherence || sceneIntent || narrationStyle) {
                prompt += `\n\nAdditional Creative Guidance:`;
                if (promptStyle) {
                    prompt += `\n- Prompt Style: ${promptStyle}`;
                }
                if (sceneIntent) {
                    prompt += `\n- Scene Intent: ${sceneIntent}`;
                }
                if (narrationStyle) {
                    prompt += `\n- Narration Style: ${narrationStyle}`;
                }
                if (promptAdherence) {
                    prompt += `\n- Prompt Adherence Level: ${promptAdherence} (1 = loose, 10 = strict)`;
                }
            }

            prompt += `

CRITICAL SAFETY REQUIREMENTS:
🚫 NEVER include celebrity names, public figures, or famous people in any content
🚫 NEVER reference actors, musicians, influencers, politicians, or any public personalities
🚫 NEVER use names like "Taylor Swift", "Kim Kardashian", "Elon Musk", "Oprah", etc.
🚫 NEVER create content that could be mistaken for celebrity endorsement
✅ Use generic terms like "creator", "user", "person", "someone", "people"
✅ Focus on authentic everyday people and relatable scenarios
✅ Keep all content original and non-celebrity focused

Create a professional UGC video script with:
• Scene descriptions
• Narration/voiceover
• On-screen text suggestions
• Camera angles and transitions
• Timeline breakdown with precise timing

Return this in JSON format like:
{
  "script": "full spoken or voiceover lines here",
  "timeline": [
    {"time": "0–2s", "action": "Hook intro", "camera": "close-up selfie"},
    {"time": "3–5s", "action": "show product demo", "camera": "b-roll"},
    {"time": "6–8s", "action": "before/after transformation", "camera": "split screen"},
    {"time": "9–12s", "action": "call to action", "camera": "close-up talking"}
  ],
  "promptIdeas": {
    "image": "Prompt for a studio-style close-up of product",
    "video": "Prompt for Sora-style demo in kitchen"
  }
}

DO NOT use quotation marks for emphasis within prompt strings (they break JSON).
Instead of "synthwave" style, use: synthwave style
Instead of "magical girl" costume, use: magical girl costume`;
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-3-haiku-20240307",
                max_tokens: 1024,
                temperature: 0.7,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        const result = data.content?.[0]?.text;

        if (!result) {
            throw new Error('No response from Claude');
        }

        if (isSuggestionRequest) {
            // For suggestions, return the raw text directly
            return NextResponse.json({
                success: true,
                result: result.trim(),
                suggestion: true,
                usedCredits: check.usedCredits
            });
        } else {
            // Robust JSON extraction function
            function extractAndParseJSON(text) {
                try {
                    // First try direct parse
                    return JSON.parse(text);
                } catch {
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

            // Try to parse the JSON response for full scripts
            let parsedResult;
            try {
                parsedResult = extractAndParseJSON(result);
            } catch {
                // If JSON parsing fails, return the raw result
                return NextResponse.json({
                    success: true,
                    result: result,
                    raw: true,
                    usedCredits: check.usedCredits
                });
            }

            return NextResponse.json({
                success: true,
                result: parsedResult,
                usedCredits: check.usedCredits
            });
        }

    } catch (error) {
        console.error('UGC Gen API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
