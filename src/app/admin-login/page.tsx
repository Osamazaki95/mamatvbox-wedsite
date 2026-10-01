'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Lock, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/primitives';

function LoginInner() {
  const router = useRouter();
  const next = useSearchParams().get('next') || '/admin';
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    setBusy(false);
    if (res.ok) { router.replace(next.startsWith('/admin') ? next : '/admin'); router.refresh(); return; }
    setError(res.status === 503 ? 'لم يتم ضبط ADMIN_PASSWORD في ملف .env على السيرفر.' : 'كلمة المرور غير صحيحة.');
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-md p-7 sm:p-9">
        <Logo />
        <h1 className="mt-6 flex items-center gap-2 font-display text-2xl font-bold"><Lock className="h-6 w-6 text-gold" /> دخول لوحة التحكم</h1>
        <p className="mt-2 text-sm text-muted">هذه المنطقة مخصصة لإدارة الموقع فقط.</p>
        <div className="mt-6">
          <Field label="كلمة مرور الإدارة">
            <input type="password" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
          </Field>
        </div>
        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex items-center gap-2 text-sm text-danger"><AlertTriangle className="h-4 w-4 shrink-0" /> {error}</motion.p>}
        <Button className="mt-6 w-full" size="lg" loading={busy} icon={<ShieldCheck className="h-5 w-5" />}>دخول</Button>
      </motion.form>
    </main>
  );
}

export default function AdminLoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}
