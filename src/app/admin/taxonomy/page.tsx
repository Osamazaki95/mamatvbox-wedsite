'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Baby, Clapperboard, Globe2, Mic, RotateCcw, Save, Tags, Tv, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { adminFetch } from '@/lib/admin';
import type { SiteSettings, Taxonomy, TitleType } from '@/lib/api/types';
import { defaultTaxonomy } from '@/lib/site-defaults';
import { cn } from '@/lib/utils';

const tabs: { k: TitleType; l: string; icon: typeof Tv }[] = [
  { k: 'movie', l: 'الأفلام', icon: Clapperboard },
  { k: 'series', l: 'المسلسلات', icon: Tv },
  { k: 'program', l: 'البرامج', icon: Mic },
  { k: 'kids', l: 'الكرتون', icon: Baby },
];

export default function TaxonomyPage() {
  const [tax, setTax] = useState<Taxonomy | null>(null);
  const [tab, setTab] = useState<TitleType>('movie');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { adminFetch<SiteSettings>('settings').then((s) => setTax(s.taxonomy)); }, []);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2400); };
  if (!tax) return <div className="skeleton h-96" />;

  const update = (key: 'origins' | 'genres', list: string[]) => { setTax({ ...tax, [tab]: { ...tax[tab], [key]: list } }); setDirty(true); };
  const save = async () => {
    setBusy(true);
    try {
      const s = await adminFetch<SiteSettings>('settings', { method: 'PUT', body: { taxonomy: tax } });
      setTax(s.taxonomy);
      setDirty(false);
      flash('تم الحفظ — القوائم ظهرت في القائمة العلوية وصفحات الأقسام');
    } catch { flash('تعذر الحفظ'); } finally { setBusy(false); }
  };

  const cur = tax[tab];
  const label = tabs.find((t) => t.k === tab)!.l;

  return (
    <div className="space-y-6 pb-28">
      <div className="bg-card p-5 sm:p-7">
        <Badge tone="gold"><Tags className="h-3 w-3" /> التصنيفات</Badge>
        <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">تصنيف الأفلام والمسلسلات والبرامج والكرتون</h1>
        <p className="mt-1 text-sm text-muted">لكل قسم قائمتين: <b className="text-teal">البلد</b> (مصري، أجنبي، ياباني...) و<b className="text-gold">النوع</b> (أكشن، دراما، كوميديا...). بتظهر في القائمة المنسدلة فوق، وفي فلاتر صفحة القسم، وفي فورم إضافة العمل.</p>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className={cn('relative flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold', tab === t.k ? 'text-bg' : 'bg-card text-muted hover:text-ink')}>
            {tab === t.k && <motion.span layoutId="tax-tab" className="absolute inset-0 rounded-full bg-gold" />}
            <t.icon className="relative h-4 w-4" /><span className="relative">{t.l}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ListEditor
          key={`${tab}-o`}
          title={`${label} حسب البلد`}
          hint="مثال: مصري، عربي، خليجي، أجنبي، ياباني، كوري، هندي، تركي"
          icon={<Globe2 className="h-5 w-5 text-teal" />}
          tone="teal"
          items={cur.origins}
          onChange={(l) => update('origins', l)}
          onReset={() => update('origins', defaultTaxonomy[tab].origins)}
        />
        <ListEditor
          key={`${tab}-g`}
          title={`أنواع ${label}`}
          hint="مثال: أكشن، دراما، خيال علمي، كوميديا، رعب، وثائقي"
          icon={<Tags className="h-5 w-5 text-gold" />}
          tone="gold"
          items={cur.genres}
          onChange={(l) => update('genres', l)}
          onReset={() => update('genres', defaultTaxonomy[tab].genres)}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line/60 bg-bg/90 p-4 backdrop-blur lg:right-[320px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted">{dirty ? 'فيه تعديلات لم تُحفظ (في كل الأقسام)' : 'كل التعديلات محفوظة'}</span>
          <Button pill={false} loading={busy} onClick={save} icon={<Save className="h-4 w-4" />}>حفظ التصنيفات</Button>
        </div>
      </div>

      <AnimatePresence>{toast && <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-teal px-5 py-3 text-sm font-bold text-bg shadow-teal">{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

function ListEditor({ title, hint, icon, tone, items, onChange, onReset }: {
  title: string; hint: string; icon: React.ReactNode; tone: 'teal' | 'gold'; items: string[];
  onChange: (l: string[]) => void; onReset: () => void;
}) {
  const [v, setV] = useState('');
  const add = (raw: string) => {
    const words = raw.split(/[,،\n]+/).map((w) => w.trim()).filter(Boolean);
    if (words.length) onChange([...new Set([...items, ...words])]);
    setV('');
  };
  const move = (i: number, d: -1 | 1) => { const n = [...items]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };

  return (
    <section className="bg-card p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">{icon} {title}</h2>
        <button onClick={onReset} className="flex items-center gap-1 text-xs text-muted hover:text-ink"><RotateCcw className="h-3.5 w-3.5" /> القائمة الافتراضية</button>
      </div>
      <p className="mt-1 text-xs text-muted">{hint}. اكتب واضغط Enter (أو الصق كذا كلمة بينهم فاصلة). الأسهم بتغيّر الترتيب.</p>
      <form onSubmit={(e) => { e.preventDefault(); add(v); }} className="mt-4 flex gap-2">
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder="أضف تصنيف..." className="h-11 min-w-0 flex-1 rounded-xl bg-panel px-4 text-sm outline-none focus:ring-2 focus:ring-teal/40" />
        <Button pill={false} variant={tone === 'teal' ? 'teal' : 'gold'}>إضافة</Button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {items.map((x, i) => (
            <motion.span layout key={x} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className={cn('flex items-center gap-1 rounded-full py-1 pe-1 ps-1 text-sm', tone === 'teal' ? 'bg-teal-soft text-teal' : 'bg-gold-soft text-gold')}>
              <button onClick={() => move(i, -1)} disabled={i === 0} className="grid h-6 w-6 place-items-center rounded-full disabled:opacity-20 hover:bg-bg/40" aria-label="قبل"><ArrowRight className="h-3 w-3 rtl-flip" /></button>
              <span className="px-1 font-semibold">{x}</span>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="grid h-6 w-6 place-items-center rounded-full disabled:opacity-20 hover:bg-bg/40" aria-label="بعد"><ArrowLeft className="h-3 w-3 rtl-flip" /></button>
              <button onClick={() => onChange(items.filter((y) => y !== x))} className="grid h-6 w-6 place-items-center rounded-full bg-bg/40 hover:bg-danger hover:text-ink" aria-label={`حذف ${x}`}><X className="h-3 w-3" /></button>
            </motion.span>
          ))}
        </AnimatePresence>
        {items.length === 0 && <p className="text-sm text-dim">القائمة فاضية — مش هتظهر في الموقع.</p>}
      </div>
    </section>
  );
}
