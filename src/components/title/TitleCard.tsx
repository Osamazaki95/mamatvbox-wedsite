'use client';

import { motion } from 'framer-motion';
import { Download, Play, Star } from 'lucide-react';
import Link from 'next/link';
import type { Title } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/primitives';
import { platformName } from './PlatformChip';
import { Poster } from './Poster';

export function TitleCard({ title, cta = true, className }: { title: Title; cta?: boolean; className?: string }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={cn('group overflow-hidden rounded-2xl bg-card shadow-card', className)}
    >
      <Link href={`/title/${title.slug}`} className="block hover:text-ink">
        <div className="relative aspect-[2/3] overflow-hidden">
          <div className="h-full w-full transition-transform duration-700 group-hover:scale-[1.06]">
            <Poster title={title} className="h-full w-full" />
          </div>
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
            <Badge tone="solidGold">{title.quality}</Badge>
            {title.inPlan
              ? <Badge tone="teal" className="bg-bg/70 backdrop-blur" dot>في باقتك • {platformName(title.platforms[0])}</Badge>
              : <Badge className="bg-bg/70 text-muted backdrop-blur">إيجار أو شراء</Badge>}
          </div>
          {title.download && (
            <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-teal-soft px-2 py-0.5 text-[10px] font-bold text-teal backdrop-blur"><Download className="h-3 w-3" /> تنزيل</span>
          )}
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-xs font-bold text-gold"><Star className="h-3.5 w-3.5 fill-gold" /> {title.rating}</span>
          <div className="absolute inset-0 grid place-items-center bg-bg/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <motion.span initial={{ scale: 0.6 }} whileHover={{ scale: 1.1 }} className="grid h-14 w-14 place-items-center rounded-full bg-gold text-bg shadow-gold">
              <Play className="h-6 w-6 fill-bg" />
            </motion.span>
          </div>
        </div>
        <div className="p-3.5">
          <h3 className="truncate font-display text-base font-bold">{title.title}</h3>
          <p className="mt-1 truncate text-xs text-muted">{title.year} • {title.genres.slice(0, 2).join('، ')}</p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-dim">
            <span>{title.runtime}</span>
            <span className="flex gap-1">
              {title.platforms.slice(0, 3).map((p) => (
                <span key={p} className="grid h-5 w-5 place-items-center rounded-full bg-panel text-[9px] font-bold text-ink">{platformName(p)[0]}</span>
              ))}
            </span>
          </div>
          {cta && (
            <span className="mt-3 flex h-8 items-center justify-center gap-1.5 rounded-full bg-gold text-xs font-bold text-bg transition group-hover:shadow-gold">
              <Play className="h-3 w-3 fill-bg" /> أين تشاهد؟
            </span>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

export function TitleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card">
      <div className="skeleton aspect-[2/3]" />
      <div className="space-y-2 p-3.5">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
