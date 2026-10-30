'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, KeyRound, LogOut, Mail, Phone, Save, Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PasswordStrength } from '@/components/auth/OAuth';
import { Counter, Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge, Field, inputClass } from '@/components/ui/primitives';
import { auth, authError, useUser } from '@/lib/auth';

export default function ProfilePage() {
  const user = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [cur, setCur] = useState('');
  const [pass, setPass] = useState('');
  const [pBusy, setPBusy] = useState(false);
  const [pMsg, setPMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => { if (user) { setName(user.name); setPhone(user.phone); } }, [user]);
  if (!user) return null;

  const save = async () => {
    setSaving(true);
    try { await auth.updateProfile(name, phone); setMsg({ ok: true, text: 'تم حفظ البيانات' }); }
    catch (e) { setMsg({ ok: false, text: authError(e) }); }
    setSaving(false);
    setTimeout(() => setMsg(null), 2500);
  };
  const changePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setPBusy(true);
    try { await auth.changePassword(cur, pass); setPMsg({ ok: true, text: 'تم تغيير كلمة المرور' }); setCur(''); setPass(''); }
    catch (err) { setPMsg({ ok: false, text: authError(err) }); }
    setPBusy(false);
  };
  const logout = async () => { await auth.logout(); router.replace('/'); };
  const remove = async () => { await auth.deleteAccount(); router.replace('/'); };

  const joined = new Date(user.createdAt.replace(' ', 'T')).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });

  return (
    <>
      <Reveal>
        <div className="card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
          <div className="glow-teal pointer-events-none absolute inset-0" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-teal to-gold p-1 sm:h-24 sm:w-24">
                {user.avatar
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                  : <span className="grid h-full w-full place-items-center rounded-full bg-panel font-display text-3xl font-bold">{(user.name || user.email)[0]?.toUpperCase()}</span>}
              </div>
              <div className="min-w-0">
                <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{user.name || user.email}</h1>
                <p dir="ltr" className="truncate text-right text-sm text-muted">{user.email}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {user.providers.password && <Badge tone="teal">بريد وكلمة مرور</Badge>}
                  {user.providers.google && <Badge tone="gold">Google</Badge>}
                  {user.providers.apple && <Badge>Apple</Badge>}
                  <Badge>عضو منذ {joined}</Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" pill={false} onClick={logout} icon={<LogOut className="h-4 w-4" />}>تسجيل الخروج</Button>
          </div>
          <div className="relative mt-8 grid grid-cols-2 gap-4 bg-bg/40 p-5">
            <div><Counter value={user.watchlist.length} className="font-display text-3xl font-bold text-gold" /><p className="mt-1 text-xs text-muted">عمل في قائمتي</p></div>
            <div><Counter value={user.platforms.length} className="font-display text-3xl font-bold text-teal" /><p className="mt-1 text-xs text-muted">منصة مشترك بها</p></div>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal className="card rounded-[2rem] p-6 sm:p-7">
          <h2 className="font-display text-xl font-bold">البيانات الشخصية</h2>
          <div className="mt-6 space-y-4">
            <Field label="الاسم"><div className="relative"><User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" /><input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} pl-11`} /></div></Field>
            <Field label="رقم الهاتف"><div className="relative"><Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" /><input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20 ..." className={`${inputClass} pl-11 text-right`} /></div></Field>
            <Field label="البريد الإلكتروني"><div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" /><input dir="ltr" readOnly value={user.email} className={`${inputClass} pl-11 text-right opacity-70`} /></div></Field>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button pill={false} loading={saving} onClick={save} icon={<Save className="h-4 w-4" />}>حفظ التعديلات</Button>
            <AnimatePresence>{msg && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`text-sm ${msg.ok ? 'text-teal' : 'text-danger'}`}>{msg.text}</motion.span>}</AnimatePresence>
          </div>
        </Reveal>

        <Reveal className="card rounded-[2rem] p-6 sm:p-7">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold"><KeyRound className="h-5 w-5 text-gold" /> {user.providers.password ? 'تغيير كلمة المرور' : 'إضافة كلمة مرور'}</h2>
          {!user.providers.password && <p className="mt-2 text-xs text-muted">حسابك متسجل بـ Google أو Apple. تقدر تضيف كلمة مرور عشان تدخل بالبريد كمان.</p>}
          <form onSubmit={changePass} className="mt-6 space-y-4">
            {user.providers.password && <Field label="كلمة المرور الحالية"><input type="password" required autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} className={inputClass} /></Field>}
            <Field label="كلمة المرور الجديدة"><input type="password" required autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} className={inputClass} /><PasswordStrength value={pass} /></Field>
            {pMsg && <p className={`flex items-center gap-2 text-sm ${pMsg.ok ? 'text-teal' : 'text-danger'}`}>{pMsg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} {pMsg.text}</p>}
            <Button pill={false} variant="teal" loading={pBusy}>حفظ كلمة المرور</Button>
          </form>
        </Reveal>
      </div>

      <Reveal className="card mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-6 sm:p-7">
        <div><h2 className="flex items-center gap-2 font-display text-lg font-bold text-danger"><AlertTriangle className="h-5 w-5" /> حذف الحساب</h2><p className="mt-1 text-xs text-muted">هيتم حذف حسابك وقائمتك نهائياً.</p></div>
        {confirmDel
          ? <div className="flex gap-2"><Button variant="danger" pill={false} onClick={remove} icon={<Trash2 className="h-4 w-4" />}>تأكيد الحذف</Button><Button variant="dark" pill={false} onClick={() => setConfirmDel(false)}>إلغاء</Button></div>
          : <Button variant="danger" pill={false} onClick={() => setConfirmDel(true)}>حذف الحساب نهائياً</Button>}
      </Reveal>
    </>
  );
}
