'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, BellRing, Check, CheckCheck, Clock, Mail, Play, Radar, Settings2, Sparkles, Star, Timer, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge, Checkbox, Toggle } from '@/components/ui/primitives';
import { meApi } from '@/lib/api';
import type { AppNotification } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const filters = [
  { k: 'all', l: 'الكل' },
  { k: 'unread', l: 'غير مقروءة' },
  { k: 'new', l: 'جديد في باقتك' },
  { k: 'quality', l: 'توفرت بجودة أعلى 4K' },
  { k: 'expiring', l: 'هيتشال قريب' },
  { k: 'billing', l: 'فواتير وتراخيص' },
] as const;

const accent: Record<AppNotification['kind'], string> = {
  expiring: 'border-r-gold', quality: 'border-r-teal', new: 'border-r-teal', billing: 'border-r-violet', available: 'border-r-line',
};
const kindBadge: Record<AppNotification['kind'], { l: string; t: 'danger' | 'gold' | 'teal' | 'violet' | 'muted' }> = {
  expiring: { l: 'هيتشال قريب — تنبيه ترخيص', t: 'danger' }, quality: { l: 'توفر بجودة أعلى 4K HDR', t: 'gold' }, new: { l: 'أضيف لمنصتك المشترك بها', t: 'teal' }, billing: { l: 'تنبيه الفوترة والتوفير', t: 'violet' }, available: { l: 'عمل مرتقب أصبح متاحاً', t: 'muted' },
};

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]['k']>('all');
  const [modal, setModal] = useState(false);

  useEffect(() => { meApi.notifications().then(setItems); }, []);

  const view = items.filter((n) => filter === 'all' || (filter === 'unread' ? !n.read : n.kind === filter));
  const unread = view.filter((n) => !n.read);
  const read = view.filter((n) => n.read);
  const markAll = async () => { setItems((s) => s.map((n) => ({ ...n, read: true }))); await meApi.markAllRead(); };
  const dismiss = (id: string) => setItems((s) => s.filter((n) => n.id !== id));

  return (
    <div className="mx-auto max-w-[1300px] px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex gap-2 text-xs"><Badge tone="teal" dot>بث مباشر للرصد الرقمي</Badge><span className="font-mono text-muted">ID: NTC-2025-EGY</span></p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">مركز الإشعارات وتنبيهات الكتالوج</h1>
          <p className="mt-2 text-sm text-muted">رصد فوري لأعمالك المنتظرة، تنبيهات سحب التراخيص قبل انتهاء العرض، وترقيات جودة البث إلى 4K عبر منصات الشرق الأوسط.</p>
        </div>
        <div className="flex gap-2"><Button variant="dark" pill={false} onClick={markAll} icon={<CheckCheck className="h-4 w-4" />}>تحديد الكل كمقروء</Button><Button variant="dark" pill={false} onClick={() => setModal(true)} icon={<Settings2 className="h-4 w-4" />}>إعدادات التنبيهات</Button></div>
      </div>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button key={f.k} onClick={() => setFilter(f.k)} className={cn('relative shrink-0 rounded-full px-4 py-2 text-xs font-semibold', filter === f.k ? 'text-bg' : 'bg-panel text-muted')}>
            {filter === f.k && <motion.span layoutId="nf" className="absolute inset-0 rounded-full bg-gold" />}<span className="relative">{f.l}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {unread.map((n, i) => (
              <motion.article key={n.id} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60, height: 0 }} transition={{ delay: i * 0.05 }} className={cn('card flex gap-5 rounded-none border-r-4 p-5', accent[n.kind])}>
                <div className="hidden h-36 w-24 shrink-0 bg-panel sm:block" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2"><Badge tone={kindBadge[n.kind].t}>{kindBadge[n.kind].l}</Badge><span className="flex items-center gap-1 text-xs text-muted"><Clock className="h-3.5 w-3.5" /> {n.time}</span></div>
                  <h3 className="mt-3 font-display text-lg font-bold leading-8">{n.title}</h3>
                  <p className="mt-1 text-xs text-muted">{n.body}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button size="sm" pill={false} variant={n.kind === 'billing' ? 'violet' : n.kind === 'expiring' ? 'gold' : 'teal'} icon={<Play className="h-3.5 w-3.5" />}>{n.kind === 'expiring' ? 'شاهد الآن قبل الحذف' : n.kind === 'billing' ? 'مراجعة اشتراك وسياسة الفوترة' : 'انتقل للمشاهدة بالجودة الجديدة'}</Button>
                    <Button size="sm" pill={false} variant="dark" onClick={() => setModal(true)}>تعديل التنبيه</Button>
                    <button onClick={() => dismiss(n.id)} className="ms-auto text-dim hover:text-danger" aria-label="إخفاء"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
          {read.length > 0 && <p className="py-2 text-center text-xs text-dim">إشعارات سابقة تمت قراءتها</p>}
          {read.map((n) => (
            <motion.article layout key={n.id} className="card flex gap-4 p-5 opacity-80"><div className="flex-1"><Badge>{kindBadge[n.kind].l}</Badge><h3 className="mt-2 text-sm font-bold">{n.title}</h3><p className="mt-1 text-xs text-muted">{n.body}</p></div><span className="text-xs text-muted">{n.time}</span></motion.article>
          ))}
          {view.length === 0 && <div className="card p-12 text-center text-muted">لا توجد إشعارات في هذا التصنيف</div>}
        </div>

        <aside className="space-y-4">
          <div className="card p-6">
            <div className="flex justify-between"><h3 className="flex items-center gap-2 font-display font-bold"><Radar className="h-5 w-5 text-teal" /> رادار اشتراكاتك</h3><Badge tone="teal">مفعل</Badge></div>
            <p className="mt-2 text-xs text-muted">نراقب باستمرار 9 منصات بث للتأكد من أنك لا تدفع مقابل منصة لا تستخدمها.</p>
            <div className="panel mt-4 p-4">
              <svg viewBox="0 0 200 50" className="h-14 w-full"><motion.path d="M0 40 L30 30 L60 36 L90 20 L120 26 L150 12 L200 18" fill="none" stroke="#4FE3D0" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} /></svg>
              <div className="mt-2 grid grid-cols-3 text-center text-xs"><div><b className="text-teal">٢٤</b><p className="text-muted">إضافات</p></div><div><b className="text-gold">٧</b><p className="text-muted">ترقيات 4K</p></div><div><b className="text-danger">٥</b><p className="text-muted">مغادرات</p></div></div>
            </div>
          </div>
          <div className="card p-6"><h3 className="font-display font-bold">قنوات التوصيل</h3><div className="mt-4 space-y-3 text-sm">{['إشعارات المتصفح الفورية', 'ملخص أسبوعي بالإيميل', 'تنبيهات تيليجرام / واتساب'].map((c, i) => <div key={c} className="flex items-center justify-between"><span>{c}</span><Toggle checked={i < 2} onChange={() => undefined} /></div>)}</div></div>
          <div className="card p-6"><p className="flex items-center gap-2 text-sm font-bold text-gold"><Sparkles className="h-4 w-4" /> نصيحة سينمائية</p><p className="mt-2 text-xs leading-6 text-muted">إذا كان لديك فيلم في «قائمتي» ولا تملك وقتاً لمشاهدته، انقر على «تفعيل التنبيه» لمعرفة المنصة التالية المرشحة لاستقباله في مصر.</p></div>
        </aside>
      </div>

      <AlertSettingsModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}

function AlertSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rules, setRules] = useState({ any: true, mine: true, quality: true, expiry: true });
  const [ch, setCh] = useState({ push: true, email: true });
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); await meApi.saveAlerts('2', { ...rules, ...ch }); setSaving(false); onClose(); };

  const rows = [
    { k: 'any' as const, i: Radar, t: 'نبهني عند توفره على أي منصة بث قانونية (Any Platform)', d: 'فور إتاحة الفيلم على أي من المنصات المرخصة سواء باشتراك، شراء، أو استئجار رسمي.' },
    { k: 'mine' as const, i: Star, t: 'نبهني فقط عند توفره ضمن باقاتي ومنصاتي المشترك بها (My Platforms Only)', d: 'لا ترسل لي تنبيهاً إلا إذا نزل العمل على شاهد VIP، Watch It، أو المنصات التي أملك اشتراكاً مفعلاً فيها.', tag: 'يوفر عليك الشراء المنفصل' },
    { k: 'quality' as const, i: Sparkles, t: 'اشترط جودة 4K UHD & HDR فقط', d: 'تجاهل إشعارات نسخ الـ 1080p العادية، ونبهني فقط عند توفر النسخة الماستر فائقة الدقة بصوت محيطي نقي.' },
    { k: 'expiry' as const, i: Timer, t: 'تنبيه الحذف المبكر (هيتشال قريب)', d: 'أرسل لي إنذاراً عاجلاً قبل ١٤ يوماً من انتهاء ترخيص الفيلم وسحبه من أي منصة.', tag: 'حماية المشاهدة' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-bg/80 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} className="my-10 w-full max-w-4xl rounded-3xl bg-card">
            <div className="flex items-start justify-between p-8">
              <div><p className="flex items-center gap-1 text-xs font-bold text-gold"><Radar className="h-4 w-4" /> الرادار السينمائي المتقدم</p><h2 className="mt-2 font-display text-2xl font-bold">ضبط تنبيهات المتابعة الذكية لعمل: أوبنهايمر (Oppenheimer)</h2><p className="mt-1 text-sm text-muted">حدد متى وكيف ترغب بأن ننبهك فور حدوث أي تحديث على ترخيص أو جودة عرض هذا العمل عبر كافة المنصات.</p></div>
              <button onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-panel"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 bg-surface p-8">
              <div className="flex justify-between text-xs"><span className="text-muted">شروط وقواعد التنبيه (ALERT TRIGGERS)</span><span className="text-teal">● فحص لحظي مباشر (Real-time Synced)</span></div>
              {rows.map((r) => (
                <motion.div key={r.k} layout className={cn('flex items-center justify-between gap-4 p-5 transition-colors', rules[r.k] ? 'bg-panel' : 'bg-card')}>
                  <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bg"><r.i className="h-5 w-5 text-teal" /></span><div><b className="flex flex-wrap items-center gap-2">{r.t} {r.tag && <Badge tone={r.k === 'expiry' ? 'danger' : 'solidGold'}>{r.tag}</Badge>}</b><p className="mt-1 text-xs text-muted">{r.d}</p></div></div>
                  <Toggle checked={rules[r.k]} onChange={(v) => setRules({ ...rules, [r.k]: v })} />
                </motion.div>
              ))}
              <p className="pt-4 text-xs text-muted">قنوات استلام التنبيه (DELIVERY CHANNELS)</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between bg-panel p-5"><div className="flex items-center gap-3"><BellRing className="h-5 w-5 text-teal" /><div><b className="text-sm">إشعارات الموقع والتطبيق</b><p className="text-xs text-teal">إشعار فوري أساسي</p></div></div><Checkbox checked={ch.push} onChange={(v) => setCh({ ...ch, push: v })} /></div>
                <div className="flex items-center justify-between bg-panel p-5"><div className="flex items-center gap-3"><Mail className="h-5 w-5 text-muted" /><div><b className="text-sm">البريد الإلكتروني</b><p className="font-mono text-xs text-muted">ahmed.cinema@example.com</p></div></div><Checkbox checked={ch.email} onChange={(v) => setCh({ ...ch, email: v })} /></div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-8">
              <Button pill={false} loading={saving} onClick={save} icon={<Check className="h-4 w-4" />}>حفظ إعدادات التنبيه وتفعيل الرادار السينمائي</Button>
              <Button pill={false} variant="dark" onClick={onClose}>إلغاء الأمر</Button>
              <p className="w-full text-center text-xs text-muted"><AlertTriangle className="me-1 inline h-3.5 w-3.5" /> يمكنك تعديل أو إلغاء تنبيهاتك في أي وقت عبر صفحة <b className="text-teal">تنبيهاتي</b> في حسابك الشخصي.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
