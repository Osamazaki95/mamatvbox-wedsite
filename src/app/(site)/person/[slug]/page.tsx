import { BadgeCheck, Bell, Share2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { TitleCard } from '@/components/title/TitleCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { peopleApi } from '@/lib/api';

export default async function PersonPage({ params }: { params: { slug: string } }) {
  const person = await peopleApi.bySlug(params.slug);
  if (!person) notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10">
      <Reveal>
        <div className="card relative grid gap-8 overflow-hidden p-8 md:grid-cols-[180px_1fr]">
          <div className="glow-teal pointer-events-none absolute inset-0" />
          <div className="relative grid aspect-square place-items-center rounded-3xl bg-gradient-to-b from-teal/30 to-panel font-display text-6xl font-extrabold">
            {person.name[0]}
            <span className="absolute bottom-2 rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold text-bg">شخصية رئيسية</span>
          </div>
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl font-extrabold">{person.name}</h1>
              <Badge tone="teal"><BadgeCheck className="h-3 w-3" /> فنان معتمد</Badge>
            </div>
            <p className="mt-2 text-sm text-muted">{person.role}</p>
            <p className="mt-4 max-w-3xl leading-8 text-ink/85">{person.bio}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button>عرض الملف الفني والجوائز الكاملة</Button>
              <Button variant="ghost" icon={<Bell className="h-4 w-4" />}>تنبيه بالجديد</Button>
              <Button variant="ghost" icon={<Share2 className="h-4 w-4" />}>مشاركة</Button>
            </div>
          </div>
        </div>
      </Reveal>

      <h2 className="mb-6 mt-12 font-display text-2xl font-bold">الأعمال السينمائية والتلفزيونية <span className="text-sm text-muted">({person.works.length})</span></h2>
      <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {person.works.map((t) => <StaggerItem key={t.id}><TitleCard title={t} /></StaggerItem>)}
      </Stagger>
    </div>
  );
}
