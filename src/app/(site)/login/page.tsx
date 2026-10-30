'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Divider, OAuthButtons } from '@/components/auth/OAuth';
import { Button } from '@/components/ui/Button';
import { Badge, Checkbox, Field, inputClass } from '@/components/ui/primitives';
import { auth, authError, authErrors } from '@/lib/auth';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/account/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const e = params.get('error');
    if (e) setError(authErrors[e] ?? authErrors.oauth_failed);
    auth.me(true).then((u) => { if (u) router.replace(next); });
  }, [params, router, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await auth.login(email, password, remember);
      router.replace(next);
    } catch (err) {
      setError(authError(err));
      setBusy(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-lg px-4 py-12 sm:px-5 sm:py-16">
      <div className="glow-teal pointer-events-none absolute inset-0" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center">
        <Badge tone="teal" dot>البوابة السينمائية الآمنة</Badge>
        <h1 className="mt-5 font-display text-4xl font-extrabold">مرحباً بعودتك</h1>
        <p className="mt-3 text-sm text-muted">سجّل دخولك لمتابعة قائمتك وتنبيهاتك ومنصاتك.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card relative mt-8 p-6 sm:p-8">
        <OAuthButtons />
        <Divider label="أو بالبريد الإلكتروني" />
        <form onSubmit={submit} className="space-y-4">
          <Field label="البريد الإلكتروني">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dim" />
              <input type="email" required autoComplete="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={`${inputClass} pl-12 text-right`} />
            </div>
          </Field>
          <Field label="كلمة المرور" hint={<Link href="/forgot-password/" className="text-teal">نسيت كلمة المرور؟</Link>}>
            <div className="relative">
              <input type={show ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${inputClass} pl-12`} />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-dim hover:text-ink" aria-label="إظهار كلمة المرور">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </Field>
          <Checkbox checked={remember} onChange={setRemember} label="تذكرني على هذا الجهاز" />
          <AnimatePresence>
            {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-sm text-danger"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</motion.p>}
          </AnimatePresence>
          <Button className="w-full" size="lg" loading={busy} icon={<LogIn className="h-5 w-5" />}>تسجيل الدخول</Button>
        </form>

        <div className="panel mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm">ليس لديك حساب بعد؟</p>
          <Button size="sm" variant="dark" href={`/signup/${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-teal">إنشاء حساب جديد</Button>
        </div>
      </motion.div>

      <div className="relative mt-6 flex flex-wrap justify-center gap-5 text-xs text-muted">
        <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-teal" /> اتصال مشفّر بالكامل</span>
        <span className="flex items-center gap-1"><Lock className="h-4 w-4 text-gold" /> كلمات المرور محفوظة بتشفير آمن</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}
