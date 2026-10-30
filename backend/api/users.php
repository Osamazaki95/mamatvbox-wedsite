<?php
declare(strict_types=1);
/**
 * Customer accounts: email/password, Google, Apple, remember-me sessions, password reset.
 * Tables are created automatically on first use.
 */

function users_db(): PDO {
    static $ready = false;
    $pdo = db();
    if (!$ready) {
        $pdo->exec('CREATE TABLE IF NOT EXISTS mtb_users (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(190) NOT NULL UNIQUE,
            name VARCHAR(190) NOT NULL DEFAULT \'\',
            phone VARCHAR(40) NOT NULL DEFAULT \'\',
            avatar VARCHAR(500) NOT NULL DEFAULT \'\',
            password_hash VARCHAR(255) NULL,
            google_id VARCHAR(64) NULL UNIQUE,
            apple_id VARCHAR(128) NULL UNIQUE,
            data LONGTEXT NULL,
            reset_hash CHAR(64) NULL,
            reset_expires INT UNSIGNED NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        $pdo->exec('CREATE TABLE IF NOT EXISTS mtb_sessions (
            token_hash CHAR(64) NOT NULL PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            expires_at INT UNSIGNED NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        $pdo->exec('CREATE TABLE IF NOT EXISTS mtb_attempts (
            k VARCHAR(190) NOT NULL, at INT UNSIGNED NOT NULL, INDEX (k, at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        $ready = true;
    }
    return $pdo;
}

/* ---------------- helpers ---------------- */

function u_fail(string $code, int $status = 400): void { out(['error' => $code], $status); }
function u_ip(): string { return (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0'); }
function u_email(string $e): string { return mb_strtolower(trim($e)); }
function b64url_decode(string $s): string { return (string) base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4)); }
function b64url(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function jwt_payload(string $jwt): array { $p = explode('.', $jwt); return json_decode(b64url_decode($p[1] ?? ''), true) ?: []; }

function set_cookie(string $name, string $value, int $expires, string $samesite = 'Lax'): void {
    setcookie($name, $value, ['expires' => $expires, 'path' => '/', 'httponly' => true, 'secure' => is_https() || $samesite === 'None', 'samesite' => $samesite]);
}

function throttle(string $key, int $max = 8, int $window = 900): void {
    $pdo = users_db();
    $pdo->prepare('DELETE FROM mtb_attempts WHERE at < ?')->execute([time() - 86400]);
    $st = $pdo->prepare('SELECT COUNT(*) FROM mtb_attempts WHERE k = ? AND at > ?');
    $st->execute([$key, time() - $window]);
    if ((int) $st->fetchColumn() >= $max) u_fail('too_many_attempts', 429);
}
function throttle_hit(string $key): void { users_db()->prepare('INSERT INTO mtb_attempts (k, at) VALUES (?, ?)')->execute([$key, time()]); }

function user_public(array $u): array {
    $d = json_decode((string) ($u['data'] ?? ''), true) ?: [];
    return [
        'id' => (int) $u['id'], 'name' => $u['name'], 'email' => $u['email'], 'phone' => $u['phone'], 'avatar' => $u['avatar'],
        'providers' => ['password' => !empty($u['password_hash']), 'google' => !empty($u['google_id']), 'apple' => !empty($u['apple_id'])],
        'createdAt' => $u['created_at'], 'watchlist' => array_values($d['watchlist'] ?? []), 'platforms' => array_values($d['platforms'] ?? []),
        'preferences' => $d['preferences'] ?? (object) [],
    ];
}

function user_by(string $col, $val): ?array {
    $st = users_db()->prepare("SELECT * FROM mtb_users WHERE {$col} = ? LIMIT 1");
    $st->execute([$val]);
    $u = $st->fetch(PDO::FETCH_ASSOC);
    return $u ?: null;
}

function user_data_update(int $id, callable $fn): array {
    $u = user_by('id', $id);
    $d = json_decode((string) ($u['data'] ?? ''), true) ?: [];
    $d = $fn($d);
    users_db()->prepare('UPDATE mtb_users SET data = ? WHERE id = ?')->execute([json_encode($d, JSON_UNESCAPED_UNICODE), $id]);
    return user_public(user_by('id', $id));
}

/* ---------------- sessions ---------------- */

function session_start_for(int $userId, bool $remember): void {
    $token = bin2hex(random_bytes(32));
    $ttl = $remember ? 30 * 86400 : 86400;
    users_db()->prepare('INSERT INTO mtb_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')->execute([hash('sha256', $token), $userId, time() + $ttl]);
    users_db()->prepare('UPDATE mtb_users SET last_login = NOW() WHERE id = ?')->execute([$userId]);
    set_cookie('mtb_sid', $token, $remember ? time() + $ttl : 0);
}

function current_user(): ?array {
    static $u = false;
    if ($u !== false) return $u;
    $t = (string) ($_COOKIE['mtb_sid'] ?? '');
    $u = null;
    if (strlen($t) === 64) {
        $st = users_db()->prepare('SELECT u.* FROM mtb_sessions s JOIN mtb_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?');
        $st->execute([hash('sha256', $t), time()]);
        $u = $st->fetch(PDO::FETCH_ASSOC) ?: null;
    }
    return $u;
}

function require_user(): array { $u = current_user(); if (!$u) u_fail('unauthorized', 401); return $u; }

function session_end(): void {
    $t = (string) ($_COOKIE['mtb_sid'] ?? '');
    if ($t !== '') users_db()->prepare('DELETE FROM mtb_sessions WHERE token_hash = ?')->execute([hash('sha256', $t)]);
    set_cookie('mtb_sid', '', time() - 3600);
}

/* ---------------- mail ---------------- */

function send_mail(string $to, string $subject, string $html): bool {
    $from = cfg('MAIL_FROM') ?: cfg('SMTP_USER') ?: ('no-reply@' . preg_replace('/^www\./', '', (string) ($_SERVER['HTTP_HOST'] ?? 'localhost')));
    $fromName = '=?UTF-8?B?' . base64_encode(kv_get('settings')['seo']['siteName'] ?? 'Mamatvbox') . '?=';
    $subj = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $body = chunk_split(base64_encode($html));
    $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\nFrom: {$fromName} <{$from}>\r\nReply-To: {$from}\r\n";

    if (cfg('SMTP_HOST') === '') return @mail($to, $subj, $body, $headers, '-f' . $from);

    $port = (int) cfg('SMTP_PORT', '465');
    $fp = @stream_socket_client(($port === 465 ? 'ssl://' : 'tcp://') . cfg('SMTP_HOST') . ':' . $port, $errno, $err, 20);
    if (!$fp) { error_log("[mail] connect: {$err}"); return false; }
    stream_set_timeout($fp, 20);
    $read = function () use ($fp): string { $d = ''; while (($l = fgets($fp, 515)) !== false) { $d .= $l; if (!isset($l[3]) || $l[3] === ' ') break; } return $d; };
    $cmd = function (string $c) use ($fp, $read): string { fwrite($fp, $c . "\r\n"); return $read(); };
    $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
    $read();
    $cmd("EHLO {$host}");
    if ($port === 587) { $cmd('STARTTLS'); stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT); $cmd("EHLO {$host}"); }
    $cmd('AUTH LOGIN');
    $cmd(base64_encode(cfg('SMTP_USER')));
    $ok = str_starts_with($cmd(base64_encode(cfg('SMTP_PASS'))), '235');
    if ($ok) {
        $cmd("MAIL FROM:<{$from}>");
        $cmd("RCPT TO:<{$to}>");
        $cmd('DATA');
        $msg = $headers . "To: <{$to}>\r\nSubject: {$subj}\r\nDate: " . date('r') . "\r\nMessage-ID: <" . bin2hex(random_bytes(8)) . "@{$host}>\r\n\r\n{$body}\r\n.";
        $ok = str_starts_with($cmd($msg), '250');
    } else error_log('[mail] SMTP auth failed');
    $cmd('QUIT');
    fclose($fp);
    return $ok;
}

function mail_template(string $title, string $text, string $button, string $url): string {
    $e = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
    return '<div dir="rtl" style="background:#0B0D12;padding:32px 12px;font-family:Tahoma,Arial,sans-serif">'
        . '<div style="max-width:520px;margin:auto;background:#1A1D23;border-radius:20px;padding:32px;color:#F2F4F7">'
        . '<div style="font-size:24px;font-weight:bold;color:#FBBF24;margin-bottom:20px">Mamatvbox</div>'
        . '<h1 style="font-size:20px;margin:0 0 12px">' . $e($title) . '</h1>'
        . '<p style="color:#9CA3AF;line-height:1.8;margin:0 0 24px">' . $e($text) . '</p>'
        . '<a href="' . $e($url) . '" style="display:inline-block;background:#FBBF24;color:#0B0D12;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px">' . $e($button) . '</a>'
        . '<p style="color:#6B7280;font-size:12px;margin-top:24px;word-break:break-all">' . $e($url) . '</p>'
        . '</div></div>';
}

/* ---------------- OAuth ---------------- */

function oauth_redirect_uri(string $p): string { return site_url() . "/api/auth/oauth/{$p}/callback"; }

function oauth_start(string $p): void {
    $next = (string) ($_GET['next'] ?? '/account/');
    if (!str_starts_with($next, '/') || str_starts_with($next, '//')) $next = '/account/';
    $state = bin2hex(random_bytes(16));
    set_cookie('mtb_oauth', $state . '|' . $next, time() + 600, 'None');

    if ($p === 'google') {
        if (cfg('GOOGLE_CLIENT_ID') === '' || cfg('GOOGLE_CLIENT_SECRET') === '') oauth_back('google_not_configured');
        header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
            'client_id' => cfg('GOOGLE_CLIENT_ID'), 'redirect_uri' => oauth_redirect_uri('google'), 'response_type' => 'code',
            'scope' => 'openid email profile', 'state' => $state, 'prompt' => 'select_account',
        ]));
        exit;
    }
    if (cfg('APPLE_CLIENT_ID') === '' || cfg('APPLE_TEAM_ID') === '' || cfg('APPLE_KEY_ID') === '' || cfg('APPLE_PRIVATE_KEY') === '') oauth_back('apple_not_configured');
    header('Location: https://appleid.apple.com/auth/authorize?' . http_build_query([
        'client_id' => cfg('APPLE_CLIENT_ID'), 'redirect_uri' => oauth_redirect_uri('apple'), 'response_type' => 'code',
        'scope' => 'name email', 'response_mode' => 'form_post', 'state' => $state,
    ]));
    exit;
}

function oauth_back(string $error, string $next = ''): void {
    header('Location: ' . site_url() . ($error ? '/login/?error=' . rawurlencode($error) : ($next ?: '/account/')));
    exit;
}

function http_post_form(string $url, array $data): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 20, CURLOPT_POSTFIELDS => http_build_query($data), CURLOPT_HTTPHEADER => ['Accept: application/json']]);
    $raw = (string) curl_exec($ch);
    curl_close($ch);
    return json_decode($raw, true) ?: [];
}

function apple_client_secret(): string {
    $key = cfg('APPLE_PRIVATE_KEY');
    if (!str_contains($key, 'BEGIN')) $key = (string) @file_get_contents(__DIR__ . '/' . basename($key));
    $h = b64url(json_encode(['alg' => 'ES256', 'kid' => cfg('APPLE_KEY_ID')]));
    $p = b64url(json_encode(['iss' => cfg('APPLE_TEAM_ID'), 'iat' => time(), 'exp' => time() + 3600, 'aud' => 'https://appleid.apple.com', 'sub' => cfg('APPLE_CLIENT_ID')]));
    if (!openssl_sign("{$h}.{$p}", $der, $key, OPENSSL_ALGO_SHA256)) throw new RuntimeException('apple_key_invalid');
    // DER → raw R||S (64 bytes)
    $pos = 2;
    if (ord($der[1]) & 0x80) $pos += ord($der[1]) & 0x7f;
    $part = function () use ($der, &$pos): string { $pos++; $len = ord($der[$pos++]); $v = substr($der, $pos, $len); $pos += $len; return str_pad(ltrim($v, "\x00"), 32, "\x00", STR_PAD_LEFT); };
    return "{$h}.{$p}." . b64url($part() . $part());
}

function oauth_callback(string $p): void {
    [$state, $next] = array_pad(explode('|', (string) ($_COOKIE['mtb_oauth'] ?? ''), 2), 2, '/account/');
    set_cookie('mtb_oauth', '', time() - 3600, 'None');
    $in = $p === 'apple' ? $_POST : $_GET;
    if (!empty($in['error'])) oauth_back($in['error'] === 'access_denied' || $in['error'] === 'user_cancelled_authorize' ? 'oauth_cancelled' : 'oauth_failed');
    if ($state === '' || !hash_equals($state, (string) ($in['state'] ?? ''))) oauth_back('oauth_state');
    $code = (string) ($in['code'] ?? '');
    if ($code === '') oauth_back('oauth_failed');

    try {
        if ($p === 'google') {
            $tok = http_post_form('https://oauth2.googleapis.com/token', [
                'code' => $code, 'client_id' => cfg('GOOGLE_CLIENT_ID'), 'client_secret' => cfg('GOOGLE_CLIENT_SECRET'),
                'redirect_uri' => oauth_redirect_uri('google'), 'grant_type' => 'authorization_code',
            ]);
            $c = jwt_payload((string) ($tok['id_token'] ?? ''));
            if (($c['aud'] ?? '') !== cfg('GOOGLE_CLIENT_ID') || !in_array($c['iss'] ?? '', ['https://accounts.google.com', 'accounts.google.com'], true)) oauth_back('oauth_failed');
            if (empty($c['email']) || empty($c['email_verified'])) oauth_back('oauth_no_email');
            $uid = oauth_user('google_id', (string) $c['sub'], u_email($c['email']), (string) ($c['name'] ?? ''), (string) ($c['picture'] ?? ''));
        } else {
            $tok = http_post_form('https://appleid.apple.com/auth/token', [
                'client_id' => cfg('APPLE_CLIENT_ID'), 'client_secret' => apple_client_secret(), 'code' => $code,
                'grant_type' => 'authorization_code', 'redirect_uri' => oauth_redirect_uri('apple'),
            ]);
            $c = jwt_payload((string) ($tok['id_token'] ?? ''));
            if (($c['aud'] ?? '') !== cfg('APPLE_CLIENT_ID') || ($c['iss'] ?? '') !== 'https://appleid.apple.com') oauth_back('oauth_failed');
            $info = json_decode((string) ($_POST['user'] ?? ''), true) ?: [];
            $name = trim(($info['name']['firstName'] ?? '') . ' ' . ($info['name']['lastName'] ?? ''));
            $email = u_email((string) ($c['email'] ?? $info['email'] ?? ''));
            $uid = oauth_user('apple_id', (string) $c['sub'], $email, $name, '');
        }
    } catch (Throwable $e) {
        error_log('[oauth] ' . $e->getMessage());
        oauth_back('oauth_failed');
    }
    session_start_for($uid, true);
    oauth_back('', $next);
}

function oauth_user(string $col, string $sub, string $email, string $name, string $avatar): int {
    if ($sub === '') oauth_back('oauth_failed');
    $u = user_by($col, $sub);
    if (!$u && $email !== '') {
        $u = user_by('email', $email);
        if ($u) users_db()->prepare("UPDATE mtb_users SET {$col} = ? WHERE id = ?")->execute([$sub, $u['id']]);
    }
    if ($u) {
        if ($avatar !== '' && $u['avatar'] === '') users_db()->prepare('UPDATE mtb_users SET avatar = ? WHERE id = ?')->execute([$avatar, $u['id']]);
        return (int) $u['id'];
    }
    if ($email === '') oauth_back('oauth_no_email');
    users_db()->prepare("INSERT INTO mtb_users (email, name, avatar, {$col}) VALUES (?, ?, ?, ?)")
        ->execute([$email, $name ?: strstr($email, '@', true), $avatar, $sub]);
    return (int) users_db()->lastInsertId();
}

/* ---------------- routes: /api/auth/* ---------------- */

function route_user_auth(string $method, array $seg, array $b): void {
    [$a, $p, $c] = array_pad($seg, 3, null);

    if ($a === 'oauth' && in_array($p, ['google', 'apple'], true)) {
        if ($c === 'callback') oauth_callback($p);
        oauth_start($p);
    }

    if ($a === 'me') { $u = current_user(); out(['user' => $u ? user_public($u) : null]); }
    if ($method !== 'POST') u_fail('not_found', 404);

    if ($a === 'signup') {
        $email = u_email((string) ($b['email'] ?? ''));
        $pass = (string) ($b['password'] ?? '');
        $name = trim((string) ($b['name'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) u_fail('invalid_email', 422);
        if (mb_strlen($pass) < 8) u_fail('weak_password', 422);
        throttle('signup|' . u_ip(), 10, 3600);
        throttle_hit('signup|' . u_ip());
        $ex = user_by('email', $email);
        if ($ex) u_fail(empty($ex['password_hash']) ? 'email_exists_oauth' : 'email_exists', 409);
        users_db()->prepare('INSERT INTO mtb_users (email, name, password_hash) VALUES (?, ?, ?)')
            ->execute([$email, $name ?: (string) strstr($email, '@', true), password_hash($pass, PASSWORD_DEFAULT)]);
        $id = (int) users_db()->lastInsertId();
        session_start_for($id, true);
        out(['user' => user_public(user_by('id', $id))], 201);
    }

    if ($a === 'login') {
        $email = u_email((string) ($b['email'] ?? ''));
        $key = 'login|' . u_ip() . '|' . $email;
        throttle($key);
        $u = user_by('email', $email);
        if (!$u || empty($u['password_hash']) || !password_verify((string) ($b['password'] ?? ''), $u['password_hash'])) {
            throttle_hit($key);
            usleep(400000);
            u_fail($u && empty($u['password_hash']) ? 'use_social_login' : 'invalid_credentials', 401);
        }
        if (password_needs_rehash($u['password_hash'], PASSWORD_DEFAULT)) {
            users_db()->prepare('UPDATE mtb_users SET password_hash = ? WHERE id = ?')->execute([password_hash((string) $b['password'], PASSWORD_DEFAULT), $u['id']]);
        }
        session_start_for((int) $u['id'], !empty($b['remember']));
        out(['user' => user_public($u)]);
    }

    if ($a === 'logout') { session_end(); out(['ok' => true]); }

    if ($a === 'forgot') {
        $email = u_email((string) ($b['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) u_fail('invalid_email', 422);
        throttle('forgot|' . u_ip(), 6, 3600);
        throttle_hit('forgot|' . u_ip());
        $u = user_by('email', $email);
        if ($u) {
            $token = bin2hex(random_bytes(32));
            users_db()->prepare('UPDATE mtb_users SET reset_hash = ?, reset_expires = ? WHERE id = ?')->execute([hash('sha256', $token), time() + 3600, $u['id']]);
            $url = site_url() . '/reset-password/?token=' . $token;
            $ok = send_mail($email, 'إعادة تعيين كلمة المرور', mail_template(
                'إعادة تعيين كلمة المرور', 'وصلنا طلب لتغيير كلمة مرور حسابك. اضغط الزرار خلال ساعة لاختيار كلمة مرور جديدة. لو ما طلبتش ده، تجاهل الرسالة.',
                'اختيار كلمة مرور جديدة', $url
            ));
            if (!$ok) u_fail('mail_failed', 500);
        }
        out(['ok' => true]);
    }

    if ($a === 'reset') {
        $token = (string) ($b['token'] ?? '');
        $pass = (string) ($b['password'] ?? '');
        if (mb_strlen($pass) < 8) u_fail('weak_password', 422);
        $st = users_db()->prepare('SELECT * FROM mtb_users WHERE reset_hash = ? AND reset_expires > ? LIMIT 1');
        $st->execute([hash('sha256', $token), time()]);
        $u = $st->fetch(PDO::FETCH_ASSOC);
        if (!$u) u_fail('invalid_token', 400);
        users_db()->prepare('UPDATE mtb_users SET password_hash = ?, reset_hash = NULL, reset_expires = NULL WHERE id = ?')->execute([password_hash($pass, PASSWORD_DEFAULT), $u['id']]);
        users_db()->prepare('DELETE FROM mtb_sessions WHERE user_id = ?')->execute([$u['id']]);
        session_start_for((int) $u['id'], true);
        out(['user' => user_public(user_by('id', (int) $u['id']))]);
    }

    if ($a === 'password') {
        $u = require_user();
        $pass = (string) ($b['password'] ?? '');
        if (!empty($u['password_hash']) && !password_verify((string) ($b['current'] ?? ''), $u['password_hash'])) u_fail('wrong_password', 401);
        if (mb_strlen($pass) < 8) u_fail('weak_password', 422);
        users_db()->prepare('UPDATE mtb_users SET password_hash = ? WHERE id = ?')->execute([password_hash($pass, PASSWORD_DEFAULT), $u['id']]);
        out(['ok' => true]);
    }

    u_fail('not_found', 404);
}

/* ---------------- routes: /api/me/* ---------------- */

function route_me(string $method, array $seg, array $b): void {
    $u = require_user();
    $id = (int) $u['id'];
    [$a] = array_pad($seg, 1, null);

    if (!$a) {
        if ($method === 'GET') out(user_public($u));
        if ($method === 'PATCH' || $method === 'PUT') {
            users_db()->prepare('UPDATE mtb_users SET name = ?, phone = ? WHERE id = ?')
                ->execute([mb_substr(trim((string) ($b['name'] ?? $u['name'])), 0, 190), mb_substr(trim((string) ($b['phone'] ?? $u['phone'])), 0, 40), $id]);
            out(user_public(user_by('id', $id)));
        }
        if ($method === 'DELETE') {
            users_db()->prepare('DELETE FROM mtb_sessions WHERE user_id = ?')->execute([$id]);
            users_db()->prepare('DELETE FROM mtb_users WHERE id = ?')->execute([$id]);
            set_cookie('mtb_sid', '', time() - 3600);
            out(['ok' => true]);
        }
    }

    if ($a === 'watchlist') {
        if ($method === 'GET') {
            $ids = array_flip(user_public($u)['watchlist']);
            [, $titles] = catalog();
            out(array_values(array_filter($titles, fn($t) => isset($ids[$t['id']]))));
        }
        $tid = (string) ($b['titleId'] ?? '');
        if ($tid === '') u_fail('invalid', 422);
        out(user_data_update($id, function ($d) use ($tid, $method) {
            $w = array_values(array_filter($d['watchlist'] ?? [], fn($x) => $x !== $tid));
            if ($method !== 'DELETE') array_unshift($w, $tid);
            $d['watchlist'] = array_slice($w, 0, 1000);
            return $d;
        }));
    }

    if ($a === 'platforms') {
        if ($method === 'GET') out(user_public($u)['platforms']);
        $list = array_values(array_map('strval', (array) ($b['platforms'] ?? [])));
        out(user_data_update($id, function ($d) use ($list) { $d['platforms'] = $list; return $d; }));
    }

    if ($a === 'preferences') out(user_data_update($id, function ($d) use ($b) { $d['preferences'] = array_replace($d['preferences'] ?? [], $b); return $d; }));
    if ($a === 'notifications') out([]);
    out(['ok' => true]);
}
