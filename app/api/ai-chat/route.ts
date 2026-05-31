import { NextRequest, NextResponse } from 'next/server';
import { getRulesContextSummary } from '@/lib/ai/rag';

export const maxDuration = 60;
export const runtime = 'nodejs';

const MODELS = [
  'google/gemma-4-26b-a4b-it:free',
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'google/gemma-4-31b-it:free',
  'openrouter/free',
];

const FALLBACK_RULES = `المسموحات: أرز، بطاطا، بطاطس، ذرة، شوفان، زيت زيتون، سمن نباتي، زيت نباتي، جبنة مسموحة، جبن قليل الدسم، لحم أحمر، سمك، تفاح، موز، توت، عسل، حلوى مسموحة، ماء، شاي، قهوة بدون حليب

الممنوعات:
- دقيق أبيض ومشتقاته، مكرونة، خبز، كيك، بسكويت، شعيرية
- حليب ومشتقاته: جبن قريش، جبنة فيتا، زبادي، لبن، رايب، جبنة بيضاء كتل، جبنة صفراء، لبنة، قشطة، كريمة
- دجاج، بيض، أومليت، مايونيز، لانشون، نقانق، برجر
- مأكولات بحرية: جمبري، حبار، أخطبوط، قشريات بحرية
- أسماك: نهرية، مزارع
- بقوليات بجميع أشكالها: فول، فاصولياء، عدس، بسلة، لوبيا، فول سوداني، حمص
- خضروات ورقية: سبانخ، خس (جميع الأنواع: روماني، آيسبرغ، زبدى)، جرجير، جرجير ماء، ملفوف (كرنب) بجميع أنواعه (أحمر، سافوي، صيني، بروكسل)، سلق، بقدونس (مجعد ومسطح)، كزبرة، كزبرة يابانية، نعناع، نعناع فلفلي، ريحان، زعتر، كيل، بوك تشوي، خردل أخضر، هندباء، إندف، حميض، كرات، شبت، حلبة، ميرمية، إكليل جبل، أوريجانو، طرخون، بابونج، قطيفة، رغل، حمحم، ملوخية، ميكروجريين وبراعم (فجل، برسيم، دوار شمس، بازلاء)، أوراق كاري، أوراق توت، أوراق عنب، أوراق مورينجا، أوراق قراص
- خضروات: طماطم بجميع أنواعها (كرزية، عنبية، خضراء، سوداء)، خيار (لبناني، شامي، أرميني)، كوسا (مدورة، صفراء، مرة)، باذنجان (أبيض، طويل، مخطط)، فلفل (رومي، حار، أصفر، برتقالي، بنفسجي، هابانيرو، جلابينو)، جزر (أرجواني، أصفر، بري)، بطاطا حلوة (بيضاء، حمراء)، بصل (أحمر، أبيض، أخضر، لؤلؤي، شلوت)، ثوم، ثوم الفيل، كراث، كراث بري، لفت (أبيض، سويدي، أسود، بري)، شمندر، فجل (أحمر، أبيض، أسود، دائري، بري)، كرفس (سيقان وأوراق وجذر)، بروكلي، قرنبيط، خرشوف، ذرة حلوة، بامية، بازيلاء (سكرية، ثلج، مجمدة)، فاصوليا (خضراء، بيضاء، حمراء، فرنسية، يابانية، سوداء، مرقطة، مجمدة)، عدس (أحمر، أخضر، بني، أسود، مجفف)، حمص (أخضر، أسود، مجفف)، فول (أسود، مجفف)، لوبيا (عين جمل، مجففة)، ترمس (حلو، مر، مجفف)، يقطين (صغير، كبير، جوز، مر، هالوين)، قرع (أصفر، عسل، زيت)، بقدونس جذر، جزر أبيض، بطاطس حلوة مجففة
- فواكه ممنوعة: برتقال، ليمون، خوخ، دراق، كمثرى، بطيخ، شمام، كانتالوب، كيوي، مانجو، أناناس، أفوكادو، توت أزرق، توت أحمر، توت العليق، جريب فروت، يوسفي، بوملي، سفرجل، كاكي، بابايا، جوز هند، عنب ثعلب، فرامبواز، كشمش، زبيب، عنب، تمر
- مشروبات ممنوعة: شاي أحمر بجميع أنواعه، كوكاكولا، بيبسي، سبرايت، سفن أب، فانتا (برتقال، عنب، فراولة)، ميريندا (برتقال، تفاح، فراولة)، دكتور بيبر، ماونتن ديو، جميع المشروبات دايت وزيرو، شويبس، تونيك ووتر، مياه غازية، بيج كولا، مشروبات الطاقة (ريد بول، مونستر، روك ستار، باوريد)
- إضافات: سكر، محليات صناعية، جلوتين، خميرة، MSG، ملح مفرط`;

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
