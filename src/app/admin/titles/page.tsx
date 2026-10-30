'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Baby, Check, Clapperboard, Eye, ExternalLink, Globe2, ImagePlus, Link2, Loader2, Mic, Moon, Pencil, Plus, Search, Tags, Trash2, Tv, UploadCloud, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Counter, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge, Field, Toggle, inputClass } from '@/components/ui/primitives';
import { adminFetch } from '@/lib/admin';
import type { Platform, SiteSettings, Taxonomy, Title, TitleType } from '@/lib/api/types';
import { defaultTaxonomy, hasGenre } from '@/lib/site-defaults';
import { cn, toArabicDigits } from '@/lib/utils';

const types: { k: TitleType; l: string; icon: typeof Tv }[] = [
  { k: 'movie', l: 'فيلم', icon: Clapperboard },
  { k: 'series', l: 'مسلسل', icon: Tv },
  { k: 'kids', l: 'كرتون', icon: Baby },
  { k: 'program', l: 'برنامج', icon: Mic },
];
const typeLabel = Object.fromEntries(types.map((t) => [t.k, t.l])) as Record<TitleType, string>;
const qualities = ['4K UHD', '4K HDR', 'IMAX 4K', '1080p FHD', 'HD 720p'];

interface Form {
  id?: string; type: TitleType; title: string; originalTitle: string; slug: string; year: number;
  genres: string[]; origin: string; ramadan: boolean; rating: number; runtime: string; quality: string; overview: string; director: string;
  cast: string; poster: string; platforms: string[]; links: Record<string, string>;
  download: boolean; inPlan: boolean; expiresInDays: number | '';
}

const emptyForm = (): Form => ({
  type: 'movie', title: '', originalTitle: '', slug: '', year: new Date().getFullYear(), genres: [], origin: '', ramadan: false, rating: 0,
  runtime: '', quality: '1080p FHD', overview: '', director: '', cast: '', poster: '', platforms: [], links: {},
  download: false, inPlan: false, expiresInDays: '',
});

const toForm = (t: Title): Form => ({
  id: t.id, type: t.type, title: t.title, originalTitle: t.originalTitle ?? '', slug: t.slug, year: t.year,
  genres: t.genres, origin: t.origin ?? '', ramadan: !!t.ramadan, rating: t.rating, runtime: t.runtime, quality: t.quality, overview: t.overview,
  director: t.director, cast: t.cast.join('، '), poster: t.poster ?? '', platforms: t.platforms, links: t.links ?? {},
  download: t.download, inPlan: t.inPlan, expiresInDays: t.expiresInDays ?? '',
});

const errors: Record<string, string> = {
  title_required: 'اكتب اسم العمل',
  platforms_required: 'اختار منصة واحدة على الأقل',
  too_large: 'حجم الصورة أكبر من ٥ ميجا',
  invalid_type: 'الصورة لازم تكون JPG أو PNG أو WEBP',
  cannot_create_dir: 'تعذر إنشاء مجلد الصور على السيرفر',
};

async function uploadPoster(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  if (res.status === 401) { window.location.href = '/admin-login/'; throw new Error('unauthorized'); }
  const d = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !d.url) throw new Error(d.error ?? 'upload_failed');
  return d.url;
}

export default function AdminTitlesPage() {
  const [titles, setTitles] = useState<Title[] | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [taxonomy, setTaxonomy] = useState<Taxonomy>(defaultTaxonomy);
  const [q, setQ] = useState('');
  const [type, setType] = useState<TitleType | 'all'>('all');
  const [originF, setOriginF] = useState('');
  const [ramadanF, setRamadanF] = useState(false);
  const [bulkOrigin, setBulkOrigin] = useState('');
  const [editing, setEditing] = useState<Form | null>(null);
  const [confirmDel, setConfirmDel] = useState<Title | null>(null);
  const [toast, setToast] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkType, setBulkType] = useState<TitleType>('series');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState<'delete' | 'delete-all' | null>(null);

  const toggleSel = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const bulk = async (action: 'delete' | 'type' | 'delete-all' | 'ramadan-on' | 'ramadan-off' | 'origin', ids: string[] = [...selected], type?: TitleType, origin?: string) => {
    setBulkBusy(true);
    try {
      const r = await adminFetch<{ affected: number }>('titles/bulk', { method: 'POST', body: { action, ids, type, origin } });
      flash(action === 'type' ? `تم نقل ${r.affected} عمل إلى «${typeLabel[type as TitleType]}»`
        : action === 'ramadan-on' ? `تمت إضافة ${r.affected} عمل لقسم رمضان`
          : action === 'ramadan-off' ? `تمت إزالة ${r.affected} عمل من قسم رمضان`
            : action === 'origin' ? `تم تصنيف ${r.affected} عمل «${origin || 'بدون بلد'}»`
              : `تم حذف ${r.affected} عمل`);
      if (action === 'type') setTitles((l) => (l ?? []).map((t) => (ids.includes(t.id) ? { ...t, type: type as TitleType } : t)));
      else if (action === 'ramadan-on' || action === 'ramadan-off') setTitles((l) => (l ?? []).map((t) => (ids.includes(t.id) ? { ...t, ramadan: action === 'ramadan-on' } : t)));
      else if (action === 'origin') setTitles((l) => (l ?? []).map((t) => (ids.includes(t.id) ? { ...t, origin: origin || null } : t)));
      else if (action === 'delete-all') setTitles([]);
      else setTitles((l) => (l ?? []).filter((t) => !ids.includes(t.id)));
      if (action === 'delete' || action === 'delete-all') setSelected(new Set());
    } catch {
      flash('تعذر تنفيذ العملية');
    } finally {
      setBulkBusy(false);
      setConfirmBulk(null);
    }
  };

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };
  const load = () => Promise.all([adminFetch<Title[]>('titles'), adminFetch<Platform[]>('platforms'), adminFetch<SiteSettings>('settings')])
    .then(([t, p, s]) => { setTitles(t); setPlatforms(p); if (s.taxonomy) setTaxonomy(s.taxonomy); })
    .catch(() => flash('تعذر تحميل البيانات'));

  useEffect(() => {
    load();
    if (new URLSearchParams(window.location.search).has('new')) setEditing(emptyForm());
  }, []);

  const pName = (id: string) => { const p = platforms.find((x) => x.id === id); return p ? p.nameAr || p.name : id; };
  const list = titles ?? [];
  const view = useMemo(() => list.filter((t) =>
    (type === 'all' || t.type === type) &&
    (!originF || (originF === '-' ? !t.origin : t.origin === originF)) &&
    (!ramadanF || t.ramadan) &&
    (!q || `${t.title} ${t.originalTitle ?? ''}`.toLowerCase().includes(q.toLowerCase()))), [list, q, type, originF, ramadanF]);
  const allOrigins = useMemo(() => [...new Set([...Object.values(taxonomy).flatMap((g) => g.origins), ...list.map((t) => t.origin).filter((o): o is string => !!o)])], [taxonomy, list]);
  const originChoices = type === 'all' ? allOrigins : taxonomy[type].origins;
  const count = (k: TitleType) => list.filter((t) => t.type === k).length;

  const remove = async (t: Title) => {
    await adminFetch(`titles/${t.id}`, { method: 'DELETE' });
    setConfirmDel(null);
    setTitles((l) => (l ?? []).filter((x) => x.id !== t.id));
    flash('تم الحذف');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 bg-card p-5 sm:p-7">
        <div>
          <Badge tone="gold">إدارة المحتوى</Badge>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">الأفلام والمسلسلات والكرتون والبرامج</h1>
          <p className="mt-1 text-sm text-muted">أضف أي عمل بإيدك: الاسم، البوستر، المنصات، والرابط الرسمي على كل منصة.</p>
        </div>
        <div className="flex flex-wrap gap-2"><Button variant="ghost" href="/admin/import/" icon={<UploadCloud className="h-4 w-4" />}>استيراد جماعي من رابط</Button><Button onClick={() => setEditing(emptyForm())} icon={<Plus className="h-4 w-4" />}>إضافة عمل جديد</Button></div>
      </div>

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[{ l: 'الإجمالي', v: list.length, c: 'text-gold' }, ...types.map((t) => ({ l: t.l, v: count(t.k), c: '' }))].map((k) => (
          <StaggerItem key={k.l} className="bg-card p-5"><p className="text-xs text-muted">{k.l}</p><p className={cn('mt-2 font-display text-3xl font-extrabold', k.c)}><Counter value={k.v} /></p></StaggerItem>
        ))}
      </Stagger>

      <div className="flex flex-col gap-3 bg-card p-4 lg:flex-row lg:items-center">
        <div className="flex h-11 flex-1 items-center gap-2 rounded-full bg-panel px-4"><Search className="h-4 w-4 shrink-0 text-dim" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم العمل..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {[{ k: 'all' as const, l: 'الكل' }, ...types].map((f) => (
            <button key={f.k} onClick={() => setType(f.k)} className={cn('relative shrink-0 rounded-full px-4 py-2 text-xs font-semibold', type === f.k ? 'text-bg' : 'bg-panel text-muted')}>
              {type === f.k && <motion.span layoutId="tt" className="absolute inset-0 rounded-full bg-teal" />}<span className="relative">{f.l}</span>
            </button>
          ))}
        </div>
        <div className="flex shrink-0 gap-2">
          <select value={originF} onChange={(e) => setOriginF(e.target.value)} className="h-10 rounded-full bg-panel px-4 text-xs outline-none" aria-label="البلد">
            <option value="">كل البلاد</option>
            {originChoices.map((o) => <option key={o} value={o}>{o}</option>)}
            <option value="-">بدون تصنيف بلد</option>
          </select>
          <button onClick={() => setRamadanF((v) => !v)} className={cn('flex h-10 items-center gap-1.5 rounded-full px-4 text-xs font-semibold', ramadanF ? 'bg-gold text-bg' : 'bg-panel text-muted')}><Moon className="h-3.5 w-3.5" /> رمضان</button>
        </div>
      </div>

      {titles !== null && list.length > 0 && (
        <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 bg-card/95 p-3 backdrop-blur sm:top-20 sm:p-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-panel px-3 py-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-[#4FE3D0]" checked={view.length > 0 && view.every((t) => selected.has(t.id))} onChange={(e) => setSelected(e.target.checked ? new Set(view.map((t) => t.id)) : new Set())} />
            تحديد الكل ({view.length})
          </label>
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-wrap items-center gap-2">
                <Badge tone="gold">محدد: {selected.size}</Badge>
                <span className="text-xs text-muted">نقل إلى</span>
                <select value={bulkType} onChange={(e) => setBulkType(e.target.value as TitleType)} className="h-9 rounded-lg bg-panel px-3 text-sm outline-none">
                  {types.map((t) => <option key={t.k} value={t.k}>{t.l}</option>)}
                </select>
                <Button size="sm" variant="teal" pill={false} loading={bulkBusy} onClick={() => bulk('type', [...selected], bulkType)}>نقل</Button>
                <span className="mx-1 h-6 w-px bg-line" />
                <select value={bulkOrigin} onChange={(e) => setBulkOrigin(e.target.value)} className="h-9 rounded-lg bg-panel px-3 text-sm outline-none" aria-label="البلد">
                  <option value="">البلد: بدون</option>
                  {allOrigins.map((o) => <option key={o} value={o}>البلد: {o}</option>)}
                </select>
                <Button size="sm" variant="ghost" pill={false} loading={bulkBusy} onClick={() => bulk('origin', [...selected], undefined, bulkOrigin)} icon={<Globe2 className="h-3.5 w-3.5" />}>تطبيق</Button>
                <Button size="sm" variant="ghost" pill={false} onClick={() => bulk('ramadan-on')} icon={<Moon className="h-3.5 w-3.5 text-gold" />}>إضافة لرمضان</Button>
                <Button size="sm" variant="ghost" pill={false} onClick={() => bulk('ramadan-off')}>إزالة من رمضان</Button>
                <Button size="sm" variant="danger" pill={false} onClick={() => setConfirmBulk('delete')} icon={<Trash2 className="h-3.5 w-3.5" />}>حذف المحدد</Button>
                <button onClick={() => setSelected(new Set())} className="text-xs text-muted underline">إلغاء التحديد</button>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setConfirmBulk('delete-all')} className="ms-auto flex items-center gap-1.5 rounded-lg bg-danger-soft px-3 py-2 text-xs font-semibold text-danger"><Trash2 className="h-3.5 w-3.5" /> حذف الكل</button>
        </div>
      )}

      {titles === null ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton aspect-[2/3]" />)}</div>
      ) : view.length === 0 ? (
        <div className="bg-card p-10 text-center sm:p-16">
          <ImagePlus className="mx-auto h-12 w-12 text-gold" />
          <h2 className="mt-4 font-display text-xl font-bold">{list.length ? 'لا توجد نتائج مطابقة' : 'لسه مفيش أعمال'}</h2>
          <p className="mt-2 text-sm text-muted">{list.length ? 'جرّب كلمة بحث أو تصنيف تاني.' : 'ابدأ بإضافة أول فيلم أو مسلسل.'}</p>
          {!list.length && <Button className="mt-6" onClick={() => setEditing(emptyForm())} icon={<Plus className="h-4 w-4" />}>إضافة أول عمل</Button>}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          <AnimatePresence>
            {view.map((t) => (
              <motion.div layout key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={cn('group flex flex-col overflow-hidden bg-card transition', selected.has(t.id) && 'ring-2 ring-teal')}>
                <div className="relative aspect-[2/3] bg-panel">
                  {t.poster
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={t.poster} alt={t.title} className="h-full w-full object-cover" loading="lazy" />
                    : <div className="grid h-full place-items-center p-3 text-center font-display font-bold text-muted">{t.title}</div>}
                  <label className="absolute right-2 top-2 grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-bg/80 backdrop-blur" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="h-4 w-4 accent-[#4FE3D0]" checked={selected.has(t.id)} onChange={() => toggleSel(t.id)} aria-label="تحديد" />
                  </label>
                  <Badge tone="solidGold" className="absolute bottom-2 right-2">{typeLabel[t.type]}</Badge>
                  {t.source === 'tmdb' && <Badge className="absolute left-2 top-2 bg-bg/80">مزامنة</Badge>}
                  {t.ramadan && <span className="absolute bottom-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-gold text-bg" title="رمضان"><Moon className="h-3.5 w-3.5" /></span>}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <b className="truncate text-sm">{t.title}</b>
                  <p className="mt-0.5 truncate text-xs text-muted">{t.year} • {t.platforms.map(pName).join('، ') || 'بدون منصات'}</p>
                  <p className="mt-1 flex items-center justify-between gap-2 text-[11px]">
                    <span className={cn('truncate', t.origin ? 'text-teal' : 'text-dim')}>{t.origin || 'بدون بلد'}</span>
                    <span className="flex shrink-0 items-center gap-1 text-muted" title="عدد المشاهدات"><Eye className="h-3 w-3" /> {toArabicDigits(t.views ?? 0)}</span>
                  </p>
                  <select value={t.type} onChange={(e) => bulk('type', [t.id], e.target.value as TitleType)} className="mt-2 h-8 rounded-lg bg-surface px-2 text-xs outline-none" aria-label="القسم">
                    {types.map((x) => <option key={x.k} value={x.k}>القسم: {x.l}</option>)}
                  </select>
                  <div className="mt-3 flex gap-1.5">
                    <button onClick={() => setEditing(toForm(t))} className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-panel text-xs font-semibold hover:bg-line"><Pencil className="h-3.5 w-3.5" /> تعديل</button>
                    <a href={`/title/${t.slug}/`} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-lg bg-panel" aria-label="عرض"><ExternalLink className="h-3.5 w-3.5" /></a>
                    <button onClick={() => setConfirmDel(t)} className="grid h-8 w-8 place-items-center rounded-lg bg-danger-soft text-danger" aria-label="حذف"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {editing && (
          <TitleForm
            key="form"
            initial={editing}
            platforms={platforms}
            taxonomy={taxonomy}
            onClose={() => setEditing(null)}
            onSaved={(msg) => { setEditing(null); flash(msg); load(); }}
            onError={flash}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmBulk && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-bg/80 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.94 }} animate={{ scale: 1 }} className="w-full max-w-md bg-card p-6">
              <h3 className="font-display text-xl font-bold">{confirmBulk === 'delete-all' ? `حذف كل الأعمال (${list.length})؟` : `حذف ${selected.size} عمل؟`}</h3>
              <p className="mt-2 text-sm text-muted">{confirmBulk === 'delete-all' ? 'كل الأفلام والمسلسلات والكرتون والبرامج هتتشال من الموقع نهائياً. المنصات والإعدادات مش هتتأثر.' : 'الأعمال المحددة هتتشال من الموقع نهائياً.'}</p>
              <div className="mt-6 flex gap-2">
                <Button variant="danger" pill={false} loading={bulkBusy} onClick={() => bulk(confirmBulk)} icon={<Trash2 className="h-4 w-4" />}>تأكيد الحذف</Button>
                <Button variant="dark" pill={false} onClick={() => setConfirmBulk(null)}>إلغاء</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDel && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-bg/80 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.94 }} animate={{ scale: 1 }} className="w-full max-w-md bg-card p-6">
              <h3 className="font-display text-xl font-bold">حذف «{confirmDel.title}»؟</h3>
              <p className="mt-2 text-sm text-muted">هيتشال من الموقع نهائياً.</p>
              <div className="mt-6 flex gap-2"><Button variant="danger" pill={false} onClick={() => remove(confirmDel)} icon={<Trash2 className="h-4 w-4" />}>حذف</Button><Button variant="dark" pill={false} onClick={() => setConfirmDel(null)}>إلغاء</Button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{toast && <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-teal px-5 py-3 text-sm font-bold text-bg shadow-teal">{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

function TitleForm({ initial, platforms, taxonomy, onClose, onSaved, onError }: {
  initial: Form; platforms: Platform[]; taxonomy: Taxonomy; onClose: () => void; onSaved: (msg: string) => void; onError: (m: string) => void;
}) {
  const [genreInput, setGenreInput] = useState('');
  const [f, setF] = useState<Form>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = !initial.id;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  const togglePlatform = (id: string) => setF((s) => ({ ...s, platforms: s.platforms.includes(id) ? s.platforms.filter((x) => x !== id) : [...s.platforms, id] }));

  const onFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setErr('');
    try { set('poster', await uploadPoster(file)); }
    catch (e) { setErr(errors[(e as Error).message] ?? 'تعذر رفع الصورة'); }
    finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim() && !f.originalTitle.trim()) { setErr(errors.title_required); return; }
    if (!f.platforms.length) { setErr(errors.platforms_required); return; }
    setBusy(true);
    setErr('');
    try {
      const body = { ...f, title: f.title.trim() || f.originalTitle.trim(), originalTitle: f.title.trim() ? f.originalTitle : '', expiresInDays: f.expiresInDays || 0 };
      if (isNew) await adminFetch('titles', { method: 'POST', body });
      else await adminFetch(`titles/${f.id}`, { method: 'PUT', body });
      onSaved(isNew ? 'تمت الإضافة ونُشر على الموقع' : 'تم حفظ التعديلات');
    } catch (e2) {
      const m = errors[(e2 as Error).message] ?? 'تعذر الحفظ';
      setErr(m);
      onError(m);
    } finally { setBusy(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-50 overflow-y-auto bg-bg/85 p-2 backdrop-blur sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.form onSubmit={submit} initial={{ y: 30, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} className="mx-auto my-4 w-full max-w-5xl bg-card sm:my-6">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line/60 bg-card p-4 sm:p-5">
          <h2 className="font-display text-lg font-bold sm:text-xl">{isNew ? 'إضافة عمل جديد' : `تعديل: ${initial.title}`}</h2>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-panel" aria-label="إغلاق"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-8 p-4 sm:p-6">
          <section>
            <p className="mb-3 text-sm font-bold">نوع العمل</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {types.map((t) => (
                <button type="button" key={t.k} onClick={() => set('type', t.k)} className={cn('flex h-14 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition', f.type === t.k ? 'border-gold bg-gold-soft text-gold' : 'border-line bg-panel text-muted hover:text-ink')}>
                  <t.icon className="h-5 w-5" /> {t.l}
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-5 rounded-xl bg-surface p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Globe2 className="h-4 w-4 text-teal" /> البلد / الأصل</p>
              <div className="flex flex-wrap gap-2">
                {[...new Set([...taxonomy[f.type].origins, ...(f.origin && !taxonomy[f.type].origins.includes(f.origin) ? [f.origin] : [])])].map((o) => (
                  <button type="button" key={o} onClick={() => set('origin', f.origin === o ? '' : o)} className={cn('rounded-full px-3.5 py-1.5 text-xs font-semibold transition', f.origin === o ? 'bg-teal text-bg' : 'bg-panel text-muted hover:text-ink')}>{o}</button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-dim">القوائم دي بتتعدل من صفحة «التصنيفات».</p>
              <label className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-panel p-3 text-sm">
                <span className="flex items-center gap-2"><Moon className="h-4 w-4 text-gold" /> يظهر في قسم رمضان</span>
                <Toggle checked={f.ramadan} onChange={(v) => set('ramadan', v)} tone="gold" />
              </label>
            </div>
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Tags className="h-4 w-4 text-gold" /> النوع <span className="text-xs font-normal text-muted">(اختار واحد أو أكتر)</span></p>
              <div className="flex flex-wrap gap-2">
                {[...new Set([...taxonomy[f.type].genres, ...f.genres.filter((g) => !taxonomy[f.type].genres.some((x) => hasGenre([g], x)))])].map((g) => {
                  const on = f.genres.some((x) => hasGenre([x], g));
                  return (
                    <button type="button" key={g} onClick={() => set('genres', on ? f.genres.filter((x) => !hasGenre([x], g)) : [...f.genres, g])} className={cn('flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition', on ? 'bg-gold text-bg' : 'bg-panel text-muted hover:text-ink')}>
                      {on && <Check className="h-3 w-3" />}{g}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <input value={genreInput} onChange={(e) => setGenreInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const g = genreInput.trim(); if (g && !f.genres.includes(g)) set('genres', [...f.genres, g]); setGenreInput(''); } }} placeholder="نوع تاني مش في القائمة؟ اكتبه واضغط Enter" className="h-10 min-w-0 flex-1 rounded-lg bg-panel px-3 text-xs outline-none" />
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div>
              <p className="mb-3 text-sm font-bold">البوستر</p>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
                className={cn('relative mx-auto aspect-[2/3] w-44 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition md:w-full', drag ? 'border-teal bg-teal-soft' : 'border-line bg-panel hover:border-teal/60')}
              >
                {f.poster
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={f.poster} alt="" className="h-full w-full object-cover" />
                  : <div className="grid h-full place-items-center p-4 text-center text-xs text-muted"><div><UploadCloud className="mx-auto mb-2 h-8 w-8 text-teal" />اضغط أو اسحب صورة هنا<br />JPG / PNG / WEBP — حتى ٥ ميجا</div></div>}
                {uploading && <div className="absolute inset-0 grid place-items-center bg-bg/70"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
              <input dir="ltr" value={f.poster} onChange={(e) => set('poster', e.target.value)} placeholder="أو الصق رابط صورة https://..." className={`${inputClass} mt-3 h-10 text-xs`} />
              {f.poster && <button type="button" onClick={() => set('poster', '')} className="mt-2 text-xs text-danger">إزالة البوستر</button>}
            </div>

            <div className="grid content-start gap-4 sm:grid-cols-2">
              <Field label={<>اسم العمل <span className="text-gold">*</span></>} hint={<span className="text-dim">بأي لغة</span>}><input value={f.title} onChange={(e) => set('title', e.target.value)} className={inputClass} placeholder="الحريفة أو El Harifa" /></Field>
              <Field label="اسم بديل" hint={<span className="text-dim">اختياري</span>}><input value={f.originalTitle} onChange={(e) => set('originalTitle', e.target.value)} className={inputClass} placeholder="الاسم بلغة تانية لو حابب" /></Field>
              <Field label="رابط الصفحة (إنجليزي بدون مسافات)" hint={<span className="text-dim">اختياري</span>}><input dir="ltr" value={f.slug} onChange={(e) => set('slug', e.target.value)} className={inputClass} placeholder="el-harifa" /></Field>
              <Field label="سنة الإنتاج"><input type="number" min={1900} max={2100} value={f.year} onChange={(e) => set('year', Number(e.target.value))} className={inputClass} /></Field>
              <Field label="التقييم من ١٠"><input type="number" min={0} max={10} step={0.1} value={f.rating} onChange={(e) => set('rating', Number(e.target.value))} className={inputClass} /></Field>
              <Field label="المدة / عدد الحلقات"><input value={f.runtime} onChange={(e) => set('runtime', e.target.value)} className={inputClass} placeholder="ساعتان أو 30 حلقة" /></Field>
              <Field label="أعلى جودة متاحة"><select value={f.quality} onChange={(e) => set('quality', e.target.value)} className={inputClass}>{qualities.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="الإخراج"><input value={f.director} onChange={(e) => set('director', e.target.value)} className={inputClass} /></Field>
              <Field label="البطولة (افصل بفاصلة)"><input value={f.cast} onChange={(e) => set('cast', e.target.value)} className={inputClass} /></Field>
              <div className="sm:col-span-2"><Field label="القصة / الوصف"><textarea rows={4} value={f.overview} onChange={(e) => set('overview', e.target.value)} className={`${inputClass} h-auto py-3`} /></Field></div>
            </div>
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold">المنصات والرابط الرسمي <span className="text-gold">*</span></p>
              <span className="text-xs text-muted">اختار المنصات اللي بتعرض العمل، وحط رابط صفحته على كل منصة</span>
            </div>
            {platforms.length === 0 && <p className="bg-panel p-4 text-sm text-muted">مفيش منصات — أضف منصة الأول من صفحة «إدارة المنصات».</p>}
            <div className="grid gap-3 md:grid-cols-2">
              {platforms.map((p) => {
                const on = f.platforms.includes(p.id);
                return (
                  <motion.div layout key={p.id} className={cn('rounded-xl border p-3 transition-colors', on ? 'border-teal/60 bg-teal-soft' : 'border-line bg-panel')}>
                    <button type="button" onClick={() => togglePlatform(p.id)} className="flex w-full items-center gap-3 text-right">
                      <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-md border', on ? 'border-teal bg-teal text-bg' : 'border-line')}>{on && <Check className="h-4 w-4" />}</span>
                      {p.logo
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={p.logo} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                        : <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold" style={{ background: `${p.color}22`, color: p.color }}>{p.name[0]}</span>}
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.nameAr || p.name}</span>
                      {p.active === false && <Badge>مخفية</Badge>}
                    </button>
                    <AnimatePresence>
                      {on && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-bg px-3">
                            <Link2 className="h-4 w-4 shrink-0 text-teal" />
                            <input dir="ltr" type="url" value={f.links[p.id] ?? ''} onChange={(e) => set('links', { ...f.links, [p.id]: e.target.value })} placeholder={p.url ? `${p.url.replace(/\/$/, '')}/...` : 'https://'} className="h-10 min-w-0 flex-1 bg-transparent text-xs outline-none" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
            {f.platforms.some((id) => platforms.find((p) => p.id === id)?.active === false) && (
              <p className="mt-3 text-xs text-gold">⚠ فيه منصة مخفية مختارة — العمل مش هيظهر عليها لحد ما تفعّلها من صفحة المنصات.</p>
            )}
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            <label className="flex items-center justify-between gap-3 rounded-xl bg-panel p-4 text-sm">متاح التنزيل بدون إنترنت<Toggle checked={f.download} onChange={(v) => set('download', v)} /></label>
            <label className="flex items-center justify-between gap-3 rounded-xl bg-panel p-4 text-sm">إظهار علامة «في باقتك»<Toggle checked={f.inPlan} onChange={(v) => set('inPlan', v)} tone="gold" /></label>
            <label className="flex items-center justify-between gap-3 rounded-xl bg-panel p-4 text-sm">
              <span>«هيتشال قريب» خلال<span className="block text-xs text-muted">عدد الأيام (اتركه فاضي لو مش هيتشال)</span></span>
              <input type="number" min={0} value={f.expiresInDays} onChange={(e) => set('expiresInDays', e.target.value === '' ? '' : Number(e.target.value))} className="h-10 w-20 rounded-lg bg-bg px-2 text-center outline-none" />
            </label>
          </section>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 bg-card p-4 sm:p-5">
          <p className="text-sm text-danger">{err}</p>
          <div className="flex gap-2">
            <Button type="button" variant="dark" pill={false} onClick={onClose}>إلغاء</Button>
            <Button pill={false} loading={busy} disabled={uploading}>{isNew ? 'نشر على الموقع' : 'حفظ التعديلات'}</Button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}
