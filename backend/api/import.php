<?php
declare(strict_types=1);
/**
 * Bulk import: fetch a URL (CSV / Google Sheets / JSON / RSS / web page with Schema.org data)
 * or an uploaded file, turn it into flat rows, then save validated titles in batches.
 */

/** @return array{0:string,1:string,2:string} body, content-type, final url */
function imp_fetch_url(string $url): array {
    if (!preg_match('#^https?://#i', $url)) throw new InvalidArgumentException('invalid_url');

    // Google Sheets → CSV export
    if (preg_match('#docs\.google\.com/spreadsheets/d/([a-zA-Z0-9_-]+)#', $url, $m) && !preg_match('/(output|format)=(csv|tsv)/', $url)) {
        $gid = preg_match('/[#&?]gid=(\d+)/', $url, $g) ? $g[1] : '0';
        $url = "https://docs.google.com/spreadsheets/d/{$m[1]}/export?format=csv&gid={$gid}";
    }
    // Google Drive file → direct download
    if (preg_match('#drive\.google\.com/file/d/([a-zA-Z0-9_-]+)#', $url, $m)) {
        $url = "https://drive.google.com/uc?export=download&id={$m[1]}";
    }
    // Dropbox → direct download
    if (str_contains($url, 'dropbox.com')) $url = (string) preg_replace('/([?&])dl=0/', '$1dl=1', $url);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 6,
        CURLOPT_TIMEOUT => 120, CURLOPT_CONNECTTIMEOUT => 20, CURLOPT_ENCODING => '',
        CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; MamatvboxImporter/1.0)',
        CURLOPT_HTTPHEADER => ['Accept: text/csv,application/json,application/xml,text/html;q=0.9,*/*;q=0.8'],
    ]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $type = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $final = (string) curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    $err = curl_error($ch);
    curl_close($ch);

    if ($body === false) throw new InvalidArgumentException('fetch_failed: ' . $err);
    if ($code >= 400) throw new InvalidArgumentException('fetch_http_' . $code);
    if (strlen((string) $body) > 30 * 1024 * 1024) throw new InvalidArgumentException('too_large');
    return [(string) $body, $type, $final ?: $url];
}

/** @return array{0:string,1:array} kind, rows */
function imp_parse(string $body, string $type): array {
    $body = (string) preg_replace('/^\xEF\xBB\xBF/', '', $body);
    if (!mb_check_encoding($body, 'UTF-8')) $body = (string) mb_convert_encoding($body, 'UTF-8', 'Windows-1256');
    $t = ltrim($body);
    if ($t === '') throw new InvalidArgumentException('empty');

    if ($t[0] === '[' || $t[0] === '{') {
        $j = json_decode($t, true);
        if (is_array($j)) return ['json', imp_rows_from_json($j)];
    }
    if (preg_match('/^<\?xml|^<rss|^<feed/i', $t) && !preg_match('/<html/i', substr($t, 0, 500))) return ['xml', imp_rows_from_xml($t)];
    if (stripos($type, 'html') !== false || preg_match('/^<(!doctype|html|head|body)/i', $t)) {
        $rows = imp_rows_from_html($body);
        if (!$rows) throw new InvalidArgumentException('html_no_data');
        return ['html', $rows];
    }
    return ['csv', imp_rows_from_csv($body)];
}

function imp_flat($v): string {
    if (is_array($v)) {
        if (array_is_list($v)) {
            return implode(', ', array_filter(array_map(
                fn($x) => is_array($x) ? (string) ($x['name'] ?? $x['title'] ?? $x['value'] ?? $x['url'] ?? '') : (string) $x, $v
            ), 'strlen'));
        }
        return (string) ($v['name'] ?? $v['title'] ?? $v['ar'] ?? $v['en'] ?? $v['url'] ?? $v['value'] ?? '');
    }
    if (is_bool($v)) return $v ? '1' : '0';
    return trim((string) $v);
}

function imp_row(array $it, string $group = ''): array {
    $row = $group !== '' ? ['__group' => $group] : [];
    foreach ($it as $k => $v) $row[(string) $k] = imp_flat($v);
    return $row;
}

function imp_rows_from_json(array $j): array {
    $isObjList = fn($v) => is_array($v) && array_is_list($v) && isset($v[0]) && is_array($v[0]);
    if (array_is_list($j)) return array_values(array_map(fn($x) => imp_row($x), array_filter($j, 'is_array')));

    // { movies: [...], series: [...], kids: [...] } → keep the group as a type hint
    $groups = [];
    foreach ($j as $k => $v) {
        if ($isObjList($v)) $groups[(string) $k] = $v;
        elseif (is_array($v)) foreach (['items', 'results', 'list', 'data'] as $inner) if (isset($v[$inner]) && $isObjList($v[$inner])) $groups[(string) $k] = $v[$inner];
    }
    if (count($groups) > 1) {
        $rows = [];
        foreach ($groups as $g => $items) foreach ($items as $it) if (is_array($it)) $rows[] = imp_row($it, $g);
        return $rows;
    }
    if ($groups) return array_map(fn($x) => imp_row($x), array_values(array_filter(reset($groups), 'is_array')));
    return [imp_row($j)];
}

function imp_rows_from_csv(string $s): array {
    $first = (string) strtok($s, "\n");
    $counts = [',' => substr_count($first, ','), ';' => substr_count($first, ';'), "\t" => substr_count($first, "\t"), '|' => substr_count($first, '|')];
    arsort($counts);
    $d = (string) array_key_first($counts);

    $fh = fopen('php://temp', 'r+');
    fwrite($fh, $s);
    rewind($fh);
    $head = null;
    $rows = [];
    while (($r = fgetcsv($fh, 0, $d, '"', '')) !== false) {
        if ($r === [null]) continue;
        if ($head === null) { $head = array_map(fn($h) => trim((string) $h), $r); continue; }
        $row = [];
        foreach ($head as $i => $h) if ($h !== '') $row[$h] = trim((string) ($r[$i] ?? ''));
        if (array_filter($row, 'strlen')) $rows[] = $row;
    }
    fclose($fh);
    if ($head === null) throw new InvalidArgumentException('empty');
    return $rows;
}

function imp_rows_from_xml(string $s): array {
    $x = @simplexml_load_string($s, 'SimpleXMLElement', LIBXML_NOCDATA);
    if (!$x) throw new InvalidArgumentException('invalid_xml');
    $items = isset($x->channel->item) ? $x->channel->item : (isset($x->entry) ? $x->entry : $x->children());
    $rows = [];
    foreach ($items as $it) {
        $row = [];
        foreach ($it->children() as $k => $v) $row[(string) $k] = trim((string) $v);
        foreach ($it->children('media', true) as $k => $v) if (isset($v->attributes()['url'])) $row['poster'] = (string) $v->attributes()['url'];
        if (isset($it->enclosure['url'])) $row['poster'] = (string) $it->enclosure['url'];
        if (isset($it->link['href'])) $row['link'] = (string) $it->link['href'];
        if ($row) $rows[] = $row;
    }
    return $rows;
}

function imp_rows_from_html(string $html): array {
    $rows = [];
    if (preg_match_all('#<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>#is', $html, $m)) {
        foreach ($m[1] as $raw) {
            $j = json_decode(trim(html_entity_decode($raw, ENT_QUOTES | ENT_HTML5, 'UTF-8')), true);
            if (is_array($j)) imp_walk_ld($j, $rows);
        }
    }
    if (!$rows) {
        $og = function (string $p) use ($html): string {
            return preg_match('#<meta[^>]+property=["\']og:' . $p . '["\'][^>]*content=["\']([^"\']*)#i', $html, $x)
                ? html_entity_decode($x[1], ENT_QUOTES | ENT_HTML5, 'UTF-8') : '';
        };
        if ($og('title') !== '') $rows[] = ['title' => $og('title'), 'overview' => $og('description'), 'poster' => $og('image'), 'link' => $og('url'), 'type' => $og('type')];
    }
    return $rows;
}

function imp_walk_ld($n, array &$rows): void {
    if (!is_array($n)) return;
    if (array_is_list($n)) { foreach ($n as $x) imp_walk_ld($x, $rows); return; }
    $t = $n['@type'] ?? '';
    $t = is_array($t) ? implode(',', $t) : (string) $t;
    if (preg_match('/Movie|TVSeries|TVSeason|CreativeWorkSeries|VideoObject/i', $t)) {
        $img = $n['image'] ?? $n['thumbnailUrl'] ?? '';
        if (is_array($img)) $img = $img['url'] ?? ($img[0] ?? '');
        if (is_array($img)) $img = $img['url'] ?? '';
        $rows[] = [
            'title' => imp_flat($n['name'] ?? ''), 'type' => $t,
            'year' => (string) ($n['datePublished'] ?? $n['startDate'] ?? $n['dateCreated'] ?? $n['uploadDate'] ?? ''),
            'poster' => (string) $img, 'overview' => imp_flat($n['description'] ?? ''),
            'genres' => imp_flat($n['genre'] ?? ''), 'rating' => (string) ($n['aggregateRating']['ratingValue'] ?? ''),
            'director' => imp_flat($n['director'] ?? ''), 'cast' => imp_flat($n['actor'] ?? $n['actors'] ?? ''),
            'link' => (string) ($n['url'] ?? ''),
        ];
        return;
    }
    foreach (['@graph', 'itemListElement', 'item', 'mainEntity', 'hasPart'] as $k) if (isset($n[$k])) imp_walk_ld($n[$k], $rows);
}

function imp_key(string $title, int $year): string {
    return mb_strtolower((string) preg_replace('/\s+/u', '', $title)) . '|' . $year;
}

/** Saves a batch. mode: skip = leave existing titles, update = overwrite them. */
function imp_commit(array $items, string $mode): array {
    $list = kv_get('titles');
    $index = [];
    foreach ($list as $i => $t) $index[imp_key((string) ($t['title'] ?? ''), (int) ($t['year'] ?? 0))] = $i;
    $added = 0; $updated = 0; $skipped = 0; $errors = [];

    foreach ($items as $n => $b) {
        if (!is_array($b)) continue;
        $k = imp_key((string) ($b['title'] ?? ''), (int) ($b['year'] ?? 0));
        try {
            if (isset($index[$k])) {
                if ($mode !== 'update') { $skipped++; continue; }
                $list[$index[$k]] = clean_title($b, $list[$index[$k]], $list);
                $updated++;
            } else {
                $list[] = clean_title($b, null, $list);
                $index[$k] = count($list) - 1;
                $added++;
            }
        } catch (InvalidArgumentException $e) {
            $errors[] = ['row' => (int) ($b['_row'] ?? $n), 'error' => $e->getMessage()];
        }
    }
    kv_set('titles', $list);
    return ['added' => $added, 'updated' => $updated, 'skipped' => $skipped, 'errors' => $errors];
}
