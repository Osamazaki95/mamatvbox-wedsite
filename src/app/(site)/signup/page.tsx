'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Clapperboard, Eye, EyeOff, Mail, ShieldCheck, Sparkles, User, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Divider, OAuthButtons, PasswordStrength } from '@/components/auth/OAuth';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, inputClass } from '@/components/ui/primitives';
import { auth, authError } from '@/lib/auth';

function SignupInner() {
  const router = useRouter();
  const next = useSearchParams().get('next') || '/onboarding/';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('كلمة المرور لازم تكون ٨ حروف أو أرقام على الأقل'); return; }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    if (!agree) { setError('لازم توافق على الشروط وسياسة الخصوصية'); return; }
    setBusy(true);
    try {
      await auth.signup(name, email, password);
      router.replace(next);
    } catch (err) {
      setError(authError(err));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-5 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card p-6 text-center sm:p-9">
        <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.15 }} className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-panel">
          <Clapperboard className="h-8 w-8 text-gold" />
          <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse-dot rounded-full bg-teal" />
        </motion.span>
        <p className="mt-4 flex items-center justify-center gap-1 text-xs text-gold"><Sparkles className="h-3.5 w-3.5" /> تجربة سينمائية فريدة وبلا إعلانات</p>
        <h1 className="mt-2 font-display text-3xl font-bold">أنشئ حسابك</h1>
        <p className="mt-2 text-sm text-muted">احفظ قائمتك، واختار منصاتك، واستقبل تنبيهات التوفر.</p>

        <div className="mt-7"><OAuthButtons stacked /></div>
        <Divider label="أو بالبريد الإلكتروني" />

        <form onSubmit={submit} className="space-y-4 text-right">
          <Field label="الاسم">
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dim" />
              <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" className={`${inputClass} pl-12`} />
            </div>
          </Field>
          <Field label={<>البريد الإلكتروني <span className="text-gold">*</span></>}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dim" />
              <input required type="email" autoComplete="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={`${inputClass} pl-12 text-right`} />
            </div>
          </Field>
          <Field label={<>كلمة المرور <span className="text-gold">*</span></>}>
            <div className="relative">
              <input required type={show ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="٨ حروف أو أرقام على الأقل" className={`${inputClass} pl-12`} />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-dim hover:text-ink" aria-label="إظهار كلمة المرور">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <PasswordStrength value={password} />
          </Field>
          <Field label={<>تأكيد كلمة المرور <span className="text-gold">*</span></>}>
            <input required type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="اكتبها تاني" className={inputClass} />
          </Field>
          <Checkbox checked={agree} onChange={setAgree} label={<>أوافق على <Link href="/legal/" className="text-teal">شروط الاستخدام</Link> و<Link href="/legal/#privacy" className="text-teal">سياسة الخصوصية</Link></>} />
          <AnimatePresence>
            {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-sm text-danger"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</motion.p>}
          </AnimatePresence>
          <Button className="w-full" size="lg" loading={busy} icon={<UserPlus className="h-5 w-5" />}>إنشاء الحساب</Button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted"><ShieldCheck className="h-4 w-4 text-teal" /> بياناتك مشفرة ولا نشاركها مع أي جهة.</p>
        <p className="mt-4 text-sm text-muted">لديك حساب بالفعل؟ <Link href="/login/" className="font-bold text-gold">تسجيل الدخول</Link></p>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return <Suspense><SignupInner /></Suspense>;
}
