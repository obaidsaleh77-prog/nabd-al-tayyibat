import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json(
        { error: 'الرسالة غير صحيحة أو فارغة' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENROUTER_API_KEY is missing');
      return NextResponse.json(
        { error: 'مفتاح API غير موجود في الخادم' },
        { status: 500 }
      );
    }

    console.log('🚀 Calling OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nabd-al-tayyibat.vercel.app',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد صحي وغذائي متخصص في تطبيق نبض الطيبات. أجب بدقة ووضوح باللغة العربية.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter Error:', response.status, errorText);
      return NextResponse.json(
        { error: `فشل الاتصال بالذكاء الاصطناعي (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Success:', data);

    const answer = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من توليد إجابة.';

    return NextResponse.json({
      reply: answer,
      success: true
    });

  } catch (error) {
    console.error('💥 Server Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في المعالج: ' + error.message },
      { status: 500 }
    );
  }
}
