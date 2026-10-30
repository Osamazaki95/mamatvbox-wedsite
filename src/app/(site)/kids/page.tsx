'use client';

import { Car, Moon, ShieldCheck, Sparkles, Telescope } from 'lucide-react';
import { PageSkeleton, useLoad } from '@/components/Loader';
import { CatalogView } from '@/components/catalog/CatalogView';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Poster } from '@/components/title/Poster';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { titlesApi } from '@/lib/api';


const bundles = [
  { i: Car, t: 'حزمة السفر البري بدون إنترنت', d: '١٢ حلقة وتوجيه مستقلة لتسلية الصغار في المقاعد الخلفية.', tag: 'جاهزة للتنزيل' },
  { i: Moon, t: 'تهويدات وقصص ما قبل النوم', d: 'رسوم هادئة وإيقاعات بصرية تساعد الطفل على الاسترخاء.', tag: 'هدوء وسكينة' },
  { i: Telescope, t: 'توابغ العلوم والاستكشاف', d: 'برامج تبسط علوم الفضاء والبيئة للأطفال بطريقة شيقة.', tag: 'تعليمي تفاعلي' },
];

export default function KidsPage() {
  const titles = useLoad(() => titlesApi.list({ type: 'kids' }));
  if (!titles) return <PageSkeleton />;
  const hero = titles[0];
  if (!hero) return <CatalogView heading="عالم الأطفال والكرتون" subtitle="لا توجد أعمال أطفال متاحة حالياً — ستظهر تلقائياً بعد المزامنة." eyebrow="مكتبة الأطفال" countLabel="٠ عمل" categories={['الكل']} titles={[]} />;

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-5 pt-10">
        <Reveal>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <Badge tone="gold"><Sparkles className="h-3 w-3" /> الوجهة العائلية الترفيهية الموثوقة</Badge>
              <h1 className="mt-4 font-display text-4xl font-extrabold">عالم الأطفال والكرتون — سينما ممتعة وآمنة ١٠٠٪</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted">دليل أولياء الأمور لاكتشاف الرسوم المتحركة ومحتوى العائلة عبر جميع المنصات الرسمية بدبلجة عربية قصصية ومصنفة عمرياً بدقة.</p>
            </div>
            <div className="space-y-2 text-sm">
              {['رقابة أبوية موثوقة', 'دبلجة عربية قصصية مميزة', 'خالٍ تماماً من المحتوى غير المناسب'].map((x) => (
                <div key={x} className="flex items-center gap-2 rounded-full bg-panel px-4 py-2"><ShieldCheck className="h-4 w-4 text-teal" /> {x}</div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-8">
          <div className="card grid overflow-hidden lg:grid-cols-[1.3fr_1fr]">
            <Poster title={hero} className="min-h-[320px]" />
            <div className="p-8">
              <div className="flex flex-wrap gap-2"><Badge tone="gold">+٧ سنوات</Badge><Badge tone="solidGold">4K ULTRA HD</Badge><Badge tone="teal">تنزيل متاح للسفر</Badge></div>
              <h2 className="mt-4 font-display text-2xl font-bold">مسلسل {hero.title}: سر البردية الذهبية</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{hero.overview}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                {['معدوم — العنف', 'نقية وقصصية — اللغة', 'تاريخي وأخلاقي — القيم'].map((x) => <div key={x} className="panel p-3 text-teal">{x}</div>)}
              </div>
              <Button className="mt-6">أين تشاهد مع العائلة؟</Button>
            </div>
          </div>
        </Reveal>
      </section>

      <CatalogView heading="مكتبة البراعم والمغامرات المختارة" subtitle="عروض معتمدة من لجان المشاهدة الأبوية مع توفير روابط المشاهدة الرسمية." eyebrow="مكتبة الأطفال" countLabel="٣٢٠ عملاً" categories={['الكل', 'مغامرات', 'تعليمي', 'رياضي', 'أنمي']} titles={titles} />

      <section className="mx-auto max-w-[1400px] px-5">
        <h2 className="mb-6 font-display text-2xl font-bold">مجموعات سريعة لرحلات السيارة وسهرات العطلة</h2>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {bundles.map((b) => (
            <StaggerItem key={b.t} className="card group p-6 transition hover:-translate-y-1 hover:border-teal/40">
              <div className="flex items-center justify-between"><b.i className="h-7 w-7 text-teal transition group-hover:scale-110" /><Badge tone="teal">{b.tag}</Badge></div>
              <h3 className="mt-5 font-display text-lg font-bold">{b.t}</h3>
              <p className="mt-2 text-sm text-muted">{b.d}</p>
              <p className="mt-4 text-sm font-semibold text-gold">تصفح الحزمة ←</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
