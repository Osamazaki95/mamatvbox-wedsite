<?php
declare(strict_types=1);
/** Paymob Unified Checkout (cards, wallets, kiosk). Card data never touches this server. */

const PM_HMAC_FIELDS = [
    'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction', 'id', 'integration_id',
    'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment', 'is_voided', 'order.id',
    'owner', 'pending', 'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success',
];

function pm_configured(): bool { return cfg('PAYMOB_SECRET_KEY') !== '' && cfg('PAYMOB_PUBLIC_KEY') !== ''; }
function pm_base(): string { return rtrim(cfg('PAYMOB_BASE_URL', 'https://accept.paymob.com'), '/'); }

function pm_val($v): string {
    if ($v === null) return '';
    if (is_bool($v)) return $v ? 'true' : 'false';
    return (string) $v;
}

function pm_check(string $s, string $hmac): bool {
    $secret = cfg('PAYMOB_HMAC_SECRET');
    return $secret !== '' && $hmac !== '' && hash_equals(hash_hmac('sha512', $s, $secret), $hmac);
}

/** Server callback: JSON { obj: {...} } */
function pm_verify_obj(array $o, string $hmac): bool {
    $s = '';
    foreach (PM_HMAC_FIELDS as $f) {
        $cur = $o;
        foreach (explode('.', $f) as $k) $cur = is_array($cur) ? ($cur[$k] ?? null) : null;
        $s .= pm_val($cur);
    }
    return pm_check($s, $hmac);
}

/** Browser redirect: same fields flat in the query (PHP turns "." into "_"). */
function pm_verify_query(array $q, string $hmac): bool {
    $s = '';
    foreach (PM_HMAC_FIELDS as $f) {
        $key = $f === 'order.id' ? 'order' : str_replace('.', '_', $f);
        $s .= (string) ($q[$key] ?? '');
    }
    return pm_check($s, $hmac);
}

function pm_create_checkout(int $amountCents, string $currency, int $integrationId, string $reference, string $item, array $customer): string {
    $name = trim((string) ($customer['name'] ?? '')) ?: 'Mamatvbox Customer';
    $parts = explode(' ', $name, 2);
    $site = site_url();
    $payload = [
        'amount' => $amountCents,
        'currency' => $currency,
        'payment_methods' => [$integrationId],
        'items' => [['name' => $item, 'amount' => $amountCents, 'description' => $item, 'quantity' => 1]],
        'billing_data' => [
            'first_name' => $parts[0], 'last_name' => $parts[1] ?? 'Customer',
            'email' => ($customer['email'] ?? '') ?: 'customer@mamatvbox.com',
            'phone_number' => ($customer['phone'] ?? '') ?: '+201000000000',
        ],
        'special_reference' => $reference,
        'notification_url' => $site . '/api/payments/webhook',
        'redirection_url' => $site . '/api/payments/webhook',
    ];
    $ch = curl_init(pm_base() . '/v1/intention/');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => ['Authorization: Token ' . cfg('PAYMOB_SECRET_KEY'), 'Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
    ]);
    $raw = (string) curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $data = json_decode($raw, true) ?: [];
    if ($code >= 300 || empty($data['client_secret'])) throw new RuntimeException("Paymob {$code}: " . substr($raw, 0, 300));
    return pm_base() . '/unifiedcheckout/?publicKey=' . rawurlencode(cfg('PAYMOB_PUBLIC_KEY')) . '&clientSecret=' . rawurlencode($data['client_secret']);
}

function pm_mark(string $reference, bool $success, string $providerRef): void {
    if ($reference === '') return;
    $list = kv_get('payments');
    foreach ($list as &$p) {
        if ($p['id'] === $reference) { $p['status'] = $success ? 'paid' : 'failed'; $p['providerRef'] = $providerRef; }
    }
    unset($p);
    kv_set('payments', $list);
}
