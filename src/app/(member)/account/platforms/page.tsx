'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Calculator, CheckCircle2, History, Lock, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Bar, CountUp, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { meApi } from '@/lib/api';
import type { PlatformId } from '@/lib/api/types';
import { usePlatforms } from '@/lib/api/hooks';

export default function MyPlatformsPage() {
  const platforms = usePlatforms();
  const [mine, setMine] = useState<PlatformId[]>(['shahid', 'watchit', 'prime']);
  const [syncing, setSyncing] = useState(false);
  const active = platforms.filter((p) => mine.includes(p.id));
  const others = platforms.filter((p) => !mine.includes(p.id) && p.priceMonthly > 0);
  const total = active.reduce((s, p) => s + p.priceMonthly, 0);
  const coverage = Math.min(100, 40 + active.length * 12);

  const sync = async () => { setSyncing(true); await meApi.savePlatforms(mine); setSyncing(false); };
  const add = (id: PlatformId) => setMine((m) => [...m, id]);
  const remove = (id: PlatformId) => setMine((m) => m.filter((x) => x !== id));

  return (
    <>
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div><Badge tone="gold"><Calculator className="h-3 w-3" /> حاسبة الباقات الذكية • Smart Optimizer</Badge><h1 className="mt-3 font-display text-4xl font-extrabold">منصاتي وباقاتي المشترك بها</h1><p className="mt-2 text-sm text-muted">أدر اشتراكاتك النشطة، راقب فاتورتك الشهرية الموحدة، واكتشف كيف توفر نفقاتك دون أن يفوتك أي فيلم في قائمتك.</p></div>
        <div className="flex gap-2"><Button variant="dark" pill={false} icon={<History className="h-4 w-4" />}>سجل الفواتير السابقة</Button><Button variant="teal" pill={false} loading={syncing} onClick={sync} icon={<RefreshCw className="h-4 w-4" />}>مزامنة الاشتراكات تلقائياً</Button></div>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 md:grid-cols-4">
        <StaggerItem className="card p-6"><p className="text-xs text-muted">إجمالي الإنفاق الموحد</p><p className="mt-4 font-display text-3xl font-bold text-gold"><CountUp to={total} /> <span className="text-sm">ج.م / شهرياً</span></p><Bar value={60} color="bg-gold" className="mt-4" /></StaggerItem>
        <StaggerItem className="card p-6"><p className="text-xs text-muted">الاشتراكات المفعلة</p><p className="mt-4 font-display text-3xl font-bold">{active.length} منصات</p><p className="mt-2 text-xs text-teal">{active.map((a) => a.name).join(' • ')}</p></StaggerItem>
        <StaggerItem className="card p-6"><p className="text-xs text-muted">تغطية قائمتك الحالية</p><p className="mt-4 font-display text-3xl font-bold">٪<CountUp to={coverage} /></p><p className="mt-2 text-xs text-gold">تبقى ٦ أعمال تحتاج لتفعيل منصة إضافية</p></StaggerItem>
        <StaggerItem className="card p-6"><p className="text-xs text-muted">وفورات الباقات التراكمية</p><p className="mt-4 font-display text-3xl font-bold">٤٥٠ ج.م وفراً</p><p className="mt-2 text-xs text-teal">توفير سنوي يعادل ٥,٤٠٠ ج.م</p></StaggerItem>
      </Stagger>

      <Reveal className="card relative mt-8 grid gap-8 overflow-hidden rounded-[2.5rem] p-8 lg:grid-cols-[1fr_380px]">
        <div className="glow-gold pointer-events-none absolute inset-0" />
        <div className="relative">
          <Badge tone="gold"><Sparkles className="h-3 w-3" /> محرك التحسين السينمائي الذكي</Badge>
          <h2 className="mt-4 font-display text-3xl font-bold">وفّر <span className="text-gold">٤٩ ج.م</span> شهرياً وافتح تغطية ١٠٠٪ لقائمتك!</h2>
          <p className="mt-3 text-sm leading-7 text-muted">لاحظنا أن قائمتك تحتوي على ٦ أعمال مفقودة غير متوفرة في منصاتك الحالية (Dune: Part Two، House of the Dragon…). بدلاً من تجديد أمازون برايم هذا الشهر، يمكنك استبدالها بـ <b className="text-teal">+OSN</b> القياسية لتحصل فوراً على كافة المحتوى.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Button pill={false} onClick={() => { remove('prime'); add('osn'); }} icon={<Sparkles className="h-4 w-4" />}>تطبيق التركيبة المقترحة وضبط التنبيهات</Button><Button variant="dark" pill={false}>عرض التفاصيل الفنية للمقارنة</Button></div>
        </div>
        <div className="relative bg-bg/70 p-5">
          <div className="flex justify-between text-sm"><b>مقارنة التكلفة والتغطية</b><Badge tone="teal">المقترح المثالي</Badge></div>
          <div className="panel mt-4 flex justify-between p-4 text-xs"><div><p className="text-muted">باقتك الحالية</p><b className="text-base">{total} ج.م / شهرياً</b></div><div className="text-left"><p className="text-gold">تغطية ٧٥٪</p><p className="text-muted">١٨ فيلماً فقط</p></div></div>
          <ArrowDown className="mx-auto my-2 h-5 w-5 text-teal" />
          <div className="flex justify-between border border-teal/40 bg-teal-soft p-4 text-xs"><div><p className="text-teal">التركيبة المقترحة (التبديل لـ OSN+)</p><b className="text-base">{total - 29 + 99} ج.م / شهرياً</b></div><div className="text-left"><p className="text-teal">تغطية ١٠٠٪</p><p className="text-muted">٢٤ عملاً من ٢٤</p></div></div>
        </div>
      </Reveal>

      <h2 className="mb-5 mt-12 flex items-center gap-2 font-display text-2xl font-bold"><span className="h-2.5 w-2.5 rounded-full bg-teal" /> الاشتراكات المفعلة حالياً ({active.length})</h2>
      <motion.div layout className="grid gap-4 md:grid-cols-3">
        <AnimatePresence>
          {active.map((p) => (
            <motion.div layout key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="card p-6">
              <div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center bg-panel text-xl font-bold" style={{ color: p.color }}>{p.name[0]}</span><div><b className="font-display text-xl">{p.nameAr}</b><p className="text-xs text-muted">{p.name}</p></div></div><Badge tone="teal" dot>نشط</Badge></div>
              <div className="mt-5 flex justify-between text-sm"><span className="font-bold">{p.priceMonthly} ج.م / شهرياً</span><span className="text-xs text-muted">موعد التجديد القادم: ١٢ نوفمبر</span></div>
              <div className="mt-3 flex flex-wrap gap-1.5"><Badge tone="solidGold">{p.maxQuality}</Badge>{p.hdr && <Badge tone="violet">{p.hdr}</Badge>}{p.offline && <Badge tone="teal">تنزيل متاح</Badge>}<Badge>{p.screens} شاشات متزامنة</Badge></div>
              <div className="mt-5 grid grid-cols-[1fr_auto] gap-2"><Button variant="ghost" pill={false} size="sm">إدارة الاشتراك</Button><Button variant="dark" pill={false} size="sm" onClick={() => remove(p.id)}>تجميد مؤقت</Button></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <h2 className="mb-5 mt-12 font-display text-2xl font-bold">منصات أخرى مرخصة يمكنك إضافتها بنقرة واحدة</h2>
      <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {others.map((p) => (
          <motion.div layout key={p.id} className="card flex flex-col p-5">
            <div className="flex items-start justify-between"><div><b className="font-display text-lg">{p.name}</b><p className="text-xs text-muted">{p.tagline}</p></div><Badge tone="gold">+{Math.round(p.catalogSize / 1000)} أعمال</Badge></div>
            <p className="mt-4 font-bold">{p.priceMonthly} ج.م / شهرياً</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted"><Lock className="h-3 w-3 text-gold" /> تفتح فوراً أعمالاً من قائمتك</p>
            <Button size="sm" variant="ghost" pill={false} className="mt-4" onClick={() => add(p.id)} icon={<Plus className="h-4 w-4" />}>تفعيل الاشتراك</Button>
          </motion.div>
        ))}
      </motion.div>

      <Reveal className="card mt-10 flex flex-wrap items-center justify-between gap-4 p-6"><div className="flex items-center gap-3"><CheckCircle2 className="h-6 w-6 text-teal" /><div><b>ضمان المزامنة والفوترة القانونية الموحدة</b><p className="text-xs text-muted">جميع عمليات التحويل والتفعيل تتم مباشرة عبر بوابات الدفع الرسمية للمنصات المشاركة.</p></div></div><Button variant="dark" pill={false}>الأسئلة الشائعة حول الفواتير</Button></Reveal>
    </>
  );
}
