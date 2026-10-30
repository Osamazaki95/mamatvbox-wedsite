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
    ];
}

function merge_settings(array $v): array {
    $d = default_settings();
    $p = array_replace($d['payments'], $v['payments'] ?? []);
    $p['integrationIds'] = array_replace($d['payments']['integrationIds'], $v['payments']['integrationIds'] ?? []);
    return [
        'seo' => array_replace($d['seo'], $v['seo'] ?? []),
        'sync' => array_replace($d['sync'], $v['sync'] ?? []),
        'payments' => $p,
    ];
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

    return array_replace($prev ?? [], [
        'id' => $id, 'slug' => $slug, 'source' => $prev['source'] ?? 'manual', 'locked' => true,
        'title' => $title, 'originalTitle' => $str('originalTitle') ?: null, 'type' => $type,
        'year' => max(1900, min(2100, (int) ($b['year'] ?? date('Y')))),
        'genres' => $list($b['genres'] ?? []),
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

/** Saves an uploaded poster to public_html/uploads/posters and returns its URL. */
function upload_poster(): array {
    $f = $_FILES['file'] ?? null;
    if (!$f || ($f['error'] ?? 1) !== UPLOAD_ERR_OK) out(['error' => 'upload_failed'], 400);
    if ($f['size'] > 5 * 1024 * 1024) out(['error' => 'too_large'], 413);
    $info = @getimagesize($f['tmp_name']);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$info['mime'] ?? ''] ?? null;
    if (!$ext) out(['error' => 'invalid_type'], 415);
    $root = dirname(__DIR__) . '/uploads';
    $dir = $root . '/posters';
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) out(['error' => 'cannot_create_dir'], 500);
    if (!is_file($root . '/.htaccess')) {
        @file_put_contents($root . '/.htaccess', "Options -Indexes\n<FilesMatch \"\\.(php|phtml|phar|pl|py|cgi|sh|html?)$\">\n  Require all denied\n</FilesMatch>\n");
    }
    $name = gmdate('Ymd') . '-' . bin2hex(random_bytes(6)) . '.' . $ext;
    if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) out(['error' => 'save_failed'], 500);
    return ['url' => '/uploads/posters/' . $name];
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
