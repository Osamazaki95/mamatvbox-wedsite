'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Banknote, CheckCircle2, Copy, Grid3x3, Headset, MessageSquare, Phone, Printer, Receipt, Send, Smartphone, Store, Timer } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge, inputClass } from '@/components/ui/primitives';
import { toArabicDigits } from '@/lib/utils';

function FawryInner() {
  const code = useSearchParams().get('code') ?? '945812730';
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const groups = code.match(/.{1,3}/g) ?? [];

  const copy = async () => {
    await navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="card flex items-center justify-between rounded-[2rem] p-5">
        <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-lg bg-gold-soft"><Banknote className="h-6 w-6 text-gold" /></span><div><b className="font-display text-xl text-gold">FAWRY فوري</b><p className="text-xs text-muted">المدفوعات الإلكترونية المعتمدة</p></div></div>
        <Badge tone="gold" dot>في انتظار السداد (طلب قيد التنفيذ)</Badge>
      </div>

      <div className="mt-8 text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal-soft"><CheckCircle2 className="h-7 w-7 text-teal" /></motion.span>
        <h1 className="mt-4 font-display text-3xl font-bold">تم إنشاء كود السداد عبر فوري بنجاح!</h1>
        <p className="mt-2 text-sm text-muted">تفضل بالدفع لدى أي منفذ فوري أو عبر تطبيق <b className="text-teal">MyFawry</b> قبل انتهاء صلاحية الكود لتفعيل اشتراكك وتجربتك المجانية فوراً وبشكل تلقائي.</p>
      </div>

      <div className="card relative mt-8 overflow-hidden rounded-[2.5rem] p-6">
        <div className="glow-gold pointer-events-none absolute inset-0" />
        <div className="relative flex flex-wrap items-center justify-between gap-2 text-xs"><span className="flex items-center gap-1 font-bold"><Grid3x3 className="h-4 w-4 text-gold" /> رقم مرجع فوري (FAWRY REFERENCE CODE)</span><Badge tone="gold"><Timer className="h-3 w-3" /> صالح لمدة: ٤٧ ساعة و ٥٢ دقيقة</Badge></div>
        <div className="relative mt-5 flex flex-wrap items-center justify-between gap-6 bg-bg p-7">
          <div>
            <div className="flex gap-6 font-display text-5xl font-extrabold tracking-[0.2em] text-gold">
              {groups.map((g, i) => <motion.span key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15 }}>{toArabicDigits(g)}</motion.span>)}
            </div>
            <p dir="ltr" className="mt-2 text-right font-mono text-sm text-muted">{groups.join(' ')}</p>
          </div>
          <Button pill={false} onClick={copy} icon={<Copy className="h-4 w-4" />}>
            <AnimatePresence mode="wait"><motion.span key={String(copied)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{copied ? 'تم النسخ ✓' : 'نسخ الرقم'}</motion.span></AnimatePresence>
          </Button>
        </div>
        <p className="relative mt-3 text-xs text-muted">ينتهي الكود: الجمعة، ٢٤ أكتوبر ٢٠٢٥ - الساعة ٠٦:٠٠ مساءً</p>
        <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
          <div className="panel p-5"><p className="text-xs text-muted">كود خدمة فوري</p><p className="mt-2"><b className="font-display text-2xl text-teal">7882</b> <span className="text-sm text-muted">(مدفوعات رقمية / Mamatvbox)</span></p></div>
          <div className="panel p-5"><p className="text-xs text-muted">المبلغ المطلوب سداده</p><p className="mt-2"><b className="font-display text-2xl">٤٦٨</b> <span className="text-sm text-gold">جنيه مصري</span></p><p className="text-[11px] text-muted">الاشتراك السنوي الشامل • ضمان استرداد 14 يوماً</p></div>
        </div>
      </div>

      <div className="card mt-6 rounded-[2.5rem] p-6">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">خطوات السداد البسيطة</h2><Badge tone="teal">تفعيل تلقائي وفوري</Badge></div>
        <Stagger className="mt-5 grid gap-3 sm:grid-cols-3">
          {[{ i: Store, t: 'توجه لأقرب منفذ', d: 'أي ماكينة فوري لدى السوبر ماركت، الصيدليات، أو افتح تطبيق MyFawry على هاتفك.' }, { i: Grid3x3, t: 'أدخل رقم المرجع', d: `اطلب خدمة 7882 وسدد باستخدام الرقم المرجعي: ${code}.` }, { i: Receipt, t: 'استلم إيصالك وشاهد', d: 'احتفظ بالإيصال؛ سيتم فتح حسابك وتفعيل باقة السينما فوراً عبر رسالة SMS وبريدك.' }].map((s, i) => (
            <StaggerItem key={s.t} className="panel p-5"><div className="flex items-center justify-between"><s.i className="h-5 w-5 text-muted" /><span className="grid h-7 w-7 place-items-center rounded-full bg-bg text-xs font-bold text-gold">{i + 1}</span></div><b className="mt-4 block">{s.t}</b><p className="mt-2 text-xs leading-6 text-muted">{s.d}</p></StaggerItem>
          ))}
        </Stagger>
      </div>

      <div className="card mt-6 rounded-[2.5rem] p-6">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-lg font-bold"><MessageSquare className="h-5 w-5 text-teal" /> إرسال الكود إلى هاتفك مجاناً</h2><Badge tone="teal">خدمة لحظية مجانية</Badge></div>
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-4 flex gap-2">
          <div className="relative flex-1"><Smartphone className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" /><input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" className={`${inputClass} rounded-none pe-11 text-right`} /></div>
          <Button pill={false} variant="ghost" className="text-teal" icon={<Send className="h-4 w-4" />}>{sent ? 'تم الإرسال' : 'إرسال SMS'}</Button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <Button variant="dark" pill={false} onClick={() => window.print()} icon={<Printer className="h-4 w-4" />}>طباعة تفاصيل الإيصال</Button>
        <Button variant="ghost" href="/checkout">تغيير وسيلة الدفع (بطاقة بنكية / محفظة)</Button>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2"><Headset className="h-5 w-5 text-teal" /> هل واجهت أي صعوبة لدى ماكينة فوري؟</span>
        <span className="flex gap-2"><Badge tone="teal">واتساب فوري (مباشر)</Badge><Badge><Phone className="h-3 w-3" /> 19999 (خط فوري)</Badge></span>
      </div>
    </div>
  );
}

export default function FawryPage() {
  return <Suspense><FawryInner /></Suspense>;
}
