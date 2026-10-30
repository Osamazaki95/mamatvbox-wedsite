'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Eye, EyeOff, LayoutTemplate, Moon, Plus, Save, Share2, Trash2, Trophy, Tv, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SocialGlyph, networkInfo, socialNetworks } from '@/components/layout/SocialIcon';
import { Button } from '@/components/ui/Button';
import { Badge, Field, Toggle, inputClass } from '@/components/ui/primitives';
import { adminFetch } from '@/lib/admin';
import type { FeatureFlags, HomeSettings, SiteSettings, SocialLink, SocialNetwork } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const newId = () => Math.random().toString(36).slice(2, 10);

export default function SiteSettingsPage() {
  const [features, setFeatures] = useState<FeatureFlags | null>(null);
  const [home, setHome] = useState<HomeSettings | null>(null);
  const [social, setSocial] = useState<SocialLink[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    adminFetch<SiteSettings>('settings').then((s) => { setFeatures(s.features); setHome(s.home); setSocial(s.social); });
  }, []);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };
  if (!features || !home) return <div className="skeleton h-96" />;

  const touch = () => setDirty(true);
  const setF = (k: keyof FeatureFlags, v: boolean) => { setFeatures({ ...features, [k]: v }); touch(); };
  const setH = (patch: Partial<HomeSettings>) => { setHome({ ...home, ...patch }); touch(); };
  const updateSocial = (id: string, patch: Partial<SocialLink>) => { setSocial((l) => l.map((s) => (s.id === id ? { ...s, ...patch } : s))); touch(); };
  const moveSocial = (i: number, d: -1 | 1) => { setSocial((l) => { const n = [...l]; const j = i + d; if (j < 0 || j >= n.length) return l; [n[i], n[j]] = [n[j], n[i]]; return n; }); touch(); };
  const addSocial = (network: SocialNetwork) => { setSocial((l) => [...l, { id: newId(), network, url: '', label: '', active: true }]); touch(); };

  const save = async () => {
    const missing = social.find((s) => !s.url.trim());
    if (missing) { flash(`اكتب رابط ${networkInfo(missing.network).label} أو احذفه`); return; }
    setBusy(true);
    try {
      const s = await adminFetch<SiteSettings>('settings', { method: 'PUT', body: { features, home, social } });
      setFeatures(s.features); setHome(s.home);
      const dropped = social.length - s.social.length;
      setSocial(s.social);
      setDirty(false);
      flash(dropped > 0 ? `تم الحفظ — ${dropped} رابط غير صالح اتشال (لازم يبدأ بـ https://)` : 'تم الحفظ وظهر على الموقع');
    } catch {
      flash('تعذر الحفظ');
    } finally { setBusy(false); }
  };

  const card = 'bg-card p-5 sm:p-7';
  const row = 'flex items-center justify-between gap-4 rounded-xl bg-panel p-4';

  return (
    <div className="space-y-6 pb-28">
      <div className={card}>
        <Badge tone="teal"><LayoutTemplate className="h-3 w-3" /> إعدادات الموقع</Badge>
        <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">الصفحة الرئيسية والقائمة والفوتر</h1>
        <p className="mt-1 text-sm text-muted">تحكم في الأقسام اللي بتظهر في الرئيسية، إظهار أو إخفاء تسجيل الدخول والباقات، وروابط السوشيال ميديا في الفوتر.</p>
      </div>

      <section className={cn(card, 'space-y-3')}>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold"><UserRound className="h-5 w-5 text-gold" /> صفحات الحساب والاشتراك</h2>
        <p className="text-xs text-muted">لما تكون مقفولة: الأزرار والروابط بتختفي من القائمة والصفحات، ولو حد فتح الرابط مباشرة بيتحوّل للرئيسية.</p>
        <label className={row}>
          <span><b className="block text-sm">تسجيل الدخول وإنشاء حساب</b><span className="text-xs text-muted">تسجيل الدخول، إنشاء حساب، قائمتي، تنبيهاتي، حسابي</span></span>
          <Toggle checked={features.accounts} onChange={(v) => setF('accounts', v)} label="تسجيل الدخول" />
        </label>
        <label className={row}>
          <span><b className="block text-sm">باقاتي (صفحة الباقات والدفع)</b><span className="text-xs text-muted">رابط «باقاتي» في القائمة، قسم العضوية في الرئيسية، وصفحات الدفع</span></span>
          <Toggle checked={features.pricing} onChange={(v) => setF('pricing', v)} tone="gold" label="باقاتي" />
        </label>
      </section>

      <section className={cn(card, 'space-y-3')}>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Tv className="h-5 w-5 text-teal" /> أقسام الصفحة الرئيسية</h2>

        <div className="rounded-xl bg-panel p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-3"><Trophy className="h-5 w-5 text-gold" /><span><b className="block text-sm">الأعلى مشاهدة — أفضل ١٠</b><span className="text-xs text-muted">أعلى ١٠ أعمال مشاهدة من كل الأقسام بترقيم كبير</span></span></span>
            <Toggle checked={home.top10.enabled} onChange={(v) => setH({ top10: { ...home.top10, enabled: v } })} label="أفضل ١٠" />
          </div>
          {home.top10.enabled && <div className="mt-3"><Field label="عنوان القسم"><input value={home.top10.title} onChange={(e) => setH({ top10: { ...home.top10, title: e.target.value } })} className={inputClass} /></Field></div>}
        </div>

        <div className={cn('rounded-xl p-4 transition-colors', home.ramadan.enabled ? 'bg-gold-soft ring-1 ring-gold/40' : 'bg-panel')}>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-3"><Moon className="h-5 w-5 text-gold" /><span><b className="block text-sm">قسم مسلسلات رمضان</b><span className="text-xs text-muted">بيعرض الأعمال اللي عليها علامة «رمضان» من صفحة الأفلام والمسلسلات</span></span></span>
            <Toggle checked={home.ramadan.enabled} onChange={(v) => setH({ ramadan: { ...home.ramadan, enabled: v } })} tone="gold" label="رمضان" />
          </div>
          {home.ramadan.enabled && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="عنوان القسم"><input value={home.ramadan.title} onChange={(e) => setH({ ramadan: { ...home.ramadan, title: e.target.value } })} className={inputClass} /></Field>
              <Field label="وصف قصير"><input value={home.ramadan.subtitle} onChange={(e) => setH({ ramadan: { ...home.ramadan, subtitle: e.target.value } })} className={inputClass} /></Field>
            </div>
          )}
        </div>

        <label className={row}>
          <span><b className="block text-sm">الأكثر مشاهدة لكل قسم</b><span className="text-xs text-muted">سلايدر للأفلام، ثم المسلسلات، ثم الكرتون، ثم البرامج</span></span>
          <Toggle checked={home.mostWatched.enabled} onChange={(v) => setH({ mostWatched: { enabled: v } })} label="الأكثر مشاهدة" />
        </label>

        <div className={row}>
          <span><b className="block text-sm">عدد المنصات في قسم «منصات البث القانونية»</b><span className="text-xs text-muted">الباقي بيظهر بزر «إظهار الكل». المنصات المميزة (⭐ من صفحة المنصات) بتظهر الأول.</span></span>
          <input type="number" min={1} max={48} value={home.platformsCount} onChange={(e) => setH({ platformsCount: Math.max(1, Number(e.target.value) || 1) })} className="h-11 w-20 rounded-lg bg-bg text-center outline-none" aria-label="عدد المنصات" />
        </div>
      </section>

      <section className={cn(card, 'space-y-4')}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Share2 className="h-5 w-5 text-violet" /> السوشيال ميديا في الفوتر</h2>
            <p className="mt-1 text-xs text-muted">ضيف أي منصة، رتّبها بالأسهم، أو اخفيها مؤقتاً من زر العين.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {socialNetworks.map((n) => (
            <button key={n.id} type="button" onClick={() => addSocial(n.id)} className="flex items-center gap-2 rounded-full bg-panel py-1.5 pe-3 ps-1.5 text-xs font-semibold transition hover:bg-line">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-bg" style={{ color: n.color }}><SocialGlyph network={n.id} className="h-3.5 w-3.5" /></span>
              {n.label}<Plus className="h-3.5 w-3.5 text-teal" />
            </button>
          ))}
        </div>

        {social.length === 0 ? (
          <p className="rounded-xl bg-panel p-6 text-center text-sm text-muted">مفيش روابط لسه — اختار منصة من فوق.</p>
        ) : (
          <div className="space-y-2">
            {social.map((s, i) => {
              const info = networkInfo(s.network);
              return (
                <motion.div layout key={s.id} className={cn('flex flex-wrap items-center gap-3 rounded-xl bg-panel p-3 sm:flex-nowrap', !s.active && 'opacity-60')}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bg" style={{ color: info.color }}><SocialGlyph network={s.network} className="h-[18px] w-[18px]" /></span>
                  <b className="w-24 shrink-0 text-sm">{info.label}</b>
                  <input dir="ltr" value={s.url} onChange={(e) => updateSocial(s.id, { url: e.target.value })} placeholder={info.placeholder} className={`${inputClass} h-10 min-w-[200px] flex-1 text-xs`} />
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => moveSocial(i, -1)} disabled={i === 0} className="grid h-9 w-9 place-items-center rounded-lg bg-bg disabled:opacity-30" aria-label="لأعلى"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => moveSocial(i, 1)} disabled={i === social.length - 1} className="grid h-9 w-9 place-items-center rounded-lg bg-bg disabled:opacity-30" aria-label="لأسفل"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => updateSocial(s.id, { active: !s.active })} className="grid h-9 w-9 place-items-center rounded-lg bg-bg" aria-label={s.active ? 'إخفاء' : 'إظهار'} title={s.active ? 'ظاهر — اضغط للإخفاء' : 'مخفي — اضغط للإظهار'}>{s.active ? <Eye className="h-4 w-4 text-teal" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button type="button" onClick={() => { setSocial((l) => l.filter((x) => x.id !== s.id)); touch(); }} className="grid h-9 w-9 place-items-center rounded-lg bg-danger-soft text-danger" aria-label="حذف"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {social.some((s) => s.active && s.url) && (
          <div className="rounded-xl border border-dashed border-line p-4">
            <p className="mb-3 text-xs text-muted">معاينة الفوتر</p>
            <div className="flex flex-wrap gap-2.5">
              {social.filter((s) => s.active && s.url).map((s) => (
                <span key={s.id} className="grid h-11 w-11 place-items-center rounded-full border border-line/70 bg-surface text-ink/75"><SocialGlyph network={s.network} className="h-[18px] w-[18px]" /></span>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line/60 bg-bg/90 p-4 backdrop-blur lg:right-[320px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted">{dirty ? 'فيه تعديلات لم تُحفظ' : 'كل التعديلات محفوظة'}</span>
          <Button pill={false} loading={busy} onClick={save} icon={<Save className="h-4 w-4" />}>حفظ ونشر على الموقع</Button>
        </div>
      </div>

      <AnimatePresence>{toast && <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-teal px-5 py-3 text-sm font-bold text-bg shadow-teal">{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}
