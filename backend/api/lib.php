<?php
declare(strict_types=1);

// config.php (your real settings) is never shipped in updates; config.sample.php is the template.
$CFG = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php')
    : (is_file(__DIR__ . '/config.sample.php') ? (require __DIR__ . '/config.sample.php') : []);
$KV = [];
const IMG = 'https://image.tmdb.org/t/p/';

function cfg(string $k, string $d = ''): string { global $CFG; return isset($CFG[$k]) ? (string) $CFG[$k] : $d; }

function out($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    if (cfg('DB_NAME') === '') throw new RuntimeException('قاعدة البيانات غير مضبوطة في api/config.php');
    $pdo = new PDO(
        'mysql:host=' . cfg('DB_HOST', 'localhost') . ';dbname=' . cfg('DB_NAME') . ';charset=utf8mb4',
        cfg('DB_USER'), cfg('DB_PASS'),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $pdo->exec('CREATE TABLE IF NOT EXISTS mtb_kv (
        k VARCHAR(64) NOT NULL PRIMARY KEY,
        v LONGTEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    return $pdo;
}

function seed(): array {
    static $s = null;
    return $s ??= json_decode((string) file_get_contents(__DIR__ . '/seed.json'), true);
}

function default_settings(): array {
    return [
        'seo' => [
            'siteName' => 'Mamatvbox',
            'title' => 'Mamatvbox — دليل البث السينمائي الموحد',
            'description' => 'اعرف فين تتفرج على أي فيلم أو مسلسل قانونياً وبأعلى جودة. قارن التوفر والأسعار عبر منصات البث الرقمية المعتمدة في مصر والوطن العربي.',
            'keywords' => ['أين أشاهد', 'منصات البث', 'شاهد VIP', 'Watch It', 'نتفليكس مصر', 'أفلام 4K', 'مسلسلات عربية', 'مقارنة الاشتراكات'],
            'ogImage' => '', 'canonicalUrl' => '', 'googleVerification' => '', 'twitterHandle' => '', 'indexing' => true,
        ],
        'sync' => ['enabled' => true, 'intervalHours' => 6, 'regions' => ['EG', 'SA', 'AE'], 'pages' => 2, 'autoAddProviders' => true],
        'payments' => ['provider' => 'paymob', 'currency' => 'EGP', 'testMode' => true, 'integrationIds' => ['card' => '', 'wallet' => '', 'kiosk' => '']],
        // Login/sign-up and the plans page are hidden until switched on from the dashboard.
        'features' => ['accounts' => false, 'pricing' => false],
        'home' => [
            'platformsCount' => 6,
            'top10' => ['enabled' => true, 'title' => 'الأعلى مشاهدة — أفضل ١٠ أعمال'],
            'ramadan' => ['enabled' => false, 'title' => 'مسلسلات رمضان', 'subtitle' => 'كل مسلسلات الموسم الرمضاني وأين تشاهدها قانونياً'],
            'mostWatched' => ['enabled' => true],
        ],
        'social' => [],
        'taxonomy' => default_taxonomy(),
    ];
}

/** Origin and genre lists for each section — editable from the dashboard (التصنيفات). */
function default_taxonomy(): array {
    return [
        'movie' => [
            'origins' => ['مصري', 'عربي', 'خليجي', 'أجنبي', 'ياباني', 'كوري', 'هندي', 'تركي'],
            'genres' => ['أكشن', 'دراما', 'كوميديا', 'خيال علمي', 'رعب', 'إثارة', 'جريمة', 'رومانسي', 'مغامرات', 'غموض', 'فانتازيا', 'تاريخي', 'حرب', 'عائلي', 'رسوم متحركة', 'وثائقي', 'موسيقي', 'سيرة ذاتية'],
        ],
        'series' => [
            'origins' => ['مصري', 'خليجي', 'عربي', 'أجنبي', 'تركي', 'كوري', 'ياباني', 'هندي'],
            'genres' => ['دراما', 'كوميديا', 'أكشن', 'إثارة', 'جريمة', 'رومانسي', 'اجتماعي', 'تاريخي', 'غموض', 'خيال علمي', 'رعب', 'فانتازيا', 'عائلي', 'وثائقي'],
        ],
        'kids' => [
            'origins' => ['عربي', 'مدبلج بالعربي', 'أجنبي', 'ياباني (أنمي)'],
            'genres' => ['مغامرات', 'كوميديا', 'تعليمي', 'أنمي', 'خيال', 'عائلي', 'موسيقي', 'رياضي', 'أبطال خارقون'],
        ],
        'program' => [
            'origins' => ['مصري', 'عربي', 'خليجي', 'أجنبي'],
            'genres' => ['حواري', 'وثائقي', 'واقعي', 'مسابقات', 'رياضة', 'طبخ', 'ديني', 'منوعات', 'كوميدي', 'أخبار'],
        ],
    ];
}

/** Clean list of short unique strings (accepts an array or "a، b، c"). */
function str_list($v, int $max = 80, int $len = 40): array {
    if (is_string($v)) $v = preg_split('/[,،\n]+/u', $v) ?: [];
    $out = [];
    foreach ((array) $v as $x) {
        $x = trim((string) $x);
        if ($x !== '' && mb_strlen($x) <= $len) $out[$x] = true;
    }
    return array_slice(array_keys($out), 0, $max);
}

function merge_taxonomy($v): array {
    $out = [];
    foreach (default_taxonomy() as $type => $def) {
        $cur = is_array($v) && is_array($v[$type] ?? null) ? $v[$type] : [];
        $out[$type] = [
            'origins' => array_key_exists('origins', $cur) ? str_list($cur['origins']) : $def['origins'],
            'genres' => array_key_exists('genres', $cur) ? str_list($cur['genres']) : $def['genres'],
        ];
    }
    return $out;
}

const SOCIAL_NETWORKS = ['facebook', 'instagram', 'x', 'tiktok', 'youtube', 'snapchat', 'whatsapp', 'telegram', 'threads', 'linkedin', 'pinterest', 'discord', 'twitch', 'spotify', 'email', 'website'];

function clean_social($v): array {
    $out = [];
    foreach (is_array($v) ? $v : [] as $s) {
        if (!is_array($s)) continue;
        $net = (string) ($s['network'] ?? '');
        $url = trim((string) ($s['url'] ?? ''));
        if (!in_array($net, SOCIAL_NETWORKS, true)) continue;
        if ($net === 'email' && filter_var($url, FILTER_VALIDATE_EMAIL)) $url = 'mailto:' . $url;
        if ($net === 'whatsapp' && preg_match('/^\+?[0-9 ]{7,}$/', $url)) $url = 'https://wa.me/' . preg_replace('/\D/', '', $url);
        if (!preg_match('#^(https?://|mailto:)#i', $url)) continue;
        $out[] = [
            'id' => preg_replace('/[^a-z0-9]/', '', strtolower((string) ($s['id'] ?? ''))) ?: bin2hex(random_bytes(4)),
            'network' => $net,
            'url' => mb_substr($url, 0, 500),
            'label' => mb_substr(trim((string) ($s['label'] ?? '')), 0, 40),
            'active' => ($s['active'] ?? true) !== false,
        ];
        if (count($out) >= 30) break;
    }
    return $out;
}

function merge_home($v): array {
    $d = default_settings()['home'];
    $v = is_array($v) ? $v : [];
    $b = fn($x, bool $def) => $x === null ? $def : (bool) $x;
    $txt = fn($x, string $def, int $len = 80) => ($t = mb_substr(trim((string) ($x ?? '')), 0, $len)) !== '' ? $t : $def;
    return [
        'platformsCount' => max(1, min(48, (int) ($v['platformsCount'] ?? $d['platformsCount']))),
        'top10' => [
            'enabled' => $b($v['top10']['enabled'] ?? null, $d['top10']['enabled']),
            'title' => $txt($v['top10']['title'] ?? null, $d['top10']['title']),
        ],
        'ramadan' => [
            'enabled' => $b($v['ramadan']['enabled'] ?? null, $d['ramadan']['enabled']),
            'title' => $txt($v['ramadan']['title'] ?? null, $d['ramadan']['title']),
            'subtitle' => mb_substr(trim((string) ($v['ramadan']['subtitle'] ?? $d['ramadan']['subtitle'])), 0, 160),
        ],
        'mostWatched' => ['enabled' => $b($v['mostWatched']['enabled'] ?? null, $d['mostWatched']['enabled'])],
    ];
}

function merge_settings(array $v): array {
    $d = default_settings();
    $p = array_replace($d['payments'], $v['payments'] ?? []);
    $p['integrationIds'] = array_replace($d['payments']['integrationIds'], $v['payments']['integrationIds'] ?? []);
    $f = is_array($v['features'] ?? null) ? $v['features'] : [];
    return [
        'seo' => array_replace($d['seo'], $v['seo'] ?? []),
        'sync' => array_replace($d['sync'], $v['sync'] ?? []),
        'payments' => $p,
        'features' => ['accounts' => (bool) ($f['accounts'] ?? false), 'pricing' => (bool) ($f['pricing'] ?? false)],
        'home' => merge_home($v['home'] ?? []),
        'social' => clean_social($v['social'] ?? []),
        'taxonomy' => merge_taxonomy($v['taxonomy'] ?? []),
    ];
}

/** Settings the public site needs (no secrets). */
function public_config(): array {
    $s = kv_get('settings');
    return [
        'features' => $s['features'],
        'home' => $s['home'],
        'social' => array_values(array_filter($s['social'], fn($x) => $x['active'])),
        'taxonomy' => $s['taxonomy'],
        'siteName' => $s['seo']['siteName'],
        'titleCount' => count(catalog()[1]),
    ];
}

/** Image URLs the site accepts: https links or files uploaded to /uploads/. */
function clean_image_url(string $u): string {
    $u = trim($u);
    return preg_match('#^(https://|/uploads/)#i', $u) ? mb_substr($u, 0, 1000) : '';
}

/* ---------- views / popularity ---------- */

function views(): array {
    $v = kv_get('views');
    return is_array($v) ? $v : [];
}

function with_views(array $titles): array {
    $v = views();
    foreach ($titles as &$t) $t['views'] = (int) ($v[$t['id']] ?? 0);
    unset($t);
    return $titles;
}

/** Most viewed first; ties → TMDB popularity → rating → newest. */
function sort_popular(array $list): array {
    usort($list, fn($a, $b) => (($b['views'] ?? 0) <=> ($a['views'] ?? 0))
        ?: (($b['popularity'] ?? 0) <=> ($a['popularity'] ?? 0))
        ?: (($b['rating'] ?? 0) <=> ($a['rating'] ?? 0))
        ?: (($b['year'] ?? 0) <=> ($a['year'] ?? 0)));
    return $list;
}

/** Guesses the origin (مصري / أجنبي / ياباني ...) of a TMDB item from its language and country. */
function detect_origin(string $type, string $lang, array $countries): string {
    $countries = array_map('strtoupper', $countries);
    $gulf = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'];
    if ($type === 'kids') {
        if ($lang === 'ar') return 'عربي';
        return $lang === 'ja' ? 'ياباني (أنمي)' : 'أجنبي';
    }
    if ($lang === 'ar') {
        if (in_array('EG', $countries, true)) return 'مصري';
        if (array_intersect($gulf, $countries) && $type !== 'movie') return 'خليجي';
        return 'عربي';
    }
    if ($type === 'program') return 'أجنبي';
    return ['ja' => 'ياباني', 'ko' => 'كوري', 'hi' => 'هندي', 'tr' => 'تركي'][$lang] ?? 'أجنبي';
}

function kv_default(string $k) {
    return match ($k) {
        'platforms' => seed()['platforms'],
        'titles' => [],
        'settings' => default_settings(),
        default => [],
    };
}

function kv_get(string $k) {
    global $KV;
    if (!array_key_exists($k, $KV)) {
        $st = db()->prepare('SELECT v FROM mtb_kv WHERE k = ?');
        $st->execute([$k]);
        $raw = $st->fetchColumn();
        $val = $raw === false ? kv_default($k) : json_decode((string) $raw, true);
        if (!is_array($val)) $val = kv_default($k);
        $KV[$k] = $k === 'settings' ? merge_settings($val) : $val;
    }
    return $KV[$k];
}

function kv_set(string $k, $v): void {
    global $KV;
    $KV[$k] = $v;
    db()->prepare('INSERT INTO mtb_kv (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)')
        ->execute([$k, json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
}

function admin_token(): string { return hash('sha256', 'mtb-admin:' . cfg('ADMIN_PASSWORD')); }
function is_admin(): bool { return cfg('ADMIN_PASSWORD') !== '' && hash_equals(admin_token(), (string) ($_COOKIE['mtb_admin'] ?? '')); }
function is_https(): bool { return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'); }

function site_url(): string {
    $c = kv_get('settings')['seo']['canonicalUrl'] ?? '';
    $u = $c ?: cfg('SITE_URL') ?: ((is_https() ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
    return rtrim($u, '/');
}

function blank_platform(): array {
    return [
        'id' => '', 'name' => '', 'nameAr' => '', 'tagline' => '', 'color' => '#4FE3D0', 'priceMonthly' => 0, 'currency' => 'ج.م',
        'maxQuality' => '1080p FHD', 'hdr' => null, 'audio' => 'Stereo 2.0', 'screens' => 1, 'offline' => false, 'trialDays' => 0,
        'catalogSize' => 0, 'kind' => 'subscription', 'url' => '', 'logo' => '', 'active' => true, 'tmdbProviderIds' => [], 'regions' => ['EG'],
    ];
}

function slugify_latin(string $s): string {
    return trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower(trim($s))), '-');
}

/** Validates a manual title from the dashboard form. */
function clean_title(array $b, ?array $prev, array $all): array {
    $str = fn(string $k, string $d = '') => trim((string) ($b[$k] ?? $d));
    $list = function ($v): array {
        if (is_string($v)) $v = preg_split('/[,،\n]+/u', $v) ?: [];
        return array_values(array_filter(array_map(fn($x) => trim((string) $x), (array) $v), 'strlen'));
    };
    $title = $str('title') ?: $str('originalTitle');
    if ($title === '') throw new InvalidArgumentException('title_required');
    $platforms = array_values(array_unique(array_map('strval', (array) ($b['platforms'] ?? []))));
    if (!$platforms) throw new InvalidArgumentException('platforms_required');

    $id = $prev['id'] ?? ('m-' . bin2hex(random_bytes(6)));
    $slug = slugify_latin($str('slug') ?: $str('originalTitle') ?: $title);
    if ($slug === '') $slug = $prev['slug'] ?? $id;
    $base = $slug;
    $n = 2;
    while (count(array_filter($all, fn($t) => ($t['slug'] ?? '') === $slug && $t['id'] !== $id))) $slug = $base . '-' . $n++;

    $links = [];
    foreach ((array) ($b['links'] ?? []) as $pid => $url) {
        $url = trim((string) $url);
        if ($url !== '' && in_array((string) $pid, $platforms, true) && preg_match('#^https?://#i', $url)) $links[(string) $pid] = $url;
    }
    $poster = $str('poster');
    if ($poster !== '' && !preg_match('#^(https?://|/uploads/)#i', $poster)) $poster = '';
    $type = in_array($b['type'] ?? '', ['movie', 'series', 'kids', 'program'], true) ? $b['type'] : 'movie';
    $days = (int) ($b['expiresInDays'] ?? 0);
    $origin = mb_substr($str('origin'), 0, 40);

    return array_replace($prev ?? [], [
        'id' => $id, 'slug' => $slug, 'source' => $prev['source'] ?? 'manual', 'locked' => true,
        'title' => $title, 'originalTitle' => $str('originalTitle') ?: null, 'type' => $type,
        'year' => max(1900, min(2100, (int) ($b['year'] ?? date('Y')))),
        'origin' => array_key_exists('origin', $b) ? ($origin !== '' ? $origin : null) : ($prev['origin'] ?? null),
        'genres' => str_list($b['genres'] ?? [], 12),
        'ramadan' => array_key_exists('ramadan', $b) ? !empty($b['ramadan']) : !empty($prev['ramadan']),
        'rating' => round(max(0, min(10, (float) ($b['rating'] ?? 0))), 1),
        'runtime' => $str('runtime') ?: ['movie' => 'فيلم', 'series' => 'مسلسل', 'kids' => 'كرتون', 'program' => 'برنامج'][$type],
        'quality' => $str('quality', '1080p FHD'),
        'platforms' => $platforms, 'availability' => [], 'links' => $links,
        'inPlan' => !empty($b['inPlan']), 'download' => !empty($b['download']),
        'expiresInDays' => $days > 0 ? $days : null,
        'poster' => $poster ?: null,
        'tint' => preg_match('/^#[0-9a-f]{6}$/i', $str('tint')) ? $str('tint') : ($prev['tint'] ?? '#1f2937'),
        'overview' => $str('overview'), 'director' => $str('director'), 'cast' => $list($b['cast'] ?? []),
        'updatedAt' => gmdate('c'),
    ]);
}

/** Saves an uploaded image to public_html/uploads/<folder> (posters | logos) and returns its URL. */
function upload_poster(string $folder = 'posters'): array {
    if (!in_array($folder, ['posters', 'logos'], true)) $folder = 'posters';
    $f = $_FILES['file'] ?? null;
    if (!$f || ($f['error'] ?? 1) !== UPLOAD_ERR_OK) out(['error' => 'upload_failed'], 400);
    if ($f['size'] > 5 * 1024 * 1024) out(['error' => 'too_large'], 413);
    $info = @getimagesize($f['tmp_name']);
    $mime = $info['mime'] ?? '';
    $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    // Logos may also be SVG (getimagesize can't read those) — accepted only without scripts.
    if (!$mime && $folder === 'logos') {
        $svg = (string) file_get_contents($f['tmp_name'], false, null, 0, 300000);
        if (preg_match('/<svg[\s>]/i', $svg) && !preg_match('/<script|on[a-z]+\s*=|javascript:|<foreignObject/i', $svg)) $mime = 'image/svg+xml';
    }
    $ext = ($types + ['image/svg+xml' => 'svg'])[$mime] ?? null;
    if (!$ext || ($ext === 'gif' && $folder !== 'logos')) out(['error' => 'invalid_type'], 415);
    $root = dirname(__DIR__) . '/uploads';
    $dir = $root . '/' . $folder;
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) out(['error' => 'cannot_create_dir'], 500);
    $ht = $root . '/.htaccess';
    if (!is_file($ht) || !str_contains((string) @file_get_contents($ht), 'svg')) {
        @file_put_contents($ht, "Options -Indexes\n<FilesMatch \"\\.(php|phtml|phar|pl|py|cgi|sh|html?)$\">\n  Require all denied\n</FilesMatch>\n"
            . "<IfModule mod_headers.c>\n  <FilesMatch \"\\.svg$\">\n    Header set Content-Security-Policy \"default-src 'none'; style-src 'unsafe-inline'; img-src data:\"\n  </FilesMatch>\n</IfModule>\n");
    }
    $name = gmdate('Ymd') . '-' . bin2hex(random_bytes(6)) . '.' . $ext;
    if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) out(['error' => 'save_failed'], 500);
    return ['url' => '/uploads/' . $folder . '/' . $name];
}

/** Active platforms + titles that have at least one active platform (optionally per region). */
function catalog(?string $region = null): array {
    $platforms = array_values(array_filter(kv_get('platforms'), fn($p) => ($p['active'] ?? true) !== false));
    $active = array_flip(array_column($platforms, 'id'));
    $titles = [];
    foreach (kv_get('titles') as $t) {
        if (empty($t['source'])) continue; // old demo data
        $ids = ($region && !empty($t['availability'][$region])) ? $t['availability'][$region] : ($t['platforms'] ?? []);
        $ids = array_values(array_filter($ids, fn($id) => isset($active[$id])));
        if (!$ids) continue;
        $t['platforms'] = $ids;
        $titles[] = $t;
    }
    return [$platforms, $titles];
}
