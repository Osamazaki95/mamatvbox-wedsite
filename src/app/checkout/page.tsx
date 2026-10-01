'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, BadgeCheck, CalendarDays, CheckCircle2, CreditCard, KeyRound, Lock, ShieldCheck, Sparkles, Star, Store, User, Wallet } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge, Field, inputClass } from '@/components/ui/primitives';
import { billingApi } from '@/lib/api';
import { USE_MOCK } from '@/lib/api/client';
import type { PaymentRequest } from '@/lib/api/types';
import { cn } from '@/lib/utils';

type Method = PaymentRequest['method'];

const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v: string) => v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1 / $2');

function CheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const planId = (params.get('plan') as PaymentRequest['planId']) ?? 'gold';
  const billing = (params.get('billing') as PaymentRequest['billing']) ?? 'yearly';
  const [method, setMethod] = useState<Method>('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', holder: '' });
  const [processing, setProcessing] = useState(false);

  const valid = !USE_MOCK || method !== 'card' || (card.number.replace(/\s/g, '').length === 16 && card.expiry.length >= 7 && card.cvv.length >= 3 && card.holder.length > 2);

  const pay = async () => {
    setProcessing(true);
    let res;
    try {
      res = await billingApi.checkout({ method, planId, billing, card: USE_MOCK && method === 'card' ? card : undefined });
    } catch {
      router.push('/checkout/failed?code=NETWORK_ERROR');
      return;
    }
    if (res.redirectUrl) { window.location.href = res.redirectUrl; return; }
    if (res.status === 'success') router.push('/checkout/success');
    else if (res.status === 'pending') router.push(`/checkout/fawry?code=${res.fawryCode}`);
    else router.push(`/checkout/failed?code=${res.errorCode}`);
  };

  return (
    <div className="mx-auto max-w-[1300px] px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Badge tone="gold"><BadgeCheck className="h-3 w-3" /> دفع مشفر وآمن ١٠٠٪ بتأمين مصرفي</Badge>
          <h1 className="mt-3 font-display text-4xl font-extrabold">تأكيد الاشتراك وتفعيل التجربة المجانية</h1>
          <p className="mt-2 text-sm text-muted">انضم الآن لصالون السينما الحصري — استمتع بـ ١٤ يوماً من الاكتشاف المطلق بدون أي التزام مالي اليوم.</p>
        </div>
        <span className="flex items-center gap-2 bg-card px-4 py-3 text-xs"><CalendarDays className="h-4 w-4 text-gold" /> بدون سحب فوري • إلغاء فوري بضغطة زر</span>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_520px]">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 bg-card p-4">
            <button className="bg-panel p-4 font-bold text-gold">🇪🇬 مصر (جنيه مصري EGP)</button>
            <button className="p-4 text-muted">🇸🇦🇰🇼 الخليج العربي (مدى، Apple Pay، KNET)</button>
          </div>

          <MethodCard active={method === 'card'} onSelect={() => setMethod('card')} icon={<CreditCard className="h-6 w-6 text-teal" />} title="البطاقات البنكية" tag="موصى به" subtitle="فيزا، ماستركارد، وميزة الوطنية المصرية">
            {!USE_MOCK ? <p className="flex items-center gap-2 bg-panel p-4 text-sm text-muted"><Lock className="h-4 w-4 shrink-0 text-teal" /> ستُدخل بيانات البطاقة في صفحة الدفع الآمنة الخاصة بـ Paymob — لا تُحفظ على خوادمنا.</p> : (
            <div className="space-y-4">
              <Field label="رقم البطاقة الائتمانية أو بطاقة ميزة" hint={<span className="flex items-center gap-1 text-teal"><Lock className="h-3 w-3" /> مشفر بالكامل</span>}>
                <div className="relative"><CreditCard className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dim" /><input dir="ltr" inputMode="numeric" value={card.number} onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })} placeholder="0000 0000 0000 0000" className={cn(inputClass, 'rounded-none pe-12 font-mono tracking-widest')} /></div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="تاريخ الانتهاء"><input dir="ltr" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} placeholder="MM / YY" className={cn(inputClass, 'rounded-none text-center font-mono')} /></Field>
                <Field label="رمز الأمان (CVV)"><div className="relative"><KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" /><input dir="ltr" type="password" inputMode="numeric" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })} placeholder="•••" className={cn(inputClass, 'rounded-none text-center')} /></div></Field>
              </div>
              <Field label="الاسم المطبوع على البطاقة"><div className="relative"><User className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" /><input value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} placeholder="الاسم كما يظهر على البطاقة البنكية" className={cn(inputClass, 'rounded-none pe-11')} /></div></Field>
              <p className="text-[11px] text-dim">للتجربة في وضع المحاكاة: أي رقم ينتهي بـ 0000 يعطي نتيجة «رفض مصرفي».</p>
            </div>
            )}
          </MethodCard>

          <MethodCard active={method === 'wallet'} onSelect={() => setMethod('wallet')} icon={<Wallet className="h-6 w-6 text-teal" />} title="المحافظ الذكية وإنستاباي (InstaPay)" subtitle="فودافون كاش، أورنج كاش، وي باي، إي آند كاش، وشبكة المدفوعات اللحظية" />
          <MethodCard active={method === 'fawry'} onSelect={() => setMethod('fawry')} icon={<Store className="h-6 w-6 text-gold" />} title="الدفع نقداً عبر فوري (Fawry)" tag="كود سداد" subtitle="ادفع في أي كشك، صيدلية، أو فرع فوري بلس خلال ٤٨ ساعة بعد التجربة" />

          <div className="flex items-start gap-4 bg-card p-6">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-soft"><ShieldCheck className="h-6 w-6 text-gold" /></span>
            <div><b className="font-display text-xl text-gold">ضمان عدم الخصم الفوري</b><p className="mt-1 font-bold">لن يُخصم من حسابك أي مليم قبل تاريخ ٢٦ أكتوبر ٢٠٢٥.</p><p className="mt-2 text-sm text-muted">يمكنك إلغاء الاشتراك بنقرة واحدة من لوحة تحكم حسابك في أي وقت خلال الـ ١٤ يوماً دون الحاجة للتواصل مع خدمة العملاء.</p></div>
          </div>

          <Button size="lg" pill={false} className="h-16 w-full text-lg" disabled={!valid} onClick={pay} icon={<Lock className="h-5 w-5" />}>ابدأ تجربتي المجانية الآن (١٤ يوماً مجاناً) <ArrowLeft className="h-5 w-5" /></Button>
          <p className="text-center text-xs text-muted">منصة مؤمنة بالكامل ومتوافقة مع المعايير المصرفية العالمية</p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="bg-card p-7">
            <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">ملخص باقة الاشتراك</h2><Badge tone="solidGold">توفير سنوي ٢٠٪</Badge></div>
            <div className="mt-5 flex items-center gap-4 bg-bg/60 p-5"><span className="grid h-12 w-12 place-items-center rounded-full bg-gold-soft"><Star className="h-6 w-6 text-gold" /></span><div><b className="font-display text-lg">العضوية الذهبية (Cinema Member)</b><p className="text-xs text-muted">وصول غير محدود لمحرك الاكتشاف وقواعد البيانات</p></div></div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">الاشتراك السنوي الموحد (١٢ شهراً):</dt><dd className="text-muted line-through">٥٨٨ ج.م</dd></div>
              <div className="flex justify-between"><dt className="text-muted">سعر الاشتراك بعد الخصم الخاص:</dt><dd>٤٦٨ ج.م <span className="text-xs text-gold">(ما يعادل ٣٩ ج.م/شهرياً)</span></dd></div>
              <div className="flex justify-between bg-teal-soft p-3 text-teal"><dt className="flex items-center gap-1"><Sparkles className="h-4 w-4" /> تجربة استكشاف مجانية:</dt><dd className="font-bold">١٤ يوماً مجاناً</dd></div>
              <div className="flex justify-between"><dt className="text-muted">تاريخ التجديد الأول القادم:</dt><dd>٢٦ أكتوبر ٢٠٢٥</dd></div>
            </dl>
            <div className="mt-5 flex items-center justify-between bg-panel p-5"><div><p className="text-xs text-muted">المطلوب سداده الآن:</p><p className="font-display text-4xl font-extrabold text-gold">٠,٠٠ ج.م</p></div><Badge tone="teal" dot>مجاني بالكامل اليوم</Badge></div>
            <p className="mt-6 text-xs font-bold text-gold">المميزات المفتوحة فوراً في باقتك:</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {['كشف جودات 4K HDR ومعدل التدفق (Bitrate) الفعلي لـ ٩ منصات', 'روابط المشاهدة والتنزيل المباشر للأعمال بدون إعلانات', 'تنبيهات فورية لانتهاء تراخيص الأفلام «هيتشال قريب»', 'ميزة حاسبة الاشتراكات الموحدة «في باقتك» لتوفير النفقات'].map((f) => (
                <li key={f} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-violet" /> {f}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <ProcessingOverlay open={processing} />
    </div>
  );
}

function MethodCard({ active, onSelect, icon, title, subtitle, tag, children }: { active: boolean; onSelect: () => void; icon: React.ReactNode; title: string; subtitle: string; tag?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('bg-card p-6 transition-colors', active && 'ring-1 ring-gold/40')}>
      <button onClick={onSelect} className="flex w-full items-start justify-between gap-4 text-right">
        <div className="flex items-start gap-3">
          <span className={cn('mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2', active ? 'border-gold' : 'border-muted')}>{active && <motion.span layoutId="pm-dot" className="h-3 w-3 rounded-full bg-gold" />}</span>
          <div><b className="flex items-center gap-2 font-display text-xl">{title} {tag && <Badge tone="gold">{tag}</Badge>}</b><p className="mt-1 text-sm text-muted">{subtitle}</p></div>
        </div>
        {icon}
      </button>
      <AnimatePresence initial={false}>
        {active && children && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="pt-6">{children}</div></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const phases = ['جار الاتصال الآمن بالبنك المركزي...', 'جار التحقق الرمزي من البطاقة...', 'جار تشفير حزم البيانات المصرفية...', 'جار تفعيل العضوية الذهبية...'];

function ProcessingOverlay({ open }: { open: boolean }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!open) { setP(0); return; }
    const id = setInterval(() => setP((v) => Math.min(v + 3, 96)), 80);
    return () => clearInterval(id);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-bg/90 p-4 backdrop-blur-xl">
          <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-xl rounded-[3rem] bg-card p-10 text-center shadow-card">
            <div className="relative mx-auto h-36 w-36">
              <motion.svg viewBox="0 0 100 100" className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}>
                <defs><linearGradient id="ring" x1="0" x2="1"><stop offset="0" stopColor="#FBBF24" /><stop offset="1" stopColor="#4FE3D0" /></linearGradient></defs>
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#ring)" strokeWidth="4" strokeLinecap="round" strokeDasharray="180 300" />
              </motion.svg>
              <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow"><circle cx="50" cy="50" r="34" fill="none" stroke="#4FE3D0" strokeOpacity=".4" strokeDasharray="2 5" /></svg>
              <span className="absolute inset-0 grid place-items-center"><Lock className="h-10 w-10 text-teal" /></span>
            </div>
            <Badge tone="teal" dot className="mt-6">جار الاتصال الآمن بالبنك المركزي / بوابة الدفع</Badge>
            <h2 className="mt-4 font-display text-3xl font-bold">جاري تأكيد وسيلة الدفع وتفعيل حسابك...</h2>
            <p className="mt-3 text-sm text-muted">يرجى الانتظار لحظات بينما نقوم بالتحقق الآمن من بطاقتك وتفعيل فترة الـ <b className="text-gold">١٤ يوماً</b> التجريبية المجانية الخاصة بك.</p>
            <div className="mt-6 flex items-start gap-3 bg-panel p-4 text-right text-sm"><AlertTriangle className="h-5 w-5 shrink-0 text-gold" /><div><b className="text-gold">إجراء أمني مطلوب</b><p className="text-xs text-muted">من فضلك لا تغلق هذه الصفحة أو تضغط على زر الرجوع في المتصفح لتفادي تكرار العملية.</p></div></div>
            <div className="mt-6 flex justify-between text-xs font-bold text-teal"><AnimatePresence mode="wait"><motion.span key={Math.floor(p / 25)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{phases[Math.min(3, Math.floor(p / 25))]}</motion.span></AnimatePresence><span>{p}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line"><motion.div className="h-full rounded-full bg-gradient-to-l from-teal to-gold" animate={{ width: `${p}%` }} /></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutInner /></Suspense>;
}
