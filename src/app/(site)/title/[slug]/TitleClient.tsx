'use client';

import { BellRing, Clock, Download, ExternalLink, Eye, Globe2, MapPin, Moon, SearchX, Star } from 'lucide-react';
import { useEffect } from 'react';
import { PageSkeleton, useLoad, useUrlSlug } from '@/components/Loader';
import { Bar, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { PlatformLogo } from '@/components/title/PlatformLogo';
import { Poster } from '@/components/title/Poster';
import { TitleActions, watchUrl } from '@/components/title/TitleActions';
import { TitleRow } from '@/components/title/TitleRow';
import { Button } from '@/components/ui/Button';
import { Badge, SectionHeader } from '@/components/ui/primitives';
import { titlesApi } from '@/lib/api';
import { sectionOf } from '@/lib/site-defaults';
import { loadPlatforms, useSiteConfig } from '@/lib/site';
import { personHref } from '@/lib/person';

export default function TitleClient() {
  const slug = useUrlSlug('title');
  const d = useLoad(async () => {
    if (!slug) return null;
    const title = await titlesApi.bySlug(slug);
    if (!title) return { title: null, similar: [], platforms: [] };
    const [similar, platforms] = await Promise.all([titlesApi.similar(title.slug), loadPlatforms()]);
    return { title, similar, platforms };
  }, [slug]);
  const config = useSiteConfig();
  const loadedSlug = d?.title?.slug;
  useEffect(() => { if (loadedSlug) titlesApi.view(loadedSlug); }, [loadedSlug]);

  if (!d) return <PageSkeleton />;
  if (!d.title) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <SearchX className="mx-auto h-12 w-12 text-gold" />
        <h1 className="mt-5 font-display text-3xl font-bold">العمل غير موجود</h1>
        <p className="mt-2 text-muted">ربما تم تغيير الرابط أو لم يعد العمل متاحاً في منطقتك.</p>
        <Button href="/search" className="mt-6">ابحث عن عمل آخر</Button>
      </div>
    );
  }

  const { title, similar, platforms } = d;
  const offers = platforms.filter((p) => title.platforms.includes(p.id));
  const unavailable = offers.length === 0 || !title.inPlan;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(70% 80% at 80% 0%, ${title.tint}, transparent 70%)` }} />
        <div className="relative mx-auto grid max-w-[1400px] gap-10 px-5 py-12 lg:grid-cols-[1fr_360px]">
          <Reveal className="order-2 lg:order-1">
            <div className="flex flex-wrap gap-2">
              <Badge tone="teal" dot>{title.inPlan ? 'في باقتك المشتركة' : 'متاح على المنصات الرسمية'}</Badge>
              {title.ramadan && <Badge tone="gold"><Moon className="h-3 w-3" /> رمضان</Badge>}
              {title.origin && <a href={`${sectionOf(title.type).href}/?origin=${encodeURIComponent(title.origin)}`}><Badge tone="violet"><Globe2 className="h-3 w-3" /> {sectionOf(title.type).label} {title.origin}</Badge></a>}
              {title.source === 'tmdb' && <Badge>محدّث تلقائياً</Badge>}
            </div>
            <h1 translate="no" className="notranslate mt-4 font-display text-5xl font-extrabold">{title.title}</h1>
            {title.originalTitle && title.originalTitle !== title.title && <p className="mt-2 font-logo text-xl text-muted">{title.originalTitle}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Badge tone="solidGold">{title.quality}</Badge>
              {title.download && <Badge tone="teal"><Download className="h-3 w-3" /> تنزيل متاح</Badge>}
              <span>• {title.year} • {title.runtime}</span>
              {title.genres.map((g) => <a key={g} href={`${sectionOf(title.type).href}/?genre=${encodeURIComponent(g)}`} className="rounded-full bg-panel px-2.5 py-0.5 text-xs hover:bg-line hover:text-ink">{g}</a>)}
            </div>
            {title.overview && <p className="mt-6 max-w-3xl leading-8 text-ink/85">{title.overview}</p>}
            {title.director && (
              <p className="mt-4 text-sm text-muted">إخراج: <a href={personHref(title.director)} translate="no" className="notranslate font-bold text-ink underline decoration-line underline-offset-4 hover:text-teal">{title.director}</a></p>
            )}
            {title.cast.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-muted">بطولة:</p>
                <div className="flex flex-wrap gap-2">
                  {title.cast.map((n) => (
                    <a key={n} href={personHref(n)} translate="no" className="notranslate flex items-center gap-2 rounded-full bg-panel py-1.5 pe-4 ps-1.5 text-sm transition hover:-translate-y-0.5 hover:bg-line hover:text-ink">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-soft text-xs font-bold text-teal">{n.trim()[0]}</span>{n}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-8"><TitleActions title={title} /></div>

            <Stagger className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { i: Star, l: 'التقييم العالمي', v: `${title.rating} / 10` },
                { i: Eye, l: 'متاح على', v: `${offers.length} ${offers.length === 1 ? 'منصة' : 'منصات'}` },
                { i: Clock, l: 'النوع', v: title.runtime },
                { i: MapPin, l: 'النطاق المحلي', v: offers.length ? 'مصر (متاح)' : 'مصر (غير متاح)' },
              ].map((k) => (
                <StaggerItem key={k.l} className="card p-4">
                  <k.i className="h-5 w-5 text-gold" />
                  <p className="mt-2 text-[11px] text-muted">{k.l}</p>
                  <p className="font-display font-bold">{k.v}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={0.1}>
            <Poster title={title} priority className="mx-auto aspect-[2/3] w-full max-w-[260px] rounded-3xl shadow-card ring-1 ring-line sm:max-w-[320px] lg:max-w-none" />
          </Reveal>
        </div>
      </section>

      <section id="where-to-watch" className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-8">
        <SectionHeader eyebrow="التوزيع القانوني الموثق" title="أين تشاهد العمل الآن؟" subtitle="ترتيب ذكي حسب الجودة والتوفر في منطقتك." />
        <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((p, i) => (
            <StaggerItem key={p.id} className="card p-6 transition hover:border-teal/40">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <PlatformLogo platform={p} />
                  <div className="min-w-0"><b className="block truncate">{p.nameAr || p.name}</b><p className="text-xs text-muted">{p.kind === 'free' ? 'مجاني قانوني' : p.kind === 'ads' ? 'مجاني بإعلانات' : p.kind === 'rental' ? 'تأجير / شراء' : 'متاح بالاشتراك'}</p></div>
                </div>
                <Badge tone={i === 0 ? 'solidGold' : 'muted'}>{p.maxQuality}</Badge>
              </div>
              <div className="mt-5 space-y-2 text-xs text-muted">
                <div className="flex justify-between"><span>الصوت</span><b className="text-ink">{p.audio}</b></div>
                <div className="flex justify-between"><span>HDR</span><b className="text-ink">{p.hdr ?? 'SDR'}</b></div>
                <div className="flex justify-between"><span>السعر الشهري</span><b className="text-gold">{p.priceMonthly ? `${p.priceMonthly} ${p.currency}` : 'مجاني / حسب العمل'}</b></div>
              </div>
              <Bar value={Math.max(30, 92 - i * 18)} className="mt-4" color={i === 0 ? 'bg-gold' : 'bg-teal'} />
              <a href={watchUrl(title, p.id, p)} target="_blank" rel="noopener noreferrer sponsored" className={`mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition hover:-translate-y-0.5 ${i === 0 ? 'bg-gold text-bg shadow-gold hover:text-bg' : 'bg-panel hover:bg-line hover:text-ink'}`}>
                شاهد على {p.nameAr || p.name} <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </StaggerItem>
          ))}
        </Stagger>

        {unavailable && offers.length === 0 && (
          <Reveal className="mt-8">
            <div className="card flex flex-wrap items-center justify-between gap-6 border-gold/30 p-7">
              <div className="max-w-2xl">
                <Badge tone="gold">حالة التوفر الإقليمي</Badge>
                <h3 className="mt-3 font-display text-xl font-bold">هذا العمل غير متاح حالياً للبث في نطاقك الجغرافي</h3>
                <p className="mt-2 text-sm text-muted">حقوق البث الرقمي غير مفعّلة على المنصات داخل منطقتك حالياً.</p>
              </div>
              {config?.features.accounts && <Button href="/notifications/" icon={<BellRing className="h-4 w-4" />}>نبهني فور توفر العمل</Button>}
            </div>
          </Reveal>
        )}
      </section>

      {similar.length > 0 && <TitleRow title="أعمال مشابهة متاحة الآن" titles={similar} />}
    </>
  );
}
