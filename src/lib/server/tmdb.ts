/**
 * Auto-sync: pulls trending movies/series from TMDB (watch-provider data by JustWatch),
 * maps every provider to a platform, and auto-creates platforms it has never seen.
 * Needs TMDB_API_KEY (v3 key or v4 read token) — free at themoviedb.org.
 */
import type { Platform, PlatformKind, SyncLog, Title } from '../api/types';
import { blankPlatform, read, update, write } from './store';

const IMG = 'https://image.tmdb.org/t/p/';
const key = () => process.env.TMDB_API_KEY ?? '';
export const tmdbConfigured = () => key().length > 0;

async function tmdb<T>(p: string, params: Record<string, string | number> = {}): Promise<T> {
  const k = key();
  const url = new URL(`https://api.themoviedb.org/3${p}`);
  Object.entries(params).forEach(([n, v]) => url.searchParams.set(n, String(v)));
  const bearer = k.length > 40;
  if (!bearer) url.searchParams.set('api_key', k);
  const res = await fetch(url, { headers: bearer ? { Authorization: `Bearer ${k}` } : {}, cache: 'no-store' });
  if (!res.ok) throw new Error(`TMDB ${res.status} على ${p}`);
  return res.json() as Promise<T>;
}

interface TmdbItem {
  id: number; title?: string; name?: string; original_title?: string; original_name?: string;
  overview: string; poster_path: string | null; release_date?: string; first_air_date?: string;
  vote_average: number; genre_ids: number[];
}
interface Provider { provider_id: number; provider_name: string; logo_path: string }
type Bucket = 'flatrate' | 'free' | 'ads' | 'rent' | 'buy';
const bucketKind: Record<Bucket, PlatformKind> = { flatrate: 'subscription', free: 'free', ads: 'ads', rent: 'rental', buy: 'rental' };

let running = false;
export const isSyncRunning = () => running;

async function pool<T>(items: T[], size: number, fn: (t: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) { const item = items[i++]; await fn(item).catch(() => undefined); }
  }));
}

async function log(entry: SyncLog) {
  await update('syncLog', (l) => [entry, ...l].slice(0, 50));
  return entry;
}

export async function runSync(): Promise<SyncLog> {
  const at = new Date().toISOString();
  const empty = { at, scanned: 0, added: 0, updated: 0, newPlatforms: [] as string[] };
  if (!tmdbConfigured()) return log({ ...empty, ok: false, message: 'مفتاح TMDB_API_KEY غير مضبوط في ملف .env' });
  if (running) return { ...empty, ok: false, message: 'توجد مزامنة أخرى قيد التشغيل' };
  running = true;

  try {
    const settings = await read('settings');
    const platforms = [...(await read('platforms'))];
    const providers = [...(await read('providers'))];
    const out = new Map((await read('titles')).map((t) => [t.id, t]));
    const { regions, pages, autoAddProviders } = settings.sync;

    const [mg, tg] = await Promise.all([
      tmdb<{ genres: { id: number; name: string }[] }>('/genre/movie/list', { language: 'ar' }),
      tmdb<{ genres: { id: number; name: string }[] }>('/genre/tv/list', { language: 'ar' }),
    ]);
    const genreName = new Map([...mg.genres, ...tg.genres].map((g) => [g.id, g.name]));

    const items: { type: 'movie' | 'tv'; item: TmdbItem }[] = [];
    for (const type of ['movie', 'tv'] as const) {
      for (let page = 1; page <= pages; page++) {
        const r = await tmdb<{ results: TmdbItem[] }>(`/trending/${type}/week`, { language: 'ar', page });
        r.results.forEach((item) => items.push({ type, item }));
      }
    }

    const byProvider = new Map<number, Platform>();
    platforms.forEach((p) => p.tmdbProviderIds?.forEach((id) => byProvider.set(id, p)));
    const newPlatforms: string[] = [];
    let added = 0;
    let updated = 0;

    await pool(items, 6, async ({ type, item }) => {
      const wp = await tmdb<{ results: Record<string, Partial<Record<Bucket, Provider[]>>> }>(`/${type}/${item.id}/watch/providers`);
      const availability: Record<string, string[]> = {};

      for (const region of regions) {
        const b = wp.results[region];
        if (!b) continue;
        const ids = new Set<string>();
        (Object.keys(bucketKind) as Bucket[]).forEach((bucket) => b[bucket]?.forEach((pr) => {
          if (!providers.some((x) => x.id === pr.provider_id)) {
            providers.push({ id: pr.provider_id, name: pr.provider_name, logo: `${IMG}w92${pr.logo_path}` });
          }
          let plat = byProvider.get(pr.provider_id);
          if (!plat && autoAddProviders) {
            plat = {
              ...blankPlatform, id: `tmdb-${pr.provider_id}`, name: pr.provider_name, nameAr: pr.provider_name,
              tagline: 'أضيفت تلقائياً من المزامنة', kind: bucketKind[bucket], logo: `${IMG}w92${pr.logo_path}`,
              active: false, auto: true, tmdbProviderIds: [pr.provider_id], regions: [region],
            };
            platforms.push(plat);
            byProvider.set(pr.provider_id, plat);
            newPlatforms.push(pr.provider_name);
          }
          if (plat) ids.add(plat.id);
        }));
        if (ids.size) availability[region] = [...ids];
      }
      if (!Object.keys(availability).length) return;

      const id = `tmdb-${type}-${item.id}`;
      const prev = out.get(id);
      if (prev?.locked) { out.set(id, { ...prev, availability }); return; }

      const date = item.release_date || item.first_air_date || '';
      const title: Title = {
        ...(prev ?? {}),
        id, tmdbId: item.id, source: 'tmdb', slug: `${type}-${item.id}`,
        title: item.title || item.name || '',
        originalTitle: item.original_title || item.original_name,
        type: item.genre_ids.includes(16) ? 'kids' : type === 'tv' ? 'series' : 'movie',
        year: Number(date.slice(0, 4)) || new Date().getFullYear(),
        genres: item.genre_ids.map((g) => genreName.get(g)).filter((g): g is string => !!g),
        rating: Math.round(item.vote_average * 10) / 10,
        runtime: prev?.runtime || (type === 'tv' ? 'مسلسل' : 'فيلم'),
        quality: prev?.quality ?? '1080p FHD',
        platforms: availability[regions[0]] ?? Object.values(availability)[0],
        availability,
        inPlan: prev?.inPlan ?? false,
        download: prev?.download ?? false,
        poster: item.poster_path ? `${IMG}w500${item.poster_path}` : prev?.poster,
        tint: prev?.tint ?? '#1f2937',
        overview: item.overview || prev?.overview || '',
        director: prev?.director ?? '',
        cast: prev?.cast ?? [],
      };
      if (prev) updated++; else added++;
      out.set(id, title);
    });

    await write('platforms', platforms);
    await write('titles', [...out.values()]);
    await write('providers', providers);
    await write('settings', { ...settings, sync: { ...settings.sync, lastRunAt: at } });
    return log({ at, ok: true, message: `تم فحص ${items.length} عملاً`, scanned: items.length, added, updated, newPlatforms });
  } catch (e) {
    return log({ ...empty, ok: false, message: e instanceof Error ? e.message : 'خطأ غير معروف' });
  } finally {
    running = false;
  }
}
