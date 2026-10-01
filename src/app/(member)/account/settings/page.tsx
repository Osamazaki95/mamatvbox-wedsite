'use client';

import { motion } from 'framer-motion';
import { Bell, Globe, Languages, MessageSquare, Mail, Monitor, Palette, Plane, RotateCcw, Save, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge, Toggle } from '@/components/ui/primitives';
import { meApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const defaults = {
  lang: 'ar', travel: false,
  expiry: true, quality: true, inPlan: true, priceDrops: true, weekly: false,
  push: true, email: true, sms: false, whatsapp: true,
  route: 'quality', dataSaver: false, autoplay: false,
};
type Prefs = typeof defaults;

function Row({ icon: Icon, title, desc, tag, children }: { icon: typeof Bell; title: string; desc: string; tag?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="panel flex items-center justify-between gap-4 p-5">
      <div className="flex items-start gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-teal" /><div><b className="flex flex-wrap items-center gap-2 text-sm">{title} {tag}</b><p className="mt-1 text-xs text-muted">{desc}</p></div></div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [p, setP] = useState<Prefs>(defaults);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setP((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    await meApi.savePreferences(p);
    setSaving(false);
    setSavedAt(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <div className="space-y-6 pb-28">
      <Reveal className="card rounded-[2.5rem] p-7">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Globe className="h-5 w-5 text-teal" /> اللغة والمنطقة الجغرافية</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="panel p-5"><p className="mb-3 flex items-center gap-2 text-sm font-bold"><Languages className="h-4 w-4" /> واجهة الموقع (Interface Language)</p>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-bg p-1">{[{ k: 'ar', l: 'العربية (الافتراضية)' }, { k: 'en', l: 'English' }].map((o) => (
              <button key={o.k} onClick={() => set('lang', o.k)} className={cn('relative rounded-md py-2 text-sm', p.lang === o.k ? 'font-bold text-bg' : 'text-muted')}>{p.lang === o.k && <motion.span layoutId="lang" className="absolute inset-0 rounded-md bg-teal" />}<span className="relative">{o.l}</span></button>
            ))}</div>
          </div>
          <div className="panel p-5"><p className="mb-3 text-sm font-bold">دولة التراخيص والعملة</p><select className="h-11 w-full rounded-lg bg-bg px-3 text-sm"><option>🇪🇬 مصر (جمهورية مصر العربية - EGP)</option><option>🇸🇦 السعودية (SAR)</option><option>🇦🇪 الإمارات (AED)</option></select></div>
        </div>
        <div className="mt-4"><Row icon={Plane} title="وضع التجوال والسفر الذكي (Travel Roaming Mode)" tag={<Badge tone="teal">موصى به للمسافرين</Badge>} desc="يرصد توفر الأفلام تلقائياً حسب موقعك الجغرافي عند السفر خارج مصر مع الحفاظ على عملة واشتراكات حسابك الأصلية."><Toggle checked={p.travel} onChange={(v) => set('travel', v)} /></Row></div>
      </Reveal>

      <Reveal className="card rounded-[2.5rem] p-7">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Bell className="h-5 w-5 text-gold" /> تخصيص التنبيهات السينمائية الذكية</h2>
        <div className="mt-5 space-y-3">
          <Row icon={Bell} title="تنبيهات انتهاء التراخيص وسحب الأعمال («هيتشال قريب»)" tag={<Badge tone="danger">عالي الأهمية</Badge>} desc="تنبيه استباقي قبل ١٤ يوماً وقبل ٤٨ ساعة من حذف أي فيلم أو مسلسل من كتالوج منصاتك."><Toggle checked={p.expiry} onChange={(v) => set('expiry', v)} /></Row>
          <Row icon={Monitor} title="توفر نسخ الأفلام بجودة (4K UHD & HDR)" tag={<Badge tone="solidGold">4K MASTER</Badge>} desc="إشعار فوري عند صدور العمل بجودة 4K أصلية أو دعم تقنيات Dolby Vision وAtmos."><Toggle checked={p.quality} onChange={(v) => set('quality', v)} /></Row>
          <Row icon={Bell} title="توفر العمل على منصاتي المشترك بها أولاً" tag={<Badge tone="teal">في باقتك</Badge>} desc="تنبيه حصري فور إتاحة الفيلم دون أي تكلفة إضافية على Shahid أو Watch It أو Netflix."><Toggle checked={p.inPlan} onChange={(v) => set('inPlan', v)} /></Row>
          <Row icon={Bell} title="تحديثات الأسعار وتخفيضات الباقات المدمجة" desc="رصد انخفاض أسعار الإيجار أو الشراء على Apple TV وYouTube Movies وكوبونات المنصات."><Toggle checked={p.priceDrops} onChange={(v) => set('priceDrops', v)} /></Row>
          <Row icon={Mail} title="النشرة السينمائية الأسبوعية لأهم الإطلاقات والترشيحات" tag={<Badge>معطل</Badge>} desc="ملخص مخصص يُرسل كل خميس بأبرز ٥ أعمال جديدة مطابقة لذوقك."><Toggle checked={p.weekly} onChange={(v) => set('weekly', v)} /></Row>
        </div>
      </Reveal>

      <Reveal className="card rounded-[2.5rem] p-7">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Smartphone className="h-5 w-5 text-teal" /> قنوات استلام التنبيهات والأجهزة</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Row icon={Monitor} title="إشعارات المتصفح الفورية" desc="macOS على Chrome (نشط)"><Toggle checked={p.push} onChange={(v) => set('push', v)} /></Row>
          <Row icon={Mail} title="رسائل البريد الإلكتروني" desc="ahmed.cinema@example.com"><Toggle checked={p.email} onChange={(v) => set('email', v)} /></Row>
          <Row icon={MessageSquare} title="إشعارات واتساب الفورية (WhatsApp)" tag={<Badge tone="teal">الخيار المفضل</Badge>} desc="+20 100 123 4567"><Toggle checked={p.whatsapp} onChange={(v) => set('whatsapp', v)} /></Row>
          <Row icon={MessageSquare} title="الرسائل النصية القصيرة (SMS)" desc="محجوزة لتنبيهات الطوارئ والتراخيص"><Toggle checked={p.sms} onChange={(v) => set('sms', v)} /></Row>
        </div>
      </Reveal>

      <Reveal className="card rounded-[2.5rem] p-7">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Monitor className="h-5 w-5 text-gold" /> معيار التوجيه والمشاهدة الافتراضي (Best-Option Rule)</h2>
        <div className="mt-5 space-y-3">
          {[{ k: 'quality', t: 'أعلى جودة مشاهدة سينمائية ممكنة (4K UHD & HDR)', d: 'تفضيل المنصة التي تبث الفيلم بأعلى دقة حتى لو تطلب الأمر فتح منصة أخرى غير في باقتك.' }, { k: 'mine', t: 'منصاتي وباقاتي المشترك بها أولاً (تجنب الدفع المنفصل)', d: 'توجيهك فوراً إلى التطبيقات التي تمتلكها بالفعل لتوفير رسوم الشراء الفردي.' }, { k: 'cheap', t: 'أقل تكلفة وأفضل سعر (عروض البث المجاني والمخفض)', d: 'البحث عن خيارات المشاهدة المجانية أو أقل سعر للتأجير عبر المتاجر.' }].map((o) => (
            <button key={o.k} onClick={() => set('route', o.k)} className={cn('flex w-full items-start gap-4 p-5 text-right transition-colors', p.route === o.k ? 'bg-teal-soft ring-1 ring-teal/40' : 'bg-panel')}>
              <span className={cn('mt-1 grid h-5 w-5 place-items-center rounded-full border-2', p.route === o.k ? 'border-teal' : 'border-muted')}>{p.route === o.k && <motion.span layoutId="br" className="h-2.5 w-2.5 rounded-full bg-teal" />}</span>
              <span><b className="text-sm">{o.t}</b><p className="mt-1 text-xs text-muted">{o.d}</p></span>
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal className="card rounded-[2.5rem] p-7">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Palette className="h-5 w-5 text-teal" /> المظهر والتحكم في تجربة التصفح</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Row icon={Palette} title="وضع تقليل استهلاك البيانات (Data Saver)" desc="تحميل بوسترات ومقاطع بجودة مضغوطة على شبكات الهاتف."><Toggle checked={p.dataSaver} onChange={(v) => set('dataSaver', v)} /></Row>
          <Row icon={Monitor} title="تشغيل المقاطع الترويجية تلقائياً (Autoplay Trailers)" desc="تشغيل التريلر بدون صوت عند الوقوف على البوستر لأكثر من ثانيتين."><Toggle checked={p.autoplay} onChange={(v) => set('autoplay', v)} /></Row>
        </div>
      </Reveal>

      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1300px] flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-sm">{savedAt ? <span className="text-teal">✓ تم حفظ كافة التحديثات في السحابة السينمائية — {savedAt}</span> : 'لديك تعديلات غير محفوظة'}</p>
          <div className="flex gap-2"><Button variant="dark" pill={false} onClick={() => setP(defaults)} icon={<RotateCcw className="h-4 w-4" />}>إعادة ضبط الافتراضيات</Button><Button pill={false} loading={saving} onClick={save} icon={<Save className="h-4 w-4" />}>حفظ التغييرات وتطبيقها</Button></div>
        </div>
      </motion.div>
    </div>
  );
}
