import { NextRequest, NextResponse } from 'next/server';
import { getRulesContextSummary } from '@/lib/ai/rag';

export const maxDuration = 60;
export const runtime = 'nodejs';

const MODELS = [
  'google/gemma-4-26b-a4b-it:free',
  'openrouter/free',
  'openai/gpt-oss-20b:free',
  'openai/gpt-oss-120b:free',
  'google/gemma-4-31b-it:free',
];

const FALLBACK_RULES = `المسموحات: نشويات (أرز، بطاطا، بطاطس، ذرة، شوفان)، دهون (زيت زيتون، سمن نباتي، زيت نباتي)، أجبان (جبنة مسموحة، جبن قليل الدسم)، لحوم (لحم أحمر، دجاج، سمك)، فواكه (تفاح، برتقال، موز، توت)، حلويات (عسل، حلوى مسموحة)، مشروبات (ماء، شاي، قهوة بدون حليب)

الممنوعات: ألبان (حليب، لبن، رايب، لبنة، قشطة، كريمة - خطورة عالية)، بيض (بيض، أومليت، مايونيز - خطورة عالية)، مخبوزات (خبز، معكرونة، كيك، بسكويت، شعيرية - متوسطة)، خضروات (طماطم، خيار، بصل، ثوم، خس، جزر - متوسطة)، بقوليات (عدس، حمص، فول، فاصوليا، بازيلا - خطورة عالية)، بروتين ممنوع (جبنة صفراء، لانشون، نقانق، برجر - خطورة حرجة)، فواكه ممنوعة (عنب، بطيخ، مانجو، تمر - متوسطة)، مشروبات ممنوعة (عصير، مشروب غازي، كولا، شاي بالحليب - خطورة عالية)، إضافات (سكر، محليات، جلوتين، خميرة، MSG، ملح مفرط - خطورة حرجة)`;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tryModel(apiKey: string, userMessage: string, model: string, systemPrompt: string) {
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 200,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsed;
    try { parsed = JSON.parse(errText); } catch { parsed = {}; }
    return { ok: false, isRateLimit: response.status === 429, status: response.status, errText: parsed?.error?.message || errText };
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

    let rulesContext = '';
    try {
      rulesContext = await getRulesContextSummary();
    } catch (e) {
      console.error('Failed to fetch rules context:', e);
    }

    const rulesList = rulesContext || FALLBACK_RULES;

    const systemPrompt = `أنت مساعد نبض الطيبات. مصدر معرفتك الوحيد: قواعد نظام الطيبات أدناه فقط. ممنوع استخدام أي معرفة خارجية.

أسلوبك: ذكي، سريع، مختصر، ودود. ترد بجملة أو اثنتين بالعربية الفصحى البسيطة. لا تستخدم إيموجي.

قواعد صارمة:
1. أجب فقط من القائمة أدناه
2. لا تذكر ممنوعات كبدائل
3. لا نصائح طبية أو تشخيص
4. لا تخترع قواعد
5. السؤال خارج النظام ← "هذا خارج نطاق نظام الطيبات"

قواعد نظام الطيبات:
${rulesList}`;

    for (const model of MODELS) {
      const result = await tryModel(apiKey, userMessage, model, systemPrompt);

      if (result.ok) {
        return NextResponse.json({ reply: result.answer, success: true });
      }

      if (!result.isRateLimit) {
        return NextResponse.json({ error: 'فشل الاتصال بالذكاء الاصطناعي' }, { status: result.status });
      }

      await delay(500);
    }

    return NextResponse.json({ error: 'جميع خدمات الذكاء الاصطناعي مشغولة حالياً، حاول بعد قليل' }, { status: 503 });

  } catch (error) {
    console.error('Server Crash:', error);
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 });
  }
}
