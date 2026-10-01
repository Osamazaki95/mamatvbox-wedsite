import { CatalogView } from '@/components/catalog/CatalogView';
import { titlesApi } from '@/lib/api';

export const metadata = { title: 'مسلسلات' };

export default async function Page() {
  const titles = await titlesApi.list({ type: 'series' });
  return (
    <CatalogView
      heading="دليل المسلسلات والدراما"
      subtitle="تابع أحدث المسلسلات العربية والعالمية وأين تتوفر مواسمها الكاملة بأعلى جودة عبر المنصات المرخصة."
      eyebrow="مكتبة الدراما المرخصة"
      countLabel="٨٦٠ مسلسلاً نشطاً"
      categories={['الكل', 'دراما تاريخية', 'كوميديا', 'إثارة', 'رمضان', 'دراما اجتماعية']}
      titles={titles}
    />
  );
}
