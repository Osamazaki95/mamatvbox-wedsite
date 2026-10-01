/**
 * Tiny JSON-file database (server only). Files live in DATA_DIR (default ./data).
 * Run a single Node process (pm2 fork mode) so the in-memory cache stays consistent.
 */
import { promises as fs } from 'fs';
import path from 'path';
import * as mock from '../mock/data';
import type { DiscoveredProvider, PaymentRecord, Platform, SiteSettings, SyncLog, Title } from '../api/types';

const DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

// TMDB provider ids (region-dependent). Verify/adjust them from Dashboard → التكاملات.
const seedMeta: Record<string, Partial<Platform>> = {
  shahid: { tmdbProviderIds: [1715], url: 'https://shahid.mbc.net' },
  watchit: { tmdbProviderIds: [], url: 'https://www.watchit.com' },
  netflix: { tmdbProviderIds: [8], url: 'https://www.netflix.com' },
  osn: { tmdbProviderIds: [629], url: 'https://osnplus.com' },
  prime: { tmdbProviderIds: [119, 9], url: 'https://www.primevideo.com' },
  yango: { tmdbProviderIds: [], url: 'https://yangoplay.com' },
  appletv: { tmdbProviderIds: [350, 2], url: 'https://tv.apple.com' },
  starzplay: { tmdbProviderIds: [630], url: 'https://starzplay.com' },
  youtube: { tmdbProviderIds: [192, 3], url: 'https://www.youtube.com/movies', kind: 'rental' },
};

export const blankPlatform: Platform = {
  id: '', name: '', nameAr: '', tagline: '', color: '#4FE3D0', priceMonthly: 0, currency: 'ج.م',
  maxQuality: '1080p FHD', hdr: null, audio: 'Stereo 2.0', screens: 1, offline: false, trialDays: 0,
  catalogSize: 0, kind: 'subscription', url: '', logo: '', active: true, tmdbProviderIds: [], regions: ['EG'],
};

export const defaultSettings: SiteSettings = {
  seo: {
    siteName: 'Mamatvbox',
    title: 'Mamatvbox — دليل البث السينمائي الموحد',
    description: 'اعرف فين تتفرج على أي فيلم أو مسلسل قانونياً وبأعلى جودة. قارن التوفر والأسعار عبر منصات البث الرقمية المعتمدة في مصر والوطن العربي.',
    keywords: ['أين أشاهد', 'منصات البث', 'شاهد VIP', 'Watch It', 'نتفليكس مصر', 'أفلام 4K', 'مسلسلات عربية', 'مقارنة الاشتراكات'],
    ogImage: '',
    canonicalUrl: '',
    googleVerification: '',
    twitterHandle: '',
    indexing: true,
  },
  sync: { enabled: true, intervalHours: 6, regions: ['EG', 'SA', 'AE'], pages: 3, autoAddProviders: true },
  payments: { provider: 'paymob', currency: 'EGP', testMode: true, integrationIds: { card: '', wallet: '', kiosk: '' } },
};

interface Collections {
  platforms: Platform[];
  titles: Title[];
  settings: SiteSettings;
  syncLog: SyncLog[];
  providers: DiscoveredProvider[];
  payments: PaymentRecord[];
}

const defaults: { [K in keyof Collections]: () => Collections[K] } = {
  platforms: () => mock.platforms.map((p) => ({ ...blankPlatform, ...p, ...seedMeta[p.id], kind: seedMeta[p.id]?.kind ?? 'subscription', active: true })),
  titles: () => mock.titles,
  settings: () => structuredClone(defaultSettings),
  syncLog: () => [],
  providers: () => [],
  payments: () => [],
};

const mergeSettings = (v: Partial<SiteSettings>): SiteSettings => ({
  seo: { ...defaultSettings.seo, ...v.seo },
  sync: { ...defaultSettings.sync, ...v.sync },
  payments: {
    ...defaultSettings.payments, ...v.payments,
    integrationIds: { ...defaultSettings.payments.integrationIds, ...v.payments?.integrationIds },
  },
});

const cache: Partial<Collections> = {};

export async function read<K extends keyof Collections>(key: K): Promise<Collections[K]> {
  if (cache[key] === undefined) {
    try {
      const raw = JSON.parse(await fs.readFile(path.join(DIR, `${key}.json`), 'utf8'));
      cache[key] = (key === 'settings' ? mergeSettings(raw) : raw) as Collections[K];
    } catch {
      cache[key] = defaults[key]();
    }
  }
  return cache[key] as Collections[K];
}

export async function write<K extends keyof Collections>(key: K, value: Collections[K]): Promise<void> {
  cache[key] = value;
  await fs.mkdir(DIR, { recursive: true });
  const file = path.join(DIR, `${key}.json`);
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

export async function update<K extends keyof Collections>(key: K, fn: (v: Collections[K]) => Collections[K]): Promise<Collections[K]> {
  const next = fn(await read(key));
  await write(key, next);
  return next;
}
