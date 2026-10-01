/**
 * Paymob (Egypt) — cards, mobile wallets (Vodafone Cash…), kiosk/Aman and more,
 * through the Unified Checkout (Intention API). Card data never touches this server.
 */
import { createHmac } from 'crypto';

const BASE = process.env.PAYMOB_BASE_URL || 'https://accept.paymob.com';

export const paymobConfigured = () => !!(process.env.PAYMOB_SECRET_KEY && process.env.PAYMOB_PUBLIC_KEY);

interface CheckoutInput {
  amountCents: number;
  currency: string;
  integrationId: number;
  reference: string;
  item: string;
  siteUrl: string;
  customer: { name: string; email: string; phone: string };
}

export async function createCheckout(o: CheckoutInput): Promise<string> {
  const [first, ...rest] = (o.customer.name || 'Mamatvbox Customer').split(' ');
  const res = await fetch(`${BASE}/v1/intention/`, {
    method: 'POST',
    headers: { Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: o.amountCents,
      currency: o.currency,
      payment_methods: [o.integrationId],
      items: [{ name: o.item, amount: o.amountCents, description: o.item, quantity: 1 }],
      billing_data: {
        first_name: first, last_name: rest.join(' ') || 'Customer',
        email: o.customer.email || 'customer@mamatvbox.com', phone_number: o.customer.phone || '+201000000000',
      },
      special_reference: o.reference,
      notification_url: `${o.siteUrl}/api/payments/webhook`,
      redirection_url: `${o.siteUrl}/api/payments/webhook`,
    }),
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as { client_secret?: string };
  if (!res.ok || !data.client_secret) throw new Error(`Paymob ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return `${BASE}/unifiedcheckout/?publicKey=${encodeURIComponent(process.env.PAYMOB_PUBLIC_KEY ?? '')}&clientSecret=${encodeURIComponent(data.client_secret)}`;
}

// Field order defined by Paymob for the transaction HMAC.
const HMAC_FIELDS = [
  'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction', 'id', 'integration_id',
  'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment', 'is_voided', 'order.id',
  'owner', 'pending', 'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success',
];

const pick = (o: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined), o);

export function verifyHmac(obj: Record<string, unknown>, hmac: string): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret || !hmac) return false;
  const str = HMAC_FIELDS.map((f) => { const v = pick(obj, f); return v === undefined || v === null ? '' : String(v); }).join('');
  return createHmac('sha512', secret).update(str).digest('hex') === hmac;
}

/** Redirect callbacks send the same fields flat in the query string. */
export function queryToTransaction(q: URLSearchParams): Record<string, unknown> {
  const o: Record<string, unknown> = Object.fromEntries(q.entries());
  o.order = { id: q.get('order') };
  o.source_data = { pan: q.get('source_data.pan'), sub_type: q.get('source_data.sub_type'), type: q.get('source_data.type') };
  return o;
}
