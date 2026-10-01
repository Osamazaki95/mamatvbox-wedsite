'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BellRing, Clapperboard, Info, Lock, PiggyBank, ShieldCheck, SlidersHorizontal, Sparkles, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Divider, OAuthButtons } from '@/components/auth/OAuth';
import { Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, inputClass } from '@/components/ui/primitives';
import { authApi } from '@/lib/api';

const perks = [
  { i: Clapperboard, t: 'تتبع شامل للمنصات', d: 'قارن بدقة بين عروض Shahid وWatch IT وNetflix وOSN+ بنقرة واحدة.' },
  { i: BellRing, t: 'تنبيهات فورية بالتوفر', d: 'استقبل إشعاراً عند نزول فيلمك المنتظر بأعلى دقة 4K HDR ضمن اشتراكاتك.' },
  { i: PiggyBank, t: 'حاسبة الباقات الذكية', d: 'اكتشف الباقة الأنسب لذوقك ووفر مصاريف الاشتراكات الشهرية غير المستغلة.' },
];

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;
    setBusy(true);
    await authApi.signup(email, 'EG');
    router.push(`/check-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card mx-auto max-w-lg p-9 text-center">
        <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2 }} className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-panel">
          <Clapperboard className="h-8 w-8 text-gold" />
          <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse-dot rounded-full bg-teal" />
        </motion.span>
        <p className="mt-4 flex items-center justify-center gap-1 text-xs text-gold"><Sparkles className="h-3.5 w-3.5" /> تجربة سينمائية فريدة وبلا إعلانات</p>
        <h1 className="mt-2 font-display text-3xl font-bold">أنشئ حسابك وابدأ شهرك المجاني</h1>
        <p className="mt-2 text-sm text-muted">انضم لأكثر من ٢٥٠ ألف سينمائي يكتشفون أين يشاهدون أعمالهم المفضلة يومياً.</p>

        <div className="mt-7"><OAuthButtons stacked /></div>
        <Divider label="أو عبر البريد الإلكتروني (رابط الدخول السحري Magic Link)" />

        <form onSubmit={submit} className="space-y-4 text-right">
          <Field label={<>البريد الإلكتروني <span className="text-gold">*</span></>} hint={<span className="flex items-center gap-1 text-teal"><Lock className="h-3 w-3" /> دخول فوري بدون كلمة مرور</span>}>
            <input required type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={`${inputClass} text-right`} />
          </Field>
          <p className="flex items-center gap-1.5 text-xs text-muted"><Info className="h-3.5 w-3.5 text-gold" /> سنرسل لك رابط دخول سري ومباشر بدون الحاجة لحفظ كلمة مرور.</p>
          <div className="panel flex items-center justify-between p-4">
            <div className="flex items-center gap-3"><span className="text-2xl">🇪🇬</span><div><b className="text-sm">جمهورية مصر العربية</b><p className="text-[11px] text-muted">لتحديد دليل المنصات المناسب لك تلقائياً</p></div></div>
            <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold text-gold"><SlidersHorizontal className="h-3 w-3" /> تلقائي</span>
          </div>
          <Checkbox checked={agree} onChange={setAgree} label={<>أوافق على <Link href="/legal" className="text-teal">شروط الاستخدام</Link> و<Link href="/legal#privacy" className="text-teal">سياسة الخصوصية</Link> وأرغب بتلقي نشرة التوصيات السينمائية الأسبوعية</>} />
          <Button className="w-full" size="lg" loading={busy} disabled={!agree} icon={<Wand2 className="h-5 w-5" />}>إرسال رابط الدخول السحري</Button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted"><ShieldCheck className="h-4 w-4 text-teal" /> بياناتك مشفرة بالكامل ولا نقوم بمشاركة بريدك مع أي منصات خارجية.</p>
        <p className="mt-5 text-sm text-muted">لديك حساب بالفعل؟ <Link href="/login" className="inline-flex items-center gap-1 font-bold text-gold">تسجيل الدخول <ArrowRight className="h-4 w-4 rotate-180" /></Link></p>
      </motion.div>

      <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
        {perks.map((p) => (
          <StaggerItem key={p.t} className="card flex items-start gap-3 rounded-[2rem] p-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-panel"><p.i className="h-5 w-5 text-teal" /></span>
            <div><b>{p.t}</b><p className="mt-1 text-xs leading-6 text-muted">{p.d}</p></div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
