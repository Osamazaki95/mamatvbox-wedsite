<?php
/**
 * Serves the exported Next.js pages and injects SEO tags (title, description,
 * keywords, Open Graph, JSON-LD) from the dashboard settings on every request.
 */
declare(strict_types=1);

$path = trim((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
$path = (string) preg_replace('#[^a-zA-Z0-9/_\-]#', '', urldecode($path));
$kind = null;
$slug = null;

if (preg_match('#^(title|person)/([^/]+)$#', $path, $m) && $m[2] !== '_') {
    [, $kind, $slug] = $m;
    $file = __DIR__ . "/{$kind}/_/index.html";
} else {
    $file = __DIR__ . '/' . ($path === '' ? '' : $path . '/') . 'index.html';
}

$status = 200;
if (!is_file($file)) { $status = 404; $file = __DIR__ . '/404.html'; }
$html = (string) @file_get_contents($file);

$e = fn($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');

try {
    require_once __DIR__ . '/api/lib.php';

    if (preg_match('#^admin(/|$)#', $path) && !is_admin()) {
        header('Location: /admin-login/?next=' . rawurlencode('/' . $path . '/'));
        exit;
    }

    $seo = kv_get('settings')['seo'];
    $base = site_url();
    $title = $seo['title'];
    $desc = $seo['description'];
    $image = $seo['ogImage'];
    $keywords = $seo['keywords'];
    $type = 'website';
    $canonical = $base . '/' . ($path === '' ? '' : $path . '/');
    $ld = ['@context' => 'https://schema.org', '@type' => 'WebSite', 'name' => $seo['siteName'], 'url' => $base, 'inLanguage' => 'ar',
        'potentialAction' => ['@type' => 'SearchAction', 'target' => $base . '/search/?q={search_term_string}', 'query-input' => 'required name=search_term_string']];

    $pages = [
        'movies' => 'دليل وأرشيف الأفلام القانونية', 'series' => 'دليل المسلسلات والدراما', 'programs' => 'البرامج والوثائقيات',
        'kids' => 'عالم الأطفال والكرتون', 'platforms' => 'دليل ومقارنة المنصات', 'pricing' => 'باقات العضوية والأسعار',
        'search' => 'البحث', 'legal' => 'المركز القانوني وسياسات الاستخدام', 'login' => 'تسجيل الدخول', 'signup' => 'إنشاء حساب',
    ];
    if (isset($pages[$path])) $title = $pages[$path] . ' | ' . $seo['siteName'];

    if ($kind === 'title') {
        foreach (kv_get('titles') as $t) {
            if (($t['slug'] ?? '') !== $slug) continue;
            $title = 'أين تشاهد ' . $t['title'] . ' (' . $t['year'] . ') | ' . $seo['siteName'];
            $desc = mb_substr(($t['overview'] ?? '') ?: ('اعرف فين تتفرج على ' . $t['title'] . ' قانونياً وبأعلى جودة.'), 0, 160);
            $image = $t['poster'] ?? $image;
            $keywords = array_merge(array_filter([$t['title'], $t['originalTitle'] ?? null, 'أين أشاهد ' . $t['title']]), $t['genres'] ?? [], $keywords);
            $type = ($t['type'] ?? '') === 'series' ? 'video.tv_show' : 'video.movie';
            $ld = array_filter([
                '@context' => 'https://schema.org', '@type' => ($t['type'] ?? '') === 'series' ? 'TVSeries' : 'Movie',
                'name' => $t['title'], 'alternateName' => $t['originalTitle'] ?? null, 'image' => $t['poster'] ?? null,
                'description' => $t['overview'] ?? null, 'datePublished' => (string) $t['year'], 'genre' => $t['genres'] ?? [],
                'director' => !empty($t['director']) ? ['@type' => 'Person', 'name' => $t['director']] : null,
                'actor' => array_map(fn($n) => ['@type' => 'Person', 'name' => $n], $t['cast'] ?? []),
            ]);
            break;
        }
    }

    $head = '<title>' . $e($title) . '</title>'
        . '<meta name="description" content="' . $e($desc) . '"/>'
        . '<meta name="keywords" content="' . $e(implode(', ', array_unique($keywords))) . '"/>'
        . '<link rel="canonical" href="' . $e($canonical) . '"/>'
        . '<meta property="og:type" content="' . $type . '"/>'
        . '<meta property="og:locale" content="ar_EG"/>'
        . '<meta property="og:site_name" content="' . $e($seo['siteName']) . '"/>'
        . '<meta property="og:title" content="' . $e($title) . '"/>'
        . '<meta property="og:description" content="' . $e($desc) . '"/>'
        . '<meta property="og:url" content="' . $e($canonical) . '"/>'
        . ($image ? '<meta property="og:image" content="' . $e($image) . '"/><meta name="twitter:image" content="' . $e($image) . '"/>' : '')
        . '<meta name="twitter:card" content="summary_large_image"/>'
        . '<meta name="twitter:title" content="' . $e($title) . '"/>'
        . '<meta name="twitter:description" content="' . $e($desc) . '"/>'
        . ($seo['twitterHandle'] ? '<meta name="twitter:site" content="' . $e($seo['twitterHandle']) . '"/>' : '')
        . ($seo['googleVerification'] ? '<meta name="google-site-verification" content="' . $e($seo['googleVerification']) . '"/>' : '')
        . '<meta name="robots" content="' . ($seo['indexing'] && !preg_match('#^(admin|account|checkout|emails)#', $path) ? 'index, follow' : 'noindex, nofollow') . '"/>'
        . '<script type="application/ld+json">' . json_encode($ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';

    $html = (string) preg_replace('#<title>.*?</title>#s', '', $html);
    $html = (string) preg_replace('#<meta\s+(name|property)="(description|keywords|robots|og:[^"]*|twitter:[^"]*|google-site-verification)"[^>]*>#i', '', $html);
    $html = (string) preg_replace('#<link rel="canonical"[^>]*>#i', '', $html);
    $html = (string) preg_replace('#</head>#', $head . '</head>', $html, 1);
} catch (Throwable $ex) {
    error_log('[mamatvbox seo] ' . $ex->getMessage());
}

http_response_code($status);
header('Content-Type: text/html; charset=utf-8');
echo $html;
