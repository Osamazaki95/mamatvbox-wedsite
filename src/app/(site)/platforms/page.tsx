'use client';

import { Check, ExternalLink, Scale, X } from 'lucide-react';
import { PageSkeleton, useLoad } from '@/components/Loader';
import { CountUp, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { PlatformLogo } from '@/components/title/PlatformLogo';
import { Button } from '@/components/ui/Button';
import { Badge, SectionHeader } from '@/components/ui/primitives';
import { loadPlatforms } from '@/lib/site';


export default function PlatformsPage() {
  const platforms = useLoad(() => loadPlatforms());
  if (!platforms) return <PageSkeleton />;
  const paid = platforms.filter((p) => p.priceMonthly > 0).map((p) => p.priceMonthly);
  const uhd = platforms.filter((p) => /4K/i.test(p.maxQuality)).length;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10">
      <Reveal>
        <Badge tone="teal" dot>دليل الخيار الرقمي السينمائي • {platforms.length} منصة</Badge>
        <h1 className="mt-4 font-display text-4xl font-extrabold">دليل ومقارنة المنصات الرقمية المرخصة في مصر والشرق الأوسط</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">نقدم لك تحليلاً محايداً ومحدثاً لجميع خدمات البث القانونية. تقارن الأسعار الرسمية بالجنيه المصري، وحزم الجودة الفائقة، ومكتبات المحتوى الحصرية دون أي تحيز تجاري.</p>
      </Reveal>

      <Stagger className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { l: 'المنصات المتوفرة', v: platforms.length, s: ' منصة رسمية' },
          { l: 'أقل سعر للاشتراك', v: paid.length ? Math.min(...paid) : 0, s: ' ج.م / شهرياً' },
          { l: 'دعم البث 4K', v: uhd, s: ` من أصل ${platforms.length} منصة` },
          { l: 'الشرعية والتراخيص', v: 100, s: '%' },
        ].map((k) => (
          <StaggerItem key={k.l} className="card p-5">
            <p className="text-xs text-muted">{k.l}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-teal"><CountUp to={k.v} /><span className="text-sm text-muted">{k.s}</span></p>
          </StaggerItem>
        ))}
      </Stagger>

      <Stagger className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {platforms.map((p) => (
          <StaggerItem key={p.id} className="card group flex scroll-mt-28 flex-col p-6 transition hover:-translate-y-1 hover:border-gold/40">
            <span id={p.id} className="block scroll-mt-28" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <PlatformLogo platform={p} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-gold">{p.tagline}</p>
                  <h2 className="mt-1 truncate font-logo text-2xl font-bold">{p.name}</h2>
                </div>
              </div>
              <div className="rounded-xl bg-panel px-3 py-2 text-center">
                <p className="text-[10px] text-muted">يبدأ من</p>
                <p className="font-display text-xl font-bold text-gold">{p.priceMonthly || 'حسب العمل'}</p>
                {p.priceMonthly > 0 && <p className="text-[10px] text-muted">ج.م / شهر</p>}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge tone="solidGold">{p.maxQuality}</Badge>
              {p.hdr && <Badge tone="violet">{p.hdr}</Badge>}
              {p.offline && <Badge tone="teal">تنزيل متاح</Badge>}
              {p.trialDays > 0 && <Badge>تجربة مجانية {p.trialDays} أيام</Badge>}
            </div>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm text-muted">
              {p.catalogSize > 0 && <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-teal" /> مكتبة تضم أكثر من {p.catalogSize.toLocaleString('en-US')} عنوان</li>}
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-teal" /> صوت {p.audio} على {p.screens} شاشات متزامنة</li>
            </ul>
            <div className="mt-6 flex gap-2">
              <Button className="flex-1" href={`/movies/?platform=${encodeURIComponent(p.id)}`}>أفلام المنصة</Button>
              <Button variant="ghost" href={`/series/?platform=${encodeURIComponent(p.id)}`}>مسلسلات</Button>
              {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-full bg-panel hover:bg-line" aria-label="الموقع الرسمي" title="الموقع الرسمي"><ExternalLink className="h-4 w-4" /></a>}
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-14">
        <SectionHeader title="مصفوفة المقارنة المباشرة السريعة (Matrix)" subtitle="نظرة شاملة لتفاصيل الاشتراك والجودة وتقنيات الصوت والتنزيل عبر كل المنصات." />
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>{['المنصة', 'أقل سعر شهري', 'أقصى دقة', 'HDR', 'الصوت', 'تنزيل', 'تجربة مجانية', ''].map((h) => <th key={h} className="p-4 text-right font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {platforms.map((p) => (
                <tr key={p.id} className="border-t border-line/50 transition hover:bg-panel/50">
                  <td className="p-4"><span className="flex items-center gap-2 font-bold text-teal"><PlatformLogo platform={p} size="sm" />{p.name}</span></td>
                  <td className="p-4 font-bold text-gold">{p.priceMonthly ? `${p.priceMonthly} ج.م` : 'حسب العمل'}</td>
                  <td className="p-4"><Badge tone="solidGold">{p.maxQuality}</Badge></td>
                  <td className="p-4 text-muted">{p.hdr ?? '—'}</td>
                  <td className="p-4 text-muted">{p.audio}</td>
                  <td className="p-4">{p.offline ? <Check className="h-5 w-5 text-teal" /> : <X className="h-5 w-5 text-dim" />}</td>
                  <td className="p-4 text-muted">{p.trialDays ? `${p.trialDays} أيام` : 'غير متوفر'}</td>
                  <td className="p-4">{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-panel px-3 py-1.5 text-xs font-semibold hover:bg-line">الموقع الرسمي <ExternalLink className="h-3 w-3" /></a> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal className="mt-10">
        <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3"><Scale className="h-6 w-6 text-gold" /><div><b>ميثاق Mamatvbox للشفافية والتوجيه السينمائي</b><p className="text-xs text-muted">لا نتقاضى أي عمولات لتفضيل منصة على أخرى في ترتيب نتائج المقارنة.</p></div></div>
          <Button variant="ghost" href="/legal">سياسة التحقق والحياد</Button>
        </div>
      </Reveal>
    </div>
  );
}
