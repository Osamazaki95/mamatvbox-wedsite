'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Baby, CheckCircle2, Clapperboard, Download, FileUp, Link2, Loader2, Mic, RotateCcw, Sparkles, Tv, UploadCloud, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Counter, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge, Field, inputClass } from '@/components/ui/primitives';
import { adminFetch } from '@/lib/admin';
import type { Platform, Title, TitleType } from '@/lib/api/types';
import { cn } from '@/lib/utils';

/* ---------------- field detection ---------------- */

type Row = Record<string, string>;
type FieldKey = 'title' | 'originalTitle' | 'type' | 'year' | 'poster' | 'overview' | 'genres' | 'rating' | 'runtime' | 'platform' | 'link' | 'director' | 'cast' | 'quality';

const FIELDS: { k: FieldKey; l: string; syn: string[]; key?: boolean }[] = [
  { k: 'title', l: 'الاسم', key: true, syn: ['title', 'name', 'titlear', 'namear', 'arabictitle', 'الاسم', 'اسم', 'العنوان', 'اسمالعمل', 'اسمالفيلم', 'الاسمبالعربي'] },
  { k: 'originalTitle', l: 'الاسم الأصلي', syn: ['originaltitle', 'originalname', 'englishtitle', 'titleen', 'nameen', 'englishname', 'الاسمالاصلي', 'الاسمبالانجليزي', 'الاسمالانجليزي'] },
  { k: 'type', l: 'النوع', key: true, syn: ['type', 'mediatype', 'kind', 'contenttype', 'category', 'النوع', 'نوعالعمل', 'الفئه', 'القسم'] },
  { k: 'year', l: 'السنة', syn: ['year', 'releaseyear', 'releasedate', 'firstairdate', 'date', 'السنه', 'سنهالانتاج', 'تاريخالعرض', 'سنهالعرض'] },
  { k: 'platform', l: 'المنصة', key: true, syn: ['platform', 'platforms', 'provider', 'providers', 'service', 'channel', 'network', 'المنصه', 'المنصات', 'القناه', 'منصهالعرض'] },
  { k: 'link', l: 'الرابط الرسمي', key: true, syn: ['link', 'url', 'watchurl', 'watchlink', 'href', 'deeplink', 'الرابط', 'رابط', 'رابطالمشاهده'] },
  { k: 'poster', l: 'البوستر', key: true, syn: ['poster', 'posterurl', 'posterpath', 'image', 'imageurl', 'img', 'thumbnail', 'thumb', 'cover', 'picture', 'البوستر', 'الصوره', 'صوره', 'الغلاف'] },
  { k: 'genres', l: 'التصنيفات', syn: ['genres', 'genre', 'tags', 'التصنيفات', 'التصنيف', 'النوعالفني'] },
  { k: 'rating', l: 'التقييم', syn: ['rating', 'voteaverage', 'imdbrating', 'score', 'rate', 'التقييم'] },
  { k: 'runtime', l: 'المدة', syn: ['runtime', 'duration', 'length', 'episodes', 'numberofepisodes', 'المده', 'عددالحلقات', 'الحلقات'] },
  { k: 'quality', l: 'الجودة', syn: ['quality', 'resolution', 'الجوده', 'الدقه'] },
  { k: 'director', l: 'الإخراج', syn: ['director', 'directors', 'directedby', 'المخرج', 'الاخراج', 'اخراج'] },
  { k: 'cast', l: 'البطولة', syn: ['cast', 'actors', 'stars', 'starring', 'actor', 'البطوله', 'الممثلين', 'بطوله'] },
  { k: 'overview', l: 'القصة', syn: ['overview', 'description', 'plot', 'summary', 'synopsis', 'story', 'القصه', 'الوصف', 'نبذه', 'ملخص'] },
];

const norm = (s: string) => s.toLowerCase()
  .replace(/[أإآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\u064B-\u0652]/g, '')
  .replace(/[\s_\-.:]+/g, '');

function autoMap(cols: string[]): Record<FieldKey, string> {
  const m = {} as Record<FieldKey, string>;
  const used = new Set<string>();
  for (const f of FIELDS) {
    const syn = f.syn.map(norm);
    const exact = cols.find((c) => !used.has(c) && syn.includes(norm(c)));
    const partial = exact ?? cols.find((c) => !used.has(c) && syn.some((s) => s.length > 3 && norm(c).includes(s)));
    m[f.k] = partial ?? '';
    if (partial) used.add(partial);
  }
  return m;
}

function detectType(text: string): TitleType | null {
  const s = norm(text);
  if (!s) return null;
  if (/(kids|cartoon|anime|animation|animated|children|كرتون|كارتون|اطفال|انمي|رسوممتحركه)/.test(s)) return 'kids';
  if (/(program|programme|talkshow|realityshow|documentar|برنامج|برامج|وثائقي|توكشو)/.test(s)) return 'program';
  if (/(series|tvseries|tvshow|^tv$|^show|season|episode|مسلسل|موسم|حلقه|حلقات)/.test(s)) return 'series';
  if (/(movie|film|فيلم|افلام)/.test(s)) return 'movie';
  return null;
}

const hostOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

interface Item {
  _row: number; type: TitleType; typeSource: 'column' | 'guess' | 'default';
  title: string; originalTitle: string; year: number; poster: string; overview: string; genres: string;
  rating: number; runtime: string; quality: string; director: string; cast: string;
  platforms: string[]; links: Record<string, string>; unknownPlatforms: string[];
  status: 'ok' | 'dup' | 'error'; error?: string;
}

const typeMeta: Record<TitleType, { l: string; icon: typeof Tv }> = {
  movie: { l: 'أفلام', icon: Clapperboard }, series: { l: 'مسلسلات', icon: Tv }, kids: { l: 'كرتون', icon: Baby }, program: { l: 'برامج', icon: Mic },
};

const errText: Record<string, string> = {
  invalid_url: 'الرابط لازم يبدأ بـ https://',
  empty: 'الملف أو الرابط فاضي',
  too_large: 'الملف أكبر من ٣٠ ميجا',
  html_no_data: 'الصفحة دي مفيهاش بيانات أفلام منظمة. استخدم ملف CSV أو Google Sheet أو JSON.',
  invalid_xml: 'ملف XML غير صالح',
  fetch_http_401: 'الرابط محمي بكلمة مرور — لازم يكون عام',
  fetch_http_403: 'الموقع رفض الوصول. لو Google Sheet: Share ← Anyone with the link',
  fetch_http_404: 'الرابط غير موجود (404)',
  title_required: 'بدون اسم',
  platforms_required: 'بدون منصة',
};

const TEMPLATE = '\uFEFFtitle,original_title,type,year,platform,link,poster,genres,rating,runtime,quality,director,cast,overview\n'
  + 'الحريفة,El Harifa,فيلم,2024,Shahid VIP,https://shahid.mbc.net/ar/movies/...,https://example.com/poster.jpg,"رياضي، شبابي",8.1,ساعتان,4K UHD,رؤوف السيد,"نور النبوي، أحمد غزي",طالب ينتقل إلى مدرسة حكومية...\n'
  + 'موضوع عائلي,Mawdoo Aeli,مسلسل,2024,Shahid VIP,https://shahid.mbc.net/ar/series/...,,كوميديا,9.1,10 حلقات,1080p FHD,أحمد الجندي,ماجد الكدواني,\n'
  + 'يحيى وكنوز,Yehia & Kenooz,كرتون,2024,Watch It,https://www.watchit.com/...,,مغامرات,9.4,26 حلقة,4K UHD,,,\n'
  + 'معكم منى الشاذلي,,برنامج,2025,YouTube Movies,https://www.youtube.com/...,,حواري,8,أسبوعي,1080p FHD,,,\n';

/* ---------------- page ---------------- */

export default function ImportPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [existing, setExisting] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [source, setSource] = useState('');
  const [kind, setKind] = useState('');
  const [map, setMap] = useState<Record<FieldKey, string>>({} as Record<FieldKey, string>);
  const [defType, setDefType] = useState<TitleType>('movie');
  const [defPlatform, setDefPlatform] = useState('');
  const [mode, setMode] = useState<'skip' | 'update'>('skip');
  const [filter, setFilter] = useState<TitleType | 'all' | 'error' | 'dup'>('all');
  const [shown, setShown] = useState(60);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<{ added: number; updated: number; skipped: number; errors: { row: number; error: string }[] } | null>(null);
  const [overrides, setOverrides] = useState<Record<number, TitleType>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([adminFetch<Platform[]>('platforms'), adminFetch<Title[]>('titles')]).then(([p, t]) => {
      setPlatforms(p);
      setExisting(new Set(t.map((x) => `${norm(x.title)}|${x.year}`)));
    });
  }, []);

  const columns = useMemo(() => (rows ? [...new Set(rows.slice(0, 200).flatMap((r) => Object.keys(r)))].filter((c) => c !== '__group') : []), [rows]);
  const hasGroups = !!rows?.some((r) => r.__group);

  const matchPlatforms = (value: string, link: string) => {
    const found = new Set<string>();
    const unknown: string[] = [];
    value.split(/[,|;،؛/]+/).map((s) => s.trim()).filter(Boolean).forEach((v) => {
      const n = norm(v);
      const p = platforms.find((x) => [x.id, x.name, x.nameAr].some((y) => {
        const ny = norm(y ?? '');
        return ny && (ny === n || (n.length >= 3 && ny.length >= 3 && (ny.includes(n) || n.includes(ny))));
      }));
      if (p) found.add(p.id); else unknown.push(v);
    });
    const h = hostOf(link);
    if (h) {
      const p = platforms.find((x) => { const ph = hostOf(x.url ?? ''); return ph && (h === ph || h.endsWith(`.${ph}`)); });
      if (p) found.add(p.id);
    }
    return { ids: [...found], unknown };
  };

  const items: Item[] = useMemo(() => {
    if (!rows) return [];
    const get = (r: Row, k: FieldKey) => (map[k] ? (r[map[k]] ?? '').trim() : '');
    return rows.map((r, i) => {
      const title = get(r, 'title') || get(r, 'originalTitle');
      const link = get(r, 'link');
      const genres = get(r, 'genres');
      const runtime = get(r, 'runtime');

      let type: TitleType | null = detectType(get(r, 'type'));
      let typeSource: Item['typeSource'] = 'column';
      if (!type) {
        typeSource = 'guess';
        type = detectType(r.__group ?? '')
          ?? (/(animation|كرتون|انمي|رسوم)/i.test(genres) ? 'kids' : null)
          ?? (/(documentary|talk|reality|وثائقي|حواري)/i.test(genres) ? 'program' : null)
          ?? (/(حلق|episode|season|موسم)/i.test(runtime) ? 'series' : null)
          ?? detectType((link.match(/\/(movies?|films?|series|shows?|tv|programs?|kids|cartoons?|anime)\//i) ?? [])[1] ?? '')
          ?? detectType(title.split(/\s+/)[0] ?? '');
      }
      if (!type) { type = defType; typeSource = 'default'; }

      const { ids, unknown } = matchPlatforms(get(r, 'platform'), link);
      if (!ids.length && defPlatform) ids.push(defPlatform);
      const links: Record<string, string> = {};
      if (link && /^https?:\/\//i.test(link) && ids.length) {
        const h = hostOf(link);
        const target = platforms.find((p) => ids.includes(p.id) && hostOf(p.url ?? '') && h.endsWith(hostOf(p.url ?? '')))?.id ?? ids[0];
        links[target] = link;
      }

      let poster = get(r, 'poster');
      if (poster.startsWith('/') && !poster.startsWith('/uploads') && poster.length > 5) poster = `https://image.tmdb.org/t/p/w500${poster}`;
      else if (poster && !/^https?:\/\//i.test(poster) && source) { try { poster = new URL(poster, source).href; } catch { poster = ''; } }

      let rating = parseFloat(get(r, 'rating').replace(',', '.')) || 0;
      if (rating > 10) rating = rating / 10;
      const year = Number((get(r, 'year').match(/(18|19|20)\d{2}/) ?? [])[0]) || new Date().getFullYear();

      const item: Item = {
        _row: i + 2, type, typeSource, title, originalTitle: get(r, 'originalTitle'), year, poster,
        overview: get(r, 'overview'), genres, rating: Math.round(rating * 10) / 10, runtime,
        quality: get(r, 'quality') || '1080p FHD', director: get(r, 'director'), cast: get(r, 'cast'),
        platforms: ids, links, unknownPlatforms: unknown, status: 'ok',
      };
      if (!title) { item.status = 'error'; item.error = 'بدون اسم'; }
      else if (!ids.length) { item.status = 'error'; item.error = unknown.length ? `منصة غير معروفة: ${unknown.join('، ')}` : 'بدون منصة'; }
      else if (existing.has(`${norm(title)}|${year}`)) item.status = 'dup';
      if (overrides[item._row]) { item.type = overrides[item._row]; item.typeSource = 'column'; }
      return item;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, map, defType, defPlatform, platforms, existing, source, overrides]);

  const stats = useMemo(() => ({
    total: items.length,
    movie: items.filter((x) => x.type === 'movie').length,
    series: items.filter((x) => x.type === 'series').length,
    kids: items.filter((x) => x.type === 'kids').length,
    program: items.filter((x) => x.type === 'program').length,
    dup: items.filter((x) => x.status === 'dup').length,
    error: items.filter((x) => x.status === 'error').length,
    unknown: [...new Set(items.flatMap((x) => x.unknownPlatforms))],
  }), [items]);

  const view = items.filter((x) => filter === 'all' || (filter === 'error' || filter === 'dup' ? x.status === filter : x.type === filter));
  const toImport = items.filter((x) => x.status === 'ok' || (x.status === 'dup' && mode === 'update'));

  const reset = () => { setRows(null); setResult(null); setErr(''); setProgress(null); setShown(60); setFilter('all'); setOverrides({}); };

  const analyse = async (file?: File) => {
    setLoading(true);
    setErr('');
    setResult(null);
    try {
      let d: { kind: string; source: string; total: number; rows: Row[] };
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/import/fetch', { method: 'POST', body: fd });
        if (res.status === 401) { window.location.href = '/admin-login/'; return; }
        d = await res.json();
        if (!res.ok) throw new Error((d as unknown as { error?: string; message?: string }).error ?? 'failed');
      } else {
        d = await adminFetch('import/fetch', { method: 'POST', body: { url } });
      }
      if (!d.rows.length) throw new Error('empty');
      setRows(d.rows);
      setKind(d.kind);
      setSource(d.source || url);
      const cols = [...new Set(d.rows.slice(0, 200).flatMap((r) => Object.keys(r)))];
      setMap(autoMap(cols));
    } catch (e) {
      const m = (e as Error).message;
      setErr(errText[m] ?? (m.startsWith('fetch_http_') ? `الموقع رجّع خطأ ${m.replace('fetch_http_', '')}` : m.startsWith('fetch_failed') ? 'تعذر الوصول للرابط' : `تعذر التحليل: ${m}`));
    } finally {
      setLoading(false);
    }
  };

  const runImport = async () => {
    const batch = 150;
    const payload = toImport.map(({ status: _s, error: _e, typeSource: _t, unknownPlatforms: _u, ...x }) => x);
    const total = { added: 0, updated: 0, skipped: 0, errors: [] as { row: number; error: string }[] };
    setProgress({ done: 0, total: payload.length });
    for (let i = 0; i < payload.length; i += batch) {
      try {
        const r = await adminFetch<typeof total>('import/commit', { method: 'POST', body: { items: payload.slice(i, i + batch), mode } });
        total.added += r.added; total.updated += r.updated; total.skipped += r.skipped; total.errors.push(...r.errors);
      } catch (e) {
        payload.slice(i, i + batch).forEach((x) => total.errors.push({ row: x._row, error: (e as Error).message }));
      }
      setProgress({ done: Math.min(i + batch, payload.length), total: payload.length });
    }
    total.skipped += items.filter((x) => x.status === 'dup' && mode === 'skip').length;
    setResult(total);
    setProgress(null);
  };

  const downloadTemplate = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8' }));
    a.download = 'mamatvbox-template.csv';
    a.click();
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4 bg-card p-5 sm:p-7">
        <div>
          <Badge tone="gold"><Sparkles className="h-3 w-3" /> استيراد جماعي</Badge>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">إضافة آلاف الأعمال مرة واحدة</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted">حط رابط أو ارفع ملف فيه أفلام ومسلسلات وكرتون وبرامج مع بعض — النظام بيتعرف على الأعمدة، ويقسّم كل عمل حسب نوعه، ويربطه بالمنصة، وبعدها تراجع وتستورد.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={downloadTemplate} icon={<Download className="h-4 w-4" />}>تحميل ملف نموذجي</Button>
          <Button variant="dark" href="/admin/titles/" icon={<ArrowRight className="h-4 w-4" />}>الأعمال</Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.section key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 text-center sm:p-10">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal text-bg"><CheckCircle2 className="h-8 w-8" /></motion.span>
            <h2 className="mt-5 font-display text-2xl font-bold">تم الاستيراد</h2>
            <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[{ l: 'اتضاف', v: result.added, c: 'text-teal' }, { l: 'اتحدّث', v: result.updated, c: 'text-gold' }, { l: 'متخطّى (مكرر)', v: result.skipped, c: '' }, { l: 'أخطاء', v: result.errors.length, c: 'text-danger' }].map((k) => (
                <div key={k.l} className="bg-surface p-4"><p className={cn('font-display text-3xl font-extrabold', k.c)}><Counter value={k.v} /></p><p className="text-xs text-muted">{k.l}</p></div>
              ))}
            </div>
            {result.errors.length > 0 && (
              <div className="mx-auto mt-6 max-h-48 max-w-2xl overflow-y-auto bg-surface p-4 text-right text-xs text-muted">
                {result.errors.slice(0, 100).map((e, i) => <p key={i}>صف {e.row}: {errText[e.error] ?? e.error}</p>)}
              </div>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/admin/titles/">عرض الأعمال</Button>
              <Button variant="ghost" onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>استيراد ملف تاني</Button>
            </div>
          </motion.section>
        ) : !rows ? (
          <motion.section key="source" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-card p-5 sm:p-7">
            <div className="mb-5 flex w-fit gap-1 rounded-full bg-panel p-1">
              {[{ k: 'url' as const, l: 'من رابط', i: Link2 }, { k: 'file' as const, l: 'رفع ملف', i: FileUp }].map((t) => (
                <button key={t.k} onClick={() => setTab(t.k)} className={cn('relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold', tab === t.k ? 'text-bg' : 'text-muted')}>
                  {tab === t.k && <motion.span layoutId="imptab" className="absolute inset-0 rounded-full bg-teal" />}
                  <t.i className="relative h-4 w-4" /><span className="relative">{t.l}</span>
                </button>
              ))}
            </div>

            {tab === 'url' ? (
              <form onSubmit={(e) => { e.preventDefault(); analyse(); }} className="flex flex-col gap-3 sm:flex-row">
                <input dir="ltr" type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/... أو رابط CSV / JSON" className={`${inputClass} flex-1`} />
                <Button loading={loading} icon={<Sparkles className="h-4 w-4" />}>تحليل الرابط</Button>
              </form>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) analyse(f); }}
                className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-line bg-panel p-10 text-center transition hover:border-teal/60"
              >
                {loading ? <Loader2 className="h-10 w-10 animate-spin text-teal" /> : <UploadCloud className="h-10 w-10 text-teal" />}
                <p className="mt-3 font-semibold">اسحب الملف هنا أو اضغط للاختيار</p>
                <p className="mt-1 text-xs text-muted">CSV · TSV · JSON · XML</p>
                <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.json,.xml" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) analyse(f); e.target.value = ''; }} />
              </div>
            )}

            <AnimatePresence>{err && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex items-start gap-2 bg-danger-soft p-4 text-sm text-danger"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {err}</motion.p>}</AnimatePresence>

            <div className="mt-6 grid gap-3 text-xs text-muted md:grid-cols-2 xl:grid-cols-4">
              {[
                ['Google Sheets', 'Share ← General access: Anyone with the link ← انسخ الرابط'],
                ['CSV / Excel', 'من Excel: File ← Save As ← CSV UTF-8'],
                ['JSON', 'قائمة أعمال، أو { "movies": [...], "series": [...] } وكل مجموعة بتتحدد نوعها'],
                ['صفحة ويب', 'لو فيها بيانات Schema.org (Movie / TVSeries) بتتقرا تلقائي'],
              ].map(([t, d]) => <div key={t} className="bg-surface p-4"><b className="block text-sm text-ink">{t}</b>{d}</div>)}
            </div>
          </motion.section>
        ) : (
          <motion.div key="review" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 text-sm">
              <span className="flex min-w-0 items-center gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-teal" /> اتقرا <b><Counter value={rows.length} /></b> صف من ملف <Badge>{kind.toUpperCase()}</Badge></span>
              <Button size="sm" variant="dark" onClick={reset} icon={<RotateCcw className="h-3.5 w-3.5" />}>مصدر تاني</Button>
            </div>

            <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
              {([
                { k: 'all', l: 'الإجمالي', v: stats.total, c: 'text-gold' },
                ...(Object.keys(typeMeta) as TitleType[]).map((t) => ({ k: t, l: typeMeta[t].l, v: stats[t], c: '' })),
                { k: 'dup', l: 'موجود قبل كده', v: stats.dup, c: 'text-violet' },
                { k: 'error', l: 'محتاج مراجعة', v: stats.error, c: 'text-danger' },
              ] as { k: typeof filter; l: string; v: number; c: string }[]).map((s) => (
                <StaggerItem key={s.k}>
                  <button onClick={() => { setFilter(s.k); setShown(60); }} className={cn('w-full bg-card p-4 text-right transition', filter === s.k && 'ring-2 ring-teal')}>
                    <p className="text-xs text-muted">{s.l}</p>
                    <p className={cn('mt-1 font-display text-2xl font-extrabold', s.c)}><Counter value={s.v} /></p>
                  </button>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
              <section className="bg-card p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold">ربط الأعمدة</h2>
                <p className="mt-1 text-xs text-muted">اتعرفنا على الأعمدة تلقائي. غيّر أي عمود لو الربط غلط.{hasGroups && ' الملف فيه مجموعات منفصلة واتقسم على أساسها.'}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {FIELDS.map((f) => (
                    <Field key={f.k} label={<span className="flex items-center gap-1">{f.l}{f.key && <span className="text-gold">•</span>}</span>}>
                      <select value={map[f.k] ?? ''} onChange={(e) => setMap({ ...map, [f.k]: e.target.value })} className={cn(inputClass, 'h-10', map[f.k] ? 'text-teal' : 'text-dim')}>
                        <option value="">— غير موجود —</option>
                        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                  ))}
                </div>
              </section>

              <section className="space-y-4 bg-card p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold">إعدادات الاستيراد</h2>
                <Field label="النوع لو ماتعرفناش عليه">
                  <div className="grid grid-cols-4 gap-1">
                    {(Object.keys(typeMeta) as TitleType[]).map((t) => {
                      const I = typeMeta[t].icon;
                      return <button type="button" key={t} onClick={() => setDefType(t)} className={cn('flex h-11 flex-col items-center justify-center rounded-lg text-[11px] font-semibold', defType === t ? 'bg-gold text-bg' : 'bg-panel text-muted')}><I className="h-4 w-4" />{typeMeta[t].l}</button>;
                    })}
                  </div>
                </Field>
                <Field label="المنصة لو الصف مفيهوش منصة">
                  <select value={defPlatform} onChange={(e) => setDefPlatform(e.target.value)} className={inputClass}>
                    <option value="">— بدون (الصف هيتعلم خطأ) —</option>
                    {platforms.map((p) => <option key={p.id} value={p.id}>{p.nameAr || p.name}</option>)}
                  </select>
                </Field>
                <Field label="الأعمال الموجودة قبل كده">
                  <div className="grid grid-cols-2 gap-1">
                    {[{ k: 'skip' as const, l: 'تخطيها' }, { k: 'update' as const, l: 'حدّث بياناتها' }].map((o) => (
                      <button type="button" key={o.k} onClick={() => setMode(o.k)} className={cn('h-10 rounded-lg text-sm font-semibold', mode === o.k ? 'bg-teal text-bg' : 'bg-panel text-muted')}>{o.l}</button>
                    ))}
                  </div>
                </Field>
                {stats.unknown.length > 0 && (
                  <div className="bg-gold-soft p-3 text-xs text-gold">
                    <b>منصات مش موجودة عندك:</b> {stats.unknown.slice(0, 12).join('، ')}{stats.unknown.length > 12 && ' …'}
                    <Link href="/admin/platforms/" className="mt-1 block underline">أضفها من صفحة المنصات ثم حلّل تاني</Link>
                  </div>
                )}
              </section>
            </div>

            <section className="overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-surface text-xs text-muted"><tr>{['#', 'البوستر', 'الاسم', 'النوع', 'السنة', 'المنصات', 'الحالة'].map((h) => <th key={h} className="p-3 text-right font-medium">{h}</th>)}</tr></thead>
                  <tbody>
                    {view.slice(0, shown).map((x) => (
                      <tr key={x._row} className="border-t border-line/40">
                        <td className="p-3 font-mono text-xs text-dim">{x._row}</td>
                        <td className="p-3">{x.poster
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={x.poster} alt="" loading="lazy" className="h-14 w-10 rounded object-cover" />
                          : <span className="block h-14 w-10 rounded bg-panel" />}</td>
                        <td className="max-w-[260px] p-3"><b className="block truncate">{x.title || '—'}</b>{x.originalTitle && <span className="block truncate text-xs text-muted" dir="ltr">{x.originalTitle}</span>}</td>
                        <td className="p-3">
                          <select value={x.type} onChange={(e) => setOverrides((o) => ({ ...o, [x._row]: e.target.value as TitleType }))} className={cn('h-9 rounded-lg px-2 text-xs font-semibold outline-none', x.typeSource === 'default' ? 'bg-panel text-muted' : 'bg-gold-soft text-gold')}>
                            {(Object.keys(typeMeta) as TitleType[]).map((t) => <option key={t} value={t}>{typeMeta[t].l}</option>)}
                          </select>
                          {x.typeSource !== 'column' && <span className="mt-1 block text-[10px] text-dim">{x.typeSource === 'guess' ? 'تخمين' : 'افتراضي'}</span>}
                        </td>
                        <td className="p-3 text-muted">{x.year}</td>
                        <td className="max-w-[200px] p-3 text-xs">{x.platforms.map((id) => platforms.find((p) => p.id === id)?.nameAr || id).join('، ') || '—'}{Object.keys(x.links).length > 0 && <Link2 className="ms-1 inline h-3 w-3 text-teal" />}</td>
                        <td className="p-3">{x.status === 'ok' ? <Badge tone="teal">جاهز</Badge> : x.status === 'dup' ? <Badge tone="violet">موجود</Badge> : <span className="flex items-center gap-1 text-xs text-danger"><XCircle className="h-4 w-4 shrink-0" />{x.error}</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {view.length > shown && <button onClick={() => setShown((s) => s + 200)} className="w-full bg-surface p-3 text-sm text-teal">عرض المزيد ({view.length - shown} صف)</button>}
              {view.length === 0 && <p className="p-8 text-center text-muted">مفيش صفوف في التصنيف ده</p>}
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {rows && !result && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:right-[320px]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            {progress ? (
              <div className="flex-1">
                <div className="mb-1.5 flex justify-between text-xs"><span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-teal" /> جاري الاستيراد... ما تقفلش الصفحة</span><b>{progress.done} / {progress.total}</b></div>
                <div className="h-2 overflow-hidden rounded-full bg-line"><motion.div className="h-full bg-gradient-to-l from-teal to-gold" animate={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }} /></div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted">هيتم استيراد <b className="text-ink">{toImport.length}</b> عمل{stats.error > 0 && <> • <span className="text-danger">{stats.error} صف هيتخطّى بسبب أخطاء</span></>}</p>
                <Button pill={false} disabled={!toImport.length} onClick={runImport} icon={<UploadCloud className="h-4 w-4" />}>استيراد {toImport.length} عمل</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
