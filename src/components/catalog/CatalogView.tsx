'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Film, Globe2, RotateCcw, Tags, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import type { PlatformId, Title, TitleType } from '@/lib/api/types';
import { hasGenre, sectionOf } from '@/lib/site-defaults';
import { usePlatformList, useSiteConfig } from '@/lib/site';
import { cn, toArabicDigits } from '@/lib/utils';
import { TitleCard } from '../title/TitleCard';
import { Toggle } from '../ui/primitives';

interface Props {
  type: TitleType;
  heading: string;
  subtitle: string;
  eyebrow: string;
  titles: Title[];
  countLabel: string;
}

type Sort = 'new' | 'rating' | 'popular';
const PAGE = 18;
const ALL = 'الكل';

/** Catalog grid with filters. Filters live in the URL (?origin=&genre=&platform=&sort=) so navbar links open them directly. */
export function CatalogView(props: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1400px] px-5 py-10"><div className="skeleton h-40 rounded-3xl" /></div>}>
      <Catalog {...props} />
    </Suspense>
  );
}

function Catalog({ type, heading, subtitle, eyebrow, titles, countLabel }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const config = useSiteConfig();
  const platforms = usePlatformList();
  const section = sectionOf(type);
  const groups = config?.taxonomy[type] ?? { origins: [], genres: [] };

  const origin = params.get('origin') ?? '';
  const genre = params.get('genre') ?? '';
  const platform = (params.get('platform') ?? '') as PlatformId | '';
  const ramadan = params.get('ramadan') === '1';
  const sortParam = params.get('sort');
  const sort: Sort = sortParam === 'rating' || sortParam === 'popular' ? sortParam : 'new';
  const [inPlan, setInPlan] = useState(false);
  const [download, setDownload] = useState(false);
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [origin, genre, platform, ramadan, sort, inPlan, download]);

  /** Updates one filter in the URL without scrolling to the top. */
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  // Origins / genres offered = dashboard lists + any extra values the titles actually use.
  const originOptions = useMemo(() => {
    const extra = titles.map((t) => t.origin).filter((o): o is string => !!o && !groups.origins.includes(o));
    return [...groups.origins, ...new Set(extra)];
  }, [titles, groups.origins]);
  // Genres with at least one title (all of them while the section is empty), plus the one picked from the navbar.
  const genreOptions = useMemo(() => {
    const used = groups.genres.filter((g) => titles.some((t) => hasGenre(t.genres, g)));
    const list = used.length ? used : groups.genres;
    return genre && !list.includes(genre) ? [...list, genre] : list;
  }, [titles, groups.genres, genre]);

  const filtered = useMemo(() => {
    let r = titles;
    if (ramadan) r = r.filter((t) => t.ramadan);
    if (origin) r = r.filter((t) => t.origin === origin);
    if (genre) r = r.filter((t) => hasGenre(t.genres, genre));
    if (platform) r = r.filter((t) => t.platforms.includes(platform));
    if (inPlan) r = r.filter((t) => t.inPlan);
    if (download) r = r.filter((t) => t.download);
    return [...r].sort((a, b) => (
      sort === 'rating' ? b.rating - a.rating
        : sort === 'popular' ? (b.views ?? 0) - (a.views ?? 0) || (b.popularity ?? 0) - (a.popularity ?? 0) || b.rating - a.rating
          : b.year - a.year
    ));
  }, [titles, origin, genre, platform, ramadan, inPlan, download, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const view = filtered.slice((page - 1) * PAGE, page * PAGE);
  const reset = () => { setInPlan(false); setDownload(false); router.replace(pathname, { scroll: false }); };
  const platformLabel = platforms.find((p) => p.id === platform)?.nameAr || platform;
  const activeFilters = [
    origin && { k: 'origin', l: `${section.label} ${origin}` },
    genre && { k: 'genre', l: genre },
    platform && { k: 'platform', l: platformLabel },
    ramadan && { k: 'ramadan', l: 'رمضان' },
  ].filter(Boolean) as { k: string; l: string }[];
  const headingNow = ramadan ? `${section.plural} رمضان` : origin || genre ? `${section.label}${origin ? ` ${origin}` : ''}${genre ? ` — ${genre}` : ''}` : heading;

  const chip = (on: boolean) => cn('relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition', on ? 'text-bg' : 'bg-panel text-ink/80 hover:bg-line');

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card relative flex flex-wrap items-center justify-between gap-6 overflow-hidden p-7">
        <div className="glow-teal pointer-events-none absolute inset-0" />
        <div className="relative">
          <span className="eyebrow rounded-full bg-teal-soft px-3 py-1 text-teal"><span className="h-1.5 w-1.5 rounded-full bg-teal" /> {eyebrow}</span>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">{headingNow}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>
        </div>
        <div className="relative flex items-center gap-3 rounded-2xl bg-panel px-5 py-3">
          <Film className="h-6 w-6 text-gold" />
          <div><p className="text-[11px] text-muted">المتاح الآن</p><p className="font-display text-xl font-bold">{activeFilters.length ? `${toArabicDigits(filtered.length)} من ${countLabel}` : countLabel}</p></div>
        </div>
      </motion.div>

      {originOptions.length > 0 && (
        <div className="mt-8 flex items-center gap-3">
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-teal"><Globe2 className="h-4 w-4" /> البلد</span>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {[ALL, ...originOptions].map((o) => {
              const on = (o === ALL && !origin) || o === origin;
              return (
                <button key={o} onClick={() => setParam('origin', o === ALL ? '' : o)} className={chip(on)}>
                  {on && <motion.span layoutId="origin-pill" className="absolute inset-0 -z-10 rounded-full bg-teal" />}
                  <span className="relative">{o}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {genreOptions.length > 0 && (
        <div className="mt-3 flex items-center gap-3">
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-gold"><Tags className="h-4 w-4" /> النوع</span>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {[ALL, ...genreOptions].map((g) => {
              const on = (g === ALL && !genre) || g === genre;
              return (
                <button key={g} onClick={() => setParam('genre', g === ALL ? '' : g)} className={chip(on)}>
                  {on && <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-gold" />}
                  <span className="relative">{g}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="card mt-6 grid gap-4 p-5 md:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select value={platform} onChange={(e) => setParam('platform', e.target.value)} className="h-11 rounded-xl bg-panel px-4 text-sm outline-none" aria-label="المنصة">
            <option value="">كل المنصات</option>
            {platforms.map((p) => <option key={p.id} value={p.id}>{p.nameAr || p.name}</option>)}
          </select>
          <select value={sort} onChange={(e) => setParam('sort', e.target.value === 'new' ? '' : e.target.value)} className="h-11 rounded-xl bg-panel px-4 text-sm outline-none" aria-label="الترتيب">
            <option value="new">الأحدث</option>
            <option value="popular">الأكثر مشاهدة</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
          <label className="flex h-11 items-center justify-between gap-3 rounded-xl bg-panel px-4 text-sm">ضمن باقاتي المشترك بها فقط <Toggle checked={inPlan} onChange={setInPlan} tone="gold" /></label>
          <label className="flex h-11 items-center justify-between gap-3 rounded-xl bg-panel px-4 text-sm">متاح للتنزيل بدون نت <Toggle checked={download} onChange={setDownload} /></label>
        </div>
        <button onClick={reset} className="grid h-11 w-11 place-items-center self-center rounded-full bg-panel transition hover:rotate-[-90deg] hover:bg-line" aria-label="إعادة ضبط"><RotateCcw className="h-4 w-4" /></button>
      </div>

      {(activeFilters.length > 0 || inPlan || download) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-dim">فلاتر مطبقة:</span>
          {activeFilters.map((f) => <button key={f.k} onClick={() => setParam(f.k, '')} className="flex items-center gap-1 rounded-full bg-teal-soft px-3 py-1 text-teal"><X className="h-3 w-3" /> {f.l}</button>)}
          {inPlan && <button onClick={() => setInPlan(false)} className="flex items-center gap-1 rounded-full bg-teal-soft px-3 py-1 text-teal"><X className="h-3 w-3" /> ضمن باقتي</button>}
          {download && <button onClick={() => setDownload(false)} className="flex items-center gap-1 rounded-full bg-teal-soft px-3 py-1 text-teal"><X className="h-3 w-3" /> متاح للتنزيل</button>}
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
            <p className="font-display text-xl font-bold">{titles.length ? 'لا توجد أعمال مطابقة لهذه الفلاتر' : 'لا توجد أعمال في هذا القسم حالياً'}</p>
            {titles.length > 0 && <button onClick={reset} className="mt-3 text-sm text-teal">إعادة ضبط الفلاتر</button>}
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length > PAGE && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <span>عرض {(page - 1) * PAGE + 1} – {Math.min(page * PAGE, filtered.length)} من أصل {filtered.length} عملاً متاحاً</span>
          <div className="flex flex-wrap items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="grid h-10 w-10 place-items-center rounded-full bg-panel disabled:opacity-40" aria-label="السابق"><ChevronRight className="h-4 w-4 rtl-flip" /></button>
            {Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2).map((n, i, arr) => (
              <span key={n} className="flex items-center gap-2">
                {i > 0 && n - arr[i - 1] > 1 && <span className="text-dim">…</span>}
                <button onClick={() => setPage(n)} className={cn('grid h-10 w-10 place-items-center rounded-full font-bold transition', n === page ? 'bg-gold text-bg' : 'bg-panel hover:bg-line')}>{n}</button>
              </span>
            ))}
            <button disabled={page === pages} onClick={() => setPage(page + 1)} className="grid h-10 w-10 place-items-center rounded-full bg-panel disabled:opacity-40" aria-label="التالي"><ChevronLeft className="h-4 w-4 rtl-flip" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
