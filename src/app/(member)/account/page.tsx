'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, Camera, CheckCircle2, Film, Laptop, LogOut, Mail, Monitor, Pencil, Phone, RefreshCw, Share2, SlidersHorizontal, Smartphone, Tv } from 'lucide-react';
import { useState } from 'react';
import { CountUp, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge, Field, inputClass } from '@/components/ui/primitives';
import { meApi } from '@/lib/api';
import { currentUser } from '@/lib/mock/data';

const devices = [
  { i: Laptop, n: 'Chrome on macOS', m: 'نشط الآن • القاهرة، مصر', current: true },
  { i: Tv, n: 'LG webOS 4K Cinema', m: 'غرفة المعيشة • نشط قبل ٤ ساعات' },
  { i: Smartphone, n: 'iPhone 15 Pro Max', m: 'تطبيق الموبايل • نشط أمس' },
];

export default function ProfilePage() {
  const [name, setName] = useState(currentUser.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await meApi.updateProfile({ name });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Reveal>
        <div className="card relative overflow-hidden rounded-[2.5rem] p-8">
          <div className="glow-teal pointer-events-none absolute inset-0" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-teal to-gold p-1"><span className="grid h-full w-full place-items-center rounded-full bg-panel font-display text-3xl font-bold">أ</span></motion.div>
                <button className="absolute -bottom-1 -left-1 grid h-8 w-8 place-items-center rounded-full bg-gold text-bg"><Camera className="h-4 w-4" /></button>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2"><h1 className="font-display text-3xl font-bold">{currentUser.name}</h1><Badge tone="gold">عضوية VIP ذهبية (Cinema Member)</Badge></div>
                <p className="mt-1 text-xs text-muted">عضو منذ {currentUser.memberSince}</p>
                <p dir="ltr" className="mt-2 flex flex-wrap justify-end gap-3 text-sm text-muted"><span className="flex items-center gap-1">{currentUser.email} <Mail className="h-4 w-4" /></span><span className="flex items-center gap-1">{currentUser.phone} <Phone className="h-4 w-4" /></span></p>
              </div>
            </div>
            <div className="flex gap-3"><Button variant="ghost" icon={<Share2 className="h-4 w-4" />} pill={false}>مشاركة ملف التذوق</Button><Button pill={false} href="/account/subscription" icon={<BadgeCheck className="h-4 w-4" />}>تجديد باقة VIP</Button></div>
          </div>
          <Stagger className="relative mt-8 grid grid-cols-2 gap-4 bg-bg/40 p-5 md:grid-cols-4">
            {[{ v: 24, l: 'عملاً في قائمة المشاهدة' }, { v: 3, l: 'منصات • Shahid VIP, Watch It, Prime', c: 'text-gold' }, { v: 450, l: 'ج.م وفرتها بميزة «في باقتك»', c: 'text-teal' }, { v: 92, l: '٪ تفضيل عروض 4K UHD' }].map((k) => (
              <StaggerItem key={k.l}><CountUp to={k.v} className={`font-display text-3xl font-bold ${k.c ?? ''}`} /><p className="mt-1 text-xs text-muted">{k.l}</p></StaggerItem>
            ))}
          </Stagger>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <Reveal className="card rounded-[2.5rem] p-7">
            <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">البيانات الشخصية</h2><Badge tone="teal" dot>بيانات موثقة</Badge></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="الاسم المعروض في المراجعات"><div className="relative"><Pencil className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" /><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></div></Field>
              <Field label="رقم الهاتف لتنبيهات البث"><input dir="ltr" defaultValue={currentUser.phone} className={`${inputClass} text-right`} /></Field>
            </div>
            <div className="mt-4"><Field label="البريد الإلكتروني الأساسي" hint={<span className="text-gold">طلب تغيير البريد</span>}><div className="relative"><CheckCircle2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-teal" /><input dir="ltr" readOnly value={currentUser.email} className={`${inputClass} text-right`} /></div></Field></div>
            <Button pill={false} className="mt-6" loading={saving} onClick={save}>{saved ? 'تم الحفظ ✓' : 'حفظ التعديلات'}</Button>
          </Reveal>
          <Reveal className="card rounded-[2.5rem] p-7">
            <h2 className="font-display text-xl font-bold">الحسابات والربط السحابي (SSO)</h2>
            <div className="mt-5 space-y-3">
              {[{ n: 'Google Account', m: 'ahmed.cinema@gmail.com', a: 'فك الارتباط' }, { n: 'Apple ID', m: 'مربوط للمزامنة مع Apple TV 4K', a: 'إدارة' }, { n: 'أجهزة التلفزيون المنزلية', m: 'Apple TV 4K (صالون)، LG OLED 65 (الرئيسية)', a: 'إضافة شاشة' }].map((s) => (
                <div key={s.n} className="panel flex items-center justify-between p-4"><div><b className="text-sm">{s.n}</b> <Badge tone="teal">متصل</Badge><p className="mt-1 text-xs text-muted">{s.m}</p></div><Button size="sm" variant="dark">{s.a}</Button></div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="space-y-6">
          <Reveal className="card rounded-[2.5rem] p-7">
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-xl font-bold"><Film className="h-5 w-5 text-gold" /> بصمتي السينمائية</h2><span className="text-xs font-bold text-gold">Cinema DNA</span></div>
            <p className="mt-2 text-xs text-muted">تُحلل الخوارزمية اختياراتك لترشيح الكنوز غير المكتشفة داخل اشتراكاتك النشطة فقط.</p>
            <div className="mt-4 flex flex-wrap gap-2">{['إثارة وغموض', 'أكشن وحركة', 'ملحمي وتاريخي', 'خيال علمي'].map((g, i) => <Badge key={g} tone={i % 2 ? 'gold' : 'teal'} dot>{g}</Badge>)}</div>
            <div className="panel mt-4 flex items-center justify-between p-4 text-xs"><span>معيار البث الافتراضي المفضل</span><span className="flex gap-1"><Badge tone="solidGold">4K UHD</Badge><Badge tone="violet">Dolby Atmos & HDR</Badge></span></div>
            <div className="mt-4 grid grid-cols-2 gap-2"><Button size="sm" variant="dark" pill={false} icon={<SlidersHorizontal className="h-4 w-4" />}>تعديل تفضيلات البث</Button><Button size="sm" variant="dark" pill={false} className="text-teal" icon={<RefreshCw className="h-4 w-4" />}>مزامنة الأذواق</Button></div>
          </Reveal>
          <Reveal className="card rounded-[2.5rem] p-7">
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-xl font-bold"><Monitor className="h-5 w-5 text-teal" /> الأجهزة المتصلة</h2><span className="text-xs text-muted">٣ جلسات نشطة</span></div>
            <div className="mt-4 space-y-2">
              {devices.map((d) => (
                <div key={d.n} className="panel flex items-center gap-3 p-4"><d.i className="h-5 w-5 text-muted" /><div className="flex-1"><b className="text-sm">{d.n}</b> {d.current && <Badge tone="solidTeal">هذا الجهاز</Badge>}<p className="text-xs text-muted">{d.m}</p></div>{!d.current && <button className="text-muted hover:text-danger"><LogOut className="h-4 w-4" /></button>}</div>
              ))}
            </div>
            <Button size="sm" variant="dark" pill={false} className="mt-3 w-full" icon={<LogOut className="h-4 w-4" />}>تسجيل الخروج من كافة الأجهزة الأخرى</Button>
          </Reveal>
          <Reveal className="card rounded-[2.5rem] p-7">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-danger"><AlertTriangle className="h-5 w-5" /> منطقة التحكم الحساسة</h2>
            <p className="mt-2 text-xs text-muted">خيارات الإيقاف المؤقت أو حذف سجلات البحث والتفضيلات نهائياً من خوادم الكتالوج.</p>
            <div className="mt-4 grid grid-cols-2 gap-2"><Button size="sm" variant="dark" pill={false}>تجميد الحساب مؤقتاً</Button><Button size="sm" variant="danger" pill={false}>حذف الحساب نهائياً</Button></div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
