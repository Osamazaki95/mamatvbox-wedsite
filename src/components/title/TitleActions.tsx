'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, ExternalLink, Play, Share2, Youtube } from 'lucide-react';
import { useEffect, useState } from 'react';
import { auth, useUser } from '@/lib/auth';
import type { Platform, Title } from '@/lib/api/types';
import { platformById, usePlatformList, useSiteConfig } from '@/lib/site';
import { cn } from '@/lib/utils';
import { platformName } from './PlatformChip';
import { PlatformLogo } from './PlatformLogo';

/**
 * Where a "watch" button goes: the title's own page on that platform (set in the dashboard),
 * otherwise the platform's site, otherwise a web search for the title on that platform.
 */
export function watchUrl(title: Title, platformId: string, platform?: Platform): string {
  const direct = title.links?.[platformId];
  if (direct) return direct;
  const p = platform ?? platformById(platformId);
  if (p?.url) return p.url;
  const q = `${title.originalTitle || title.title} ${p?.name ?? platformName(platformId)}`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

export const trailerUrl = (title: Title) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title.originalTitle || title.title} ${title.year} trailer`)}`;

export function TitleActions({ title }: { title: Title }) {
  usePlatformList();
  const config = useSiteConfig();
  const accounts = !!config?.features.accounts;
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const user = useUser();
  useEffect(() => { if (user) setSaved(user.watchlist.includes(title.id)); }, [user, title.id]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const toggleSave = async () => {
    if (user === null) { window.location.href = `/login/?next=${encodeURIComponent(window.location.pathname)}`; return; }
    const next = !saved;
    setSaved(next);
    try {
      await auth.toggleWatchlist(title.id, next);
      flash(next ? 'تمت الإضافة إلى قائمة المشاهدة' : 'تمت الإزالة من القائمة');
    } catch {
      setSaved(!next);
      flash('تعذر الحفظ — جرّب تاني');
    }
  };
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: title.title, url }); return; } catch { /* cancelled → copy instead */ }
    }
    await navigator.clipboard?.writeText(url).catch(() => undefined);
    flash('تم نسخ رابط العمل');
  };

  const [first, second] = title.platforms;
  const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5';

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {first && (
          <a href={watchUrl(title, first)} target="_blank" rel="noopener noreferrer sponsored" className={cn(btn, 'bg-gold text-bg shadow-gold hover:bg-[#FCD34D] hover:text-bg')}>
            <Play className="h-4 w-4 fill-bg" /> شاهد على {platformName(first)}
          </a>
        )}
        {second && (
          <a href={watchUrl(title, second)} target="_blank" rel="noopener noreferrer sponsored" className={cn(btn, 'bg-panel text-ink hover:bg-line hover:text-ink')}>
            <PlatformLogo platform={platformById(second) ?? { name: platformName(second), color: '#9CA3AF' }} size="xs" /> شاهد على {platformName(second)}
          </a>
        )}
        {title.platforms.length > 2 && (
          <a href="#where-to-watch" className={cn(btn, 'bg-panel text-ink hover:bg-line hover:text-ink')}>+{title.platforms.length - 2} منصات أخرى</a>
        )}
        <a href={trailerUrl(title)} target="_blank" rel="noopener noreferrer" className={cn(btn, 'bg-panel text-ink hover:bg-line hover:text-ink')}>
          <Youtube className="h-4 w-4 text-danger" /> الإعلان الرسمي <ExternalLink className="h-3.5 w-3.5 text-dim" />
        </a>
        {accounts && (
          <button onClick={toggleSave} className="grid h-11 w-11 place-items-center rounded-full bg-panel transition hover:bg-line" aria-label="قائمتي">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={String(saved)} initial={{ scale: 0.4, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.4 }}>
                {saved ? <BookmarkCheck className="h-5 w-5 text-gold" /> : <Bookmark className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        )}
        <button onClick={share} className="grid h-11 w-11 place-items-center rounded-full bg-panel transition hover:bg-line" aria-label="مشاركة"><Share2 className="h-5 w-5" /></button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-teal px-5 py-3 text-sm font-bold text-bg shadow-teal">{toast}</motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
