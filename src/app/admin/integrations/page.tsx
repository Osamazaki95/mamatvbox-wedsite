'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Copy, CreditCard, Database, Link2, Loader2, Plug, RefreshCw, Save, Trash2, XCircle, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Counter } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge, Field, Toggle, inputClass } from '@/components/ui/primitives';
import { adminFetch } from '@/lib/admin';
import type { IntegrationStatus, SiteSettings, SyncLog } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const REGIONS = [
  ['EG', 'مصر'], ['SA', 'السعودية'], ['AE', 'الإمارات'], ['KW', 'الكويت'], ['QA', 'قطر'], ['BH', 'البحرين'],
  ['OM', 'عُمان'], ['JO', 'الأردن'], ['LB', 'لبنان'], ['MA', 'المغرب'], ['TN', 'تونس'], ['DZ', 'الجزائر'],
] as const;

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : 'لم تتم بعد');

function Status({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
  return (
    <div className="flex items-start gap-3 bg-card p-5">
      {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />}
      <div className="min-w-0"><b className="text-sm">{label}</b><p className="mt-1 break-words text-xs text-muted">{hint}</p></div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [data, setData] = useState<IntegrationStatus | null>(null);
  const [s, setS] = useState<SiteSettings | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncLog | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [origin, setOrigin] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2400); };
  const load = () => adminFetch<IntegrationStatus>('integrations').then((d) => { setData(d); setS(d.settings); });
  useEffect(() => { load(); setOrigin(window.location.origin); }, []);

  if (!data || !s) return <div className="skeleton h-96" />;

  const siteUrl = (data.siteUrl || origin).replace(/\/$/, '');
  const setSync = (patch: Partial<SiteSettings['sync']>) => setS({ ...s, sync: { ...s.sync, ...patch } });
  const setPay = (patch: Partial<SiteSettings['payments']>) => setS({ ...s, payments: { ...s.payments, ...patch } });
  const setIds = (k: keyof SiteSettings['payments']['integrationIds'], v: string) => setPay({ integrationIds: { ...s.payments.integrationIds, [k]: v } });
  const toggleRegion = (r: string) => setSync({ regions: s.sync.regions.includes(r) ? s.sync.regions.filter((x) => x !== r) : [...s.sync.regions, r] });

  const save = async () => {
    setSaving(true);
    await adminFetch('settings', { method: 'PUT', body: { sync: s.sync, payments: s.payments } });
    setSaving(false);
    flash('تم حفظ الإعدادات');
  };
  const syncNow = async () => {
    setSyncing(true);
    setResult(null);
    const r = await adminFetch<SyncLog>('sync', { method: 'POST' }).catch((e: Error) => ({ at: new Date().toISOString(), ok: false, message: e.message, scanned: 0, added: 0, updated: 0, newPlatforms: [] }));
    setResult(r);
    setSyncing(false);
    load();
  };
  const purgeDemo = async () => {
    if (!confirm('حذف كل الأعمال التجريبية والإبقاء على الأعمال المُزامنة فقط؟')) return;
    await adminFetch('titles/purge-demo', { method: 'POST' });
    flash('تم حذف البيانات التجريبية');
    load();
  };
  const copy = (v: string) => { navigator.clipboard?.writeText(v); flash('تم النسخ'); };

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-card p-5 sm:p-7">
        <Badge tone="teal"><Plug className="h-3 w-3" /> التكاملات</Badge>
        <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">المزامنة التلقائية والدفع</h1>
        <p className="mt-1 text-sm text-muted">من هنا تتحكم في جلب الأفلام والمسلسلات الجديدة تلقائياً من المنصات، وفي بوابة الدفع.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Status ok={data.tmdbConfigured} label="مصدر البيانات (TMDB)" hint={data.tmdbConfigured ? 'متصل — المزامنة جاهزة' : 'أضف TMDB_API_KEY في ملف api/config.php'} />
        <Status ok={data.paymobConfigured} label="بوابة الدفع Paymob" hint={data.paymobConfigured ? 'مفاتيح Paymob مضبوطة' : 'أضف PAYMOB_SECRET_KEY و PAYMOB_PUBLIC_KEY في api/config.php'} />
        <Status ok={data.hmacConfigured} label="تأمين إشعارات الدفع (HMAC)" hint={data.hmacConfigured ? 'مضبوط' : 'أضف PAYMOB_HMAC_SECRET في api/config.php'} />
        <Status ok={!!data.siteUrl} label="رابط الموقع SITE_URL" hint={data.siteUrl || 'أضف SITE_URL في api/config.php'} />
      </div>

      <section className="bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold"><RefreshCw className="h-5 w-5 text-teal" /> المزامنة التلقائية للمحتوى</h2>
            <p className="mt-1 text-sm text-muted">آخر مزامنة: <b className="text-ink">{fmt(data.lastRunAt)}</b>{data.running && <span className="text-gold"> — قيد التشغيل الآن</span>}</p>
          </div>
          <Button variant="teal" loading={syncing} onClick={syncNow} icon={<Zap className="h-4 w-4" />}>مزامنة الآن</Button>
        </div>

        <AnimatePresence>
          {(syncing || result) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className={cn('mt-5 p-4 text-sm', syncing ? 'bg-panel' : result?.ok ? 'bg-teal-soft text-teal' : 'bg-danger-soft text-danger')}>
                {syncing ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> جاري جلب الأعمال من المنصات... قد يستغرق دقيقة.</span> : result && (
                  <>
                    <b>{result.message}</b>
                    {result.ok && <p className="mt-1">جديد: {result.added} • محدّث: {result.updated}{result.newPlatforms.length > 0 && ` • منصات جديدة: ${result.newPlatforms.join('، ')}`}</p>}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex items-center justify-between gap-3 rounded-xl bg-panel p-4 text-sm"><span><b>تشغيل المزامنة التلقائية</b><span className="block text-xs text-muted">يعمل في الخلفية على السيرفر</span></span><Toggle checked={s.sync.enabled} onChange={(v) => setSync({ enabled: v })} /></label>
          <label className="flex items-center justify-between gap-3 rounded-xl bg-panel p-4 text-sm"><span><b>إضافة المنصات الجديدة تلقائياً</b><span className="block text-xs text-muted">تُضاف غير مفعّلة حتى توافق عليها</span></span><Toggle checked={s.sync.autoAddProviders} onChange={(v) => setSync({ autoAddProviders: v })} tone="gold" /></label>
          <Field label="تكرار المزامنة">
            <select value={s.sync.intervalHours} onChange={(e) => setSync({ intervalHours: Number(e.target.value) })} className={inputClass}>
              {[1, 3, 6, 12, 24].map((h) => <option key={h} value={h}>كل {h} {h === 1 ? 'ساعة' : 'ساعات'}</option>)}
            </select>
          </Field>
          <Field label="حجم المزامنة (كل صفحة = 20 فيلم + 20 مسلسل)">
            <input type="number" min={1} max={10} value={s.sync.pages} onChange={(e) => setSync({ pages: Math.max(1, Math.min(10, Number(e.target.value))) })} className={inputClass} />
          </Field>
        </div>
        <p className="mb-3 mt-6 text-xs text-muted">الدول التي يتم رصد التوفر فيها (الأولى هي الافتراضية للموقع):</p>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(([code, name]) => (
            <button key={code} onClick={() => toggleRegion(code)} className={cn('rounded-full border px-3.5 py-2 text-xs font-semibold transition', s.sync.regions.includes(code) ? 'border-teal bg-teal-soft text-teal' : 'border-line text-muted')}>{name} <span className="font-mono">{code}</span></button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="bg-card p-5 sm:p-7">
          <h2 className="font-display text-lg font-bold">سجل المزامنة</h2>
          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
            {data.logs.length === 0 && <p className="text-sm text-dim">لا توجد عمليات بعد</p>}
            {data.logs.map((l) => (
              <div key={l.at} className="flex items-start gap-3 bg-surface p-3 text-xs">
                {l.ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" /> : <XCircle className="h-4 w-4 shrink-0 text-danger" />}
                <div className="min-w-0"><b className="text-ink">{l.message}</b><p className="text-muted">{fmt(l.at)}{l.ok && ` • جديد ${l.added} • محدّث ${l.updated}`}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card p-5 sm:p-7">
          <h2 className="font-display text-lg font-bold">المزوّدون المكتشفون ({data.discovered.length})</h2>
          <p className="mt-1 text-xs text-muted">كل منصة ظهرت في البيانات برقمها. لربط رقم بمنصة موجودة أضفه في «أرقام TMDB» من صفحة المنصات.</p>
          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
            {data.discovered.length === 0 && <p className="text-sm text-dim">شغّل المزامنة لعرض المزوّدين</p>}
            {data.discovered.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-surface p-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.logo} alt="" className="h-8 w-8 shrink-0 rounded-lg" />
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <span className="font-mono text-xs text-muted">#{p.id}</span>
                {p.platformId ? <Badge tone="teal"><Link2 className="h-3 w-3" /> {p.platformId}</Badge> : <Badge>غير مربوط</Badge>}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-card p-5 sm:p-7">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><CreditCard className="h-5 w-5 text-gold" /> بوابة الدفع (Paymob)</h2>
        <p className="mt-1 text-sm text-muted">المفاتيح السرية تُكتب في ملف api/config.php فقط. هنا تضع أرقام وسائل الدفع (Integration IDs) من لوحة Paymob.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field label="Integration ID — البطاقات البنكية"><input dir="ltr" value={s.payments.integrationIds.card} onChange={(e) => setIds('card', e.target.value)} className={inputClass} placeholder="4xxxxxx" /></Field>
          <Field label="Integration ID — المحافظ الإلكترونية"><input dir="ltr" value={s.payments.integrationIds.wallet} onChange={(e) => setIds('wallet', e.target.value)} className={inputClass} placeholder="4xxxxxx" /></Field>
          <Field label="Integration ID — الدفع النقدي (Kiosk/أمان)"><input dir="ltr" value={s.payments.integrationIds.kiosk} onChange={(e) => setIds('kiosk', e.target.value)} className={inputClass} placeholder="4xxxxxx" /></Field>
          <Field label="العملة"><select value={s.payments.currency} onChange={(e) => setPay({ currency: e.target.value })} className={inputClass}>{['EGP', 'SAR', 'AED', 'OMR'].map((c) => <option key={c}>{c}</option>)}</select></Field>
          <label className="flex items-center justify-between gap-3 rounded-xl bg-panel p-4 text-sm md:col-span-2"><span><b>وضع الاختبار</b><span className="block text-xs text-muted">استخدم أرقام Integration الخاصة بـ Test Mode من Paymob</span></span><Toggle checked={s.payments.testMode} onChange={(v) => setPay({ testMode: v })} tone="gold" /></label>
        </div>
        <div className="mt-5 space-y-2">
          <p className="text-xs text-muted">ضع هذا الرابط في Paymob في خانتي Transaction processed callback و Transaction response callback:</p>
          <div className="flex items-center gap-2 bg-bg p-3"><code dir="ltr" className="min-w-0 flex-1 truncate text-left font-mono text-xs text-teal">{siteUrl}/api/payments/webhook</code><button onClick={() => copy(`${siteUrl}/api/payments/webhook`)} className="grid h-8 w-8 shrink-0 place-items-center bg-panel" aria-label="نسخ"><Copy className="h-4 w-4" /></button></div>
          <p className="text-xs text-muted">عدد عمليات الدفع المسجلة: <b className="text-ink"><Counter value={data.counts.payments} /></b></p>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 bg-card p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <Database className="mt-1 h-5 w-5 shrink-0 text-violet" />
          <div>
            <b>قاعدة البيانات</b>
            <p className="text-xs text-muted">إجمالي الأعمال <Counter value={data.counts.titles} /> • من المزامنة <Counter value={data.counts.synced} /> • تجريبية <Counter value={data.counts.demo} /></p>
          </div>
        </div>
        <Button variant="danger" pill={false} onClick={purgeDemo} disabled={data.counts.demo === 0} icon={<Trash2 className="h-4 w-4" />}>حذف الأعمال التجريبية</Button>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:right-[320px]">
        <div className="flex items-center justify-end gap-3 px-4 py-3 sm:px-6"><Button pill={false} loading={saving} onClick={save} icon={<Save className="h-4 w-4" />}>حفظ إعدادات المزامنة والدفع</Button></div>
      </div>

      <AnimatePresence>{toast && <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-teal px-5 py-3 text-sm font-bold text-bg">{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}
