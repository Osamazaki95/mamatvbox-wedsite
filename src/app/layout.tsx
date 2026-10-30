import type { Metadata, Viewport } from 'next';
import { Alexandria, IBM_Plex_Sans_Arabic, JetBrains_Mono, Montserrat_Alternates } from 'next/font/google';
import { earlyLangScript } from '@/lib/i18n';
import { Translator } from '@/components/i18n/Language';
import './globals.css';

const plex = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-plex' });
const alexandria = Alexandria({ subsets: ['arabic', 'latin'], weight: ['500', '600', '700', '800'], variable: '--font-alexandria' });
const logo = Montserrat_Alternates({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-logo' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-mono' });

// Defaults only — on the server, seo.php replaces these with the live settings from the dashboard.
export const metadata: Metadata = {
  title: { default: 'Mamatvbox — دليل البث السينمائي الموحد', template: '%s | Mamatvbox' },
  description: 'اعرف فين تتفرج على أي فيلم أو مسلسل قانونياً وبأعلى جودة. قارن التوفر والأسعار عبر منصات البث الرقمية المعتمدة.',
};

export const viewport: Viewport = { themeColor: '#0B0D12', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${plex.variable} ${alexandria.variable} ${logo.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyLangScript }} />
      </head>
      <body>{children}<Translator /></body>
    </html>
  );
}
