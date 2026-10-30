'use client';

import { Clapperboard, Film, Search, Share2, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageSkeleton, useLoad, useUrlSlug } from '@/components/Loader';
import { Counter, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { TitleCard } from '@/components/title/TitleCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { peopleApi } from '@/lib/api';
import type { TitleType } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const tabs: { k: TitleType | 'all'; l: string }[] = [
  { k: 'all', l: 'الكل' }, { k: 'movie', l: 'أفلام' }, { k: 'series', l: 'مسلسلات' }, { k: 'kids', l: 'كرتون' }, { k: 'program', l: 'برامج' },
];

export default function PersonClient() {
  const slug = useUrlSlug('person');
  const [name, setName] = useState('');
  const [tab, setTab] = useState<TitleType | 'all'>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get('n');
    setName((n ?? slug).trim());
  }, [slug]);

  const person = useLoad(() => (name ? peopleApi.bySlug(name) : Promise.resolve(undefined)), [name]);

  if (!name || person === undefined) return <PageSkeleton />;
  if (!person) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <UserRound className="mx-auto h-12 w-12 text-gold" />
        <h1 className="mt-5 font-display text-3xl font-bold">مفيش أعمال متاحة لـ «{name}»</h1>
        <p className="mt-2 text-muted">جرّب تبحث بالاسم بطريقة تانية.</p>
        <Button href={`/search/?q=${encodeURIComponent(name)}`} className="mt-6" icon={<Search className="h-4 w-4" />}>بحث</Button>
      </div>
    );
  }

  const count = (k: TitleType) => person.works.filter((t) => t.type === k).length;
  const view = person.works.filter((t) => tab === 'all' || t.type === tab);
  const years = person.works.map((t) => t.year).filter(Boolean);
  const share = async () => {
    await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10">
      <Reveal>
        <div className="card relative grid gap-6 overflow-hidden p-6 sm:p-8 md:grid-cols-[160px_1fr]">
          <div className="glow-teal pointer-events-none absolute inset-0" />
          <div className="relative mx-auto grid aspect-square w-32 place-items-center rounded-3xl bg-gradient-to-b from-teal/30 to-panel font-display text-5xl font-extrabold md:w-full">
            {person.name[0]}
          </div>
          <div className="relative">
            <Badge tone="teal">{person.role}</Badge>
            <h1 translate="no" className="notranslate mt-3 font-display text-4xl font-extrabold">{person.name}</h1>
            <div className="mt-5 grid max-w-xl grid-cols-3 gap-3">
              <div className="panel p-3"><p className="text-[11px] text-muted">إجمالي الأعمال</p><Counter value={person.works.length} className="font-display text-2xl font-bold text-gold" /></div>
              <div className="panel p-3"><p className="text-[11px] text-muted">أفلام</p><Counter value={count('movie')} className="font-display text-2xl font-bold" /></div>
              <div className="panel p-3"><p className="text-[11px] text-muted">مسلسلات</p><Counter value={count('series')} className="font-display text-2xl font-bold" /></div>
            </div>
            {years.length > 0 && <p className="mt-4 text-sm text-muted">نشاط من {Math.min(...years)} إلى {Math.max(...years)}</p>}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="ghost" onClick={share} icon={<Share2 className="h-4 w-4" />}>{copied ? 'تم نسخ الرابط' : 'مشاركة'}</Button>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mb-6 mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold"><Clapperboard className="h-6 w-6 text-gold" /> كل الأعمال</h2>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {tabs.filter((t) => t.k === 'all' || count(t.k as TitleType) > 0).map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} className={cn('shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition', tab === t.k ? 'bg-gold text-bg' : 'bg-panel text-muted hover:text-ink')}>
              {t.l} <span className="opacity-70">({t.k === 'all' ? person.works.length : count(t.k as TitleType)})</span>
            </button>
          ))}
        </div>
      </div>
      {view.length ? (
        <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {view.map((t) => <StaggerItem key={t.id}><TitleCard title={t} /></StaggerItem>)}
        </Stagger>
      ) : <div className="card p-10 text-center text-muted"><Film className="mx-auto mb-3 h-8 w-8" />مفيش أعمال في القسم ده</div>}
    </div>
  );
}
