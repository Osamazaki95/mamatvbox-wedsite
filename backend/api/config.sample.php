<?php
/**
 * قالب إعدادات Mamatvbox.
 * أول تركيب: انسخ الملف ده باسم config.php في نفس المجلد (api) واملأ القيم.
 * ⚠️ التحديثات الجاية مش هتحتوي على config.php، فإعداداتك مش هتتمسح.
 */
return [
    // قاعدة البيانات: hPanel → Databases → MySQL Databases
    'DB_HOST' => 'localhost',
    'DB_NAME' => 'u000000000_mamatvbox',
    'DB_USER' => 'u000000000_admin',
    'DB_PASS' => 'ضع_كلمة_مرور_قاعدة_البيانات',

    // رابط الموقع بدون / في الآخر
    'SITE_URL' => 'https://your-domain.com',

    // كلمة مرور لوحة التحكم /admin
    'ADMIN_PASSWORD' => 'غير_دي_لكلمة_مرور_قوية',

    // كلمة سرية لتشغيل المزامنة من رابط خارجي (بدون مسافات)
    'CRON_SECRET' => 'change-this-random-secret-123456',

    // مفتاح المزامنة التلقائية (اختياري): https://www.themoviedb.org/settings/api
    'TMDB_API_KEY' => '',

    // Paymob: لوحة Paymob → Settings → Account Info
    'PAYMOB_SECRET_KEY' => '',
    'PAYMOB_PUBLIC_KEY' => '',
    'PAYMOB_HMAC_SECRET' => '',
    'PAYMOB_BASE_URL' => 'https://accept.paymob.com',

    // ===== تسجيل الدخول بجوجل =====
    // console.cloud.google.com → APIs & Services → Credentials → OAuth client ID (Web application)
    // Authorized redirect URI:  https://your-domain.com/api/auth/oauth/google/callback
    'GOOGLE_CLIENT_ID' => '',
    'GOOGLE_CLIENT_SECRET' => '',

    // ===== تسجيل الدخول بأبل =====
    // developer.apple.com → Certificates, IDs & Profiles (Services ID + Key "Sign in with Apple")
    // Return URL:  https://your-domain.com/api/auth/oauth/apple/callback
    'APPLE_CLIENT_ID' => '',   // Services ID  (مثال: com.mamatvbox.web)
    'APPLE_TEAM_ID' => '',
    'APPLE_KEY_ID' => '',
    'APPLE_PRIVATE_KEY' => '', // اسم ملف .p8 مرفوع في مجلد api (مثال: AuthKey_ABC123.p8) أو محتواه كامل

    // ===== إرسال الإيميلات (نسيت كلمة المرور) =====
    // hPanel → Emails → اعمل إيميل (مثلاً no-reply@your-domain.com) وحط بياناته هنا
    'SMTP_HOST' => 'smtp.hostinger.com',
    'SMTP_PORT' => '465',
    'SMTP_USER' => '',
    'SMTP_PASS' => '',
    'MAIL_FROM' => '',
];
