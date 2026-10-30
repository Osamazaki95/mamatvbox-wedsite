'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Title } from '@/lib/api/types';
import { cn, toArabicDigits } from '@/lib/utils';
import { SectionHeader } from '../ui/primitives';
import { TitleCard } from './TitleCard';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  titles: Title[];
  /** "عرض الكل" link */
  href?: string;
  /** big rank numbers (Top 10) */
  ranked?: boolean;
  /** seconds between automatic moves (0 = off) */
  interval?: number;
  className?: string;
}

/**
 * Auto-playing carousel that runs in the reading direction — right to left in Arabic
 * (left to right when the site is switched to a Latin language).
 * Pauses while hovered / touched / focused, loops back to the start, and can be dragged or scrolled.
 */
export function TitleSlider({ title, subtitle, eyebrow, icon, titles, href, ranked, interval = 4, className }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /** +1 = forward (towards the end of the list), -1 = back. Works for RTL and LTR. */
  const move = useCallback((dir: 1 | -1, loop = false) => {
    const el = track.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    const card = el.querySelector<HTMLElement>('[data-slide]');
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    const pos = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    if (dir === 1 && loop && pos >= max - 4) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    el.scrollBy({ left: (rtl ? -1 : 1) * dir * step, behavior: 'smooth' });
  }, []);

  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const pos = Math.abs(el.scrollLeft);
    setAtStart(pos < 4);
    setAtEnd(pos >= el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    onScroll();
    return () => io.disconnect();
  }, [onScroll, titles.length]);

  useEffect(() => {
    if (!interval || paused || userPaused || !visible) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => move(1, true), interval * 1000);
    return () => clearInterval(id);
  }, [interval, paused, userPaused, visible, move]);

  if (!titles.length) return null;

  return (
    <section className={cn('mx-auto max-w-[1400px] px-5 py-8', className)}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        icon={icon}
        action={
          <div className="flex items-center gap-2">
            {href && <Link href={href} className="me-2 flex items-center gap-1 text-sm font-semibold text-teal">عرض الكل <ChevronLeft className="h-4 w-4 rtl-flip" /></Link>}
            {interval > 0 && (
              <button onClick={() => setUserPaused((v) => !v)} className="grid h-9 w-9 place-items-center rounded-full bg-panel transition hover:bg-line" aria-label={userPaused ? 'تشغيل العرض التلقائي' : 'إيقاف العرض التلقائي'}>
                {userPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            )}
            <button onClick={() => move(-1)} disabled={atStart} className="grid h-9 w-9 place-items-center rounded-full bg-panel transition hover:bg-line disabled:opacity-40" aria-label="السابق"><ChevronRight className="h-4 w-4 rtl-flip" /></button>
            <button onClick={() => move(1)} disabled={atEnd} className="grid h-9 w-9 place-items-center rounded-full bg-panel transition hover:bg-line disabled:opacity-40" aria-label="التالي"><ChevronLeft className="h-4 w-4 rtl-flip" /></button>
          </div>
        }
      />
      <div
        ref={track}
        onScroll={onScroll}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 2500)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-4"
      >
        {titles.map((t, i) => (
          <motion.div
            key={t.id}
            data-slide
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: Math.min(i, 6) * 0.05 }}
            className={cn('shrink-0 snap-start', ranked ? 'flex items-end' : 'w-[160px] sm:w-[190px] lg:w-[205px]')}
          >
            {ranked && (
              <span aria-hidden className="-me-2 min-w-[56px] select-none text-center font-display text-[104px] font-extrabold leading-[0.85] text-transparent sm:min-w-[70px] sm:text-[128px]" style={{ WebkitTextStroke: '2.5px #FBBF24' }}>
                {toArabicDigits(i + 1)}
              </span>
            )}
            <TitleCard title={t} cta={false} className={ranked ? 'relative z-10 w-[150px] shrink-0 sm:w-[175px]' : undefined} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
