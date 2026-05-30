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
      max_tokens: 300,
      temperature: 0.5,
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

    const rulesList = rulesContext || FALLBACK_RULES;

    const systemPrompt = `أنت مساعد نبض الطيبات — دليل نظام الطيبات الغذائي.
مصدر معرفتك الوحيد: قواعد نظام الطيبات المرفقة أدناه. ممنوع استخدام أي معرفة خارجية.

هويتك:
- ذكي، سريع، مختصر، ودود
- ترد بجملة أو جملتين فقط — لا تطيل أبداً
- تستخدم لغة قريبة للمستخدم: "أهلاً بك"، "بكل سرور"، "طبعاً"
- لا تستخدم رموزاً أو إيموجي

قواعد صارمة:
1. أجب فقط من القائمة أدناه — لا معلومة من خارجها
2. لا تذكر ممنوعات كبدائل أو خيارات
3. لا نصائح طبية أو تشخيص
4. لا تخترع أطعمة أو قواعد
5. السؤال خارج النظام ← "هذا خارج نطاق نظام الطيبات، أنا هنا لأساعدك فقط بقواعد المسموحات والممنوعات"
6. استوعب كل القواعد في ذاكرتك لترد فوراً بدون تردد

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
    }

    return NextResponse.json({ error: 'جميع خدمات الذكاء الاصطناعي مشغولة حالياً، حاول بعد قليل' }, { status: 503 });

  } catch (error) {
    console.error('Server Crash:', error);
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 });
  }
}
