import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nabd-al-tayyibat.vercel.app',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-7b-instruct:free',
        messages: [
          { 
            role: 'system', 
            content: 'أنت مساعد مفيد في تطبيق نبض الطيبات للإجابة على الأسئلة الصحية والغذائية.' 
          },
          { 
            role: 'user', 
            content: userMessage 
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter Error:', errorData);
      return NextResponse.json(
        { error: 'فشل الاتصال بالذكاء الاصطناعي' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة';

    return NextResponse.json({ reply: answer, success: true });

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي' }, 
      { status: 500 }
    );
  }
}
