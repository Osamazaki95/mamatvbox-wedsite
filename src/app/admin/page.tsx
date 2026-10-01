'use client';

import { motion } from 'framer-motion';
import { Download, LayoutDashboard, RefreshCw, Search, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, Counter, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { adminApi } from '@/lib/api';
import type { AdminKpi, ReferralShare } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const ranges = ['اليوم', 'آخر ٧ أيام', 'آخر ٣٠ يوماً', 'مخصص'];
const topSearched = [
  ['كيرة والجن', '١٤,٢٠٠', '٪٩٩', 'شاهد VIP'],
  ['Oppenheimer 4K', '٩,٨٥٠', '٪٩٧', '+OSN'],
  ['موضوع عائلي ٣', '٨,٤٠٠', '٪٩٦', 'شاهد VIP'],
  ['الحشاشين', '٧,١٠٠', '٪٩٨', 'Watch It'],
  ['Dune: Part Two', '٦,٥٠٠', '٪٨٩', 'OSN+ / Apple TV'],
];
const gaps = [
  { t: '"الموسم ٦ مدبلج Peaky Blinders"', n: '١,٤٢٠ بحث', d: 'اقتراح: تفعيل تنبيه توفر + ربط بنسخة نتفليكس المترجمة', a: 'إعادة توجيه', tone: 'teal' },
  { t: '"Shogun مترجم مصري"', n: '٩٨٠ بحث', d: 'العمل متاح على OSN+/Disney+ - الاسم البديل غير مفهرس', a: 'إضافة مرادف', tone: 'gold' },
  { t: '"فيلم السرب نسخة 4K Atmos"', n: '٨٥٠ بحث', d: 'متاح بجودة 1080p على Watch It، مطلوب تحديث شارة 4K', a: 'إضافة ربط يدوي', tone: 'teal' },
];

export default function AdminDashboard() {
  const [range, setRange] = useState(2);
  const [kpis, setKpis] = useState<AdminKpi[]>([]);
  const [refs, setRefs] = useState<ReferralShare[]>([]);
  const [spin, setSpin] = useState(false);

  const load = () => { setSpin(true); Promise.all([adminApi.kpis(), adminApi.referrals()]).then(([k, r]) => { setKpis(k); setRefs(r); setSpin(false); }); };
  useEffect(load, []);

  return (
    <div className="space-y-6">
      <Reveal className="bg-card p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-full bg-teal-soft"><LayoutDashboard className="h-6 w-6 text-teal" /></span><div><h1 className="flex items-center gap-2 font-display text-2xl font-bold">لوحة المؤشرات والتحليلات الحية <Badge tone="teal" dot>بث حي مباشر</Badge></h1><p className="text-sm text-muted">مراقبة فورية لتدفقات الاشتراكات، الإيراد التكراري، وإحالات البث السينمائي عبر المنصات الشريكة</p></div></div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="grid h-11 w-11 place-items-center rounded-full bg-panel"><RefreshCw className={cn('h-4 w-4', spin && 'animate-spin')} /></button>
            <Button variant="ghost" icon={<Download className="h-4 w-4" />}>تصدير CSV</Button>
            <div className="no-scrollbar flex max-w-full overflow-x-auto rounded-full bg-bg p-1">{ranges.map((r, i) => <button key={r} onClick={() => setRange(i)} className={cn('relative rounded-full px-4 py-2 text-xs', range === i ? 'font-bold text-bg' : 'text-muted')}>{range === i && <motion.span layoutId="range" className="absolute inset-0 rounded-full bg-teal" />}<span className="relative">{r}</span></button>)}</div>
          </div>
        </div>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k, i) => (
          <StaggerItem key={k.label} className="bg-card p-5">
            <p className="text-xs text-muted">{k.label}</p>
            <p className={cn('mt-5 font-display text-2xl font-extrabold', i === 0 || i === 5 ? 'text-gold' : '')}><Counter value={k.value} /></p>
            <p className={cn('mt-3 text-[11px]', k.trend === 'down' || i < 5 ? 'text-teal' : 'text-gold')}>{k.delta}</p>
            <Bar value={50 + i * 8} className="mt-4" color={i % 2 ? 'bg-teal' : 'bg-gold'} />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Reveal className="bg-card p-7">
          <div className="flex justify-between"><div><h2 className="font-display text-xl font-bold">توزيع نقرات الإحالة والتحويلات حسب المنصة الشريكة</h2><p className="text-xs text-muted">معدلات توجيه المشاهدين إلى سيرفرات البث الخارجية (إجمالي ٩٢,٤٠٠ نقرة مسجلة)</p></div><Badge tone="teal" dot>API مباشر</Badge></div>
          <div className="mt-6 flex h-3 overflow-hidden rounded-full">{refs.map((r, i) => <motion.span key={r.platform} style={{ background: r.color }} initial={{ width: 0 }} animate={{ width: `${r.share}%` }} transition={{ delay: i * 0.08, duration: 0.8 }} />)}</div>
          <div className="mt-6 space-y-2">
            {refs.map((r) => (
              <div key={r.platform} className="grid grid-cols-[1fr_1fr_90px_50px] items-center gap-4 bg-surface p-4 text-sm">
                <b className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />{r.platform}</b>
                <Bar value={r.share * 2.5} color="bg-teal" />
                <span className="text-xs text-muted">{r.clicks.toLocaleString('ar-EG')} نقرة</span>
                <b className="text-teal">٪{r.share}</b>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal className="bg-card p-7" delay={0.1}>
          <h2 className="font-display text-xl font-bold">جودة تدفق الإحالات الحالية</h2>
          <p className="text-xs text-muted">نسبة توفر الروابط المباشرة بدون أخطاء 404 أو قيود جغرافية</p>
          <div className="relative mx-auto mt-6 h-52 w-52">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2A2E36" strokeWidth="3.5" />
              <motion.circle cx="18" cy="18" r="15.9" fill="none" stroke="#FBBF24" strokeWidth="3.5" strokeDasharray="100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 65 }} transition={{ duration: 1.2 }} />
              <motion.circle cx="18" cy="18" r="15.9" fill="none" stroke="#4FE3D0" strokeWidth="3.5" strokeDasharray="100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 38 }} transition={{ duration: 1.2, delay: 0.2 }} />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center"><div><b className="font-display text-3xl">٪٩٩.٨</b><p className="text-xs text-teal">روابط تعمل</p></div></div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-center"><div className="bg-surface p-4"><p className="text-xs text-muted">4K UHD / HDR ●</p><b className="font-display text-2xl">٪٦٢</b><p className="text-xs text-teal">أعلى دقة توجيه</p></div><div className="bg-surface p-4"><p className="text-xs text-muted">Full HD 1080p ●</p><b className="font-display text-2xl">٪٣٥</b><p className="text-xs text-gold">الأسرع تحميلاً</p></div></div>
        </Reveal>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Reveal className="bg-card p-7">
          <div className="flex justify-between"><h2 className="flex items-center gap-2 font-display text-xl font-bold"><Search className="h-5 w-5 text-teal" /> الأعمال الأكثر بحثاً واكتشافاً</h2><span className="text-xs text-muted">تحديث كل ٦٠ ثانية</span></div>
          <table className="mt-5 w-full text-sm"><thead className="text-xs text-muted"><tr><th className="p-3 text-right">العمل والكلمة المفتاحية</th><th>حجم البحث</th><th>معدل الإيجاد</th><th>منصة التوجيه الأولى</th></tr></thead>
            <tbody>{topSearched.map((r, i) => <tr key={r[0]} className="border-t border-line/40 text-center"><td className="p-3 text-right font-bold"><span className="me-2 inline-grid h-6 w-6 place-items-center rounded-full bg-panel text-xs text-gold">{i + 1}</span>{r[0]}</td><td className="font-mono text-muted">{r[1]}</td><td><Badge tone="teal">{r[2]}</Badge></td><td><Badge>{r[3]}</Badge></td></tr>)}</tbody>
          </table>
        </Reveal>
        <Reveal className="bg-card p-7" delay={0.1}>
          <div className="flex justify-between"><h2 className="font-display text-xl font-bold">عمليات بحث بدون نتائج (تدخل فوري)</h2><Badge tone="gold">٤ حالات تتطلب الإجراء</Badge></div>
          <div className="mt-5 space-y-3">
            {gaps.map((g) => <div key={g.t} className="flex items-center justify-between gap-4 bg-surface p-4"><div><b className="text-sm">{g.t}</b> <Badge>{g.n}</Badge><p className="mt-1 text-xs text-muted">{g.d}</p></div><Button size="sm" pill={false} variant={g.tone === 'gold' ? 'gold' : 'teal'}>{g.a}</Button></div>)}
          </div>
          <p className="mt-4 flex items-center gap-1 text-xs text-muted"><Zap className="h-4 w-4 text-gold" /> التدخل التلقائي بالـ AI مفعل</p>
        </Reveal>
      </div>
    </div>
  );
}
