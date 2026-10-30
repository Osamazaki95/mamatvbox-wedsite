# Mamatvbox

دليل البث السينمائي القانوني — Next.js 14 (Static Export) + Tailwind + Framer Motion، وباك إند PHP 8 + MySQL.

- **الرفع على Hostinger ولوحة التحكم:** اقرأ [`DASHBOARD.md`](./DASHBOARD.md)
- **البناء:** `npm install && npm run build` ← المجلد `out/` جاهز للرفع على `public_html`
- **التطوير المحلي:** `NEXT_PUBLIC_USE_MOCK=true npm run dev`

## البنية
```
src/            الواجهة (Next.js) — كل البيانات تُحمّل من /api في المتصفح
backend/
  .htaccess     توجيه الروابط + HTTPS + كاش
  seo.php       يقدّم الصفحات ويحقن SEO من لوحة التحكم
  api/
    config.php  الإعدادات (قاعدة البيانات، كلمة مرور الأدمن، TMDB، Paymob)
    index.php   كل الـ API (عام + أدمن + دفع + sitemap/robots)
    sync.php    المزامنة التلقائية من TMDB
    paymob.php  بوابة الدفع
    cron.php    تشغيل المزامنة المجدولة
    seed.json   البيانات الأولية
scripts/pack.mjs  ينسخ backend داخل out بعد البناء
```

## الـ API
| المسار | الوصف |
|---|---|
| `GET /api/titles?type=&platform=&region=` | الأعمال |
| `GET /api/titles/trending` · `/expiring` · `/{slug}` · `/{slug}/similar` | |
| `GET /api/titles/popular?type=&limit=` · `/top10` · `/ramadan` | الأكثر مشاهدة / أفضل ١٠ / رمضان |
| `POST /api/titles/{slug}/view` | عدّ مشاهدة صفحة العمل |
| `GET /api/config` | إعدادات الموقع العامة (الأقسام، التصنيفات، السوشيال) |
| `GET /api/platforms` · `/api/search?q=` · `/api/people/{slug}` | |
| `GET /api/meta/countries` · `/api/billing/plans` | |
| `POST /api/admin-auth` · `DELETE` | دخول/خروج الأدمن |
| `/api/admin/platforms` (GET/POST) · `/api/admin/platforms/{id}` (PUT/DELETE) | إدارة المنصات |
| `/api/admin/settings` (GET/PUT) · `/api/admin/integrations` · `POST /api/admin/sync` | الإعدادات والمزامنة |
| `POST /api/admin/upload?folder=posters\|logos` | رفع بوستر أو لوجو منصة |
| `POST /api/payments/checkout` · `/api/payments/webhook` | Paymob |
| `/sitemap.xml` · `/robots.txt` | تلقائي |
