'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, KeyRound, Mail, MailCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/primitives';
import { auth, authError } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setBusy(true);
    try {
      await auth.forgot(email);
      setSent(true);
      setWait(60);
    } catch (err) {
      setError(authError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-5 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="card p-6 text-center sm:p-9">
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 20 }}>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-panel"><KeyRound className="h-8 w-8 text-gold" /></span>
              <h1 className="mt-5 font-display text-3xl font-bold">نسيت كلمة المرور؟</h1>
              <p className="mt-2 text-sm text-muted">اكتب بريدك الإلكتروني وهنبعتلك رابط لاختيار كلمة مرور جديدة.</p>
              <form onSubmit={send} className="mt-7 space-y-4 text-right">
                <Field label="البريد الإلكتروني">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dim" />
                    <input type="email" required autoComplete="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={`${inputClass} pl-12 text-right`} />
                  </div>
                </Field>
                {error && <p className="flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-sm text-danger"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</p>}
                <Button className="w-full" size="lg" loading={busy}>إرسال رابط إعادة التعيين</Button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="sent" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-teal-soft"><MailCheck className="h-8 w-8 text-teal" /></motion.span>
              <h1 className="mt-5 font-display text-3xl font-bold">تفقّد بريدك</h1>
              <p className="mt-2 text-sm text-muted">لو البريد <b dir="ltr" className="text-ink">{email}</b> مسجل عندنا، هيوصلك رابط خلال دقايق. الرابط صالح لمدة ساعة.</p>
              <p className="mt-2 text-xs text-dim">لو ما لقيتوش، شوف مجلد الرسائل غير المرغوب فيها (Spam).</p>
              <button onClick={() => send()} disabled={wait > 0 || busy} className="mt-6 inline-flex items-center gap-2 rounded-full bg-panel px-5 py-2.5 text-sm font-semibold disabled:text-muted">
                <RefreshCw className={`h-4 w-4 text-teal ${busy ? 'animate-spin' : ''}`} />
                {wait > 0 ? `إعادة الإرسال بعد ${wait} ثانية` : 'إعادة إرسال الرابط'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <Link href="/login/" className="mt-8 inline-flex items-center gap-1 text-sm font-semibold"><ArrowRight className="h-4 w-4" /> العودة لتسجيل الدخول</Link>
      </motion.div>
    </div>
  );
}
