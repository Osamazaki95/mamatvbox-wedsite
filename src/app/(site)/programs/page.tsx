import { CatalogView } from '@/components/catalog/CatalogView';
import { titlesApi } from '@/lib/api';

export const metadata = { title: 'برامج' };

export default async function Page() {
  const titles = await titlesApi.list({ type: 'program' });
  return (
    <CatalogView
      heading="البرامج والوثائقيات"
      subtitle="برامج حوارية ووثائقية ورياضية متاحة عبر المنصات الرسمية."
      eyebrow="برامج مرخصة"
      countLabel="٣١٠ برنامجاً"
      categories={['الكل', 'حواري', 'وثائقي', 'رياضة', 'مسابقات']}
      titles={titles}
    />
  );
}
