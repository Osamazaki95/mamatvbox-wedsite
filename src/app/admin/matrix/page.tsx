'use client';

import { motion } from 'framer-motion';
import { Download, Filter, Globe, LayoutGrid, RefreshCw, Search, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { Counter, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { usePlatforms } from '@/lib/api/hooks';

export default function QualityMatrixPage() {
  const platforms = usePlatforms();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(false);
  const rows = platforms.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.nameAr.includes(q));

  return (
    <div className="space-y-6">
      <Reveal className="relative overflow-hidden bg-card p-8">
        <div className="glow-gold pointer-events-none absolute inset-0" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div><p className="flex gap-2 text-xs"><Badge tone="teal">التحكم التقني المركزي</Badge><span className="text-muted">● مزامنة نشطة V4.8</span></p><h1 className="mt-3 font-display text-4xl font-extrabold">مصفوفة الجودات والتراخيص التقنية</h1><p className="mt-2 max-w-3xl text-sm text-muted">نظرة بانورامية شاملة لمطابقة جودات البث (4K, HDR, Dolby Atmos) وتوافق التنزيل عبر كافة المنصات والباقات في الشرق الأوسط مع إمكانية التعديل والتجاوز الفوري.</p></div>
          <div className="flex flex-col gap-2"><Button variant="ghost" pill={false} icon={<RefreshCw className="h-4 w-4" />}>مزامنة تلقائية مع الـ APIs</Button><Button pill={false} icon={<Download className="h-4 w-4" />}>تصدير المصفوفة (CSV / Excel)</Button></div>
        </div>
        <Stagger className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[['المنصات المفهرسة', '8 منصات نشطة'], ['تغطية 4K UHD فائقة', '75% من الباقات'], ['دعم Dolby Atmos', '5 مسارات تدفقية'], ['زمن آخر فحص CDN', 'منذ ١٥ دقيقة']].map(([l, v], i) => (
            <StaggerItem key={l} className="bg-bg p-5"><p className="text-xs text-muted">{l}</p><b className={`font-display text-2xl ${i === 1 ? 'text-gold' : i === 2 ? 'text-teal' : ''}`}><Counter value={v} /></b></StaggerItem>
          ))}
        </Stagger>
      </Reveal>

      <div className="flex flex-wrap items-center gap-3 bg-card p-5">
        <button className="flex h-11 items-center gap-2 bg-panel px-4 text-sm"><Globe className="h-4 w-4" /> الدولة: جميع الدول</button>
        <button className="flex h-11 items-center gap-2 bg-panel px-4 text-sm"><LayoutGrid className="h-4 w-4" /> المنصة: كافة المنصات</button>
        <button className="flex h-11 items-center gap-2 bg-panel px-4 text-sm"><Filter className="h-4 w-4" /> الجودة الدنيا: الكل بدون فرز</button>
        <div className="ms-auto flex h-11 items-center gap-2 bg-panel px-4"><Search className="h-4 w-4 text-dim" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="تصفية سريعة في الجدول..." className="bg-transparent text-sm outline-none" /></div>
        <Button size="sm" pill={false} variant={editing ? 'teal' : 'dark'} onClick={() => setEditing((v) => !v)} icon={<Wand2 className="h-4 w-4" />}>{editing ? 'التعديل المباشر مفعّل' : 'تفعيل التعديل المباشر'}</Button>
      </div>

      <Reveal className="overflow-x-auto bg-card">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-surface text-xs text-muted"><tr>{['المنصة والشعار', 'الدولة / العملة', 'أقصى دقة صورة', 'معيار HDR', 'معيار الصوت', 'التنزيل أوفلاين', 'الشاشات', 'حالة الترخيص والـ API'].map((h) => <th key={h} className="p-4 text-right font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((p, i) => (
              <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-t border-line/40 hover:bg-panel/40">
                <td className="p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-panel font-bold" style={{ color: p.color }}>{p.name[0]}</span><div><b>{p.nameAr}</b><p className="text-xs text-muted">{p.name}</p></div></div></td>
                <td className="p-4"><span className="me-1 inline-block h-2 w-2 rounded-full bg-gold" /> مصر (EGP)</td>
                <td className="p-4" contentEditable={editing} suppressContentEditableWarning><Badge tone="solidGold">{p.maxQuality}</Badge></td>
                <td className="p-4"><Badge>{p.hdr ?? 'SDR'}</Badge></td>
                <td className="p-4" contentEditable={editing} suppressContentEditableWarning>{p.audio}</td>
                <td className="p-4">{p.offline ? <Badge tone="teal">متاح (1080p)</Badge> : <Badge>غير متاح</Badge>}</td>
                <td className="p-4">{p.screens} شاشات</td>
                <td className="p-4 font-bold text-teal">● موثق فوري</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between bg-surface p-4 text-xs text-muted"><span>جميع المعايير متزامنة مع CDN وشهادات Widevine L1 / PlayReady SL3000 • إظهار {rows.length} من {platforms.length} باقات نشطة</span><span>انقر نقراً مزدوجاً على أي خلية لتجاوز البيانات يدوياً • <kbd className="font-mono">Ctrl + S</kbd> للحفظ</span></div>
      </Reveal>
    </div>
  );
}
