import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'الرسالة فارغة أو غير صحيحة' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('Missing OPENROUTER_API_KEY');
      return NextResponse.json({ error: 'مفتاح الخادم مفقود' }, { status: 500 });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nabd-al-tayyibat.vercel.app',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-next-80b-a3b-instruct:free',
        messages: [
          { role: 'system', content: 'أنت مساعد صحي وغذائي في تطبيق نبض الطيبات. أجب بدقة ووضوح.' },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter Error:', response.status, errText);
      return NextResponse.json({ error: 'فشل الاتصال بالذكاء الاصطناعي' }, { status: response.status });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة.';

    return NextResponse.json({ reply: answer, success: true });

  } catch (error) {
    console.error('Server Crash:', error);
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 });
  }
}
