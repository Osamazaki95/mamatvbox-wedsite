/**
 * Public read API served by this Next.js app from the JSON store.
 * Account/auth routes still return demo data — plug your user system in here.
 */
import { NextResponse } from 'next/server';
import * as mock from '@/lib/mock/data';
import { read } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

type Ctx = { params: { path: string[] } };
const json = (d: unknown, status = 200) => NextResponse.json(d, { status });

async function catalog(region?: string) {
  const [platforms, titles] = await Promise.all([read('platforms'), read('titles')]);
  const activePlatforms = platforms.filter((p) => p.active !== false);
  const active = new Set(activePlatforms.map((p) => p.id));
  const list = titles
    .map((t) => ({ ...t, platforms: ((region && t.availability?.[region]) || t.platforms).filter((id) => active.has(id)) }))
    .filter((t) => t.platforms.length > 0);
  return { platforms: activePlatforms, titles: list };
}

export async function GET(req: Request, { params }: Ctx) {
  const [a, b, c] = params.path;
  const q = new URL(req.url).searchParams;
  const region = q.get('region') ?? undefined;

  if (a === 'titles') {
    const { titles } = await catalog(region);
    if (!b) {
      let r = titles;
      const type = q.get('type');
      const platform = q.get('platform');
      if (type) r = r.filter((t) => t.type === type);
      if (platform) r = r.filter((t) => t.platforms.includes(platform));
      return json(r);
    }
    if (b === 'trending') {
      return json([...titles].sort((x, y) => Number(y.source === 'tmdb') - Number(x.source === 'tmdb') || y.rating - x.rating).slice(0, 12));
    }
    if (b === 'expiring') return json(titles.filter((t) => t.expiresInDays));
    const t = titles.find((x) => x.slug === b) ?? null;
    if (c === 'similar') return json(titles.filter((x) => x.slug !== b && (!t || x.genres.some((g) => t.genres.includes(g)))).slice(0, 8));
    return json(t);
  }

  if (a === 'platforms') {
    const { platforms } = await catalog();
    return json(b ? platforms.find((p) => p.id === b) ?? null : platforms);
  }

  if (a === 'search') {
    if (b === 'trending') return json(mock.trendingSearches);
    const s = (q.get('q') ?? '').trim().toLowerCase();
    const { titles } = await catalog(region);
    const found = s ? titles.filter((x) => x.title.toLowerCase().includes(s) || x.originalTitle?.toLowerCase().includes(s) || x.cast.some((n) => n.includes(s))) : [];
    const people = s ? mock.people.filter((p) => p.name.includes(s)) : [];
    if (b === 'suggestions') return json(found.slice(0, 6));
    return json({ titles: found.slice(0, 40), people, total: found.length + people.length });
  }

  if (a === 'people' && b) {
    const p = mock.people.find((x) => x.slug === b);
    if (!p) return json(null);
    const { titles } = await catalog();
    return json({ ...p, works: titles.filter((t) => p.titles.includes(t.id) || t.cast.includes(p.name)) });
  }

  if (a === 'meta') return json(b === 'countries' ? mock.countries : []);
  if (a === 'billing') return json(b === 'plans' ? mock.plans : b === 'invoices' ? mock.invoices : []);

  if (a === 'me') {
    if (!b) return json(mock.currentUser);
    if (b === 'watchlist') {
      const { titles } = await catalog();
      return json(titles.filter((t) => mock.currentUser.watchlist.includes(t.id)));
    }
    if (b === 'notifications') return json(mock.notifications);
    if (b === 'platforms') return json(mock.currentUser.platforms);
    return json([]);
  }

  if (a === 'auth' && b === 'oauth') return json({ error: 'oauth_not_configured' }, 501);
  return json({ error: 'not_found' }, 404);
}

async function mutate(req: Request, { params }: Ctx) {
  const [a, b] = params.path;
  if (a === 'auth' && b === 'magic-link') return json({ ok: true, expiresIn: 900 });
  if (a === 'me' && !b) return json({ ...mock.currentUser, ...(await req.json().catch(() => ({}))) });
  return json({ ok: true });
}

export const POST = mutate;
export const PUT = mutate;
export const PATCH = mutate;
export const DELETE = mutate;
