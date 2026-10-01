# Mamatvbox — Next.js 14 + Tailwind CSS

دليل البث السينمائي القانوني — واجهة كاملة RTL عربية مبنية بـ **Next.js 14 (App Router)** و **Tailwind CSS** و **Framer Motion**.

## التشغيل

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

## الرفع على السيرفر

**Node مباشرة (VPS):**
```bash
npm install
npm run build
npm start            # يستخدم PORT أو 3000
```
استخدم `pm2 start npm --name mamatvbox -- start` للتشغيل الدائم، وضع Nginx كـ reverse proxy على المنفذ 3000.

**Docker:**
```bash
docker build -t mamatvbox .
docker run -p 3000:3000 --env-file .env.local mamatvbox
```

**Vercel:** ارفع المجلد مباشرة — لا يحتاج إعداد إضافي.

## ربط الـ API الحقيقي

كل التعامل مع الباك إند موجود في `src/lib/api/`:

| الملف | الدور |
|---|---|
| `endpoints.ts` | كل مسارات الـ API في مكان واحد (عدّلها لتطابق الباك إند) |
| `client.ts` | `apiFetch` — base URL، JSON، توكن `Authorization`، معالجة الأخطاء `ApiError` |
| `types.ts` | أنواع TypeScript لكل البيانات (Title, Platform, Plan, Invoice, ...) — هي العقد بين الواجهة والباك إند |
| `index.ts` | الـ services: `titlesApi`, `searchApi`, `authApi`, `meApi`, `billingApi`, `metaApi`, `adminApi` |
| `hooks.ts` | `useResource` + هوكس جاهزة للصفحات التفاعلية |

خطوات التحويل:
1. ضع رابط الباك إند في `NEXT_PUBLIC_API_BASE_URL`.
2. غيّر `NEXT_PUBLIC_USE_MOCK=false`.
3. تأكد أن ردود الباك إند تطابق الأنواع في `types.ts`.

كل دالة service تحتوي الفرعين (mock / real) بشكل صريح، مثال:

```ts
bySlug(slug) {
  if (USE_MOCK) return mockDelay(mock.titles.find(...));
  return apiFetch(endpoints.titles.bySlug(slug), { revalidate: 300 });
}
```

التوكن يُقرأ من `localStorage['mtb_token']` — عدّل `authHeader()` في `client.ts` لو تستخدم cookies.

> للتجربة: في صفحة الدفع أي رقم بطاقة ينتهي بـ `0000` يُرجع رفض مصرفي، واختيار «فوري» يُرجع كود سداد.

## الصفحات

| المسار | الشاشة |
|---|---|
| `/` | الرئيسية |
| `/movies` `/series` `/programs` `/kids` | الكتالوجات مع الفلاتر والصفحات |
| `/title/[slug]` | صفحة العمل + الإعلان التشويقي + أين تشاهد |
| `/person/[slug]` | صفحة الممثل |
| `/platforms` | دليل ومقارنة المنصات |
| `/platforms/compare` | أداة مقارنة تغطية القائمة |
| `/pricing` | الباقات |
| `/search` | البحث (حالة فارغة / نتائج / بدون نتائج + طلب إضافة) — و `Ctrl + K` من أي صفحة |
| `/login` `/signup` `/check-email` | الدخول بالرابط السحري |
| `/onboarding` | الإعداد في ٤ خطوات |
| `/watchlist` `/notifications` | قائمتي والتنبيهات (+ نافذة ضبط التنبيه) |
| `/account` `/account/subscription` `/account/billing` `/account/platforms` `/account/settings` `/account/cancel` | الحساب |
| `/checkout` `/checkout/success` `/checkout/failed` `/checkout/fawry` | الدفع (مع شاشة المعالجة) |
| `/legal` | المركز القانوني |
| `/emails` | معاينة قوالب البريد |
| `/admin` `/admin/platforms` `/admin/matrix` `/admin/titles` `/admin/rows` | لوحة الإدارة |
| 404 / 500 | `not-found.tsx` و `error.tsx` |

## البنية

```
src/
  app/            الصفحات (route groups: (site) عامة، (member) للمشترك)
  components/
    layout/       Navbar, Footer, Logo, FlowHeader, CookieConsent
    ui/           Button, Badge, Toggle, Checkbox, Field, Faq
    title/        Poster, TitleCard, TitleRow, TitleActions, PlatformChip
    motion.tsx    Reveal, Stagger, CountUp, Bar — أساس كل الأنيميشن
  lib/api/        طبقة الـ API
  lib/mock/       بيانات تجريبية
```

## الصور

البوسترات تُقرأ من `title.poster` (رابط من الـ API أو `/public/posters`). لو غير موجود، يظهر بديل ملون باسم العمل. أضف دومين الصور في `next.config.mjs` إذا لزم.

## الأنيميشن

- ظهور تدريجي عند التمرير (`Reveal` / `Stagger`) لكل الأقسام
- عدادات أرقام متحركة (`CountUp`) وأشرطة تقدم تمتلئ عند الظهور (`Bar`)
- مؤشرات تبويب منزلقة بـ `layoutId` (النافبار، الفلاتر، الحساب، الأدمن)
- انتقالات الخطوات في الـ onboarding باتجاه RTL
- نوافذ منبثقة بـ spring (البحث، الإعلان، التنبيهات، الكوكيز)
- شاشة معالجة الدفع بحلقات دوّارة ومراحل نصية
- إعادة ترتيب صفوف الرئيسية بالسحب (`Reorder`) في الأدمن
- يحترم `prefers-reduced-motion`
