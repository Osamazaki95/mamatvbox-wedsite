'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, Flame, Globe2, LogIn, Menu, Search, Tags, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { TitleType } from '@/lib/api/types';
import { useUser } from '@/lib/auth';
import { sections } from '@/lib/site-defaults';
import { useSiteConfig } from '@/lib/site';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { SearchPalette } from '../search/SearchPalette';
import { LanguageSwitcher } from '../i18n/Language';

type NavItem = { href: string; label: string; type?: TitleType };

const memberLinks: NavItem[] = [
  { href: '/watchlist', label: 'قائمتي' },
  { href: '/notifications', label: 'تنبيهاتي' },
  { href: '/account', label: 'حسابي' },
];

const catalogHref = (href: string, key: 'origin' | 'genre' | 'sort', value: string) => `${href}/?${key}=${encodeURIComponent(value)}`;

export function Navbar(_props: { signedIn?: boolean } = {}) {
  void _props;
  const pathname = usePathname();
  const config = useSiteConfig();
  const accounts = !!config?.features.accounts;
  const user = useUser();
  const signedIn = accounts && !!user;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menu, setMenu] = useState<TitleType | null>(null);
  const [mobileSection, setMobileSection] = useState<TitleType | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(true); }
      if (e.key === 'Escape') setMenu(null);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => { setOpen(false); setMenu(null); }, [pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  const items: NavItem[] = [
    { href: '/', label: 'الرئيسية' },
    ...sections.map((s) => ({ href: s.href, label: s.label, type: s.type })),
    { href: '/platforms', label: 'المنصات' },
    ...(config?.features.pricing && !signedIn ? [{ href: '/pricing', label: 'باقاتي' }] : []),
    ...(signedIn ? memberLinks : []),
  ];
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const openMenu = (t: TitleType) => { clearTimeout(closeTimer.current); setMenu(t); };
  const closeMenu = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setMenu(null), 160); };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn('sticky top-0 z-40 whitespace-nowrap transition-all duration-300', scrolled ? 'border-b border-line/60 bg-bg/80 backdrop-blur-xl' : 'bg-bg')}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:h-[72px] sm:px-5">
          <Logo />

          <nav className="hidden flex-1 items-center justify-center gap-0.5 xl:flex">
            {items.map((l) => {
              const active = isActive(l.href);
              const link = (
                <Link
                  href={l.href}
                  aria-haspopup={l.type ? 'true' : undefined}
                  aria-expanded={l.type ? menu === l.type : undefined}
                  onFocus={() => l.type && openMenu(l.type)}
                  className={cn('relative flex items-center gap-1 rounded-full px-2.5 py-2 text-[13px] hover:text-ink 2xl:px-3.5 2xl:text-sm', active ? 'font-bold text-teal' : 'text-ink/80')}
                >
                  {active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-panel" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  {l.label}
                  {l.type && <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', menu === l.type && 'rotate-180')} />}
                </Link>
              );
              if (!l.type) return <span key={l.href}>{link}</span>;
              return (
                <div key={l.href} className="relative" onMouseEnter={() => openMenu(l.type!)} onMouseLeave={closeMenu} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) closeMenu(); }}>
                  {link}
                  <AnimatePresence>
                    {menu === l.type && config && <SectionMenu type={l.type} groups={config.taxonomy[l.type]} onPick={() => setMenu(null)} />}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <button onClick={() => setPaletteOpen(true)} aria-label="بحث" className="hidden h-10 items-center gap-2 rounded-full bg-surface px-4 text-xs text-dim transition hover:bg-panel 2xl:flex 2xl:w-60">
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-right">ابحث عن فيلم، مسلسل، منصة...</span>
              <kbd className="rounded bg-panel px-1.5 py-0.5 font-mono text-[10px] text-muted">Ctrl + K</kbd>
            </button>
            <button onClick={() => setPaletteOpen(true)} aria-label="بحث" className="grid h-10 w-10 place-items-center rounded-full bg-surface transition hover:bg-panel 2xl:hidden">
              <Search className="h-[18px] w-[18px]" />
            </button>

            <LanguageSwitcher />

            {signedIn && (
              <>
                <Link href="/notifications" aria-label="التنبيهات" className="relative grid h-10 w-10 place-items-center rounded-full bg-surface hover:text-ink">
                  <Bell className="h-[18px] w-[18px]" />
                </Link>
                <Link href="/account" className="flex items-center gap-2 hover:text-ink">
                  <span className="hidden text-right leading-tight 2xl:block">
                    <span className="block max-w-[140px] truncate text-xs font-bold">{user?.name || user?.email}</span>
                    <span className="block text-[10px] font-semibold text-gold">حسابي</span>
                  </span>
                  <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-teal font-bold text-bg">{user?.avatar
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                    : (user?.name || user?.email || '?')[0].toUpperCase()}</span>
                </Link>
              </>
            )}
            {accounts && !signedIn && (
              <>
                <Link href="/login" className="hidden h-10 items-center rounded-full bg-surface px-4 text-xs font-semibold hover:text-teal md:flex">تسجيل الدخول</Link>
                <Link href="/signup" className="hidden h-10 items-center rounded-full bg-gold px-4 text-xs font-bold text-bg shadow-gold transition hover:-translate-y-0.5 hover:text-bg sm:flex">شاهد الآن</Link>
                <Link href="/login" aria-label="حسابي" className="grid h-10 w-10 place-items-center rounded-full bg-teal text-bg hover:text-bg"><User className="h-5 w-5" /></Link>
              </>
            )}

            <button className="grid h-10 w-10 place-items-center rounded-full bg-surface xl:hidden" onClick={() => setOpen((v) => !v)} aria-label="القائمة" aria-expanded={open}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={String(open)} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.nav
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[82%] max-w-sm flex-col bg-surface p-5 xl:hidden"
            >
              <div className="flex items-center justify-between"><Logo size="sm" /><button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-panel" aria-label="إغلاق"><X className="h-5 w-5" /></button></div>
              <div className="mt-6 grid gap-1 overflow-y-auto">
                {items.map((l, i) => (
                  <motion.div key={l.href} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 + i * 0.04 }}>
                    {l.type ? (
                      <>
                        <button onClick={() => setMobileSection((s) => (s === l.type ? null : l.type!))} aria-expanded={mobileSection === l.type} className={cn('flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-base', isActive(l.href) ? 'bg-panel font-bold text-teal' : 'text-ink/85')}>
                          {l.label}
                          <ChevronDown className={cn('h-4 w-4 transition-transform', mobileSection === l.type && 'rotate-180')} />
                        </button>
                        <AnimatePresence initial={false}>
                          {mobileSection === l.type && config && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <MobileSection type={l.type} groups={config.taxonomy[l.type]} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link href={l.href} className={cn('block rounded-xl px-4 py-3.5 text-base', isActive(l.href) ? 'bg-panel font-bold text-teal' : 'text-ink/85')}>{l.label}</Link>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="mt-auto grid gap-2 pt-6">
                <LanguageSwitcher full />
                {accounts && !signedIn && (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" className="flex h-12 items-center justify-center gap-2 rounded-full bg-panel text-sm font-semibold"><LogIn className="h-4 w-4" /> تسجيل الدخول</Link>
                    <Link href="/signup" className="flex h-12 items-center justify-center rounded-full bg-gold text-sm font-bold text-bg hover:text-bg">شاهد الآن</Link>
                  </div>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <SearchPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}

/** Desktop dropdown: all / most watched + by origin + by genre. */
function SectionMenu({ type, groups, onPick }: { type: TitleType; groups: { origins: string[]; genres: string[] }; onPick: () => void }) {
  const s = sections.find((x) => x.type === type)!;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.16 }}
      role="menu"
      className="absolute right-0 top-full z-50 pt-2"
    >
      <div className="w-[min(560px,90vw)] whitespace-normal rounded-2xl border border-line/70 bg-card p-5 shadow-card">
        <div className="flex flex-wrap gap-2 border-b border-line/50 pb-4">
          <Link href={s.href} onClick={onPick} className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-bg hover:text-bg">{s.all}</Link>
          <Link href={catalogHref(s.href, 'sort', 'popular')} onClick={onPick} className="flex items-center gap-1.5 rounded-full bg-panel px-4 py-2 text-xs font-semibold hover:bg-line"><Flame className="h-3.5 w-3.5 text-gold" /> الأكثر مشاهدة</Link>
          <Link href={catalogHref(s.href, 'sort', 'rating')} onClick={onPick} className="rounded-full bg-panel px-4 py-2 text-xs font-semibold hover:bg-line">الأعلى تقييماً</Link>
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_1.6fr]">
          {groups.origins.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-teal"><Globe2 className="h-3.5 w-3.5" /> حسب البلد</p>
              <ul className="grid gap-0.5">
                {groups.origins.map((o) => (
                  <li key={o}><Link href={catalogHref(s.href, 'origin', o)} onClick={onPick} role="menuitem" className="block rounded-lg px-2.5 py-1.5 text-sm text-ink/85 hover:bg-panel">{s.label} {o}</Link></li>
                ))}
              </ul>
            </div>
          )}
          {groups.genres.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-gold"><Tags className="h-3.5 w-3.5" /> حسب النوع</p>
              <ul className="grid grid-cols-2 gap-0.5">
                {groups.genres.map((g) => (
                  <li key={g}><Link href={catalogHref(s.href, 'genre', g)} onClick={onPick} role="menuitem" className="block truncate rounded-lg px-2.5 py-1.5 text-sm text-ink/85 hover:bg-panel">{g}</Link></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MobileSection({ type, groups }: { type: TitleType; groups: { origins: string[]; genres: string[] } }) {
  const s = sections.find((x) => x.type === type)!;
  const chip = 'rounded-full bg-panel px-3 py-1.5 text-xs text-ink/85';
  return (
    <div className="space-y-3 px-4 pb-4 pt-1">
      <div className="flex flex-wrap gap-1.5">
        <Link href={s.href} className="rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-bg hover:text-bg">{s.all}</Link>
        <Link href={catalogHref(s.href, 'sort', 'popular')} className={chip}>الأكثر مشاهدة</Link>
      </div>
      {groups.origins.length > 0 && <div className="flex flex-wrap gap-1.5">{groups.origins.map((o) => <Link key={o} href={catalogHref(s.href, 'origin', o)} className={chip}>{o}</Link>)}</div>}
      {groups.genres.length > 0 && <div className="flex flex-wrap gap-1.5">{groups.genres.map((g) => <Link key={g} href={catalogHref(s.href, 'genre', g)} className={chip}>{g}</Link>)}</div>}
    </div>
  );
}
