import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json(
        { error: 'الرسالة فارغة' }, 
        { status: 400 }
      );
    }

    // الاتصال بـ Puter API
    const response = await fetch('https://api.puter.com/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://puter.com'
      },
      body: JSON.stringify({
        model: 'qwen',
        messages: [
          { 
            role: 'system', 
            content: 'أنت مساعد مفيد في تطبيق نبض الطيبات.' 
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
      const errorText = await response.text();
      console.error('Puter API Error:', response.status, errorText);
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'تم تجاوز الحد المسموح. انتظر قليلاً.' }, 
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: `خطأ في API: ${response.status}` }, 
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // استخراج الإجابة
    const answer = data.message?.content || 
                   data.choices?.[0]?.message?.content ||
                   'عذراً، لم أتمكن من فهم الرد';

    return NextResponse.json({ 
      reply: answer,
      success: true 
    });

  } catch (error) {
    console.error('❌ Server Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: 'حدث خطأ داخلي في الخادم',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}
