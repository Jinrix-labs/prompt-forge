import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        hasGroqKey: !!process.env.GROQ_API_KEY,
        hasClaudeKey: !!process.env.ANTHROPIC_API_KEY,
        groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
        claudeKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        vercelRegion: process.env.VERCEL_REGION,
        timestamp: new Date().toISOString()
    });
}
