'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, LogIn, Menu, Search, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { SearchPalette } from '../search/SearchPalette';

const links = [
  { href: '/', label: 'الرئيسية' },
  { href: '/movies', label: 'أفلام' },
  { href: '/series', label: 'مسلسلات' },
  { href: '/programs', label: 'برامج' },
  { href: '/kids', label: 'كرتون' },
  { href: '/platforms', label: 'المنصات' },
  { href: '/pricing', label: 'باقاتي' },
];

const memberLinks = [
  { href: '/watchlist', label: 'قائمتي' },
  { href: '/notifications', label: 'تنبيهاتي' },
  { href: '/account', label: 'حسابي' },
];

export function Navbar({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(true); }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  const items = signedIn ? [...links.slice(0, 6), ...memberLinks] : links;
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

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
            {items.map((l) => (
              <Link key={l.href} href={l.href} className={cn('relative rounded-full px-2.5 py-2 text-[13px] hover:text-ink 2xl:px-3.5 2xl:text-sm', isActive(l.href) ? 'font-bold text-teal' : 'text-ink/80')}>
                {isActive(l.href) && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-panel" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                {l.label}
              </Link>
            ))}
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

            <button className="hidden h-10 items-center gap-2 rounded-full bg-surface px-3 text-xs lg:flex">
              <span>🇪🇬</span> مصر <ChevronDown className="h-3.5 w-3.5 text-muted" />
            </button>

            {signedIn ? (
              <>
                <Link href="/notifications" aria-label="التنبيهات" className="relative grid h-10 w-10 place-items-center rounded-full bg-surface hover:text-ink">
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-bold text-bg">٣</span>
                </Link>
                <Link href="/account" className="flex items-center gap-2 hover:text-ink">
                  <span className="hidden text-right leading-tight 2xl:block">
                    <span className="block text-xs font-bold">أحمد السعيد</span>
                    <span className="block text-[10px] font-semibold text-gold">عضوية VIP ذهبية</span>
                  </span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-teal text-bg"><User className="h-5 w-5" /></span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden h-10 items-center rounded-full bg-surface px-4 text-xs font-semibold hover:text-teal md:flex">تسجيل الدخول</Link>
                <Link href="/signup" className="hidden h-10 items-center rounded-full bg-gold px-4 text-xs font-bold text-bg shadow-gold transition hover:-translate-y-0.5 hover:text-bg sm:flex">شاهد الآن</Link>
                <Link href="/account" aria-label="حسابي" className="grid h-10 w-10 place-items-center rounded-full bg-teal text-bg hover:text-bg"><User className="h-5 w-5" /></Link>
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
                    <Link href={l.href} className={cn('block rounded-xl px-4 py-3.5 text-base', isActive(l.href) ? 'bg-panel font-bold text-teal' : 'text-ink/85')}>{l.label}</Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-auto grid gap-2 pt-6">
                <button className="flex h-12 items-center justify-center gap-2 rounded-full bg-panel text-sm">🇪🇬 مصر (EGP) <ChevronDown className="h-4 w-4" /></button>
                {!signedIn && (
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
