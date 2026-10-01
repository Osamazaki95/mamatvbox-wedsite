import type { Viewport } from 'next';
import { Alexandria, IBM_Plex_Sans_Arabic, JetBrains_Mono, Montserrat_Alternates } from 'next/font/google';
import { read } from '@/lib/server/store';
import { siteBase, siteMetadata } from '@/lib/server/seo';
import './globals.css';

const plex = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-plex' });
const alexandria = Alexandria({ subsets: ['arabic', 'latin'], weight: ['500', '600', '700', '800'], variable: '--font-alexandria' });
const logo = Montserrat_Alternates({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-logo' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-mono' });

// Content comes from the live store (sync + dashboard), so pages render per request.
export const dynamic = 'force-dynamic';

export const generateMetadata = siteMetadata;

export const viewport: Viewport = { themeColor: '#0B0D12', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ seo }, base] = await Promise.all([read('settings'), siteBase()]);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seo.siteName,
    url: base,
    inLanguage: 'ar',
    potentialAction: { '@type': 'SearchAction', target: `${base}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
  };

  return (
    <html lang="ar" dir="rtl" className={`${plex.variable} ${alexandria.variable} ${logo.variable} ${mono.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
