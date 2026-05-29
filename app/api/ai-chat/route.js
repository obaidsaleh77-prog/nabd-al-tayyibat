import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 });
    }

    const puterResponse = await fetch('https://api.puter.com/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen',
        messages: [
          { role: 'system', content: 'أنت مساعد ذكي في تطبيق نبض الطيبات، تجيب بدقة عن الأسئلة الغذائية والصحية.' },
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (!puterResponse.ok) {
      const errorData = await puterResponse.json();
      console.error('Puter API Error:', errorData);
      return NextResponse.json({ error: 'فشل الاتصال بالذكاء الاصطناعي' }, { status: 500 });
    }

    const data = await puterResponse.json();
    const replyContent = data.message?.content || data.choices?.[0]?.message?.content || JSON.stringify(data);

    return NextResponse.json({ reply: replyContent });

  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'حدث خطأ في المعالج الداخلي' }, { status: 500 });
  }
}
