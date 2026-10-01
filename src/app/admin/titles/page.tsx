'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, History, Link2, PlusCircle, Save, Search, ShieldCheck, Star } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from '@/components/motion';
import { Poster } from '@/components/title/Poster';
import { Button } from '@/components/ui/Button';
import { Badge, Checkbox, Toggle } from '@/components/ui/primitives';
import { adminApi } from '@/lib/api';
import { titles } from '@/lib/mock/data';

const title = titles[0];

export default function TitleOverridesPage() {
  const [overrides, setOverrides] = useState({ featured: true, expiring: false, exclusive: true, netflixNotify: false });
  const [links, setLinks] = useState({ shahid: 'https://shahid.mbc.net/ar/movies/kira-el-gin/1289', watchit: 'https://watchit.com/movies/kira-wa-el-gin' });
  const [expiry, setExpiry] = useState('2025-10-31');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await adminApi.saveOverrides(title.id, { overrides, links, expiry });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center gap-3 bg-card p-5">
        <div className="flex h-12 items-center gap-2 rounded-full bg-panel px-4"><Search className="h-4 w-4 text-teal" /><b>{title.title} (2022)</b><Badge>معرف: #789410</Badge></div>
        <div className="flex h-12 items-center gap-3 rounded-full bg-panel px-5 text-sm"><CheckCircle2 className="h-4 w-4 text-teal" /> الحالة: <b className="text-teal">نشط في ٣ منصات</b> • الترخيص: <b className="text-gold">بمصر</b></div>
        <select className="h-12 rounded-full bg-panel px-5 text-sm"><option>🇪🇬 جمهورية مصر العربية</option></select>
        <Checkbox checked={false} onChange={() => undefined} label="تطبيق التجاوز على كافة دول المنطقة (MENA)" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Reveal className="bg-card p-7">
          <div className="flex items-start justify-between"><div><h1 className="font-display text-2xl font-bold">مصفوفة توفر المنصات والجودات</h1><p className="text-sm text-muted">التجاوزات المطبقة هنا تستبدل فوراً بيانات JustWatch وتتحكم بتجربة المستخدم على تطبيق الموبايل والشاشات الذكية.</p></div><Button variant="ghost" size="sm" icon={<PlusCircle className="h-4 w-4" />}>إضافة مزود جديد</Button></div>
          {(['shahid', 'watchit'] as const).map((pid) => (
            <div key={pid} className="mt-5 bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><b className="flex items-center gap-2">{pid === 'shahid' ? 'شاهد VIP (Shahid VIP)' : 'ووتش إت (Watch It)'} <Badge tone="teal">في باقتك</Badge></b><Badge tone="solidTeal">✓ متاح باشتراك - SVOD</Badge></div>
              <label className="mt-4 block text-xs text-muted">رابط المشاهدة المباشر (Deep Link Override)</label>
              <div className="mt-2 flex items-center gap-2 bg-bg px-4"><Link2 className="h-4 w-4 text-muted" /><input dir="ltr" value={links[pid]} onChange={(e) => setLinks({ ...links, [pid]: e.target.value })} className="h-12 flex-1 bg-transparent font-mono text-sm outline-none" /></div>
              <div className="mt-3 flex flex-wrap gap-2"><Badge tone="solidGold">{pid === 'shahid' ? '4K UHD' : '1080p FHD'}</Badge><Badge>{pid === 'shahid' ? 'Atmos' : 'Stereo 2.0'}</Badge><Badge tone="teal">تنزيل متاح</Badge></div>
            </div>
          ))}
          <div className="mt-5 flex items-center justify-between bg-surface p-5"><div><b>أو إس إن بلس (OSN+)</b> <Badge>غير مدرج</Badge><p className="text-xs text-danger">حالة التوفر: غير متاح حالياً للمشاهدين بمصر</p></div><Button size="sm" variant="ghost" className="text-gold">+ إضافة ترخيص استثنائي</Button></div>
          <div className="mt-5 flex items-center justify-between bg-surface p-5"><div><b>نتفليكس (Netflix)</b> <Badge tone="gold">قادم قريباً</Badge><p className="text-xs text-gold">يبدأ العرض الرسمي في: ١ نوفمبر ٢٠٢٥</p></div><div className="flex items-center gap-3 text-xs">تفعيل عد تنازلي وتنبيه «أعلمني عند التوفر»<Toggle checked={overrides.netflixNotify} onChange={(v) => setOverrides({ ...overrides, netflixNotify: v })} tone="gold" /></div></div>
        </Reveal>

        <div className="space-y-6">
          <Reveal className="bg-card p-6">
            <div className="flex gap-4"><Poster title={title} className="h-40 w-28 shrink-0 rounded-lg" /><div><Badge tone="gold">سينما عربية فاخرة</Badge><h2 className="mt-2 font-display text-2xl font-bold">{title.title}</h2><p className="text-sm text-muted">٢٠٢٢ • Kira & El Gin</p><p className="mt-2 flex items-center gap-1 text-sm"><Clock className="h-4 w-4 text-teal" /> {title.runtime}</p><p className="mt-1 flex items-center gap-1 font-bold text-gold"><Star className="h-4 w-4" /> 8.2 / 10 (IMDb)</p></div></div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="bg-surface p-3"><p className="text-muted">معرف JustWatch ID</p><b className="font-mono">jw_movie_901249</b></div><div className="bg-surface p-3"><p className="text-muted">التصنيف العمري (API)</p><b>+16 إثارة وعنف</b></div></div>
          </Reveal>
          <Reveal className="bg-card p-6">
            <h3 className="font-display text-lg font-bold text-gold">التجاوزات التحريرية الشاملة</h3>
            <div className="mt-4 space-y-3">
              {[{ k: 'featured' as const, i: Star, t: 'تمييز كعمل رئيسي (Featured Hero)', d: 'تثبيت البوستر العملاق في واجهة المشتركين' }, { k: 'expiring' as const, i: AlertTriangle, t: 'علامة "هيتشال قريب" اليدوية', d: 'إظهار شريط التحذير العاجل للمشاهدين' }, { k: 'exclusive' as const, i: ShieldCheck, t: 'شارة حصرية لـ Mamatvbox', d: 'أولوية الظهور في نتائج محركات التوصية' }].map((o) => (
                <motion.div key={o.k} layout className="flex items-center justify-between gap-3 bg-surface p-4"><div className="flex items-start gap-3"><o.i className="h-5 w-5 text-gold" /><div><b className="text-sm">{o.t}</b><p className="text-xs text-muted">{o.d}</p></div></div><Checkbox checked={overrides[o.k]} onChange={(v) => setOverrides({ ...overrides, [o.k]: v })} /></motion.div>
              ))}
            </div>
            <label className="mt-5 flex items-center justify-between text-xs text-muted">تاريخ انتهاء الترخيص الفعلي في مصر: <span className="text-gold">يدوي تحريري</span></label>
            <div className="mt-2 flex items-center gap-2 bg-bg px-4"><CalendarDays className="h-4 w-4 text-muted" /><input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="h-12 flex-1 bg-transparent font-mono outline-none [color-scheme:dark]" /></div>
            <p className="mt-2 text-xs text-muted">سيتم أرشفة روابط المشاهدة بعد هذا التاريخ تلقائياً</p>
          </Reveal>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:right-[320px]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <p className="flex items-center gap-2 text-sm"><History className="h-4 w-4 text-teal" /> سجل تدقيق التعديلات: <span className="text-gold">آخر تعديل بواسطة: م. أحمد السعيد (مشرف المحتوى)</span></p>
          <div className="flex gap-2"><Button variant="dark" pill={false}>استرجاع بيانات API الافتراضية</Button><Button pill={false} loading={saving} onClick={save} icon={<Save className="h-4 w-4" />}>{saved ? 'تم النشر ✓' : 'حفظ التعديلات ونشرها فوراً على الكتالوج'}</Button></div>
        </div>
      </div>
    </div>
  );
}
