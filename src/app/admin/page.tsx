'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, FileUp, Globe, LayoutDashboard, LayoutTemplate, Network, Plus, RefreshCw, Tags } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Counter, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { adminFetch } from '@/lib/admin';
import type { AdminKpi, Title } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const actions = [
  { href: '/admin/titles/?new=1', icon: Plus, t: 'إضافة فيلم أو مسلسل', d: 'اسم، بوستر، منصات، ورابط رسمي', c: 'text-gold' },
  { href: '/admin/import/', icon: FileUp, t: 'استيراد جماعي', d: 'آلاف الأعمال من رابط أو ملف', c: 'text-gold' },
  { href: '/admin/platforms/', icon: Network, t: 'إدارة المنصات', d: 'إضافة وتعديل وحذف المنصات', c: 'text-teal' },
  { href: '/admin/site/', icon: LayoutTemplate, t: 'الرئيسية والسوشيال', d: 'رمضان، أفضل ١٠، روابط الفوتر', c: 'text-gold' },
  { href: '/admin/taxonomy/', icon: Tags, t: 'التصنيفات', d: 'البلد والنوع لكل قسم', c: 'text-violet' },
  { href: '/admin/seo/', icon: Globe, t: 'SEO والكلمات المفتاحية', d: 'العنوان والوصف والكلمات', c: 'text-violet' },
  { href: '/admin/integrations/', icon: RefreshCw, t: 'المزامنة والدفع', d: 'TMDB و Paymob', c: 'text-teal' },
];
const typeLabel: Record<string, string> = { movie: 'فيلم', series: 'مسلسل', kids: 'كرتون', program: 'برنامج' };

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<AdminKpi[] | null>(null);
  const [recent, setRecent] = useState<Title[]>([]);
  const [spin, setSpin] = useState(false);

  const load = () => {
    setSpin(true);
    Promise.all([adminFetch<AdminKpi[]>('kpis'), adminFetch<Title[]>('titles')])
      .then(([k, t]) => { setKpis(k); setRecent(t.slice(0, 8)); })
      .finally(() => setSpin(false));
  };
  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-soft"><LayoutDashboard className="h-6 w-6 text-teal" /></span>
          <div><h1 className="font-display text-xl font-bold sm:text-2xl">نظرة عامة</h1><p className="text-sm text-muted">أرقام الموقع الحقيقية واختصارات سريعة</p></div>
        </div>
        <button onClick={load} className="grid h-11 w-11 place-items-center rounded-full bg-panel" aria-label="تحديث"><RefreshCw className={cn('h-4 w-4', spin && 'animate-spin')} /></button>
      </div>

      <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {(kpis ?? Array.from({ length: 6 }, () => null)).map((k, i) => (
          <StaggerItem key={i} className="bg-card p-5">
            {k ? (
              <>
                <p className="text-xs text-muted">{k.label}</p>
                <p className={cn('mt-3 font-display text-2xl font-extrabold sm:text-3xl', i === 0 || i === 5 ? 'text-gold' : '')}><Counter value={k.value} /></p>
                <p className="mt-2 text-[11px] text-teal">{k.delta}</p>
              </>
            ) : <div className="skeleton h-20" />}
          </StaggerItem>
        ))}
      </Stagger>

      <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((a) => (
          <StaggerItem key={a.href}>
            <Link href={a.href} className="group flex h-full items-center gap-4 bg-card p-5 transition hover:bg-panel hover:text-ink">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface"><a.icon className={cn('h-6 w-6', a.c)} /></span>
              <span className="min-w-0 flex-1"><b className="block">{a.t}</b><span className="text-xs text-muted">{a.d}</span></span>
              <ArrowLeft className="h-5 w-5 shrink-0 text-dim transition group-hover:-translate-x-1 group-hover:text-teal" />
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <section className="bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">آخر الأعمال المضافة</h2>
          <Link href="/admin/titles/" className="text-sm font-semibold text-teal">عرض الكل</Link>
        </div>
        {recent.length === 0 ? (
          <div className="mt-6 bg-surface p-8 text-center">
            <p className="text-muted">لسه مفيش أعمال على الموقع.</p>
            <Button href="/admin/titles/?new=1" className="mt-4" icon={<Plus className="h-4 w-4" />}>أضف أول عمل</Button>
          </div>
        ) : (
          <div className="mt-5 grid gap-2">
            {recent.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 bg-surface p-3">
                {t.poster
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={t.poster} alt="" className="h-14 w-10 shrink-0 rounded object-cover" />
                  : <span className="h-14 w-10 shrink-0 rounded bg-panel" />}
                <div className="min-w-0 flex-1"><b className="block truncate text-sm">{t.title}</b><span className="text-xs text-muted">{t.year} • {t.platforms.length} منصات</span></div>
                <Badge tone="gold">{typeLabel[t.type] ?? t.type}</Badge>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
