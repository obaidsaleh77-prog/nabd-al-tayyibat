# نبض الطيبات (Nabd Al-Tayyibat)

تطبيق ويب PWA-ready لمتابعة الالتزام بنظام «الطيبات» للدكتور ضياء العوضي.

## الميزات

- مصادقة + OTP + إقرار مسؤولية
- لوحة تحكم: وجبات، وزن، مؤشر التزام، ساعة حية
- محرك قواعد + OCR كاميرا + شات Groq/LangChain
- مدونة تعليمية + لوحة أدمن (RBAC)
- PWA (manifest + service worker)

## الإعداد

1. انسخ `.env.example` إلى `.env.local` واملأ مفاتيح Supabase.
2. في Supabase Dashboard:
   - فعّل **Email** مع **OTP** للتسجيل
   - نفّذ `supabase/schema.sql` في SQL Editor
3. ثبّت الحزم وشغّل:

```bash
npm install
npm run dev
```

4. عيّن `NEXT_PUBLIC_SITE_URL` و`GROQ_API_KEY` و`SUPABASE_SERVICE_ROLE_KEY` (لحذف الحساب).
5. (اختياري) نفّذ `supabase/seed.sql` لمقال المدونة ومستند المعرفة.

## ترقية مستخدم إلى أدمن

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```
