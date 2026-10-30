<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

$uri = (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$route = $_GET['route'] ?? ((($p = strpos($uri, '/api/')) !== false) ? substr($uri, $p + 5) : '');
$seg = array_values(array_filter(explode('/', trim((string) $route, '/')), 'strlen'));
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$body = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($body)) $body = [];

try {
    $a = $seg[0] ?? '';
    if ($a === 'sitemap.xml') route_sitemap();
    if ($a === 'robots.txt') route_robots();
    if ($a === 'admin-auth') route_auth($method, $body);
    if ($a === 'admin') route_admin($method, array_slice($seg, 1), $body);
    if ($a === 'payments') route_payments($method, $seg[1] ?? '', $body);
    if ($a === 'cron') route_cron();
    if ($a === 'auth') { require_once __DIR__ . '/users.php'; route_user_auth($method, array_slice($seg, 1), $body + $_POST); }
    if ($a === 'me') { require_once __DIR__ . '/users.php'; route_me($method, array_slice($seg, 1), $body); }
    route_public($method, $seg, $body);
} catch (InvalidArgumentException $e) {
    out(['error' => $e->getMessage()], 422);
} catch (Throwable $e) {
    error_log('[mamatvbox] ' . $e->getMessage());
    out(['error' => 'server_error', 'message' => $e->getMessage()], 500);
}

/* ---------------- public ---------------- */

function route_public(string $method, array $seg, array $body): void {
    [$a, $b, $c] = array_pad($seg, 3, null);
    $region = isset($_GET['region']) ? (string) $_GET['region'] : null;

    if ($method !== 'GET') {
        if ($a === 'auth' && $b === 'magic-link') out(['ok' => true, 'expiresIn' => 900]);
        if ($a === 'me' && !$b) out(array_replace(seed()['currentUser'], $body));
        out(['ok' => true]);
    }

    switch ($a) {
        case 'titles':
            [, $titles] = catalog($region);
            if (!$b) {
                $type = (string) ($_GET['type'] ?? '');
                $pl = (string) ($_GET['platform'] ?? '');
                out(array_values(array_filter($titles, fn($t) => (!$type || $t['type'] === $type) && (!$pl || in_array($pl, $t['platforms'], true)))));
            }
            if ($b === 'trending') {
                usort($titles, fn($x, $y) => ((($y['source'] ?? '') === 'tmdb') <=> (($x['source'] ?? '') === 'tmdb')) ?: ($y['rating'] <=> $x['rating']));
                out(array_slice($titles, 0, 12));
            }
            if ($b === 'expiring') out(array_values(array_filter($titles, fn($t) => !empty($t['expiresInDays']))));
            $t = null;
            foreach ($titles as $x) if ($x['slug'] === $b) { $t = $x; break; }
            if ($c === 'similar') {
                out(array_slice(array_values(array_filter($titles, fn($x) => $x['slug'] !== $b && (!$t || array_intersect($x['genres'] ?? [], $t['genres'] ?? [])))), 0, 8));
            }
            out($t);

        case 'platforms':
            [$platforms] = catalog();
            if ($b) { foreach ($platforms as $p) if ($p['id'] === $b) out($p); out(null); }
            out($platforms);

        case 'search':
            if ($b === 'trending') out(seed()['trendingSearches']);
            $s = mb_strtolower(trim((string) ($_GET['q'] ?? '')));
            [, $titles] = catalog($region);
            $found = $s === '' ? [] : array_values(array_filter($titles, fn($t) =>
                mb_stripos($t['title'] ?? '', $s) !== false || mb_stripos((string) ($t['originalTitle'] ?? ''), $s) !== false
                || count(array_filter($t['cast'] ?? [], fn($n) => mb_stripos($n, $s) !== false)) > 0));
            $names = [];
            if ($s !== '') foreach ($titles as $t) foreach (array_merge($t['cast'] ?? [], !empty($t['director']) ? [$t['director']] : []) as $n) {
                if (mb_stripos($n, $s) !== false) $names[$n] = ($names[$n] ?? 0) + 1;
            }
            arsort($names);
            $people = [];
            foreach (array_slice($names, 0, 12, true) as $n => $c) $people[] = ['id' => $n, 'slug' => $n, 'name' => $n, 'role' => $c . ' عمل', 'bio' => '', 'titles' => []];
            if ($b === 'suggestions') out(array_slice($found, 0, 6));
            out(['titles' => array_slice($found, 0, 40), 'people' => $people, 'total' => count($found) + count($people)]);

        case 'people':
            $name = trim(urldecode((string) ($_GET['name'] ?? $b ?? '')));
            if ($name === '') out(null);
            [, $titles] = catalog();
            $key = mb_strtolower($name);
            $acted = 0; $directed = 0;
            $works = array_values(array_filter($titles, function ($t) use ($key, &$acted, &$directed) {
                $a = count(array_filter($t['cast'] ?? [], fn($n) => mb_strtolower(trim($n)) === $key)) > 0;
                $d = mb_strtolower(trim((string) ($t['director'] ?? ''))) === $key;
                if ($a) $acted++;
                if ($d) $directed++;
                return $a || $d;
            }));
            usort($works, fn($x, $y) => ($y['year'] ?? 0) <=> ($x['year'] ?? 0));
            if (!$works) out(null);
            $role = $acted && $directed ? 'ممثل ومخرج' : ($directed ? 'مخرج' : 'ممثل');
            out(['id' => $name, 'slug' => $name, 'name' => $name, 'role' => $role, 'bio' => '', 'titles' => array_column($works, 'id'), 'works' => $works]);

        case 'meta':
            out($b === 'countries' ? seed()['countries'] : []);

        case 'billing':
            out($b === 'plans' ? seed()['plans'] : ($b === 'invoices' ? seed()['invoices'] : []));

        case 'me':
            $u = seed()['currentUser'];
            if (!$b) out($u);
            if ($b === 'watchlist') { [, $titles] = catalog(); out(array_values(array_filter($titles, fn($t) => in_array($t['id'], $u['watchlist'], true)))); }
            if ($b === 'notifications') out(seed()['notifications']);
            if ($b === 'platforms') out($u['platforms']);
            out([]);

        case 'auth':
            out(['error' => 'oauth_not_configured'], 501);
    }
    out(['error' => 'not_found'], 404);
}

/* ---------------- admin login ---------------- */

function route_auth(string $method, array $body): void {
    if ($method === 'DELETE') {
        setcookie('mtb_admin', '', ['expires' => time() - 3600, 'path' => '/']);
        out(['ok' => true]);
    }
    if (cfg('ADMIN_PASSWORD') === '') out(['error' => 'not_configured'], 503);
    if (!hash_equals(cfg('ADMIN_PASSWORD'), (string) ($body['password'] ?? ''))) { usleep(700000); out(['error' => 'invalid'], 401); }
    setcookie('mtb_admin', admin_token(), ['expires' => time() + 604800, 'path' => '/', 'httponly' => true, 'secure' => is_https(), 'samesite' => 'Lax']);
    out(['ok' => true]);
}

/* ---------------- admin ---------------- */

function route_admin(string $method, array $seg, array $body): void {
    if (!is_admin()) out(['error' => 'unauthorized'], 401);
    [$a, $b] = array_pad($seg, 2, null);

    if ($method === 'GET') {
        switch ($a) {
            case 'platforms': out(kv_get('platforms'));
            case 'settings': out(kv_get('settings'));
            case 'titles':
                $list = array_values(array_filter(kv_get('titles'), fn($t) => !empty($t['source'])));
                usort($list, fn($x, $y) => strcmp((string) ($y['updatedAt'] ?? ''), (string) ($x['updatedAt'] ?? '')));
                out($list);
            case 'kpis':
                $titles = array_filter(kv_get('titles'), fn($t) => !empty($t['source']));
                $byType = fn(array $types) => count(array_filter($titles, fn($t) => in_array($t['type'] ?? '', $types, true)));
                $paid = array_filter(kv_get('payments'), fn($p) => ($p['status'] ?? '') === 'paid');
                $revenue = array_sum(array_map(fn($p) => (int) $p['amountCents'], $paid)) / 100;
                out([
                    ['label' => 'إجمالي الأعمال', 'value' => (string) count($titles), 'delta' => 'كل المحتوى المنشور', 'trend' => 'up'],
                    ['label' => 'الأفلام', 'value' => (string) $byType(['movie']), 'delta' => 'فيلم', 'trend' => 'up'],
                    ['label' => 'المسلسلات', 'value' => (string) $byType(['series']), 'delta' => 'مسلسل', 'trend' => 'up'],
                    ['label' => 'كرتون وبرامج', 'value' => (string) $byType(['kids', 'program']), 'delta' => 'عمل', 'trend' => 'up'],
                    ['label' => 'المنصات المفعّلة', 'value' => (string) count(array_filter(kv_get('platforms'), fn($p) => ($p['active'] ?? true) !== false)), 'delta' => 'من أصل ' . count(kv_get('platforms')), 'trend' => 'up'],
                    ['label' => 'الإيراد المحصّل', 'value' => number_format($revenue) . ' ج.م', 'delta' => count($paid) . ' عملية دفع ناجحة', 'trend' => 'up'],
                ]);
            case 'referrals': out([]);
            case 'payments': out(kv_get('payments'));
            case 'integrations':
                require_once __DIR__ . '/sync.php';
                require_once __DIR__ . '/paymob.php';
                $settings = kv_get('settings');
                $mapped = [];
                foreach (kv_get('platforms') as $p) foreach ($p['tmdbProviderIds'] ?? [] as $id) $mapped[(int) $id] = $p['id'];
                $titles = kv_get('titles');
                out([
                    'tmdbConfigured' => cfg('TMDB_API_KEY') !== '',
                    'paymobConfigured' => pm_configured(),
                    'hmacConfigured' => cfg('PAYMOB_HMAC_SECRET') !== '',
                    'siteUrl' => cfg('SITE_URL'),
                    'lastRunAt' => $settings['sync']['lastRunAt'] ?? null,
                    'running' => sync_running(),
                    'logs' => kv_get('syncLog'),
                    'settings' => $settings,
                    'discovered' => array_map(fn($p) => $p + ['platformId' => $mapped[(int) $p['id']] ?? null], kv_get('providers')),
                    'counts' => [
                        'titles' => count($titles),
                        'synced' => count(array_filter($titles, fn($t) => ($t['source'] ?? '') === 'tmdb')),
                        'demo' => count(array_filter($titles, fn($t) => empty($t['source']))),
                        'payments' => count(kv_get('payments')),
                    ],
                ]);
        }
    }

    if ($method === 'POST') {
        if ($a === 'platforms') {
            $list = kv_get('platforms');
            $id = trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower((string) (($body['id'] ?? '') ?: ($body['name'] ?? '')))), '-') ?: 'platform-' . time();
            foreach ($list as $p) if ($p['id'] === $id) out(['error' => 'exists'], 409);
            $created = array_replace(blank_platform(), $body, ['id' => $id, 'auto' => false]);
            $list[] = $created;
            kv_set('platforms', $list);
            out($created, 201);
        }
        if ($a === 'titles' && !$b) {
            $list = kv_get('titles');
            $t = clean_title($body, null, $list);
            $list[] = $t;
            kv_set('titles', $list);
            out($t, 201);
        }
        if ($a === 'import') {
            require_once __DIR__ . '/import.php';
            if ($b === 'fetch') {
                @set_time_limit(180);
                $src = '';
                if (!empty($_FILES['file']['tmp_name'])) {
                    $raw = (string) file_get_contents($_FILES['file']['tmp_name']);
                    $ctype = '';
                } else {
                    [$raw, $ctype, $src] = imp_fetch_url(trim((string) ($body['url'] ?? '')));
                }
                [$kind, $rows] = imp_parse($raw, $ctype);
                out(['kind' => $kind, 'source' => $src, 'total' => count($rows), 'rows' => array_slice($rows, 0, 20000)]);
            }
            if ($b === 'commit') {
                @set_time_limit(300);
                out(imp_commit((array) ($body['items'] ?? []), (string) ($body['mode'] ?? 'skip')));
            }
        }
        if ($a === 'upload') out(upload_poster());
        if ($a === 'sync') { require_once __DIR__ . '/sync.php'; out(run_sync()); }
        if ($a === 'titles' && $b === 'bulk') {
            $ids = array_flip(array_map('strval', (array) ($body['ids'] ?? [])));
            $action = (string) ($body['action'] ?? '');
            $list = kv_get('titles');
            if ($action === 'delete-all') {
                kv_set('titles', []);
                out(['ok' => true, 'affected' => count($list)]);
            }
            if (!$ids) out(['error' => 'no_selection'], 422);
            if ($action === 'delete') {
                $next = array_values(array_filter($list, fn($t) => !isset($ids[$t['id']])));
                kv_set('titles', $next);
                out(['ok' => true, 'affected' => count($list) - count($next)]);
            }
            if ($action === 'type') {
                $type = (string) ($body['type'] ?? '');
                if (!in_array($type, ['movie', 'series', 'kids', 'program'], true)) out(['error' => 'invalid_type'], 422);
                $n = 0;
                foreach ($list as &$t) if (isset($ids[$t['id']])) { $t['type'] = $type; $t['locked'] = true; $t['updatedAt'] = gmdate('c'); $n++; }
                unset($t);
                kv_set('titles', $list);
                out(['ok' => true, 'affected' => $n]);
            }
            out(['error' => 'invalid_action'], 422);
        }
        if ($a === 'titles' && $b === 'purge-demo') {
            $next = array_values(array_filter(kv_get('titles'), fn($t) => !empty($t['source'])));
            kv_set('titles', $next);
            out(['ok' => true, 'remaining' => count($next)]);
        }
    }

    if ($method === 'PUT') {
        if ($a === 'platforms' && $b) {
            $list = kv_get('platforms');
            $found = null;
            foreach ($list as &$p) if ($p['id'] === $b) { $p = array_replace($p, $body, ['id' => $b]); $found = $p; }
            unset($p);
            kv_set('platforms', $list);
            out($found);
        }
        if ($a === 'settings') {
            $cur = kv_get('settings');
            $merged = merge_settings([
                'seo' => array_replace($cur['seo'], $body['seo'] ?? []),
                'sync' => array_replace($cur['sync'], $body['sync'] ?? []),
                'payments' => array_replace($cur['payments'], $body['payments'] ?? [], [
                    'integrationIds' => array_replace($cur['payments']['integrationIds'], $body['payments']['integrationIds'] ?? []),
                ]),
            ]);
            if (isset($body['seo']['keywords'])) $merged['seo']['keywords'] = array_values($body['seo']['keywords']);
            if (isset($body['sync']['regions'])) $merged['sync']['regions'] = array_values($body['sync']['regions']);
            kv_set('settings', $merged);
            out($merged);
        }
        if ($a === 'titles' && $b) {
            $list = kv_get('titles');
            $found = null;
            foreach ($list as &$t) if ($t['id'] === $b) { $t = clean_title($body, $t, $list); $found = $t; }
            unset($t);
            if (!$found) out(['error' => 'not_found'], 404);
            kv_set('titles', $list);
            out($found);
        }
        if ($a === 'home-rows') out(['ok' => true]);
    }

    if ($method === 'DELETE' && $a === 'titles' && $b) {
        kv_set('titles', array_values(array_filter(kv_get('titles'), fn($t) => $t['id'] !== $b)));
        out(['ok' => true]);
    }

    if ($method === 'DELETE' && $a === 'platforms' && $b) {
        kv_set('platforms', array_values(array_filter(kv_get('platforms'), fn($p) => $p['id'] !== $b)));
        $titles = kv_get('titles');
        foreach ($titles as &$t) {
            $t['platforms'] = array_values(array_filter($t['platforms'] ?? [], fn($id) => $id !== $b));
            if (!empty($t['availability'])) foreach ($t['availability'] as $r => $ids) $t['availability'][$r] = array_values(array_filter($ids, fn($id) => $id !== $b));
        }
        unset($t);
        kv_set('titles', $titles);
        out(['ok' => true]);
    }

    out(['error' => 'not_found'], 404);
}

/* ---------------- payments ---------------- */

function route_payments(string $method, string $action, array $body): void {
    require_once __DIR__ . '/paymob.php';
    $fail = fn(string $code) => out(['status' => 'failed', 'transactionId' => '', 'errorCode' => $code]);

    if ($action === 'checkout' && $method === 'POST') {
        if (!pm_configured()) $fail('PAYMENTS_NOT_CONFIGURED');
        $plan = null;
        foreach (seed()['plans'] as $p) if ($p['id'] === ($body['planId'] ?? '')) $plan = $p;
        if (!$plan || (int) $plan['monthly'] === 0) $fail('INVALID_PLAN');

        $settings = kv_get('settings');
        $ids = $settings['payments']['integrationIds'];
        $m = (string) ($body['method'] ?? 'card');
        $integration = $m === 'wallet' ? $ids['wallet'] : ($m === 'fawry' ? $ids['kiosk'] : $ids['card']);
        if (!$integration) $fail('METHOD_NOT_CONFIGURED');

        $yearly = ($body['billing'] ?? '') === 'yearly';
        $amount = (int) ($yearly ? $plan['yearly'] : $plan['monthly']) * 100;
        $reference = 'MTB-' . time() . '-' . random_int(100, 999);
        try {
            $url = pm_create_checkout($amount, $settings['payments']['currency'], (int) $integration, $reference, $plan['name'] . ($yearly ? ' (سنوي)' : ' (شهري)'), $body);
        } catch (Throwable $e) {
            error_log('[paymob] ' . $e->getMessage());
            $fail('GATEWAY_ERROR');
        }
        $list = kv_get('payments');
        array_unshift($list, ['id' => $reference, 'at' => gmdate('c'), 'planId' => $plan['id'], 'billing' => $yearly ? 'yearly' : 'monthly', 'amountCents' => $amount, 'currency' => $settings['payments']['currency'], 'status' => 'pending', 'method' => $m, 'email' => $body['email'] ?? null]);
        kv_set('payments', $list);
        out(['status' => 'pending', 'transactionId' => $reference, 'redirectUrl' => $url]);
    }

    if ($action === 'webhook' && $method === 'POST') {
        $obj = $body['obj'] ?? null;
        if (!is_array($obj)) out(['ok' => false], 400);
        if (!pm_verify_obj($obj, (string) ($_GET['hmac'] ?? ''))) out(['ok' => false, 'error' => 'bad_hmac'], 401);
        pm_mark((string) ($obj['order']['merchant_order_id'] ?? ''), ($obj['success'] ?? false) === true, (string) ($obj['id'] ?? ''));
        out(['ok' => true]);
    }

    if ($action === 'webhook' && $method === 'GET') {
        $ok = pm_verify_query($_GET, (string) ($_GET['hmac'] ?? '')) && ($_GET['success'] ?? '') === 'true';
        pm_mark((string) ($_GET['merchant_order_id'] ?? ''), $ok, (string) ($_GET['id'] ?? ''));
        $code = (string) (($_GET['txn_response_code'] ?? '') ?: ($_GET['data_message'] ?? '') ?: 'PAYMENT_DECLINED');
        header('Location: ' . site_url() . ($ok ? '/checkout/success/' : '/checkout/failed/?code=' . rawurlencode($code)));
        exit;
    }
    out(['error' => 'not_found'], 404);
}

/* ---------------- cron via URL ---------------- */

function route_cron(): void {
    if (cfg('CRON_SECRET') === '' || !hash_equals(cfg('CRON_SECRET'), (string) ($_GET['key'] ?? ''))) out(['error' => 'unauthorized'], 401);
    require_once __DIR__ . '/sync.php';
    out(run_sync());
}

/* ---------------- SEO files ---------------- */

function route_sitemap(): void {
    header('Content-Type: application/xml; charset=utf-8');
    $base = site_url();
    [, $titles] = catalog();
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    foreach (['/', '/movies/', '/series/', '/programs/', '/kids/', '/platforms/', '/pricing/', '/search/', '/legal/'] as $p) {
        echo '<url><loc>' . htmlspecialchars($base . $p) . '</loc><changefreq>daily</changefreq><priority>' . ($p === '/' ? '1.0' : '0.8') . '</priority></url>';
    }
    foreach ($titles as $t) {
        echo '<url><loc>' . htmlspecialchars($base . '/title/' . $t['slug'] . '/') . '</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>';
    }
    echo '</urlset>';
    exit;
}

function route_robots(): void {
    header('Content-Type: text/plain; charset=utf-8');
    $seo = kv_get('settings')['seo'];
    echo $seo['indexing']
        ? "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /admin-login/\nDisallow: /api/\nDisallow: /account/\nDisallow: /checkout/\nDisallow: /emails/\n"
        : "User-agent: *\nDisallow: /\n";
    echo "\nSitemap: " . site_url() . "/sitemap.xml\n";
    exit;
}
