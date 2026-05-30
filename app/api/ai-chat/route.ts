import { NextRequest, NextResponse } from 'next/server';
import { getRulesContextSummary } from '@/lib/ai/rag';

export const maxDuration = 60;
export const runtime = 'nodejs';

const MODELS = [
  'openrouter/free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'deepseek/deepseek-v4-flash:free',
  'google/gemma-4-31b-it:free',
];

const BASE_SYSTEM_PROMPT = `أنت مساعد "نبض الطيبات" الحصري. دورك الوحيد هو الإجابة عن أسئلة المستخدمين حول نظام الطيبات الغذائي بناءً على القواعد المسموحة والممنوعة أدناه.

قوانين صارمة:
1. لا تجيب عن أي سؤال خارج نظام الطيبات (تغذية عامة، طب، وصفات، برامج أخرى)
2. لا تقدم نصائح طبية أو تشخيصية
3. إذا سألك المستخدم عن شيء خارج النظام، قل له: "هذا السؤال خارج نطاق نظام الطيبات. أنا هنا للإجابة فقط عن الأسئلة المتعلقة بقواعد نظام الطيبات (المسموحات والممنوعات)."
4. لا تخترع قواعد غير موجودة في القائمة أدناه
5. إذا سأل عن طعام معين، ابحث عنه في القائمة المرفقة وأخبره إن كان مسموحاً أو ممنوعاً مع ذكر السبب

قواعد نظام الطيبات المرجعية:\n`;

const FALLBACK_RULES = `المسموحات:
- نشويات: أرز، بطاطا، بطاطس، ذرة، شوفان (حسب الجدول الزمني للنظام)
- دهون: زيت زيتون، سمن نباتي، زيت نباتي (بكميات محددة)
- أجبان: جبنة مسموحة، جبن قليل الدسم (الأنواع المسموحة فقط)
- لحوم: لحم أحمر، دجاج، سمك (بدون إضافات محظورة)
- فواكه: تفاح، برتقال، موز، توت (حسب المرحلة)
- حلويات: عسل، حلوى مسموحة (كميات محدودة)
- مشروبات: ماء، شاي، قهوة بدون حليب (بدون سكر مضاف)

الممنوعات:
- ألبان (خطورة عالية 12%): حليب، لبن، رايب، لبنة، قشطة، كريمة - البروتين الحيواني واللاكتوز يهيج الأمعاء
- بيض (خطورة عالية 12%): بيض، أومليت، مايونيز - يسبب حساسية وتهيج لمرضى القولون
- مخبوزات (متوسطة 10%): خبز، معكرونة، كيك، بسكويت، شعيرية - تحتوي على الجلوتين والخميرة
- خضروات (متوسطة 10%): طماطم، خيار، بصل، ثوم، خس، جزر - الألياف والقشور تهيج الجهاز الهضمي
- بقوليات (خطورة عالية 12%): عدس، حمص، فول، فاصوليا، بازيلا - صعبة الهضم
- بروتين ممنوع (خطورة حرجة 15%): جبنة صفراء، لانشون، نقانق، برجر - لحوم/أجبان مصنعة
- فواكه ممنوعة (متوسطة 10%): عنب، بطيخ، مانجو، تمر - نسبة عالية من السكريات
- مشروبات ممنوعة (خطورة عالية 12%): عصير، مشروب غازي، كولا، شاي بالحليب - سكريات مضافة ومواد حافظة
- إضافات (خطورة حرجة 15%): سكر، محليات، جلوتين، خميرة، MSG، ملح مفرط - محفزات التهابات`;

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
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsed;
    try { parsed = JSON.parse(errText); } catch { parsed = {}; }
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

    let rulesContext = '';
    try {
      rulesContext = await getRulesContextSummary();
    } catch (e) {
      console.error('Failed to fetch rules context:', e);
    }

    const systemPrompt = BASE_SYSTEM_PROMPT + (rulesContext || FALLBACK_RULES);

    for (const model of MODELS) {
      const result = await tryModel(apiKey, userMessage, model, systemPrompt);

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
