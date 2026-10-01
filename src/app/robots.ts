import type { MetadataRoute } from 'next';
import { siteBase } from '@/lib/server/seo';
import { read } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [base, { seo }] = await Promise.all([siteBase(), read('settings')]);
  return {
    rules: seo.indexing
      ? { userAgent: '*', allow: '/', disallow: ['/admin', '/admin-login', '/api/', '/account', '/checkout', '/emails'] }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
