'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Clapperboard, Search, Star, UserSquare, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { searchApi } from '@/lib/api';
import type { SearchResult } from '@/lib/api/types';
import { platformName } from '../title/PlatformChip';
import { personHref } from '@/lib/person';
import { Poster } from '../title/Poster';
import { Badge } from '../ui/primitives';

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  useEffect(() => {
    if (!q.trim()) { setData(null); return; }
    setLoading(true);
    const t = setTimeout(() => searchApi.query(q).then((r) => { setData(r); setLoading(false); }), 220);
    return () => clearTimeout(t);
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex justify-center bg-bg/80 px-4 pt-24 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="w-full max-w-3xl"
            initial={{ y: -24, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -16, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={submit} className="flex h-16 items-center gap-3 rounded-full border-2 border-teal/50 bg-card px-6 shadow-teal">
              <Search className="h-5 w-5 text-teal" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن فيلم، مسلسل، ممثل، أو منصة..." className="flex-1 bg-transparent text-lg outline-none placeholder:text-dim" />
              {q && <button type="button" onClick={() => setQ('')} className="flex items-center gap-1 rounded-full bg-panel px-3 py-1 text-xs text-muted"><X className="h-3 w-3" /> مسح</button>}
              <kbd className="hidden whitespace-nowrap rounded-full bg-teal-soft sm:inline px-3 py-1 text-[11px] font-bold text-teal">ESC للإغلاق</kbd>
            </form>

            <AnimatePresence mode="wait">
              {(data || loading) && (
                <motion.div key={q} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 max-h-[60vh] overflow-y-auto rounded-3xl bg-card p-4">
                  {loading && [0, 1, 2].map((i) => <div key={i} className="skeleton mb-2 h-20 rounded-xl" />)}
                  {data && !loading && (
                    <>
                      <div className="mb-3 flex items-center justify-between px-2">
                        <h3 className="flex items-center gap-2 font-display font-bold"><Clapperboard className="h-5 w-5 text-gold" /> الأعمال والعناوين</h3>
                        <span className="text-xs text-dim">{data.titles.length} اقتراحات مطابقة</span>
                      </div>
                      {data.titles.length === 0 && (
                        <p className="px-2 py-6 text-center text-sm text-muted">لا توجد نتائج مطابقة — <Link href={`/search?q=${q}`} onClick={onClose} className="text-teal">جرّب البحث المتقدم</Link></p>
                      )}
                      {data.titles.map((t, i) => (
                        <motion.div key={t.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                          <Link href={`/title/${t.slug}`} onClick={onClose} className="group mb-2 flex items-center gap-4 rounded-2xl bg-surface p-3 hover:bg-panel hover:text-ink">
                            <Poster title={t} className="h-20 w-14 shrink-0 rounded-lg" compact />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold">{t.title}</span>
                                <span className="text-sm text-muted">({t.year})</span>
                                <Badge tone="solidGold">{t.quality}</Badge>
                                {t.inPlan && <Badge tone="teal" dot>في باقتك</Badge>}
                              </div>
                              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                                {t.genres.join(' / ')} • <Star className="h-3.5 w-3.5 fill-gold text-gold" /> <b className="text-gold">{t.rating}</b> • {t.runtime}
                              </div>
                            </div>
                            <div className="hidden gap-1.5 sm:flex">
                              {t.platforms.map((p) => <span key={p} className="rounded-full bg-panel px-3 py-1 text-xs font-semibold">{platformName(p)}</span>)}
                            </div>
                            <ArrowLeft className="h-5 w-5 text-dim transition group-hover:-translate-x-1 group-hover:text-teal" />
                          </Link>
                        </motion.div>
                      ))}
                      {data.people.length > 0 && (
                        <>
                          <h3 className="mb-3 mt-5 flex items-center gap-2 px-2 font-display font-bold"><UserSquare className="h-5 w-5 text-teal" /> صناع السينما والأشخاص</h3>
                          {data.people.map((p) => (
                            <Link key={p.id} href={personHref(p.name)} onClick={onClose} className="mb-2 flex items-center gap-3 rounded-2xl bg-surface p-3 hover:bg-panel hover:text-ink">
                              <span className="grid h-12 w-12 place-items-center rounded-full bg-teal-soft font-bold text-teal">{p.name[0]}</span>
                              <span><b className="block">{p.name}</b><span className="text-xs text-muted">{p.role}</span></span>
                            </Link>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
