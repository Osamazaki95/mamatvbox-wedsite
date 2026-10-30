'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BarChart3, Bell, Boxes, Cloud, ExternalLink, FileUp, Grid3x3, LayoutTemplate, Menu, Network, Globe, LogOut, Plug, Search, SlidersHorizontal, Tags, TrendingUp, User, Users, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogoMark } from '../layout/Logo';

const nav = [
  { href: '/admin', label: 'نظرة عامة والتحليلات', icon: BarChart3 },
  { href: '/admin/platforms', label: 'إدارة المنصات والأسعار', icon: Network },
  { href: '/admin/matrix', label: 'مصفوفة الجودات والتراخيص', icon: Grid3x3 },
  { href: '/admin/titles', label: 'الأفلام والمسلسلات', icon: Boxes },
  { href: '/admin/taxonomy', label: 'التصنيفات (البلد والنوع)', icon: Tags },
  { href: '/admin/site', label: 'الرئيسية والسوشيال ميديا', icon: LayoutTemplate },
  { href: '/admin/import', label: 'استيراد جماعي من رابط', icon: FileUp },
  { href: '/admin/users', label: 'المشتركون والعمليات', icon: Users },
  { href: '/admin/referrals', label: 'تقارير نقرات الإحالة', icon: TrendingUp },
  { href: '/admin/seo', label: 'SEO والكلمات المفتاحية', icon: Globe },
  { href: '/admin/integrations', label: 'المزامنة والدفع والتكاملات', icon: Plug },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const logout = async () => { await fetch('/api/admin-auth', { method: 'DELETE' }); window.location.href = '/admin-login'; };

  return (
    <div className="flex min-h-screen">
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.nav initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }} className="fixed inset-y-0 right-0 z-50 w-[82%] max-w-xs overflow-y-auto bg-surface py-5 lg:hidden">
              <div className="flex items-center justify-between px-5 pb-4"><span className="font-logo text-xl font-bold text-gold">Mamatvbox</span><button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-panel" aria-label="إغلاق"><X className="h-4 w-4" /></button></div>
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className={cn('flex items-center gap-3 px-6 py-3.5 text-sm', path.replace(/\/$/, '') === n.href ? 'bg-teal font-bold text-bg hover:text-bg' : 'text-ink/85')}><n.icon className="h-5 w-5" /> {n.label}</Link>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
      <aside className="sticky top-0 hidden h-screen w-[320px] shrink-0 flex-col bg-surface lg:flex">
        <div className="flex items-center justify-between p-6">
          <div><span className="font-logo text-2xl font-bold text-gold">Mamatvbox</span><p className="text-[11px] text-muted">بوابة الإدارة المركزية</p></div>
          <LogoMark />
        </div>
        <div className="mx-5 flex items-center justify-between bg-panel px-4 py-2.5 text-xs"><span className="flex items-center gap-2 text-teal"><span className="h-2 w-2 animate-pulse-dot rounded-full bg-teal" /> الخوادم متصلة ٪99.98</span><Cloud className="h-4 w-4 text-teal" /></div>
        <nav className="mt-6 flex-1 space-y-1">
          {nav.map((n) => {
            const active = path.replace(/\/$/, '') === n.href;
            return (
              <Link key={n.href} href={n.href} className={cn('relative flex items-center gap-3 px-8 py-3.5 text-sm', active ? 'font-bold text-bg hover:text-bg' : 'text-ink/85')}>
                {active && <motion.span layoutId="admin-nav" className="absolute inset-x-2 inset-y-0 -z-0 bg-teal" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <n.icon className="relative h-5 w-5" /><span className="relative">{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="m-5 flex items-center justify-between bg-panel p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-teal text-bg"><User className="h-5 w-5" /></span><div><b className="text-sm">الإدارة العليا</b><p className="text-[11px] text-gold">مشرف عام النظام</p></div></div><button onClick={logout} aria-label="تسجيل الخروج" title="تسجيل الخروج" className="text-muted hover:text-danger"><LogOut className="h-5 w-5" /></button></div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
          <button onClick={() => setOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface lg:hidden" aria-label="القائمة"><Menu className="h-5 w-5" /></button>
          <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-surface px-4 text-sm text-dim md:max-w-md"><Search className="h-4 w-4 shrink-0" /><input placeholder="بحث سريع في الأفلام، المنصات، أو المعرفات..." className="min-w-0 flex-1 bg-transparent outline-none" /></div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/" className="flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-3 text-xs font-bold text-bg hover:text-bg sm:px-4"><ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">معاينة الموقع</span></Link>
            <button className="hidden h-10 w-10 place-items-center rounded-full bg-surface sm:grid"><Bell className="h-4 w-4" /></button>
            <button className="hidden h-10 w-10 place-items-center rounded-full bg-surface md:grid"><SlidersHorizontal className="h-4 w-4" /></button>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-teal text-bg"><User className="h-5 w-5" /></span>
          </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
