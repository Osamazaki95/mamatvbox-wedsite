'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Maximize, Pause, Play, Settings, Share2, Subtitles, Volume2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { meApi } from '@/lib/api';
import type { Title } from '@/lib/api/types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/primitives';
import { platformName } from './PlatformChip';
import { Poster } from './Poster';

export function TitleActions({ title }: { title: Title }) {
  const [saved, setSaved] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const toggleSave = async () => {
    const next = !saved;
    setSaved(next);
    await meApi.toggleWatchlist(title.id, next);
    flash(next ? 'تمت الإضافة إلى قائمة المشاهدة' : 'تمت الإزالة من القائمة');
  };
  const share = async () => {
    await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
    flash('تم نسخ رابط العمل');
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button icon={<Play className="h-4 w-4 fill-bg" />}>شاهد على {platformName(title.platforms[0])}</Button>
        {title.platforms[1] && <Button variant="ghost">شاهد على {platformName(title.platforms[1])}</Button>}
        <Button variant="ghost" onClick={() => setTrailer(true)} icon={<Play className="h-4 w-4" />}>الإعلان الرسمي (4K)</Button>
        <button onClick={toggleSave} className="grid h-11 w-11 place-items-center rounded-full bg-panel transition hover:bg-line" aria-label="قائمتي">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={String(saved)} initial={{ scale: 0.4, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.4 }}>
              {saved ? <BookmarkCheck className="h-5 w-5 text-gold" /> : <Bookmark className="h-5 w-5" />}
            </motion.span>
          </AnimatePresence>
        </button>
        <button onClick={share} className="grid h-11 w-11 place-items-center rounded-full bg-panel transition hover:bg-line" aria-label="مشاركة"><Share2 className="h-5 w-5" /></button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-teal px-5 py-3 text-sm font-bold text-bg shadow-teal">{toast}</motion.div>
        )}
      </AnimatePresence>

      <TrailerModal open={trailer} onClose={() => setTrailer(false)} title={title} />
    </>
  );
}

function TrailerModal({ open, onClose, title }: { open: boolean; onClose: () => void; title: Title }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) { setPlaying(false); setProgress(0); return; }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.code === 'Space') { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 0.6)), 100);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-bg/85 p-4 backdrop-blur-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} className="w-full max-w-4xl overflow-hidden rounded-[2rem] bg-card">
            <div className="flex items-start justify-between p-6">
              <div>
                <div className="flex gap-2"><Badge tone="solidGold">4K UHD</Badge><Badge>مدة العرض: ٢:٤٥ دقيقة</Badge></div>
                <h3 className="mt-2 font-display text-xl font-bold">الإعلان التشويقي الرسمي — {title.title}</h3>
              </div>
              <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-panel hover:bg-line"><X className="h-5 w-5" /></button>
            </div>
            <div className="relative mx-6 aspect-video overflow-hidden rounded-2xl">
              <Poster title={title} className="h-full w-full" compact />
              <motion.button onClick={() => setPlaying((p) => !p)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-bg shadow-gold">
                {playing ? <Pause className="h-8 w-8 fill-bg" /> : <Play className="h-8 w-8 fill-bg" />}
              </motion.button>
            </div>
            <div className="px-6 pt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gold transition-[width]" style={{ width: `${progress}%` }} /></div>
              <div className="mt-3 flex items-center justify-between text-muted">
                <div className="flex items-center gap-3"><Maximize className="h-5 w-5" /><Settings className="h-5 w-5" /><Subtitles className="h-5 w-5" /><Badge tone="gold">4K 60fps</Badge></div>
                <div className="flex items-center gap-3 font-mono text-xs"><Volume2 className="h-5 w-5" /> 02:45</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between bg-surface px-6 py-4 text-xs text-muted">
              <span className="flex gap-2"><kbd className="rounded bg-panel px-2 py-1">ESC للإغلاق</kbd><kbd className="rounded bg-panel px-2 py-1">Space للإيقاف</kbd></span>
              <span className="font-semibold text-teal">جاهز للمشاهدة؟ شاهد الفيلم الكامل الآن</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
