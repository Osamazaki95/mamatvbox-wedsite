'use client';

import { CatalogView } from '@/components/catalog/CatalogView';
import { PageSkeleton, useLoad } from '@/components/Loader';
import { titlesApi } from '@/lib/api';
import { toArabicDigits } from '@/lib/utils';

export default function Page() {
  const titles = useLoad(() => titlesApi.list({ type: 'movie' }));
  if (!titles) return <PageSkeleton />;
  return (
    <CatalogView
      type="movie"
      heading="دليل وأرشيف الأفلام القانونية"
      subtitle="استكشف أين تشاهد الأفلام العربية والعالمية مع مقارنة الجودة، خيارات التنزيل دون إنترنت، والتكلفة الاشتراكية لحظة بلحظة وبشكل رسمي وآمن."
      eyebrow="أرشيف السينما القانونية المرخصة"
      countLabel={`${toArabicDigits(titles.length)} فيلماً نشطاً`}
      titles={titles}
    />
  );
}
