import { CatalogView } from '@/components/catalog/CatalogView';
import { titlesApi } from '@/lib/api';

export const metadata = { title: 'أفلام' };

export default async function Page() {
  const titles = await titlesApi.list();
  return (
    <CatalogView
      heading="دليل وأرشيف الأفلام القانونية"
      subtitle="استكشف أين تشاهد أكثر من ١٢,٠٠٠ فيلم عربي وعالمي مع مقارنة الجودة، خيارات التنزيل دون إنترنت، والتكلفة الاشتراكية لحظة بلحظة وبشكل رسمي وآمن."
      eyebrow="أرشيف السينما القانونية المرخصة"
      countLabel="١,٤٢٠ فيلماً نشطاً"
      categories={['الكل', 'أكشن وإثارة', 'دراما وواقعية', 'كوميديا عائلية', 'خيال علمي', 'رعب وغموض', 'وثائقية وسير ذاتية', 'كلاسيكيات السينما المصرية']}
      titles={titles.filter((t) => t.type === 'movie')}
    />
  );
}
