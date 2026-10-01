'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Mail, RefreshCw, ShieldCheck, Wand2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Divider, OAuthButtons } from '@/components/auth/OAuth';
import { Button } from '@/components/ui/Button';
import { Badge, Checkbox, Field, inputClass } from '@/components/ui/primitives';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [withPassword, setWithPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('يرجى إدخال بريد إلكتروني صحيح'); return; }
    setError('');
    setBusy(true);
    await authApi.sendMagicLink(email);
    router.push(`/check-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="relative mx-auto max-w-lg px-5 py-16">
      <div className="glow-teal pointer-events-none absolute inset-0" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center">
        <Badge tone="teal" dot>البوابة السينمائية الآمنة</Badge>
        <h1 className="mt-5 font-display text-4xl font-extrabold">مرحباً بعودتك إلى</h1>
        <p className="mt-1 font-logo text-5xl font-bold text-teal">Mamatvbox</p>
        <p className="mt-4 text-sm text-muted">سجّل دخولك لمتابعة أعمالك في باقتك، قوائم المشاهدة، وتنبيهات الجودة والتراخيص.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card relative mt-8 p-8">
        <OAuthButtons />
        <Divider label="أو بالبريد الإلكتروني" />
        <form onSubmit={submit} className="space-y-5">
          <Field label="البريد الإلكتروني المسجل" hint={<span className="text-teal">سريع وآمن</span>}>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dim" />
              <input dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={`${inputClass} text-right`} />
            </div>
            <AnimatePresence>{error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-xs text-danger">{error}</motion.p>}</AnimatePresence>
          </Field>

          <AnimatePresence>
            {withPassword && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <Field label="كلمة المرور"><input type="password" className={inputClass} placeholder="••••••••" /></Field>
              </motion.div>
            )}
          </AnimatePresence>

          <Button className="w-full" size="lg" loading={busy} icon={<Wand2 className="h-5 w-5" />}>أرسل رابط الدخول السحري (Magic Link)</Button>

          <div className="flex items-center justify-between text-xs text-muted">
            <button type="button" onClick={() => setWithPassword((v) => !v)} className="flex items-center gap-1">
              أو الدخول بكلمة المرور <motion.span animate={{ rotate: withPassword ? 180 : 0 }}><ChevronDown className="h-4 w-4" /></motion.span>
            </button>
            <span>خيارات إضافية</span>
          </div>
          <Checkbox checked={remember} onChange={setRemember} label="تذكر هذا الجهاز لمدة ٣٠ يوماً" />
        </form>

        <div className="panel mt-6 flex items-center justify-between p-4">
          <div className="text-sm"><p>ليس لديك حساب بعد؟</p><p className="text-xs text-teal">جرّب كافة مزايا التتبع والتراخيص مجاناً</p></div>
          <Button size="sm" variant="dark" href="/signup" className="text-teal">اشترك الآن</Button>
        </div>
      </motion.div>

      <div className="relative mt-6 flex flex-wrap justify-center gap-5 text-xs text-muted">
        <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-teal" /> حماية معتمدة بنظام التشفير التام</span>
        <span className="flex items-center gap-1"><Zap className="h-4 w-4 text-gold" /> دخول بدون كلمات مرور معقدة</span>
        <span className="flex items-center gap-1"><RefreshCw className="h-4 w-4 text-teal" /> مزامنة فورية لقوائمك</span>
      </div>
    </div>
  );
}
