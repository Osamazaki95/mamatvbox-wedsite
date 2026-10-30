<?php
declare(strict_types=1);
/**
 * Auto-sync from TMDB (watch-provider data by JustWatch).
 * Pulls trending movies/series, maps providers to platforms, auto-creates unknown platforms (hidden).
 */

function tmdb_handle(string $path, array $params = []) {
    $key = cfg('TMDB_API_KEY');
    $bearer = strlen($key) > 40;
    if (!$bearer) $params['api_key'] = $key;
    $ch = curl_init('https://api.themoviedb.org/3' . $path . '?' . http_build_query($params));
    $h = ['Accept: application/json'];
    if ($bearer) $h[] = 'Authorization: Bearer ' . $key;
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 25, CURLOPT_HTTPHEADER => $h]);
    return $ch;
}

function tmdb(string $path, array $params = []): array {
    $ch = tmdb_handle($path, $params);
    $raw = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code !== 200) throw new RuntimeException("TMDB {$code} على {$path}");
    return json_decode((string) $raw, true) ?: [];
}

function tmdb_many(array $paths): array {
    $mh = curl_multi_init();
    $hs = [];
    foreach ($paths as $k => $p) { $hs[$k] = tmdb_handle($p); curl_multi_add_handle($mh, $hs[$k]); }
    do {
        $st = curl_multi_exec($mh, $running);
        if ($running) curl_multi_select($mh, 1.0);
    } while ($running && $st === CURLM_OK);
    $out = [];
    foreach ($hs as $k => $h) {
        $code = (int) curl_getinfo($h, CURLINFO_HTTP_CODE);
        $out[$k] = $code === 200 ? (json_decode((string) curl_multi_getcontent($h), true) ?: null) : null;
        curl_multi_remove_handle($mh, $h);
        curl_close($h);
    }
    curl_multi_close($mh);
    return $out;
}

function sync_log(array $e): array {
    $l = kv_get('syncLog');
    array_unshift($l, $e);
    kv_set('syncLog', array_slice($l, 0, 50));
    return $e;
}

function sync_running(): bool {
    $lock = kv_get('syncLock');
    return is_array($lock) && isset($lock['at']) && time() - (int) $lock['at'] < 600;
}

function run_sync(): array {
    $at = gmdate('c');
    $empty = ['at' => $at, 'scanned' => 0, 'added' => 0, 'updated' => 0, 'newPlatforms' => []];
    if (cfg('TMDB_API_KEY') === '') return sync_log($empty + ['ok' => false, 'message' => 'مفتاح TMDB_API_KEY غير مضبوط في api/config.php']);
    if (sync_running()) return $empty + ['ok' => false, 'message' => 'توجد مزامنة أخرى قيد التشغيل'];

    kv_set('syncLock', ['at' => time()]);
    @set_time_limit(300);
    ignore_user_abort(true);

    try {
        $settings = kv_get('settings');
        $sync = $settings['sync'];
        $regions = $sync['regions'] ?: ['EG'];
        $pages = max(1, min(10, (int) $sync['pages']));
        $autoAdd = (bool) $sync['autoAddProviders'];
        $platforms = kv_get('platforms');
        $providers = kv_get('providers');
        $titles = [];
        foreach (kv_get('titles') as $t) $titles[$t['id']] = $t;

        $genres = [];
        foreach (['movie', 'tv'] as $ty) foreach (tmdb("/genre/{$ty}/list", ['language' => 'ar'])['genres'] ?? [] as $g) $genres[$g['id']] = $g['name'];

        $items = [];
        foreach (['movie', 'tv'] as $ty) {
            for ($p = 1; $p <= $pages; $p++) {
                foreach (tmdb("/trending/{$ty}/week", ['language' => 'ar', 'page' => $p])['results'] ?? [] as $it) $items[] = [$ty, $it];
            }
        }

        $byProvider = [];
        foreach ($platforms as $i => $p) foreach ($p['tmdbProviderIds'] ?? [] as $pid) $byProvider[(int) $pid] = $i;
        $known = [];
        foreach ($providers as $pr) $known[(int) $pr['id']] = true;
        $buckets = ['flatrate' => 'subscription', 'free' => 'free', 'ads' => 'ads', 'rent' => 'rental', 'buy' => 'rental'];
        $added = 0; $updated = 0; $new = [];

        foreach (array_chunk($items, 10) as $chunk) {
            $res = tmdb_many(array_map(fn($x) => "/{$x[0]}/{$x[1]['id']}/watch/providers", $chunk));
            foreach ($chunk as $k => [$ty, $it]) {
                $wp = $res[$k]['results'] ?? null;
                if (!$wp) continue;
                $availability = [];
                foreach ($regions as $region) {
                    if (empty($wp[$region])) continue;
                    $ids = [];
                    foreach ($buckets as $bucket => $kind) {
                        foreach ($wp[$region][$bucket] ?? [] as $pr) {
                            $pid = (int) $pr['provider_id'];
                            $logo = IMG . 'w92' . ($pr['logo_path'] ?? '');
                            if (!isset($known[$pid])) { $providers[] = ['id' => $pid, 'name' => $pr['provider_name'], 'logo' => $logo]; $known[$pid] = true; }
                            if (!isset($byProvider[$pid]) && $autoAdd) {
                                $platforms[] = array_replace(blank_platform(), [
                                    'id' => "tmdb-{$pid}", 'name' => $pr['provider_name'], 'nameAr' => $pr['provider_name'],
                                    'tagline' => 'أضيفت تلقائياً من المزامنة', 'kind' => $kind, 'logo' => $logo,
                                    'active' => false, 'auto' => true, 'tmdbProviderIds' => [$pid], 'regions' => [$region],
                                ]);
                                $byProvider[$pid] = count($platforms) - 1;
                                $new[] = $pr['provider_name'];
                            }
                            if (isset($byProvider[$pid])) $ids[$platforms[$byProvider[$pid]]['id']] = true;
                        }
                    }
                    if ($ids) $availability[$region] = array_keys($ids);
                }
                if (!$availability) continue;

                $id = "tmdb-{$ty}-{$it['id']}";
                $prev = $titles[$id] ?? null;
                if ($prev && !empty($prev['locked'])) { $titles[$id]['availability'] = $availability; continue; }

                $date = (string) (($it['release_date'] ?? '') ?: ($it['first_air_date'] ?? ''));
                $gids = $it['genre_ids'] ?? [];
                $lang = (string) ($it['original_language'] ?? '');
                $isKids = in_array(16, $gids, true) || in_array(10762, $gids, true);
                $isProgram = (bool) array_intersect($gids, [99, 10763, 10764, 10767]);
                $detected = $isKids ? 'kids' : ($ty === 'tv' ? ($isProgram ? 'program' : 'series') : ($isProgram ? 'program' : 'movie'));
                unset($lang);
                $titles[$id] = array_replace($prev ?? [], [
                    'id' => $id, 'tmdbId' => $it['id'], 'source' => 'tmdb', 'slug' => "{$ty}-{$it['id']}",
                    'title' => $it['title'] ?? $it['name'] ?? '',
                    'originalTitle' => $it['original_title'] ?? $it['original_name'] ?? null,
                    'type' => $detected,
                    'year' => ((int) substr($date, 0, 4)) ?: (int) date('Y'),
                    'genres' => array_values(array_filter(array_map(fn($g) => $genres[$g] ?? null, $gids))),
                    'rating' => round((float) ($it['vote_average'] ?? 0), 1),
                    'runtime' => $prev['runtime'] ?? ($ty === 'tv' ? 'مسلسل' : 'فيلم'),
                    'quality' => $prev['quality'] ?? '1080p FHD',
                    'platforms' => $availability[$regions[0]] ?? array_values($availability)[0],
                    'availability' => $availability,
                    'inPlan' => $prev['inPlan'] ?? false,
                    'download' => $prev['download'] ?? false,
                    'poster' => !empty($it['poster_path']) ? IMG . 'w500' . $it['poster_path'] : ($prev['poster'] ?? null),
                    'tint' => $prev['tint'] ?? '#1f2937',
                    'overview' => ($it['overview'] ?? '') ?: ($prev['overview'] ?? ''),
                    'director' => $prev['director'] ?? '',
                    'cast' => $prev['cast'] ?? [],
                ]);
                if ($prev) $updated++; else $added++;
            }
        }

        kv_set('platforms', array_values($platforms));
        kv_set('titles', array_values($titles));
        kv_set('providers', $providers);
        $settings['sync']['lastRunAt'] = $at;
        kv_set('settings', $settings);
        $r = sync_log(['at' => $at, 'ok' => true, 'message' => 'تم فحص ' . count($items) . ' عملاً', 'scanned' => count($items), 'added' => $added, 'updated' => $updated, 'newPlatforms' => $new]);
    } catch (Throwable $e) {
        $r = sync_log($empty + ['ok' => false, 'message' => $e->getMessage()]);
    } finally {
        kv_set('syncLock', []);
    }
    return $r;
}
