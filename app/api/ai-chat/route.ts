import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const runtime = 'nodejs';

const MODELS = [
  'openrouter/free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'deepseek/deepseek-v4-flash:free',
  'google/gemma-4-31b-it:free',
];

const SYSTEM_PROMPT = 'أنت مساعد صحي وغذائي في تطبيق نبض الطيبات. أجب بدقة ووضوح.';

async function tryModel(apiKey: string, userMessage: string, model: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nabd-al-tayyibat.vercel.app',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    const parsed = JSON.parse(errText);
    const isRateLimit = response.status === 429;
    return { ok: false, isRateLimit, status: response.status, errText: parsed?.error?.message || errText };
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة.';
  return { ok: true, answer };
}

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

    for (const model of MODELS) {
      const result = await tryModel(apiKey, userMessage, model);

      if (result.ok) {
        return NextResponse.json({ reply: result.answer, success: true });
      }

      if (!result.isRateLimit) {
        return NextResponse.json({ error: 'فشل الاتصال بالذكاء الاصطناعي' }, { status: result.status });
      }
    }

    return NextResponse.json({ error: 'جميع خدمات الذكاء الاصطناعي مشغولة حالياً، حاول بعد قليل' }, { status: 503 });

  } catch (error) {
    console.error('Server Crash:', error);
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 });
  }
}
