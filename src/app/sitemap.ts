import type { MetadataRoute } from 'next';
import { siteBase } from '@/lib/server/seo';
import { read } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [base, titles, platforms] = await Promise.all([siteBase(), read('titles'), read('platforms')]);
  const active = new Set(platforms.filter((p) => p.active !== false).map((p) => p.id));
  const now = new Date();
  const pages = ['', '/movies', '/series', '/programs', '/kids', '/platforms', '/pricing', '/search', '/legal'];

  return [
    ...pages.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: 'daily' as const, priority: p === '' ? 1 : 0.8 })),
    ...titles
      .filter((t) => t.platforms.some((id) => active.has(id)))
      .map((t) => ({ url: `${base}/title/${t.slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
