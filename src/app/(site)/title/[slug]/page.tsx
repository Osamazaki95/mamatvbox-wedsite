import { BellRing, Clock, Download, Eye, MapPin, Star } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { read } from '@/lib/server/store';
import { Bar, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { platformName } from '@/components/title/PlatformChip';
import { Poster } from '@/components/title/Poster';
import { TitleActions } from '@/components/title/TitleActions';
import { TitleRow } from '@/components/title/TitleRow';
import { Button } from '@/components/ui/Button';
import { Badge, SectionHeader } from '@/components/ui/primitives';
import { platformsApi, titlesApi } from '@/lib/api';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [t, { seo }] = await Promise.all([titlesApi.bySlug(params.slug), read('settings')]);
  if (!t) return { title: 'غير موجود', robots: { index: false } };
  const title = `أين تشاهد ${t.title} (${t.year})`;
  const description = (t.overview || `اعرف فين تتفرج على ${t.title} قانونياً وبأعلى جودة.`).slice(0, 160);
  return {
    title,
    description,
    keywords: [t.title, t.originalTitle ?? '', `أين أشاهد ${t.title}`, ...t.genres, ...seo.keywords].filter(Boolean),
    alternates: { canonical: `/title/${t.slug}` },
    openGraph: { type: t.type === 'series' ? 'video.tv_show' : 'video.movie', title, description, images: t.poster ? [t.poster] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: t.poster ? [t.poster] : undefined },
  };
}

export default async function TitlePage({ params }: { params: { slug: string } }) {
  const title = await titlesApi.bySlug(params.slug);
  if (!title) notFound();
  const [similar, platforms] = await Promise.all([titlesApi.similar(title.slug), platformsApi.list()]);
  const offers = platforms.filter((p) => title.platforms.includes(p.id));
  const unavailable = offers.length === 0 || !title.inPlan;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': title.type === 'series' ? 'TVSeries' : 'Movie',
    name: title.title,
    alternateName: title.originalTitle,
    image: title.poster,
    description: title.overview,
    datePublished: String(title.year),
    genre: title.genres,
    director: title.director ? { '@type': 'Person', name: title.director } : undefined,
    actor: title.cast.map((name) => ({ '@type': 'Person', name })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(70% 80% at 80% 0%, ${title.tint}, transparent 70%)` }} />
        <div className="relative mx-auto grid max-w-[1400px] gap-10 px-5 py-12 lg:grid-cols-[1fr_360px]">
          <Reveal className="order-2 lg:order-1">
            <div className="flex flex-wrap gap-2">
              <Badge tone="teal" dot>{title.inPlan ? 'في باقتك المشتركة' : 'متاح للإيجار أو الشراء'}</Badge>
              <Badge>تم التحديث منذ ساعتين</Badge>
            </div>
            <h1 className="mt-4 font-display text-5xl font-extrabold">{title.title}</h1>
            {title.originalTitle && <p className="mt-2 font-logo text-xl text-muted">{title.originalTitle}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Badge tone="solidGold">{title.quality}</Badge>
              <Badge tone="violet">HDR10+</Badge>
              <Badge>DOLBY ATMOS</Badge>
              {title.download && <Badge tone="teal"><Download className="h-3 w-3" /> تنزيل متاح</Badge>}
              <span>• {title.year} • {title.runtime} • {title.genres.join('، ')}</span>
            </div>
            <p className="mt-6 max-w-3xl leading-8 text-ink/85">{title.overview}</p>
            <p className="mt-4 text-sm text-muted">إخراج: <b className="text-ink">{title.director}</b> • بطولة: {title.cast.join('، ')}</p>
            <div className="mt-8"><TitleActions title={title} /></div>

            <Stagger className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { i: Star, l: 'التقييم العالمي', v: `${title.rating} / 10` },
                { i: Eye, l: 'مشاهدات الشهر', v: '١.٢ مليون' },
                { i: Clock, l: 'مدة العرض', v: title.runtime },
                { i: MapPin, l: 'النطاق المحلي', v: unavailable ? 'مصر (غير متاح)' : 'مصر (متاح)' },
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

      <section className="mx-auto max-w-[1400px] px-5 py-8">
        <SectionHeader eyebrow="التوزيع القانوني الموثق" title="أين تشاهد العمل الآن؟" subtitle="ترتيب ذكي حسب الجودة ومدى توفره في باقتك — تحديث مباشر عبر JustWatch API." />
        <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((p, i) => (
            <StaggerItem key={p.id} className="card p-6 transition hover:border-teal/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl font-bold" style={{ background: `${p.color}22`, color: p.color }}>{p.name[0]}</span>
                  <div><b>{p.name}</b><p className="text-xs text-muted">{i === 0 ? 'مشمول في باقتك' : 'متاح بالاشتراك'}</p></div>
                </div>
                <Badge tone={i === 0 ? 'solidGold' : 'muted'}>{p.maxQuality}</Badge>
              </div>
              <div className="mt-5 space-y-2 text-xs text-muted">
                <div className="flex justify-between"><span>الصوت</span><b className="text-ink">{p.audio}</b></div>
                <div className="flex justify-between"><span>HDR</span><b className="text-ink">{p.hdr ?? 'SDR'}</b></div>
                <div className="flex justify-between"><span>السعر الشهري</span><b className="text-gold">{p.priceMonthly} ج.م</b></div>
              </div>
              <Bar value={92 - i * 18} className="mt-4" color={i === 0 ? 'bg-gold' : 'bg-teal'} />
              <Button className="mt-5 w-full" variant={i === 0 ? 'gold' : 'ghost'}>شاهد على {platformName(p.id)}</Button>
            </StaggerItem>
          ))}
        </Stagger>

        {unavailable && (
          <Reveal className="mt-8">
            <div className="card flex flex-wrap items-center justify-between gap-6 border-gold/30 p-7">
              <div className="max-w-2xl">
                <Badge tone="gold">حالة التوفر الإقليمي</Badge>
                <h3 className="mt-3 font-display text-xl font-bold">هذا العمل غير متاح حالياً للبث ضمن باقاتك في نطاقك الجغرافي (جمهورية مصر العربية 🇪🇬)</h3>
                <p className="mt-2 text-sm text-muted">حقوق البث الرقمي غير مفعّلة على بعض المنصات داخل الشرق الأوسط، لكن العمل متاح قانونياً في دول ومناطق أخرى.</p>
              </div>
              <Button icon={<BellRing className="h-4 w-4" />}>نبهني فور توفر الفيلم في مصر</Button>
            </div>
          </Reveal>
        )}
      </section>

      <TitleRow title="أعمال مشابهة متاحة الآن في باقتك" titles={similar} />
    </>
  );
}
