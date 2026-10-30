'use client';

import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { SocialLink } from '@/lib/api/types';
import { usePlatformList, useSiteConfig } from '@/lib/site';
import { Logo } from './Logo';
import { SocialGlyph, networkInfo } from './SocialIcon';
import { PlatformChip } from '../title/PlatformChip';

/** Light brand colours (X, TikTok, Snapchat…) get a dark glyph on hover. */
const isLight = (hex: string) => {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
};

function SocialButton({ s }: { s: SocialLink }) {
  const info = networkInfo(s.network);
  const external = !s.url.startsWith('mailto:');
  const style = { '--brand': info.color, '--brand-ink': isLight(info.color) ? '#0B0D12' : '#FFFFFF' } as CSSProperties;
  return (
    <a
      href={s.url}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer me' : undefined}
      aria-label={s.label || info.label}
      title={s.label || info.label}
      style={style}
      className="group relative grid h-11 w-11 place-items-center rounded-full border border-line/70 bg-surface text-ink/75 transition duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-[var(--brand)] hover:text-[var(--brand-ink)] hover:shadow-[0_10px_28px_-10px_var(--brand)]"
    >
      <SocialGlyph network={s.network} className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" />
    </a>
  );
}

export function Footer() {
  const config = useSiteConfig();
  const platforms = usePlatformList();
  const social = config?.social ?? [];
  const legal = [
    { href: '/legal#privacy', label: 'سياسة الخصوصية' },
    { href: '/legal', label: 'الشروط والأحكام' },
    { href: '/platforms', label: 'دليل المنصات' },
    ...(config?.features.accounts ? [{ href: '/notifications', label: 'تنبيهات التوفر' }] : []),
    { href: '/legal#ip', label: 'حقوق الملكية الفكرية' },
    { href: '/legal#contact', label: 'تواصل معنا' },
  ];

  return (
    <footer className="mt-24 pb-10">
      <div className="mx-auto max-w-[1400px] px-5">
        <div className="card flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-soft"><ShieldCheck className="h-6 w-6 text-teal" /></span>
            <div>
              <h3 className="font-display text-xl font-bold">منصة توجيه وبحث قانونية وموثوقة</h3>
              <p className="mt-1.5 text-sm text-muted">«لا يستضيف [Mamatvbox] أي ملفات وسائط أو محتوى فيديو؛ نحن محرك بحث وتوجيه سينمائي قانوني يساعدك في معرفة أين تشاهد وبأي جودة وأسعار الاشتراك.»</p>
            </div>
          </div>
          <div className="flex gap-2 text-xs font-semibold text-muted">
            <span className="rounded-full bg-panel px-3 py-1.5">TMDB Verified Partner</span>
            <span className="rounded-full bg-panel px-3 py-1.5">JustWatch API</span>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <Logo />
            <p className="mt-3 text-xs leading-6 text-muted">منصتك الشاملة لاستكشاف البث السينمائي ومقارنة توفر الأعمال السينمائية عبر كافة الاشتراكات العالمية والعربية بدقة سينمائية فاخرة.</p>
            {social.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold text-ink/85">تابعنا على السوشيال ميديا</p>
                <div className="flex flex-wrap gap-2.5">
                  {social.map((s) => <SocialButton key={s.id} s={s} />)}
                </div>
              </div>
            )}
          </div>
          {platforms.length > 0 && (
            <div>
              <p className="mb-3 text-xs text-dim">المنصات المرخصة المدعومة</p>
              <div className="flex max-w-3xl flex-wrap gap-2.5">
                {platforms.slice(0, 14).map((p) => <PlatformChip key={p.id} id={p.id} href={`/platforms/#${p.id}`} />)}
                {platforms.length > 14 && <Link href="/platforms" className="inline-flex items-center rounded-full border border-dashed border-line px-4 py-1.5 text-xs font-semibold text-muted">+{platforms.length - 14} منصة</Link>}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 border-t border-line/50 pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} لمنصة Mamatvbox دليل الترفيه السينمائي الرقمي.</p>
          <nav className="flex flex-wrap gap-5">
            {legal.map((l) => <Link key={l.label} href={l.href}>{l.label}</Link>)}
          </nav>
        </div>
      </div>
    </footer>
  );
}
