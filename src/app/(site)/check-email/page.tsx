'use client';

import { motion } from 'framer-motion';
import { ArrowRight, AtSign, ExternalLink, LogIn, Mail, MailCheck, Pencil, RefreshCw, Search, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Stagger, StaggerItem } from '@/components/motion';
import { Badge } from '@/components/ui/primitives';
import { authApi } from '@/lib/api';

const steps = [
  { i: Mail, t: 'افتح تطبيق بريدك', d: 'توجه لصندوق الوارد على Gmail أو Outlook أو تطبيقك المفضل.' },
  { i: Search, t: 'ابحث عن رسالتنا', d: 'ابحث عن رسالة واردة من «فريق Mamatvbox السينمائي».' },
  { i: LogIn, t: 'انقر للدخول فوراً', d: 'اضغط على زر «تسجيل الدخول» لتفعيل الجلسة واستئناف المتابعة.' },
];

function CheckEmailInner() {
  const email = useSearchParams().get('email') ?? 'ahmed.cinema@example.com';
  const [seconds, setSeconds] = useState(45);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const resend = async () => {
    setSending(true);
    await authApi.sendMagicLink(email);
    setSending(false);
    setSeconds(45);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card relative overflow-hidden border-t-2 border-t-teal/60 p-10 text-center">
        <div className="glow-teal pointer-events-none absolute inset-0" />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.15 }} className="relative mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-panel shadow-teal">
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}><MailCheck className="h-11 w-11 text-teal" /></motion.span>
          <motion.span className="absolute -right-3 -top-3" animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}><Sparkles className="h-6 w-6 text-gold" /></motion.span>
        </motion.div>
        <Badge tone="teal" dot className="relative mt-6">تم إرسال رابط الدخول السحري بنجاح</Badge>
        <h1 className="relative mt-4 font-display text-4xl font-extrabold">تفقّد بريدك الإلكتروني!</h1>
        <p className="relative mt-3 text-sm text-muted">أرسلنا رابط تسجيل دخول آمن وخاص بدون كلمة مرور. ينتهي هذا الرابط خلال 15 دقيقة لضمان أعلى مستويات الأمان.</p>

        <div className="relative mx-auto mt-6 flex max-w-md items-center justify-between rounded-full bg-panel p-2 ps-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-soft"><AtSign className="h-4 w-4 text-teal" /></span>
          <b dir="ltr" className="flex-1 text-center">{email}</b>
          <Link href="/login" className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-xs text-muted"><Pencil className="h-3 w-3" /> تعديل البريد</Link>
        </div>

        <div className="panel relative mt-8 rounded-[2rem] p-6 text-right">
          <p className="mb-4 text-xs text-muted">خطوات إتمام الدخول إلى عالم MAMATVBOX:</p>
          <Stagger className="grid gap-3 sm:grid-cols-3">
            {steps.map((s, i) => (
              <StaggerItem key={s.t} className="rounded-3xl bg-surface p-5">
                <div className="flex items-center justify-between"><span className="grid h-7 w-7 place-items-center rounded-full bg-panel text-xs font-bold text-gold">{i + 1}</span><s.i className="h-5 w-5 text-muted" /></div>
                <b className="mt-3 block text-sm">{s.t}</b>
                <p className="mt-2 text-xs leading-6 text-muted">{s.d}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          {[{ l: 'فتح بريد Gmail', h: 'https://mail.google.com' }, { l: 'فتح بريد Outlook', h: 'https://outlook.live.com' }, { l: 'تطبيق البريد الافتراضي', h: 'mailto:' }].map((b) => (
            <motion.a key={b.l} href={b.h} target="_blank" rel="noreferrer" whileHover={{ y: -3 }} className="flex h-14 items-center justify-center gap-2 rounded-full bg-panel text-sm font-semibold hover:text-ink">{b.l} <ExternalLink className="h-4 w-4 text-muted" /></motion.a>
          ))}
        </div>

        <p className="relative mt-8 text-xs text-muted">لم تصلك الرسالة بعد؟</p>
        <button onClick={resend} disabled={seconds > 0 || sending} className="relative mt-2 inline-flex items-center gap-2 rounded-full bg-panel px-5 py-2.5 text-sm font-semibold disabled:text-muted">
          <RefreshCw className={`h-4 w-4 text-teal ${sending ? 'animate-spin' : ''}`} />
          {seconds > 0 ? `إعادة إرسال الرابط (خلال ${seconds} ثانية)` : 'إعادة إرسال الرابط الآن'}
        </button>
        <p className="relative mt-3 text-[11px] text-dim">يرجى التحقق من مجلد الرسائل غير المرغوب فيها (Spam / Junk) أو تأكد من دقة العنوان المدخل قبل طلب رابط جديد.</p>
        <Link href="/login" className="relative mt-6 inline-flex items-center gap-1 text-sm font-semibold"><ArrowRight className="h-4 w-4" /> العودة إلى صفحة تسجيل الدخول</Link>
      </motion.div>
      <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted"><ShieldCheck className="h-4 w-4 text-teal" /> روابط الدخول لدينا مشفرة وفق معايير بروتوكول PKCE وحماية الجلسات الأحادية</p>
    </div>
  );
}

export default function CheckEmailPage() {
  return <Suspense><CheckEmailInner /></Suspense>;
}
