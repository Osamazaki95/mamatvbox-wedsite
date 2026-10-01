import type { Metadata } from 'next';
import { read } from './store';

export async function siteBase(): Promise<string> {
  const { seo } = await read('settings');
  return (seo.canonicalUrl || process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function siteMetadata(): Promise<Metadata> {
  const { seo } = await read('settings');
  let metadataBase: URL;
  try { metadataBase = new URL(await siteBase()); } catch { metadataBase = new URL('http://localhost:3000'); }

  return {
    metadataBase,
    title: { default: seo.title, template: `%s | ${seo.siteName}` },
    description: seo.description,
    keywords: seo.keywords,
    applicationName: seo.siteName,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website', locale: 'ar_EG', siteName: seo.siteName, title: seo.title, description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    twitter: { card: 'summary_large_image', site: seo.twitterHandle || undefined, title: seo.title, description: seo.description },
    verification: seo.googleVerification ? { google: seo.googleVerification } : undefined,
    robots: seo.indexing ? { index: true, follow: true } : { index: false, follow: false },
  };
}
