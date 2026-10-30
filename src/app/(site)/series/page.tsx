'use client';

import { CatalogView } from '@/components/catalog/CatalogView';
import { PageSkeleton, useLoad } from '@/components/Loader';
import { titlesApi } from '@/lib/api';
import { toArabicDigits } from '@/lib/utils';

export default function Page() {
  const titles = useLoad(() => titlesApi.list({ type: 'series' }));
  if (!titles) return <PageSkeleton />;
  return (
    <CatalogView
      heading="دليل المسلسلات والدراما"
      subtitle="تابع أحدث المسلسلات العربية والعالمية وأين تتوفر مواسمها الكاملة بأعلى جودة عبر المنصات المرخصة."
      eyebrow="مكتبة الدراما المرخصة"
      countLabel={`${toArabicDigits(titles.length)} مسلسلاً نشطاً`}
      categories={['الكل', 'دراما', 'كوميديا', 'إثارة', 'جريمة', 'تاريخي']}
      titles={titles}
    />
  );
}
