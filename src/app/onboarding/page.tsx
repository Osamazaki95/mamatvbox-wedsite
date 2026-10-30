'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Bell, Check, Clapperboard, Download, Drama, Film, Ghost, Globe2, HeartHandshake,
  KeyRound, Laugh, Lightbulb, Mic, Monitor, Plus, Rocket, Search, Shield, Sparkles, Swords, Tag, Tv, Users, Video, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge, Toggle } from '@/components/ui/primitives';
import { meApi } from '@/lib/api';
import type { PlatformId } from '@/lib/api/types';
import { useCountries, usePlatforms } from '@/lib/api/hooks';
import { cn } from '@/lib/utils';

const stepNames = ['الدولة', 'المنصات', 'الاهتمامات', 'التوجيه'];

const formats = [
  { id: 'movies', i: Clapperboard, t: 'أفلام سينمائية', d: 'تجارب روائية وملاحم بصرية متكاملة' },
  { id: 'series', i: Monitor, t: 'مسلسلات درامية', d: 'مواسم متصلة وحبكات متعددة الحلقات' },
  { id: 'docs', i: Mic, t: 'وثائقيات وحوارية', d: 'قصص واقعية واستكشافات عميقة' },
  { id: 'anim', i: Film, t: 'رسوم متحركة وكرتون', d: 'إبداعات بصرية لكافة الأعمار' },
];
const genres = [
  { id: 'thriller', i: Lightbulb, t: 'إثارة وغموض', d: 'ألغاز ونهايات غير متوقعة' },
  { id: 'action', i: Zap, t: 'أكشن وحركة', d: 'مطاردات وتحديات ملحمية' },
  { id: 'epic', i: Swords, t: 'ملحمي وتاريخي', d: 'حروب وحضارات غابرة' },
  { id: 'comedy', i: Laugh, t: 'كوميديا ومرح', d: 'ضحك وخفة ظل مستمرة' },
  { id: 'scifi', i: Rocket, t: 'خيال علمي وفضاء', d: 'عوالم مستقبلية وسفر كوني' },
  { id: 'horror', i: Ghost, t: 'رعب وتشويق', d: 'خوارق وظواهر مظلمة' },
  { id: 'romance', i: HeartHandshake, t: 'رومانسي واجتماعي', d: 'مشاعر وعلاقات إنسانية' },
  { id: 'classic', i: Video, t: 'كلاسيكيات مصرية', d: 'زمن الأبيض والأسود الجميل' },
  { id: 'crime', i: Shield, t: 'جريمة وعصابات', d: 'تحقيقات ومافيا ومطاردات' },
  { id: 'family', i: Users, t: 'دراما عائلية', d: 'قصص واقعية تناسب الجميع' },
  { id: 'anime', i: Drama, t: 'أنمي ياباني مترجم', d: 'شونين، سينين ومغامرات' },
];
const routing = [
  { id: 'quality', i: Tv, t: 'أعلى جودة مشاهدة ممكنة (4K UHD & HDR)', d: 'سنضع دائماً في المقدمة المنصة التي تبث العمل بأعلى دقة وتدعم تقنيات الصوت المحيطي والتنزيل فائق الوضوح.', tag: 'الأكثر تفضيلاً لعشاق السينما' },
  { id: 'mine', i: KeyRound, t: 'منصاتي وباقاتي المشترك بها أولاً', d: 'الأولوية القصوى دائماً للأعمال المتاحة مجاناً ضمن باقاتك المفعلة بعلامة «في باقتك».', tag: 'توفير أقصى' },
  { id: 'cheap', i: Tag, t: 'أقل تكلفة وأفضل سعر (Free / Lowest Price)', d: 'سنظهر لك خيارات البث المجانية الرسمية وقنوات يوتيوب المصرحة أولاً، تليها العروض الأرخص للإيجار.', tag: 'اقتصادي' },
];

const slide = {
  enter: (d: number) => ({ x: d * -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d * 60, opacity: 0 }),
};

export default function OnboardingPage() {
  const platforms = usePlatforms();
  const countries = useCountries();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [country, setCountry] = useState('EG');
  const [countryQuery, setCountryQuery] = useState('');
  const [mine, setMine] = useState<PlatformId[]>(['shahid', 'netflix', 'watchit']);
  const [fmt, setFmt] = useState<string[]>(['movies', 'series']);
  const [gen, setGen] = useState<string[]>(['thriller', 'action', 'epic']);
  const [lang, setLang] = useState<string[]>(['arabic', 'subbed']);
  const [route, setRoute] = useState('quality');
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [downloadPreview, setDownloadPreview] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggle = <T,>(list: T[], set: (v: T[]) => void, v: T) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const picks = fmt.length + gen.length + lang.length;
  const selectedCountry = countries.find((c) => c.code === country);
  const filteredCountries = useMemo(() => countries.filter((c) => c.name.includes(countryQuery) || c.official.includes(countryQuery)), [countryQuery, countries]);

  const finish = async () => {
    setSaving(true);
    await Promise.all([meApi.savePlatforms(mine), meApi.savePreferences({ country, formats: fmt, genres: gen, languages: lang, routing: route, expiryAlerts, downloadPreview })]).catch(() => undefined);
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1300px] items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-logo text-2xl font-bold text-ink">Mamatvbox</Link>
            <span className="hidden h-5 w-px bg-line sm:block" />
            <span className="hidden text-xs text-muted sm:block">إعداد التجربة المخصصة</span>
          </div>
          <nav className="hidden gap-2 md:flex">
            {stepNames.map((s, i) => (
              <button key={s} onClick={() => go(i)} className={cn('relative rounded-full px-5 py-2 text-sm', step === i ? 'font-bold text-teal' : 'text-muted')}>
                {step === i && <motion.span layoutId="ob-step" className="absolute inset-0 -z-10 rounded-full bg-panel shadow-teal" />}
                {s}
              </button>
            ))}
          </nav>
          <Link href="/" className="flex items-center gap-1 text-sm text-muted">تخطي <ArrowLeft className="h-4 w-4" /></Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1300px] px-5 py-10">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-3 font-display text-xl font-bold text-gold">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-sm text-bg">{step + 1}</span>
            الخطوة {step + 1} من ٤: {['تحديد نطاق التراخيص الإقليمية', 'المنصات المشتركة', 'الاهتمامات والأنواع', 'توجيه النتائج والتفضيل الذكي'][step]}
          </h2>
          <Link href="/" className="text-sm text-muted">تخطي الآن</Link>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-3">
          {stepNames.map((s, i) => (
            <div key={s}>
              <div className="h-1.5 overflow-hidden rounded-full bg-line">
                <motion.div className={cn('h-full rounded-full', i < step ? 'bg-teal' : 'bg-gold')} initial={false} animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.6 }} />
              </div>
              <p className={cn('mt-2 text-xs', i <= step ? 'text-gold' : 'text-dim')}>{i + 1}. {s}</p>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.section key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mt-10">
            {step === 0 && (
              <>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <Badge tone="teal" dot>تحديث دليل التراخيص: نوفمبر ٢٠٢٤</Badge>
                    <h1 className="mt-4 font-display text-4xl font-extrabold leading-snug md:text-5xl">أهلاً بك في <span className="text-gradient-brand font-logo">Mamatvbox!</span> في أي دولة تشاهد السينما؟</h1>
                    <p className="mt-3 max-w-3xl text-muted">نحدد لك مكتبات العرض المرخصة والعملة المحلية بدقة لكل منصة رقمية، لتجنب اقتراح عناوين غير مدعومة في منطقتك الجغرافية أو تحويلات أسعار غير دقيقة.</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-full bg-card p-3 pe-6"><span className="grid h-14 w-14 place-items-center rounded-full bg-panel"><Globe2 className="h-7 w-7 text-teal" /></span><div><b className="font-display text-xl">١٢ دولة مدعومة</b><p className="text-xs text-gold">+١٤٠ منصة مرخصة</p></div></div>
                </div>
                <div className="mt-8 flex h-16 items-center gap-3 rounded-full bg-card px-6"><Search className="h-5 w-5 text-muted" /><input value={countryQuery} onChange={(e) => setCountryQuery(e.target.value)} placeholder="ابحث عن دولتك (مثل: مصر، السعودية، الإمارات، المغرب...)" className="flex-1 bg-transparent outline-none placeholder:text-dim" /></div>
                <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredCountries.map((c) => (
                    <motion.button layout key={c.code} onClick={() => setCountry(c.code)} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} className={cn('relative rounded-[2rem] border p-6 text-right transition-colors', country === c.code ? 'border-gold/50 bg-gold/10' : 'border-transparent bg-card hover:bg-panel')}>
                      <AnimatePresence>{country === c.code && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute left-6 top-6 grid h-7 w-7 place-items-center rounded-full bg-gold text-bg"><Check className="h-4 w-4" /></motion.span>}</AnimatePresence>
                      <div className="flex items-center gap-3"><span className="text-4xl">{c.flag}</span><div><b className="font-display text-xl">{c.name}</b><p className="text-xs text-muted">{c.official}</p></div></div>
                      <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-4 text-xs">
                        <span className="text-muted">العملة المعتمدة</span>
                        <span className="flex items-center gap-2"><b className={country === c.code ? 'text-gold' : ''}>{c.currencyName}</b><span className="rounded-full bg-panel px-2 py-0.5 font-mono text-muted">{c.currency}</span></span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
                <div className="card mt-8 flex items-center gap-3 p-5 text-sm"><Lightbulb className="h-5 w-5 text-teal" /><span><b className="text-teal">تلميح ذكي:</b> يمكنك دائماً تغيير الدولة أو تفعيل «وضع السفر والتجوال» لاحقاً بضغطة واحدة من القائمة العلوية.</span></div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <Badge tone="teal" dot>تزامن الاشتراكات السحابي</Badge>
                    <h1 className="mt-4 font-display text-4xl font-extrabold md:text-5xl">إيه المنصات اللي مشترك فيها حالياً؟</h1>
                    <p className="mt-3 text-muted">هنعلّم على الأعمال المتوفرة في باقاتك بعلامة <span className="rounded-full bg-teal-soft px-2 text-teal">«في باقتك»</span> وهنحسبلك وفورات اشتراكاتك تلقائياً وبدقة فائقة.</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-card p-2"><span className="rounded-full bg-panel px-4 py-2 text-sm font-bold"><span className="me-2 inline-block h-2 w-2 rounded-full bg-gold" />تم تحديد {mine.length} منصات</span><button onClick={() => setMine([])} className="px-3 text-sm text-muted">إلغاء التحديد</button></div>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {platforms.map((p) => {
                    const on = mine.includes(p.id);
                    return (
                      <motion.button key={p.id} onClick={() => toggle(mine, setMine, p.id)} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} className={cn('flex h-56 flex-col justify-between p-6 text-right transition-colors', on ? 'bg-[#2c4a4a]' : 'bg-card hover:bg-panel')}>
                        <div className="flex items-start justify-between">
                          <span className="grid h-14 w-14 place-items-center rounded-full bg-bg text-lg font-bold" style={{ color: p.color }}>{p.name[0]}</span>
                          <span className={cn('flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold', on ? 'bg-teal text-bg' : 'bg-panel text-muted')}>{on ? <><Check className="h-3 w-3" /> مشترك</> : <><Plus className="h-3 w-3" /> إضافة</>}</span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div><b className="font-display text-2xl">{p.nameAr}</b><p className="mt-1 text-xs text-muted">{p.name} • {p.tagline}</p></div>
                          <motion.span animate={{ scale: on ? 1 : 0.85, rotate: on ? 0 : -90 }} className={cn('grid h-10 w-10 place-items-center rounded-full', on ? 'bg-teal text-bg' : 'bg-panel text-muted')}>{on ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</motion.span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="card mt-8 flex flex-wrap items-center justify-between gap-6 border-t-2 border-t-teal/50 p-7">
                  <div className="max-w-2xl"><h3 className="flex items-center gap-2 font-display text-2xl font-bold text-gold"><Sparkles className="h-5 w-5" /> ميزة ذكية وحصرية</h3><p className="mt-2 text-sm leading-7 text-muted">لما تختار منصاتك، هنقترح لك أولاً الأعمال اللي تقدر تشوفها فوراً ببلاش ضمن باقتك دون دفع أي رسوم إضافية، وهنحسبلك إجمالي الساعات اللي وفرت فيها تكلفة التأجير المنفصل.</p></div>
                  <div className="rounded-xl bg-bg p-5 text-center"><p className="text-xs text-teal">الوفورات المتوقعة</p><p className="font-display text-3xl font-extrabold text-gold">٪{Math.min(100, mine.length * 33)}</p><p className="text-[11px] text-muted">تغطية كتالوجية</p></div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="flex items-center gap-1 text-xs text-teal"><Sparkles className="h-3.5 w-3.5" /> محرك التوصية السينمائي الفائق</p>
                    <h1 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">ما نوع المحتوى الذي يثير شغفك السينمائي؟</h1>
                    <p className="mt-3 max-w-3xl text-muted">اختر ٣ تصنيفات على الأقل لنصمم لك صفحة رئيسية وتوصيات مخصصة لذوقك تماماً، بلمسة دار سينما منزلية رفيعة المستوى.</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-full bg-card p-3 pe-6">
                    <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90"><circle cx="18" cy="18" r="15" fill="none" stroke="#2A2E36" strokeWidth="3" /><motion.circle cx="18" cy="18" r="15" fill="none" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" strokeDasharray="94.2" animate={{ strokeDashoffset: 94.2 - Math.min(picks / 10, 1) * 94.2 }} /><text x="18" y="22" textAnchor="middle" className="rotate-90 fill-gold font-bold" style={{ transformOrigin: 'center', fontSize: 12 }}>{picks}</text></svg>
                    <div><b>تفضيلات محددة</b><p className={cn('text-xs', gen.length >= 3 ? 'text-teal' : 'text-muted')}>{gen.length >= 3 ? '✓ الحد الأدنى مكتمل' : 'اختر ٣ على الأقل'}</p></div>
                  </div>
                </div>
                <ChoiceGroup title="نوع العمل الرئيسي" note="(اختر طريقة العرض المفضلة)" items={formats} selected={fmt} onToggle={(v) => toggle(fmt, setFmt, v)} big />
                <ChoiceGroup title="التصنيفات والأنواع الفنية" note="(عالمك المفضل من السيناريو والتشويق)" items={genres} selected={gen} onToggle={(v) => toggle(gen, setGen, v)} />
                <ChoiceGroup title="تفضيل الصوت واللغة" note="(خيارات الاستماع والترجمة الافتراضية)" tone="teal" items={[{ id: 'arabic', i: Globe2, t: 'إنتاجات عربية ومصرية أصلية', d: 'أصوات ولهجات محلية بدون دبلجة' }, { id: 'subbed', i: Film, t: 'أفلام أجنبية مترجمة للعربية', d: 'الصوت الأصلي مع نصوص عربية دقيقة' }, { id: 'dubbed', i: Mic, t: 'أعمال مدبلجة للعربية', d: 'بالفصحى أو اللهجات الدارجة' }]} selected={lang} onToggle={(v) => toggle(lang, setLang, v)} cols="lg:grid-cols-3" />
                <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-gradient-to-l from-card to-[#223b3b] p-6">
                  <div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-full bg-gold text-bg"><Sparkles className="h-6 w-6" /></span><div><p className="text-xs font-bold text-gold">الذكاء التنسيقي لـ MAMATVBOX</p><p className="text-sm">اخترت {picks} خيارات سينمائية مميزة — صفحتك الرئيسية تتشكل الآن بأعلى معايير الدقة والتشويق.</p></div></div>
                  <span className="rounded-full bg-bg px-4 py-2 text-xs"><span className="me-2 inline-block h-2 w-2 rounded-full bg-teal" />الخوارزمية جاهزة للتطبيق</span>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <Badge><Sparkles className="h-3 w-3" /> الخوارزمية السينمائية المخصصة</Badge>
                <h1 className="mt-4 font-display text-4xl font-extrabold">كيف تفضل أن نوجهك للمشاهدة؟</h1>
                <p className="mt-3 text-muted">اختر المعيار الأهم بالنسبة لك عند البحث عن أي فيلم أو مسلسل لتخصيص ترتيب المنصات وزر التشغيل الفوري.</p>
                <div className="mt-8 space-y-4">
                  {routing.map((r) => {
                    const on = route === r.id;
                    return (
                      <motion.button key={r.id} onClick={() => setRoute(r.id)} layout className={cn('relative block w-full overflow-hidden p-6 text-right transition-colors', on ? 'bg-gradient-to-l from-card to-gold/60' : 'bg-card hover:bg-panel')}>
                        <div className={cn('flex items-start gap-5 rounded-2xl p-5', on && 'bg-bg/80')}>
                          <span className={cn('mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full', on ? 'bg-bg ring-2 ring-gold' : 'bg-panel')}>{on && <motion.span layoutId="route-dot" className="h-3 w-3 rounded-full bg-gold" />}</span>
                          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-panel"><r.i className={cn('h-7 w-7', on ? 'text-gold' : 'text-teal')} /></span>
                          <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><b className="font-display text-xl">{r.t}</b><Badge tone={on ? 'solidGold' : 'teal'}>{r.tag}</Badge></div><p className="mt-2 text-sm leading-7 text-muted">{r.d}</p></div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="card mt-6 p-6">
                  <h3 className="mb-4 font-display font-bold">إعدادات سينمائية إضافية للتوجيه</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="panel flex items-center justify-between gap-4 p-5"><div className="flex gap-3"><Bell className="h-5 w-5 text-gold" /><div><b className="text-sm">تنبيه انتهاء تراخيص العرض</b><p className="text-xs text-muted">تنبيهي تلقائياً عند اقتراب سحب ترخيص أي فيلم في قائمتي (هيتشال قريب).</p></div></div><Toggle checked={expiryAlerts} onChange={setExpiryAlerts} tone="gold" /></div>
                    <div className="panel flex items-center justify-between gap-4 p-5"><div className="flex gap-3"><Download className="h-5 w-5 text-teal" /><div><b className="text-sm">معاينة التنزيل المباشر</b><p className="text-xs text-muted">إظهار إمكانية التنزيل والمشاهدة أوفلاين مباشر في بطاقة ملخص العمل.</p></div></div><Toggle checked={downloadPreview} onChange={setDownloadPreview} /></div>
                  </div>
                </div>
              </>
            )}
          </motion.section>
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-between rounded-[2rem] bg-card p-5">
          {step > 0
            ? <Button variant="ghost" onClick={() => go(step - 1)} icon={<ArrowRight className="h-4 w-4" />}>الخطوة السابقة</Button>
            : <p className="flex items-center gap-2 text-sm"><span className="h-2 w-2 rounded-full bg-teal" /> تم حفظ الاختيار تلقائياً: <b>{selectedCountry?.name} ({selectedCountry?.official})</b></p>}
          {step < 3
            ? <Button size="lg" onClick={() => go(step + 1)} disabled={step === 2 && gen.length < 3}>{step === 1 ? `حفظ والمتابعة (${mine.length} منصات مختارة)` : step === 2 ? 'المتابعة للخطوة الأخيرة' : 'المتابعة للخطوة التالية'} <ArrowLeft className="h-5 w-5" /></Button>
            : <Button size="lg" onClick={finish} loading={saving} icon={<Rocket className="h-5 w-5" />}>إتمام الإعداد والدخول إلى عالم Mamatvbox</Button>}
        </div>
      </main>
    </>
  );
}

type Choice = { id: string; i: typeof Film; t: string; d: string };

function ChoiceGroup({ title, note, items, selected, onToggle, big, tone = 'gold', cols = 'lg:grid-cols-4' }: { title: string; note: string; items: Choice[]; selected: string[]; onToggle: (id: string) => void; big?: boolean; tone?: 'gold' | 'teal'; cols?: string }) {
  const on = (id: string) => selected.includes(id);
  const active = tone === 'gold' ? 'bg-[#2a2415] text-gold' : 'bg-[#15302e] text-teal';
  return (
    <div className="mt-10">
      <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold"><span className={cn('h-2.5 w-2.5 rounded-full', tone === 'gold' ? 'bg-gold' : 'bg-teal')} /> {title} <span className="text-xs font-normal text-muted">{note}</span></h3>
      <div className={cn('grid gap-3 sm:grid-cols-2', cols)}>
        {items.map((it) => (
          <motion.button key={it.id} onClick={() => onToggle(it.id)} whileTap={{ scale: 0.97 }} className={cn('flex items-center gap-4 p-5 text-right transition-colors', big && 'h-48 flex-col items-start justify-between', on(it.id) ? active : 'bg-card hover:bg-panel')}>
            <span className={cn('grid shrink-0 place-items-center rounded-full bg-bg/40', big ? 'h-14 w-14' : 'h-11 w-11')}><it.i className="h-5 w-5" /></span>
            <span className="flex-1"><b className={cn('block', big ? 'font-display text-xl' : 'text-sm')}>{it.t}</b><span className="text-xs text-muted">{it.d}</span></span>
            <motion.span key={String(on(it.id))} initial={{ scale: 0.4 }} animate={{ scale: 1 }}>{on(it.id) ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5 text-dim" />}</motion.span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
