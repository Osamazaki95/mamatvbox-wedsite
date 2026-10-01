import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import * as mock from '@/lib/mock/data';
import type { Platform, SiteSettings, Title } from '@/lib/api/types';
import { ADMIN_COOKIE, isAdmin } from '@/lib/server/auth';
import { paymobConfigured } from '@/lib/server/paymob';
import { blankPlatform, read, update, write } from '@/lib/server/store';
import { isSyncRunning, runSync, tmdbConfigured } from '@/lib/server/tmdb';

export const dynamic = 'force-dynamic';

type Ctx = { params: { path: string[] } };
const json = (d: unknown, status = 200) => NextResponse.json(d, { status });
const guard = () => isAdmin(cookies().get(ADMIN_COOKIE)?.value);
const body = (req: Request) => req.json().catch(() => ({})) as Promise<Record<string, unknown>>;
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await guard())) return json({ error: 'unauthorized' }, 401);
  const [a] = params.path;

  if (a === 'platforms') return json(await read('platforms'));
  if (a === 'settings') return json(await read('settings'));
  if (a === 'titles') return json(await read('titles'));
  if (a === 'kpis') return json(mock.adminKpis);
  if (a === 'referrals') return json(mock.referrals);
  if (a === 'payments') return json(await read('payments'));

  if (a === 'integrations') {
    const [settings, logs, providers, platforms, titles, payments] = await Promise.all([
      read('settings'), read('syncLog'), read('providers'), read('platforms'), read('titles'), read('payments'),
    ]);
    const mapped = new Map<number, string>();
    platforms.forEach((p) => p.tmdbProviderIds?.forEach((id) => mapped.set(id, p.id)));
    return json({
      tmdbConfigured: tmdbConfigured(),
      paymobConfigured: paymobConfigured(),
      hmacConfigured: !!process.env.PAYMOB_HMAC_SECRET,
      siteUrl: process.env.SITE_URL ?? '',
      lastRunAt: settings.sync.lastRunAt,
      running: isSyncRunning(),
      logs,
      settings,
      discovered: providers.map((p) => ({ ...p, platformId: mapped.get(p.id) })),
      counts: { titles: titles.length, synced: titles.filter((t) => t.source === 'tmdb').length, demo: titles.filter((t) => !t.source).length, payments: payments.length },
    });
  }
  return json({ error: 'not_found' }, 404);
}

export async function POST(req: Request, { params }: Ctx) {
  if (!(await guard())) return json({ error: 'unauthorized' }, 401);
  const [a, b] = params.path;

  if (a === 'platforms') {
    const p = (await body(req)) as Partial<Platform>;
    const id = slugify(p.id || p.name || '') || `platform-${Date.now()}`;
    const list = await read('platforms');
    if (list.some((x) => x.id === id)) return json({ error: 'exists' }, 409);
    const created: Platform = { ...blankPlatform, ...p, id, auto: false };
    await write('platforms', [...list, created]);
    return json(created, 201);
  }
  if (a === 'sync') return json(await runSync());
  if (a === 'titles' && b === 'purge-demo') {
    const next = await update('titles', (l) => l.filter((t) => t.source));
    return json({ ok: true, remaining: next.length });
  }
  return json({ error: 'not_found' }, 404);
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!(await guard())) return json({ error: 'unauthorized' }, 401);
  const [a, b] = params.path;
  const data = await body(req);

  if (a === 'platforms' && b) {
    const next = await update('platforms', (l) => l.map((p) => (p.id === b ? { ...p, ...(data as Partial<Platform>), id: b } : p)));
    return json(next.find((p) => p.id === b) ?? null);
  }
  if (a === 'settings') {
    const cur = await read('settings');
    const s = data as Partial<SiteSettings>;
    const merged: SiteSettings = {
      seo: { ...cur.seo, ...s.seo },
      sync: { ...cur.sync, ...s.sync },
      payments: { ...cur.payments, ...s.payments, integrationIds: { ...cur.payments.integrationIds, ...s.payments?.integrationIds } },
    };
    await write('settings', merged);
    return json(merged);
  }
  if (a === 'titles' && b) {
    const next = await update('titles', (l) => l.map((t): Title => (t.id === b ? { ...t, locked: true, adminOverrides: data } : t)));
    return json(next.find((t) => t.id === b) ?? null);
  }
  if (a === 'home-rows') return json({ ok: true });
  return json({ error: 'not_found' }, 404);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await guard())) return json({ error: 'unauthorized' }, 401);
  const [a, b] = params.path;
  if (a === 'platforms' && b) {
    await update('platforms', (l) => l.filter((p) => p.id !== b));
    await update('titles', (l) => l.map((t) => ({
      ...t,
      platforms: t.platforms.filter((id) => id !== b),
      availability: t.availability && Object.fromEntries(Object.entries(t.availability).map(([r, ids]) => [r, ids.filter((id) => id !== b)])),
    })));
    return json({ ok: true });
  }
  return json({ error: 'not_found' }, 404);
}
