'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { PasswordStrength } from '@/components/auth/OAuth';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/primitives';
import { auth, authError } from '@/lib/auth';

function ResetInner() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(token ? '' : 'الرابط غير صالح — اطلب رابط جديد');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('كلمة المرور لازم تكون ٨ حروف أو أرقام على الأقل'); return; }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    setBusy(true);
    try {
      await auth.reset(token, password);
      setDone(true);
      setTimeout(() => router.replace('/account/'), 1800);
    } catch (err) {
      setError(authError(err));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-5 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="card p-6 text-center sm:p-9">
        {done ? (
          <>
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal text-bg"><CheckCircle2 className="h-8 w-8" /></motion.span>
            <h1 className="mt-5 font-display text-3xl font-bold">تم تغيير كلمة المرور</h1>
            <p className="mt-2 text-sm text-muted">تم تسجيل دخولك — جاري تحويلك لحسابك...</p>
          </>
        ) : (
          <>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-panel"><KeyRound className="h-8 w-8 text-gold" /></span>
            <h1 className="mt-5 font-display text-3xl font-bold">كلمة مرور جديدة</h1>
            <p className="mt-2 text-sm text-muted">اختار كلمة مرور قوية ما استخدمتهاش قبل كده.</p>
            <form onSubmit={submit} className="mt-7 space-y-4 text-right">
              <Field label="كلمة المرور الجديدة">
                <div className="relative">
                  <input required type={show ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pl-12`} />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-dim hover:text-ink" aria-label="إظهار كلمة المرور">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
                <PasswordStrength value={password} />
              </Field>
              <Field label="تأكيد كلمة المرور">
                <input required type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
              </Field>
              {error && <p className="flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-sm text-danger"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</p>}
              <Button className="w-full" size="lg" loading={busy} disabled={!token}>حفظ كلمة المرور</Button>
            </form>
            <Link href="/forgot-password/" className="mt-6 inline-block text-sm text-teal">طلب رابط جديد</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetInner /></Suspense>;
}
