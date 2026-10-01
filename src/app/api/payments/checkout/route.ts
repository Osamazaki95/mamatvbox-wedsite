import { NextResponse } from 'next/server';
import * as mock from '@/lib/mock/data';
import type { PaymentRequest, PaymentResult } from '@/lib/api/types';
import { createCheckout, paymobConfigured } from '@/lib/server/paymob';
import { read, update } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

const fail = (errorCode: string): NextResponse<PaymentResult> => NextResponse.json({ status: 'failed', transactionId: '', errorCode });

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Partial<PaymentRequest> & { email?: string; phone?: string; name?: string };
  if (!paymobConfigured()) return fail('PAYMENTS_NOT_CONFIGURED');

  const settings = await read('settings');
  const plan = mock.plans.find((p) => p.id === b.planId);
  if (!plan || plan.monthly === 0) return fail('INVALID_PLAN');

  const ids = settings.payments.integrationIds;
  const integration = b.method === 'wallet' ? ids.wallet : b.method === 'fawry' ? ids.kiosk : ids.card;
  if (!integration) return fail('METHOD_NOT_CONFIGURED');

  const amount = b.billing === 'yearly' ? plan.yearly : plan.monthly;
  const reference = `MTB-${Date.now()}`;
  const siteUrl = (process.env.SITE_URL || new URL(req.url).origin).replace(/\/$/, '');

  try {
    const redirectUrl = await createCheckout({
      amountCents: amount * 100,
      currency: settings.payments.currency,
      integrationId: Number(integration),
      reference,
      item: `${plan.name} (${b.billing === 'yearly' ? 'سنوي' : 'شهري'})`,
      siteUrl,
      customer: { name: b.name ?? '', email: b.email ?? '', phone: b.phone ?? '' },
    });
    await update('payments', (l) => [{
      id: reference, at: new Date().toISOString(), planId: plan.id, billing: b.billing ?? 'monthly',
      amountCents: amount * 100, currency: settings.payments.currency, status: 'pending', method: b.method ?? 'card', email: b.email,
    }, ...l]);
    return NextResponse.json<PaymentResult>({ status: 'pending', transactionId: reference, redirectUrl });
  } catch (e) {
    console.error('[paymob]', e);
    return fail('GATEWAY_ERROR');
  }
}
