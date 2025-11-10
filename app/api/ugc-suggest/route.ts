// /app/api/ugc-suggest/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { type, productName, productCategory, creatorDemo, tone, platform } = await req.json();

    const prompt = type === "hero"
        ? `Give 3 short, catchy UGC video hero messages for a product called \"${productName}\".\nCategory: ${productCategory}\nTarget: ${creatorDemo}\nTone: ${tone}\nPlatform: ${platform}\nOnly return the 3 short hero messages in a list.`
        : `Give 3 short, punchy CTAs for a product called \"${productName}\".\nCategory: ${productCategory}\nPlatform: ${platform}\nTone: ${tone}\nOnly return the 3 CTAs in a list.`;

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "content-type": "application/json",
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-3-haiku-20240307",
                max_tokens: 512,
                temperature: 0.7,
                messages: [
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        const rawText = data?.content?.[0]?.text || "";

        const suggestions = rawText.trim()
            .split("\n")
            .map(s => s.replace(/^[-\u2022]\s*/, ''))
            .filter(Boolean);

        return NextResponse.json({
            success: true,
            suggestions
        });

    } catch (err) {
        console.error("Claude Suggestion Error:", err);
        return NextResponse.json({
            success: false,
            error: err.message
        }, { status: 500 });
    }
}
