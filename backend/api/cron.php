<?php
/**
 * Scheduled sync — hPanel → Advanced → Cron Jobs (every hour):
 *   /usr/bin/php /home/USER/domains/DOMAIN/public_html/api/cron.php
 * Runs only when due (interval set in Dashboard → التكاملات). Add --force to run now.
 */
declare(strict_types=1);
require __DIR__ . '/lib.php';
require __DIR__ . '/sync.php';

if (PHP_SAPI !== 'cli' && (cfg('CRON_SECRET') === '' || !hash_equals(cfg('CRON_SECRET'), (string) ($_GET['key'] ?? '')))) {
    out(['error' => 'unauthorized'], 401);
}

$s = kv_get('settings')['sync'];
$force = PHP_SAPI === 'cli' ? in_array('--force', $argv ?? [], true) : isset($_GET['force']);

if (!$force) {
    if (empty($s['enabled'])) out(['skipped' => 'disabled']);
    $last = isset($s['lastRunAt']) ? (int) strtotime((string) $s['lastRunAt']) : 0;
    if (time() - $last < ((int) $s['intervalHours']) * 3600) out(['skipped' => 'not_due', 'lastRunAt' => $s['lastRunAt'] ?? null]);
}

out(run_sync());
