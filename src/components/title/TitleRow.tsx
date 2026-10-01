'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import type { Title } from '@/lib/api/types';
import { Stagger, StaggerItem } from '../motion';
import { SectionHeader } from '../ui/primitives';
import { TitleCard } from './TitleCard';

export function TitleRow({ title, subtitle, eyebrow, titles, href, icon }: { title: ReactNode; subtitle?: string; eyebrow?: ReactNode; titles: Title[]; href?: string; icon?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-8">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        icon={icon}
        action={
          <div className="flex items-center gap-2">
            {href && <Link href={href} className="me-2 flex items-center gap-1 text-sm font-semibold text-teal">عرض الكل <ChevronLeft className="h-4 w-4" /></Link>}
            <button onClick={() => scroll(1)} className="grid h-9 w-9 place-items-center rounded-full bg-panel transition hover:bg-line" aria-label="السابق"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={() => scroll(-1)} className="grid h-9 w-9 place-items-center rounded-full bg-panel transition hover:bg-line" aria-label="التالي"><ChevronLeft className="h-4 w-4" /></button>
          </div>
        }
      />
      <div ref={ref} className="no-scrollbar -mx-5 overflow-x-auto px-5">
        <Stagger className="flex gap-4 pb-4">
          {titles.map((t) => (
            <StaggerItem key={t.id} className="w-[180px] shrink-0 sm:w-[210px]">
              <TitleCard title={t} cta={false} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
