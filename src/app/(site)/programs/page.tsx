'use client';

import { CatalogView } from '@/components/catalog/CatalogView';
import { PageSkeleton, useLoad } from '@/components/Loader';
import { titlesApi } from '@/lib/api';
import { toArabicDigits } from '@/lib/utils';

export default function Page() {
  const titles = useLoad(() => titlesApi.list({ type: 'program' }));
  if (!titles) return <PageSkeleton />;
  return (
    <CatalogView
      heading="البرامج والوثائقيات"
      subtitle="برامج حوارية ووثائقية ورياضية متاحة عبر المنصات الرسمية."
      eyebrow="برامج مرخصة"
      countLabel={`${toArabicDigits(titles.length)} برنامجاً`}
      categories={['الكل', 'حواري', 'وثائقي', 'رياضة', 'مسابقات']}
      titles={titles}
    />
  );
}
