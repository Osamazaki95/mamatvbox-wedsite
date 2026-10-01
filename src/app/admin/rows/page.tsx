'use client';

import { Reorder, motion } from 'framer-motion';
import { Eye, EyeOff, GripVertical, Plus, Radio, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from '@/components/motion';
import { Poster } from '@/components/title/Poster';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { titles } from '@/lib/mock/data';

const initialRows = [
  { id: 'hero', name: 'البانر البطولي الترويجي الرئيسي', tag: 'مثبت يدوياً', desc: 'تغطية سينمائية عريضة • Hero Spotlight Banner', items: [0] },
  { id: 'trending', name: '«الأكثر مشاهدة الليلة في مصر»', tag: 'خوارزمي ذكي', desc: 'معيار الفرز: أعلى معدل نقرات خلال آخر ٢٤ ساعة (Trending Clicks)', items: [10, 3, 5, 6, 2] },
  { id: 'expiring', name: '«هيتشال قريب (تراخيص تنتهي خلال ٧ أيام)»', tag: 'مؤقت حسب التراخيص', desc: 'الفرز: الأقرب تاريخياً لانتهاء حقوق البث عبر المنصات المحلية الشريكة', items: [6, 7] },
  { id: '4k', name: '«متاح بأعلى جودة 4K في باقتك الحالية»', tag: 'مخصص للمستخدم', desc: 'الفلتر: عرض الأفلام المتوفرة حصرياً في منصات المستخدم بجودة 4K UHD + Dolby Atmos', items: [3, 8, 9, 1] },
  { id: 'shahid', name: '«أحدث إضافات منصة شاهد VIP»', tag: 'شريك معتمد (Affiliate)', desc: 'رابط إحالة مباشر مزود بـ UTM Tracking للحسابات المصرية', items: [13, 4, 10] },
];

export default function HomeRowsPage() {
  const [rows, setRows] = useState(initialRows);
  const [hidden, setHidden] = useState<string[]>([]);
  const [published, setPublished] = useState(false);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <Reveal className="flex flex-wrap items-center justify-between gap-4 bg-card p-6">
          <div><Badge tone="gold">نظام الترتيب والجدولة الذكي</Badge><h1 className="mt-2 font-display text-2xl font-bold">إدارة وتنظيم صفوف الصفحة الرئيسية</h1><p className="text-xs text-muted">تحكم في ترتيب ظهور الأقسام السينمائية، خوارزميات الفرز، والتخصيص الجغرافي لجمهور مصر والشرق الأوسط.</p></div>
          <div className="flex gap-2"><Button pill={false} icon={<Plus className="h-4 w-4" />}>إضافة صف محتوى جديد</Button><Button pill={false} variant="dark" icon={<Eye className="h-4 w-4" />}>معاينة حية</Button><Button pill={false} variant="teal" onClick={() => setPublished(true)} icon={<Radio className="h-4 w-4" />}>{published ? 'تم النشر ✓' : 'نشر الترتيب الجديد'}</Button></div>
        </Reveal>
        <p className="text-xs text-muted">⠿ اسحب الصفوف لإعادة الترتيب التلقائي عبر المنصة • تم الحفظ تلقائياً: منذ دقيقتين</p>
        <Reorder.Group axis="y" values={rows} onReorder={setRows} className="space-y-4">
          {rows.map((r, i) => (
            <Reorder.Item key={r.id} value={r} whileDrag={{ scale: 1.02, boxShadow: '0 20px 50px -10px rgba(0,0,0,.8)' }} className={`cursor-grab bg-card p-5 active:cursor-grabbing ${hidden.includes(r.id) ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3"><GripVertical className="mt-1 h-5 w-5 text-dim" /><Badge tone="gold">#{i + 1}</Badge><div><b className="flex items-center gap-2">{r.name} <Badge tone="teal">{r.tag}</Badge></b><p className="mt-1 text-xs text-muted">{r.desc}</p></div></div>
                <div className="flex gap-2"><button onClick={() => setHidden((h) => (h.includes(r.id) ? h.filter((x) => x !== r.id) : [...h, r.id]))} className="grid h-9 w-9 place-items-center rounded-full bg-panel">{hidden.includes(r.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button className="grid h-9 w-9 place-items-center rounded-full bg-panel"><Settings2 className="h-4 w-4" /></button></div>
              </div>
              <div className="mt-4 flex gap-3 overflow-hidden">{r.items.map((idx) => <motion.div key={idx} whileHover={{ y: -4 }} className="w-28 shrink-0"><Poster title={titles[idx]} className="aspect-[2/3] rounded-md" /><p className="mt-1 truncate text-xs">{titles[idx].title}</p></motion.div>)}</div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      <aside className="space-y-4">
        <div className="bg-card p-6"><h3 className="font-display text-lg font-bold">قواعد النشر والجدولة</h3><div className="mt-4 space-y-2 bg-surface p-4 text-xs"><p className="flex justify-between"><span className="text-muted">التكرار:</span><b className="text-teal">كل يوم جمعة</b></p><p className="flex justify-between"><span className="text-muted">توقيت النشر:</span><b className="text-gold">06:00 مساءً (توقيت القاهرة)</b></p><p className="flex justify-between"><span className="text-muted">العمل القادم:</span><b>فيلم «الحريفة ٢»</b></p></div></div>
        <div className="bg-card p-6"><h3 className="font-display text-lg font-bold">اختبارات الترتيب A/B</h3><div className="mt-4 space-y-3 text-xs"><div className="border-r-2 border-teal bg-surface p-3"><b>النمط أ (الافتراضي ٥٠٪)</b> <span className="text-teal">CTR 14.8%</span></div><div className="border-r-2 border-gold bg-surface p-3"><b>النمط ب (التجريبي ٥٠٪)</b> <span className="text-gold">CTR 18.2% 🚀</span></div></div><Button variant="dark" pill={false} className="mt-4 w-full" size="sm">تطبيق النمط (ب) كترتيب نهائي رسمي</Button></div>
      </aside>
    </div>
  );
}
