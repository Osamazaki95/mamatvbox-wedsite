'use client';

import { Bell, BellRing, Check, Download, Filter, PiggyBank, Search, SlidersHorizontal, Star, Wallet } from 'lucide-react';
import { PageSkeleton, useLoad } from '@/components/Loader';
import { HomeHero } from '@/components/home/HomeHero';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Poster } from '@/components/title/Poster';
import { TitleRow } from '@/components/title/TitleRow';
import { Button } from '@/components/ui/Button';
import { Faq } from '@/components/ui/Faq';
import { Badge, SectionHeader } from '@/components/ui/primitives';
import { platformsApi, titlesApi } from '@/lib/api';

const steps = [
  { n: '٠١', icon: Search, title: 'ابحث عن عملك المفضل', body: 'ابحث في كتالوج يضم آلاف الأفلام والمسلسلات العربية والعالمية. أكتب الاسم بالعربي أو الإنجليزي وسنجد لك النتائج.' },
  { n: '٠٢', icon: SlidersHorizontal, title: 'قارن المنصات وجودة البث', body: 'اكتشف أين يتوفر العمل قانونياً وبأعلى جودة 4K UHD وHDR مع مقارنة الأسعار وخيارات التنزيل للمشاهدة بدون اتصال.' },
  { n: '٠٣', icon: Filter, title: 'انقر وشاهد مباشرة', body: 'توجيه مباشر آمن لصفحة العمل على المنصة الرسمية بدون إعلانات أو نوافذ منبثقة وبضغطة زر واحدة.' },
];

const faqs = [
  { q: 'هل تقوم المنصة بتشغيل أو بث الأفلام والمسلسلات مباشرة؟', a: 'لا، Mamatvbox محرك بحث وتوجيه قانوني فقط. نوجهك إلى المنصة الرسمية المرخصة التي تعرض العمل في منطقتك.' },
  { q: 'كيف تعمل ميزة «في باقتك» المخصصة؟', a: 'عند تحديد منصاتك المشترك بها، نميز الأعمال المتاحة لك مجاناً ضمن اشتراكاتك بعلامة «في باقتك» في كل مكان على الموقع.' },
  { q: 'هل الروابط والتوجيهات آمنة ورسمية بنسبة 100%؟', a: 'نعم، جميع الروابط مستخرجة من الشركاء الرسميين وخاضعة للتحقق الآلي كل ١٥ دقيقة.' },
  { q: 'هل تدعم المنصة تتبع العروض بدقة 4K وتقنيات الصوت Dolby؟', a: 'نعم، نرصد الجودة القصوى المتاحة لكل عمل على كل منصة بما في ذلك HDR10 وDolby Vision وDolby Atmos.' },
];

export default function HomePage() {
  const d = useLoad(() => Promise.all([titlesApi.trending(), platformsApi.list(), titlesApi.list()]));
  if (!d) return <PageSkeleton />;
  const [trending, platforms, all] = d;
  const featured = all[0];

  return (
    <>
      <HomeHero stats={{ titles: all.length, platforms: platforms.length }} />

      <section className="mx-auto max-w-[1400px] px-5 py-14">
        <Reveal><SectionHeader eyebrow="خطوة بخطوة" title="كيف تعمل المنصة في ٣ خطوات بسيطة" subtitle="رحلة سينمائية ذكية تبدأ من البحث وتنتهي بالمشاهدة بضغطة واحدة." /></Reveal>
        <Stagger className="grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <StaggerItem key={s.n} className="card group p-7 transition hover:border-teal/40">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-gold">{s.n}</span>
                <s.icon className="h-6 w-6 text-muted transition group-hover:scale-110 group-hover:text-teal" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{s.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-10">
        <div className="card p-7">
          <SectionHeader eyebrow="منصات البث القانونية في مصر والشرق الأوسط" title="شركاء المحتوى والمنصات المرخصة" />
          <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {platforms.map((p) => (
              <StaggerItem key={p.id} className="panel p-5 text-center transition hover:-translate-y-1 hover:bg-line">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl text-lg font-bold" style={{ background: `${p.color}22`, color: p.color }}>{p.name[0]}</span>
                <h3 className="mt-3 font-display font-bold">{p.name}</h3>
                <p className="mt-1 text-[11px] text-muted">{p.tagline}</p>
                <p className="mt-2 text-[11px] font-semibold text-teal">{p.priceMonthly ? `من ${p.priceMonthly} ج.م/شهرياً` : 'شراء وتأجير'}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {featured && (
      <Reveal className="mx-auto max-w-[1400px] px-5 py-10">
        <div className="card grid gap-8 overflow-hidden p-7 lg:grid-cols-[260px_1fr]">
          <Poster title={featured} className="aspect-[2/3] rounded-2xl" />
          <div>
            <Badge tone="gold">بحث تفاعلي مباشر</Badge>
            <h3 className="mt-3 font-display text-2xl font-bold">أين تشاهد «{featured.title}» الآن؟</h3>
            <p className="mt-1 text-sm text-muted">المنصات الرسمية المتاح عليها العمل.</p>
            <div className="mt-6 space-y-3">
              {platforms.filter((p) => featured.platforms.includes(p.id)).map((p, i) => (
                <div key={p.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
                  <div><b>{p.nameAr || p.name}</b><p className="text-xs text-muted">{p.priceMonthly ? `${p.priceMonthly} ${p.currency} / شهرياً` : 'مجاني / حسب العمل'}</p></div>
                  <Badge tone={i === 0 ? 'solidGold' : 'muted'}>{p.maxQuality}</Badge>
                  <Button size="sm" variant={i === 0 ? 'gold' : 'ghost'} href={`/title/${featured.slug}/`}>شاهد على {p.nameAr || p.name}</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
      )}

      {trending.length > 0 && <TitleRow title="الأكثر مشاهدة اليوم في مصر" icon={<Star className="h-6 w-6" />} titles={trending} href="/movies" />}

      <Reveal className="mx-auto max-w-[1400px] px-5 py-10">
        <div className="card relative grid gap-8 overflow-hidden p-8 lg:grid-cols-[1fr_360px]">
          <div className="glow-gold pointer-events-none absolute inset-0" />
          <div className="relative">
            <Badge tone="gold">عضوية Mamatvbox Premium</Badge>
            <h3 className="mt-4 font-display text-3xl font-bold leading-snug">تحكم كامل في ميزانية ترفيهك وتنبيهات فورية عند وصول أعمالك المرتقبة</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { i: BellRing, t: 'تنبيهات فورية للهاتف' },
                { i: Wallet, t: 'مزامنة باقات غير محدودة' },
                { i: Bell, t: 'تتبع مواعيد انتهاء الحقوق' },
                { i: Download, t: 'تصفح بدون إعلانات' },
              ].map((f) => <div key={f.t} className="flex items-center gap-3 text-sm"><f.i className="h-5 w-5 text-teal" /> {f.t}</div>)}
            </div>
          </div>
          <div className="panel relative p-6 text-center">
            <p className="text-xs text-muted">تجربة مجانية كاملة</p>
            <p className="mt-2 font-display text-5xl font-extrabold text-gold">مجاناً</p>
            <p className="mt-2 text-sm">لمدة ١٤ يوماً • ثم 19.99 ج.م</p>
            <Button href="/pricing" className="mt-6 w-full">ابدأ التجربة المجانية الآن</Button>
            <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-dim"><Check className="h-3 w-3" /> إلغاء في أي وقت</p>
          </div>
        </div>
      </Reveal>

      <section className="mx-auto max-w-3xl px-5 py-14">
        <Reveal><SectionHeader eyebrow="لديك سؤال؟" title="الأسئلة الشائعة" /></Reveal>
        <Faq items={faqs} />
      </section>

      <Reveal className="mx-auto max-w-[1400px] px-5">
        <div className="card relative overflow-hidden p-12 text-center">
          <div className="glow-teal pointer-events-none absolute inset-0" />
          <h2 className="relative font-display text-3xl font-bold">وفّر وقت البحث وتنقّل بين أفضل الأعمال الترفيهية بدون أي مجهود</h2>
          <p className="relative mt-3 text-muted">انضم إلى أكثر من 250,000 مشاهد في العالم العربي يستخدمون Mamatvbox لاكتشاف محتواهم القادم.</p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Button href="/signup" icon={<PiggyBank className="h-4 w-4" />}>ابدأ تجربتك المجانية</Button>
            <Button href="/movies" variant="ghost">استكشف مكتبة الأعمال</Button>
          </div>
        </div>
      </Reveal>
    </>
  );
}
