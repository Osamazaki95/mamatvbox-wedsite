'use client';

import { Bookmark, Timer } from 'lucide-react';
import { PageSkeleton, useLoad } from '@/components/Loader';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { TitleCard } from '@/components/title/TitleCard';
import { TitleRow } from '@/components/title/TitleRow';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { meApi, titlesApi } from '@/lib/api';


export default function WatchlistPage() {
  const d = useLoad(() => Promise.all([meApi.watchlist(), titlesApi.expiring()]));
  if (!d) return <PageSkeleton />;
  const [list, expiring] = d;
  const inPlan = list.filter((t) => t.inPlan).length;

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-5 py-10">
        <Reveal className="card flex flex-wrap items-center justify-between gap-6 p-7">
          <div><Badge tone="teal" dot>قائمة المشاهدة المتزامنة</Badge><h1 className="mt-3 flex items-center gap-3 font-display text-4xl font-extrabold"><Bookmark className="h-8 w-8 text-gold" /> قائمتي</h1><p className="mt-2 text-sm text-muted">{list.length} عملاً محفوظاً • {inPlan} منها متاح الآن ضمن باقاتك المشترك بها.</p></div>
          <div className="flex gap-2"><Button variant="ghost" href="/platforms/compare">حلل تغطية قائمتي</Button><Button href="/movies">أضف أعمالاً جديدة</Button></div>
        </Reveal>
        <Stagger className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {list.map((t) => <StaggerItem key={t.id}><TitleCard title={t} /></StaggerItem>)}
        </Stagger>
      </div>
      <TitleRow title={<>هيتشال قريب <Badge tone="danger">تراخيص تنتهي خلال ٧ أيام</Badge></>} icon={<Timer className="h-6 w-6" />} subtitle="أعمال من قائمتك ستُسحب قريباً — شاهدها قبل فوات الأوان." titles={expiring} />
    </>
  );
}
