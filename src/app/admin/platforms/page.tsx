'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Counter, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge, Field, Toggle, inputClass } from '@/components/ui/primitives';
import { adminFetch, kindLabels } from '@/lib/admin';
import type { Platform, PlatformKind } from '@/lib/api/types';
import { cn } from '@/lib/utils';

type Filter = PlatformKind | 'all' | 'auto' | 'inactive';

const blank: Platform = {
  id: '', name: '', nameAr: '', tagline: '', color: '#4FE3D0', priceMonthly: 0, currency: 'ج.م',
  maxQuality: '1080p FHD', hdr: null, audio: 'Stereo 2.0', screens: 1, offline: false, trialDays: 0,
  catalogSize: 0, kind: 'subscription', url: '', logo: '', active: true, tmdbProviderIds: [], regions: ['EG'],
};

export default function AdminPlatformsPage() {
  const [list, setList] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<{ p: Platform; isNew: boolean } | null>(null);
  const [confirmDel, setConfirmDel] = useState<Platform | null>(null);
  const [toast, setToast] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2400); };
  const load = () => adminFetch<Platform[]>('platforms').then(setList).catch(() => flash('تعذر تحميل المنصات')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const view = useMemo(() => list.filter((p) => {
    if (q && !`${p.name} ${p.nameAr} ${p.id}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === 'auto') return !!p.auto;
    if (filter === 'inactive') return p.active === false;
    if (filter !== 'all') return (p.kind ?? 'subscription') === filter;
    return true;
  }), [list, q, filter]);

  const stats = {
    total: list.length,
    active: list.filter((p) => p.active !== false).length,
    auto: list.filter((p) => p.auto && p.active === false).length,
    free: list.filter((p) => p.kind === 'free' || p.kind === 'ads').length,
  };

  const save = async (p: Platform, isNew: boolean) => {
    try {
      if (isNew) await adminFetch('platforms', { method: 'POST', body: p });
      else await adminFetch(`platforms/${p.id}`, { method: 'PUT', body: p });
      setEditing(null);
      flash(isNew ? 'تمت إضافة المنصة' : 'تم حفظ التعديلات');
      load();
    } catch (e) {
      flash(e instanceof Error && e.message === 'exists' ? 'هذا المعرّف مستخدم لمنصة أخرى' : 'تعذر الحفظ');
    }
  };

  const toggle = async (p: Platform) => {
    const active = p.active === false;
    setList((l) => l.map((x) => (x.id === p.id ? { ...x, active } : x)));
    await adminFetch(`platforms/${p.id}`, { method: 'PUT', body: { active } }).catch(() => flash('تعذر التحديث'));
  };

  const remove = async (p: Platform) => {
    await adminFetch(`platforms/${p.id}`, { method: 'DELETE' });
    setConfirmDel(null);
    setList((l) => l.filter((x) => x.id !== p.id));
    flash('تم حذف المنصة');
  };

  const filters: { k: Filter; l: string }[] = [
    { k: 'all', l: 'الكل' },
    ...(Object.keys(kindLabels) as PlatformKind[]).map((k) => ({ k, l: kindLabels[k] })),
    { k: 'auto', l: 'مكتشفة تلقائياً' },
    { k: 'inactive', l: 'غير مفعّلة' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 bg-card p-5 sm:p-7">
        <div>
          <Badge tone="teal" dot>إدارة المنصات والأسعار</Badge>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">المنصات المعروضة على الموقع</h1>
          <p className="mt-1 text-sm text-muted">أضف منصة، عدّل بياناتها، فعّل أو أوقف ظهورها، أو احذفها. المنصات الجديدة التي تكتشفها المزامنة تظهر هنا غير مفعّلة حتى توافق عليها.</p>
        </div>
        <Button onClick={() => setEditing({ p: { ...blank }, isNew: true })} icon={<Plus className="h-4 w-4" />}>إضافة منصة جديدة</Button>
      </div>

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: 'إجمالي المنصات', v: stats.total },
          { l: 'مفعّلة على الموقع', v: stats.active, c: 'text-teal' },
          { l: 'بانتظار موافقتك', v: stats.auto, c: 'text-gold' },
          { l: 'مجانية قانونية', v: stats.free },
        ].map((k) => (
          <StaggerItem key={k.l} className="bg-card p-5"><p className="text-xs text-muted">{k.l}</p><p className={cn('mt-2 font-display text-3xl font-extrabold', k.c)}><Counter value={k.v} /></p></StaggerItem>
        ))}
      </Stagger>

      <div className="flex flex-col gap-3 bg-card p-4 lg:flex-row lg:items-center">
        <div className="flex h-11 flex-1 items-center gap-2 rounded-full bg-panel px-4"><Search className="h-4 w-4 shrink-0 text-dim" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم المنصة أو المعرّف..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {filters.map((f) => (
            <button key={f.k} onClick={() => setFilter(f.k)} className={cn('relative shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold', filter === f.k ? 'text-bg' : 'bg-panel text-muted')}>
              {filter === f.k && <motion.span layoutId="pf" className="absolute inset-0 rounded-full bg-teal" />}<span className="relative">{f.l}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-52" />)}</div>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {view.map((p) => (
              <motion.div layout key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={cn('flex flex-col bg-card p-5', p.active === false && 'opacity-70')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {p.logo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.logo} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                      : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-bold" style={{ background: `${p.color}22`, color: p.color }}>{p.name[0]}</span>}
                    <div className="min-w-0"><b className="block truncate font-display text-lg">{p.nameAr || p.name}</b><p className="truncate font-mono text-xs text-muted">{p.id}</p></div>
                  </div>
                  <Toggle checked={p.active !== false} onChange={() => toggle(p)} label="تفعيل" />
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Badge tone={p.kind === 'free' || p.kind === 'ads' ? 'teal' : p.kind === 'rental' ? 'violet' : 'gold'}>{kindLabels[p.kind ?? 'subscription']}</Badge>
                  {p.auto && <Badge tone="gold"><Sparkles className="h-3 w-3" /> مكتشفة تلقائياً</Badge>}
                  {p.active === false && <Badge>مخفية</Badge>}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-surface p-2.5"><dt className="text-muted">السعر الشهري</dt><dd className="font-bold text-gold">{p.priceMonthly ? `${p.priceMonthly} ${p.currency}` : 'مجاني / حسب العمل'}</dd></div>
                  <div className="bg-surface p-2.5"><dt className="text-muted">أقصى جودة</dt><dd className="font-bold">{p.maxQuality}</dd></div>
                  <div className="col-span-2 bg-surface p-2.5"><dt className="text-muted">أرقام TMDB للمزامنة</dt><dd className="font-mono">{p.tmdbProviderIds?.length ? p.tmdbProviderIds.join(', ') : '—  (لن تُربط تلقائياً)'}</dd></div>
                </dl>
                <div className="mt-4 flex gap-2 pt-1">
                  <Button size="sm" variant="ghost" pill={false} className="flex-1" onClick={() => setEditing({ p, isNew: false })} icon={<Pencil className="h-3.5 w-3.5" />}>تعديل</Button>
                  {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="grid h-8 w-9 place-items-center rounded-lg bg-panel" aria-label="فتح الموقع"><ExternalLink className="h-3.5 w-3.5" /></a>}
                  <button onClick={() => setConfirmDel(p)} className="grid h-8 w-9 place-items-center rounded-lg bg-danger-soft text-danger" aria-label="حذف"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {view.length === 0 && <p className="col-span-full bg-card p-10 text-center text-muted">لا توجد منصات مطابقة</p>}
        </motion.div>
      )}

      <AnimatePresence>{editing && <PlatformForm key="form" initial={editing.p} isNew={editing.isNew} onClose={() => setEditing(null)} onSave={save} />}</AnimatePresence>

      <AnimatePresence>
        {confirmDel && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-bg/80 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.94 }} animate={{ scale: 1 }} className="w-full max-w-md bg-card p-6">
              <h3 className="font-display text-xl font-bold">حذف «{confirmDel.nameAr || confirmDel.name}»؟</h3>
              <p className="mt-2 text-sm text-muted">ستُحذف المنصة وتُزال من كل الأعمال المرتبطة بها. إذا كنت تريد إخفاءها مؤقتاً استخدم زر التفعيل بدلاً من الحذف.</p>
              <div className="mt-6 flex gap-2"><Button variant="danger" pill={false} onClick={() => remove(confirmDel)} icon={<Trash2 className="h-4 w-4" />}>حذف نهائي</Button><Button variant="dark" pill={false} onClick={() => setConfirmDel(null)}>إلغاء</Button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{toast && <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-teal px-5 py-3 text-sm font-bold text-bg shadow-teal">{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

function PlatformForm({ initial, isNew, onClose, onSave }: { initial: Platform; isNew: boolean; onClose: () => void; onSave: (p: Platform, isNew: boolean) => Promise<void> }) {
  const [f, setF] = useState<Platform>(initial);
  const [ids, setIds] = useState((initial.tmdbProviderIds ?? []).join(', '));
  const [regions, setRegions] = useState((initial.regions ?? ['EG']).join(', '));
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Platform>(k: K, v: Platform[K]) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await onSave({
      ...f,
      tmdbProviderIds: ids.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n) && n > 0),
      regions: regions.split(/[,\s]+/).map((r) => r.trim().toUpperCase()).filter(Boolean),
      auto: false,
    }, isNew);
    setBusy(false);
  };

  const text = (k: keyof Platform, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field label={label}><input value={String(f[k] ?? '')} onChange={(e) => set(k, e.target.value as never)} className={inputClass} {...props} /></Field>
  );
  const num = (k: keyof Platform, label: string) => (
    <Field label={label}><input type="number" min={0} value={Number(f[k] ?? 0)} onChange={(e) => set(k, Number(e.target.value) as never)} className={inputClass} /></Field>
  );

  return (
    <motion.div className="fixed inset-0 z-50 overflow-y-auto bg-bg/80 p-3 backdrop-blur sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.form onSubmit={submit} initial={{ y: 30, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} className="mx-auto my-6 w-full max-w-3xl bg-card">
        <div className="flex items-center justify-between border-b border-line/60 p-5">
          <h2 className="font-display text-xl font-bold">{isNew ? 'إضافة منصة جديدة' : `تعديل: ${initial.nameAr || initial.name}`}</h2>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-panel" aria-label="إغلاق"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {text('nameAr', 'اسم المنصة بالعربية', { required: true, placeholder: 'مثال: شاهد VIP' })}
          {text('name', 'اسم المنصة بالإنجليزية', { required: true, placeholder: 'Shahid VIP' })}
          {isNew ? text('id', 'المعرّف (بالإنجليزية بدون مسافات)', { placeholder: 'shahid' }) : <Field label="المعرّف"><input disabled value={f.id} className={`${inputClass} opacity-60`} /></Field>}
          <Field label="نوع المنصة">
            <select value={f.kind ?? 'subscription'} onChange={(e) => set('kind', e.target.value as PlatformKind)} className={inputClass}>
              {(Object.keys(kindLabels) as PlatformKind[]).map((k) => <option key={k} value={k}>{kindLabels[k]}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">{text('tagline', 'وصف قصير يظهر تحت الاسم', { placeholder: 'الأرشيف المصري والدراما الحية' })}</div>
          {text('url', 'رابط الموقع الرسمي', { type: 'url', dir: 'ltr', placeholder: 'https://' })}
          {text('logo', 'رابط الشعار (صورة)', { dir: 'ltr', placeholder: 'https://.../logo.png' })}
          {num('priceMonthly', 'السعر الشهري (0 = مجاني)')}
          {text('currency', 'العملة المعروضة')}
          {text('maxQuality', 'أقصى جودة', { placeholder: '4K UHD' })}
          <Field label="تقنية HDR"><input value={f.hdr ?? ''} onChange={(e) => set('hdr', e.target.value || null)} className={inputClass} placeholder="Dolby Vision / HDR10" /></Field>
          {text('audio', 'الصوت', { placeholder: 'Dolby Atmos' })}
          {num('screens', 'عدد الشاشات المتزامنة')}
          {num('trialDays', 'أيام التجربة المجانية')}
          <Field label="لون المنصة"><div className="flex gap-2"><input type="color" value={f.color} onChange={(e) => set('color', e.target.value)} className="h-12 w-14 cursor-pointer rounded-xl bg-panel p-1" /><input dir="ltr" value={f.color} onChange={(e) => set('color', e.target.value)} className={inputClass} /></div></Field>
          <Field label="أرقام مزوّد TMDB (مفصولة بفاصلة)" hint={<span className="text-teal">تربط المزامنة التلقائية</span>}><input dir="ltr" value={ids} onChange={(e) => setIds(e.target.value)} className={inputClass} placeholder="8, 1715" /></Field>
          <Field label="الدول (أكواد مفصولة بفاصلة)"><input dir="ltr" value={regions} onChange={(e) => setRegions(e.target.value)} className={inputClass} placeholder="EG, SA, AE" /></Field>
          <label className="flex items-center justify-between gap-3 rounded-xl bg-panel p-4 text-sm">متاح التنزيل بدون إنترنت<Toggle checked={f.offline} onChange={(v) => set('offline', v)} /></label>
          <label className="flex items-center justify-between gap-3 rounded-xl bg-panel p-4 text-sm">ظاهرة على الموقع<Toggle checked={f.active !== false} onChange={(v) => set('active', v)} tone="gold" /></label>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-line/60 p-5">
          <Button type="button" variant="dark" pill={false} onClick={onClose}>إلغاء</Button>
          <Button pill={false} loading={busy}>{isNew ? 'إضافة المنصة' : 'حفظ التعديلات'}</Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
