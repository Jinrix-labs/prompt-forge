import { NextResponse } from 'next/server';

export async function GET() {
    const hasGroq = !!process.env.GROQ_API_KEY;
    const hasClaude = !!process.env.ANTHROPIC_API_KEY;

    return NextResponse.json({
        groq: hasGroq ? 'Configured' : 'Missing',
        claude: hasClaude ? 'Configured' : 'Missing',
        timestamp: new Date().toISOString()
    });
}