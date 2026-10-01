'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Film, RotateCcw, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PlatformId, Title } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { platformName } from '../title/PlatformChip';
import { TitleCard } from '../title/TitleCard';
import { Toggle } from '../ui/primitives';

interface Props {
  heading: string;
  subtitle: string;
  eyebrow: string;
  categories: string[];
  titles: Title[];
  countLabel: string;
}

const PAGE = 12;

export function CatalogView({ heading, subtitle, eyebrow, categories, titles, countLabel }: Props) {
  const [category, setCategory] = useState(categories[0]);
  const [platform, setPlatform] = useState<PlatformId | ''>('');
  const [inPlan, setInPlan] = useState(false);
  const [download, setDownload] = useState(false);
  const [sort, setSort] = useState<'new' | 'rating'>('new');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = titles;
    if (category !== categories[0]) r = r.filter((t) => t.genres.some((g) => category.includes(g) || g.includes(category.split(' ')[0])));
    if (platform) r = r.filter((t) => t.platforms.includes(platform));
    if (inPlan) r = r.filter((t) => t.inPlan);
    if (download) r = r.filter((t) => t.download);
    return [...r].sort((a, b) => (sort === 'new' ? b.year - a.year : b.rating - a.rating));
  }, [titles, category, categories, platform, inPlan, download, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const view = filtered.slice((page - 1) * PAGE, page * PAGE);
  const reset = () => { setCategory(categories[0]); setPlatform(''); setInPlan(false); setDownload(false); setPage(1); };
  const activeFilters = [inPlan && 'ضمن باقتي', download && 'متاح للتنزيل', platform && platformName(platform)].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card relative flex flex-wrap items-center justify-between gap-6 overflow-hidden p-7">
        <div className="glow-teal pointer-events-none absolute inset-0" />
        <div className="relative">
          <span className="eyebrow rounded-full bg-teal-soft px-3 py-1 text-teal"><span className="h-1.5 w-1.5 rounded-full bg-teal" /> {eyebrow}</span>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">{heading}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>
        </div>
        <div className="relative flex items-center gap-3 rounded-2xl bg-panel px-5 py-3">
          <Film className="h-6 w-6 text-gold" />
          <div><p className="text-[11px] text-muted">المتاح الآن في نطاقك الجغرافي</p><p className="font-display text-xl font-bold">{countLabel} 🇪🇬</p></div>
        </div>
      </motion.div>

      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button key={c} onClick={() => { setCategory(c); setPage(1); }} className={cn('relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition', category === c ? 'text-bg' : 'bg-panel text-ink/80 hover:bg-line')}>
            {category === c && <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-gold" />}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>

      <div className="card mt-6 grid gap-4 p-5 md:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select value={platform} onChange={(e) => { setPlatform(e.target.value as PlatformId | ''); setPage(1); }} className="h-11 rounded-xl bg-panel px-4 text-sm outline-none">
            <option value="">كل المنصات التسع</option>
            {(['shahid', 'watchit', 'netflix', 'osn', 'prime', 'yango', 'appletv', 'starzplay', 'youtube'] as PlatformId[]).map((p) => <option key={p} value={p}>{platformName(p)}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as 'new' | 'rating')} className="h-11 rounded-xl bg-panel px-4 text-sm outline-none">
            <option value="new">الأحدث إضافة للمكتبة</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
          <label className="flex h-11 items-center justify-between gap-3 rounded-xl bg-panel px-4 text-sm">ضمن باقاتي المشترك بها فقط <Toggle checked={inPlan} onChange={(v) => { setInPlan(v); setPage(1); }} tone="gold" /></label>
          <label className="flex h-11 items-center justify-between gap-3 rounded-xl bg-panel px-4 text-sm">متاح للتنزيل بدون نت <Toggle checked={download} onChange={(v) => { setDownload(v); setPage(1); }} /></label>
        </div>
        <button onClick={reset} className="grid h-11 w-11 place-items-center self-center rounded-full bg-panel transition hover:rotate-[-90deg] hover:bg-line" aria-label="إعادة ضبط"><RotateCcw className="h-4 w-4" /></button>
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-dim">فلاتر مطبقة:</span>
          {activeFilters.map((f) => <span key={f} className="flex items-center gap-1 rounded-full bg-teal-soft px-3 py-1 text-teal"><X className="h-3 w-3" /> {f}</span>)}
          <button onClick={reset} className="text-muted underline">مسح الكل</button>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {view.length ? (
          <motion.div layout className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {view.map((t, i) => (
              <motion.div key={t.id} layout initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ delay: i * 0.03 }}>
                <TitleCard title={t} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card mt-8 p-12 text-center">
            <p className="font-display text-xl font-bold">لا توجد أعمال مطابقة لهذه الفلاتر</p>
            <button onClick={reset} className="mt-3 text-sm text-teal">إعادة ضبط الفلاتر</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
        <span>عرض {(page - 1) * PAGE + 1} – {Math.min(page * PAGE, filtered.length)} من أصل {filtered.length} عملاً متاحاً</span>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="grid h-10 w-10 place-items-center rounded-full bg-panel disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setPage(n)} className={cn('grid h-10 w-10 place-items-center rounded-full font-bold transition', n === page ? 'bg-gold text-bg' : 'bg-panel hover:bg-line')}>{n}</button>
          ))}
          <button disabled={page === pages} onClick={() => setPage(page + 1)} className="grid h-10 w-10 place-items-center rounded-full bg-panel disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
