export async function GET() {
  return Response.json({
    hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
    hasGroq: !!process.env.GROQ_API_KEY,
    anthropicStart: process.env.ANTHROPIC_API_KEY?.substring(0, 15) || 'MISSING',
    groqStart: process.env.GROQ_API_KEY?.substring(0, 15) || 'MISSING',
    allKeys: Object.keys(process.env).filter(k => k.includes('API'))
  });
}

