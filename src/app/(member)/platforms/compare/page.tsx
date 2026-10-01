'use client';

import { motion } from 'framer-motion';
import { Check, CircleCheck, Lightbulb, Minus, Plus, RotateCcw, Save, Share2, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Bar, Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { meApi } from '@/lib/api';
import type { PlatformId } from '@/lib/api/types';
import { usePlatforms } from '@/lib/api/hooks';
import { cn } from '@/lib/utils';

const WATCHLIST_SIZE = 24;
const coverageOf: Record<PlatformId, number> = { shahid: 11, watchit: 9, osn: 8, netflix: 6, prime: 5, yango: 2, appletv: 3, starzplay: 3, youtube: 4 };

export default function ComparePage() {
  const platforms = usePlatforms();
  const [picked, setPicked] = useState<PlatformId[]>(['shahid', 'watchit', 'osn']);
  const [saving, setSaving] = useState(false);
  const sel = platforms.filter((p) => picked.includes(p.id));
  const covered = Math.min(WATCHLIST_SIZE, sel.reduce((s, p) => s + coverageOf[p.id], 0) - Math.max(0, sel.length - 1) * 2);
  const pct = Math.round((covered / WATCHLIST_SIZE) * 100);
  const cost = sel.reduce((s, p) => s + p.priceMonthly, 0);
  const toggle = (id: PlatformId) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p));

  const rows: { l: string; get: (p: (typeof platforms)[number]) => React.ReactNode }[] = [
    { l: 'باقة العرض المختارة والتكلفة', get: (p) => <b className="text-gold">{p.priceMonthly} ج.م</b> },
    { l: 'أقصى دقة بث ونظام الصوت', get: (p) => <><Badge tone="solidGold">{p.maxQuality}</Badge><p className="mt-1 text-xs text-muted">{p.audio}</p></> },
    { l: 'عدد الشاشات المتزامنة', get: (p) => `${p.screens} شاشات في نفس الوقت` },
    { l: 'إمكانية التنزيل بدون إنترنت', get: (p) => (p.offline ? <span className="flex items-center justify-center gap-1 text-teal"><CircleCheck className="h-4 w-4" /> متاح</span> : <Minus className="mx-auto h-4 w-4 text-dim" />) },
    { l: 'تغطية أعمال قائمتك مباشرة', get: (p) => <div><b className="font-display text-xl text-teal">{coverageOf[p.id]} عملاً</b><Bar value={(coverageOf[p.id] / WATCHLIST_SIZE) * 100} className="mt-2" /></div> },
    { l: 'فترة التجربة المجانية', get: (p) => (p.trialDays ? `${p.trialDays} أيام تجربة مجانية` : <span className="text-dim">غير متوفر حالياً</span>) },
  ];

  return (
    <div className="mx-auto max-w-[1300px] px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><Badge tone="teal" dot>محرك التحليل الذكي لكتالوجات القنوات</Badge><h1 className="mt-3 font-display text-4xl font-extrabold">أداة مقارنة المنصات وتغطية قائمة المشاهدة</h1><p className="mt-2 max-w-3xl text-sm text-muted">حدد المنصات التي تفكر بالاشتراك فيها وقارن فوراً نسبة تغطية قائمتك، التكلفة الإجمالية، وأعلى دقة عرض وجودة صوت متوفرة في منطقتك.</p></div>
        <div className="flex gap-2"><Button variant="dark" pill={false} onClick={() => setPicked([])} icon={<RotateCcw className="h-4 w-4" />}>إعادة ضبط الخيارات</Button><Button variant="teal" pill={false} icon={<SlidersHorizontal className="h-4 w-4" />}>تصفية حسب ميزانيتي</Button></div>
      </div>

      <div className="card mt-8 rounded-[2rem] p-6">
        <div className="flex justify-between text-sm"><b className="font-display text-lg">اختر باقة المنصات للمقارنة الفورية <span className="text-xs font-normal text-muted">({picked.length} / 3 منصات)</span></b></div>
        <div className="mt-4 flex flex-wrap gap-2">
          {platforms.map((p) => {
            const on = picked.includes(p.id);
            return (
              <motion.button key={p.id} whileTap={{ scale: 0.95 }} onClick={() => toggle(p.id)} className={cn('flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors', on ? 'border-teal bg-teal-soft text-teal' : 'border-line text-muted hover:text-ink')}>
                {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {p.name} <span className="text-[10px] font-normal">{on ? 'مفعّل' : 'غير مفعل'}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Reveal className="card rounded-[2rem] p-6"><p className="text-xs text-gold">مؤشر الجاهزية والرصد</p><b className="font-display text-lg">نسبة تغطية قائمتك</b><motion.p key={pct} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 font-display text-5xl font-extrabold text-teal">٪{pct}</motion.p><Bar value={pct} className="mt-4 h-2" color="bg-gradient-to-l from-teal to-gold" /><p className="mt-3 text-xs text-muted">{covered} من أصل {WATCHLIST_SIZE} عملاً</p></Reveal>
        <Reveal className="card rounded-[2rem] p-6" delay={0.05}><p className="text-xs text-gold">الميزانية الشهرية المقدرة</p><b className="font-display text-lg">التكلفة الشهرية المجمعة</b><motion.p key={cost} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4 font-display text-5xl font-extrabold">{cost} <span className="text-lg text-gold">ج.م / شهرياً</span></motion.p><p className="mt-3 text-xs text-muted">يشمل الضرائب الرسمية لكل جمهورية مصر العربية دون رسوم خفية.</p></Reveal>
        <Reveal className="card rounded-[2rem] p-6" delay={0.1}><p className="text-xs text-gold">الجودة السمعية والبصرية</p><b className="font-display text-lg">محتوى 4K UHD & HDR</b><p className="mt-4 font-display text-5xl font-extrabold">١٩ <span className="text-lg">عملاً</span></p><div className="mt-3 flex gap-1"><Badge tone="solidGold">4K Ultra HD</Badge><Badge tone="violet">Dolby Vision</Badge><Badge>Dolby Atmos</Badge></div></Reveal>
      </div>

      <Reveal className="card mt-10 overflow-x-auto rounded-[2rem]">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="bg-surface"><th className="p-5 text-right text-xs text-muted">المعيار والخاصية</th>{sel.map((p) => <th key={p.id} className="p-5 text-center"><b className="font-display text-lg">{p.name}</b><p className="text-[11px] font-normal text-muted">{p.tagline}</p></th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.l} className="border-t border-line/50"><td className="p-5 text-muted">{r.l}</td>{sel.map((p) => <td key={p.id} className="p-5 text-center">{r.get(p)}</td>)}</tr>)}</tbody>
        </table>
        {sel.length === 0 && <p className="p-10 text-center text-muted">اختر منصة واحدة على الأقل للمقارنة</p>}
      </Reveal>

      <Reveal className="card mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-6"><div className="flex items-center gap-3"><Lightbulb className="h-8 w-8 text-gold" /><div><p className="text-xs text-gold">نصيحة Mamatvbox الذكية للمشاهد</p><b className="font-display text-lg">استراتيجية التدوير الفصلي (Streaming Rotation)</b><p className="mt-1 text-xs text-muted">يمكنك تدوير اشتراكك كل ٣ أشهر لمشاهدة كافة الأعمال بدون دفع تكاليف المنصات كلها في وقت واحد.</p></div></div><Button variant="dark" pill={false}>تفعيل جدول التدوير الذكي</Button></Reveal>

      <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 rounded-full p-4 ps-6">
        <div><b className="font-display">تشكيلة الـ ٪{pct} جاهزة للحفظ</b><p className="text-xs text-muted">{sel.length} منصات مجمعة • إجمالي {cost} ج.م شهرياً</p></div>
        <div className="flex gap-2"><Button variant="dark" pill={false} icon={<Share2 className="h-4 w-4" />}>مشاركة نتيجة المقارنة</Button><Button pill={false} loading={saving} onClick={async () => { setSaving(true); await meApi.savePlatforms(picked); setSaving(false); }} icon={<Save className="h-4 w-4" />}>حفظ هذه التشكيلة وتحديث دليل باقتي</Button></div>
      </div>
    </div>
  );
}
