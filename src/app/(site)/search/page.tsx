'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Clock, Flame, LayoutGrid, Radar, Search, SearchX, Sparkles, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Stagger, StaggerItem } from '@/components/motion';
import { TitleCard, TitleCardSkeleton } from '@/components/title/TitleCard';
import { Button } from '@/components/ui/Button';
import { Badge, Checkbox, inputClass } from '@/components/ui/primitives';
import { searchApi, titlesApi } from '@/lib/api';
import type { SearchResult, Title } from '@/lib/api/types';

const recent = ['كيرة والجن', 'الحشاشين', 'أوبنهايمر 4K', 'مسلسلات شاهد VIP', 'كريم عبد العزيز'];
const quick = ['أفلام 4K فائقة الوضوح', 'متاح للتنزيل بدون إنترنت', 'مسلسلات مصرية حديثة', 'مسلسلات كرتون مدبلجة', 'أعمال حائزة على جوائز', 'برامج حوارية ووثائقية'];

function SearchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const [input, setInput] = useState(q);
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState<Title[]>([]);
  const [history, setHistory] = useState(recent);

  useEffect(() => { titlesApi.trending().then(setFallback); }, []);
  useEffect(() => {
    setInput(q);
    if (!q) { setData(null); return; }
    setLoading(true);
    searchApi.query(q).then((r) => { setData(r); setLoading(false); });
  }, [q]);

  const go = (v: string) => router.push(v ? `/search?q=${encodeURIComponent(v)}` : '/search');

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10">
      <form onSubmit={(e) => { e.preventDefault(); go(input); }} className="card flex h-16 items-center gap-3 px-6 transition focus-within:border-teal/60 focus-within:shadow-teal">
        <Search className="h-6 w-6 text-teal" />
        <input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="ابحث عن فيلم، مسلسل، ممثل، أو منصة..." className="flex-1 bg-transparent text-lg outline-none placeholder:text-dim" />
        {input && <button type="button" onClick={() => { setInput(''); go(''); }} className="flex items-center gap-1 text-sm text-muted"><X className="h-4 w-4" /> مسح</button>}
        <Button size="sm" variant="teal" icon={<ArrowLeft className="h-4 w-4" />}>بحث</Button>
      </form>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted"><span className="h-2 w-2 animate-pulse-dot rounded-full bg-teal" /> وضع البحث الذكي نشط — البحث يشمل 9 منصات مرخصة بالتزامن</p>

      <AnimatePresence mode="wait">
        {!q && (
          <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 grid gap-5 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              <div className="card p-6">
                <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-lg font-bold"><Clock className="h-5 w-5 text-teal" /> عمليات البحث الأخيرة</h2><button onClick={() => setHistory([])} className="text-xs text-muted">مسح السجل</button></div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AnimatePresence>
                    {history.map((h) => (
                      <motion.span key={h} layout exit={{ scale: 0.6, opacity: 0 }} className="flex items-center gap-2 rounded-full bg-panel px-4 py-2 text-sm">
                        <button onClick={() => go(h)}>{h}</button>
                        <button onClick={() => setHistory(history.filter((x) => x !== h))}><X className="h-3.5 w-3.5 text-dim" /></button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              <div className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold"><LayoutGrid className="h-5 w-5 text-teal" /> تصفح سريع حسب التصنيف</h2>
                <Stagger className="mt-4 grid gap-3 sm:grid-cols-2">
                  {quick.map((x) => <StaggerItem key={x}><button onClick={() => go(x.split(' ')[0])} className="panel w-full p-4 text-right text-sm transition hover:bg-line">{x}</button></StaggerItem>)}
                </Stagger>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-lg font-bold"><Flame className="h-5 w-5 text-gold" /> الأكثر بحثاً وتداولاً اليوم</h2><Badge tone="gold">تحديث مباشر</Badge></div>
              <ol className="mt-4 space-y-1">
                {fallback.slice(0, 6).map((t, i) => (
                  <li key={t.id}><button onClick={() => router.push(`/title/${t.slug}`)} className="flex w-full items-center gap-4 rounded-xl p-3 text-right transition hover:bg-panel">
                    <span className="font-display text-xl font-bold text-gold">{i + 1}</span>
                    <span className="flex-1"><b className="block text-sm">{t.title}</b><span className="text-xs text-muted">{t.genres[0]} • {t.runtime}</span></span>
                  </button></li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}

        {q && loading && (
          <motion.div key="loading" className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <TitleCardSkeleton key={i} />)}</motion.div>
        )}

        {q && !loading && data && data.total > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <h2 className="mb-5 font-display text-2xl font-bold">نتائج البحث عن «{q}» <span className="text-sm text-muted">({data.total})</span></h2>
            <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {data.titles.map((t) => <StaggerItem key={t.id}><TitleCard title={t} /></StaggerItem>)}
            </Stagger>
          </motion.div>
        )}

        {q && !loading && data && data.total === 0 && <NoResults key="none" q={q} suggestions={fallback} />}
      </AnimatePresence>
    </div>
  );
}

function NoResults({ q, suggestions }: { q: string; suggestions: Title[] }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notify, setNotify] = useState(true);
  const [form, setForm] = useState({ title: q, year: '2024', email: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await searchApi.requestTitle(form);
    setBusy(false);
    setSent(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 space-y-8">
      <div className="card relative overflow-hidden p-10 text-center">
        <motion.div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-gold/30 bg-panel" animate={{ boxShadow: ['0 0 0 0 #FBBF2433', '0 0 0 24px #FBBF2400'] }} transition={{ duration: 2, repeat: Infinity }}>
          <SearchX className="h-10 w-10 text-gold" />
        </motion.div>
        <Badge tone="gold" className="mt-5">فهرس المنصات المعتمدة</Badge>
        <h2 className="mt-3 font-display text-3xl font-bold">لم نتمكن من العثور على أي نتائج</h2>
        <p className="mt-2 text-sm text-muted">بحثك عن <b className="text-teal underline">«{q}»</b> لم يتطابق مع أي أعمال رقمية مرخصة للبث في الوقت الحالي داخل مصر.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="flex items-center gap-1 text-muted"><Sparkles className="h-4 w-4 text-gold" /> هل تقصد البحث عن:</span>
          {suggestions.slice(0, 3).map((s) => <a key={s.id} href={`/title/${s.slug}`} className="rounded-full bg-panel px-4 py-1.5 font-semibold text-gold">«{s.title}»</a>)}
        </div>
      </div>

      <div className="card grid gap-8 p-8 md:grid-cols-2">
        <div>
          <Badge tone="teal"><Radar className="h-3 w-3" /> نظام تعقب حقوق التوزيع المباشر</Badge>
          <h3 className="mt-3 font-display text-2xl font-bold">لم تجد ما تبحث عنه؟ اطلب إضافة العمل فوراً</h3>
          <p className="mt-2 text-sm leading-7 text-muted">سواء كان العمل سيعرض قريباً في صالات السينما أو لا يزال قيد مفاوضات المنصات (Shahid, Watch It, OSN+, Netflix)، سنقوم بإدراجه في رادارك وإشعارك لحظة توفره القانوني.</p>
        </div>
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="ok" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="panel grid place-items-center p-8 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-teal text-bg">✓</span>
              <p className="mt-4 font-bold">تم تسجيل طلبك بنجاح</p>
              <p className="mt-1 text-xs text-muted">سنراسلك فور توفر العمل على أي منصة مرخصة.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} className="panel space-y-3 p-5">
              <div className="grid grid-cols-[1fr_110px] gap-3">
                <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان العمل المطلوب" />
                <input className={inputClass} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="سنة الإصدار" />
              </div>
              <input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" />
              <Checkbox checked={notify} onChange={setNotify} label="أخبرني إذا توفر على المنصات المشترك بها فقط في باقاتي" />
              <Button className="w-full" loading={busy}>اطلب إضافة العمل للتتبع</Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchInner /></Suspense>;
}
