import { NextResponse } from 'next/server';
import { queryToTransaction, verifyHmac } from '@/lib/server/paymob';
import { update } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

async function markPayment(reference: string, success: boolean, providerRef: string) {
  if (!reference) return;
  await update('payments', (l) => l.map((p) => (p.id === reference ? { ...p, status: success ? 'paid' : 'failed', providerRef } : p)));
}

/** Server-to-server "processed callback" from Paymob. */
export async function POST(req: Request) {
  const hmac = new URL(req.url).searchParams.get('hmac') ?? '';
  const payload = (await req.json().catch(() => null)) as { obj?: Record<string, unknown> } | null;
  const obj = payload?.obj;
  if (!obj) return NextResponse.json({ ok: false }, { status: 400 });
  if (!verifyHmac(obj, hmac)) return NextResponse.json({ ok: false, error: 'bad_hmac' }, { status: 401 });

  const order = (obj.order ?? {}) as { merchant_order_id?: string };
  await markPayment(String(order.merchant_order_id ?? ''), obj.success === true, String(obj.id ?? ''));
  return NextResponse.json({ ok: true });
}

/** Browser redirect after checkout. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams;
  const ok = verifyHmac(queryToTransaction(q), q.get('hmac') ?? '') && q.get('success') === 'true';
  await markPayment(q.get('merchant_order_id') ?? '', ok, q.get('id') ?? '');
  const dest = ok ? '/checkout/success' : `/checkout/failed?code=${encodeURIComponent(q.get('txn_response_code') || q.get('data.message') || 'PAYMENT_DECLINED')}`;
  return NextResponse.redirect(new URL(dest, process.env.SITE_URL || url.origin));
}
