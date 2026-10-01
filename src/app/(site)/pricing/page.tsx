import { Award, Check, Minus } from 'lucide-react';
import { Bar, Counter, Reveal } from '@/components/motion';
import { PricingPlans } from '@/components/pricing/PricingPlans';
import { Button } from '@/components/ui/Button';
import { Faq } from '@/components/ui/Faq';
import { Badge, SectionHeader } from '@/components/ui/primitives';
import { billingApi } from '@/lib/api';

export const metadata = { title: 'باقات العضوية والأسعار' };

const rows: [string, string, string, string][] = [
  ['بحث الكتالوج الشامل ومحرك الاستكشاف', '✓', '✓', '✓'],
  ['كشف الجودة الفعلية (4K Ultra HD, Dolby Vision, Atmos)', '—', 'شامل لكافة المنصات', 'شامل لكافة المنصات'],
  ['ميزة «في باقتك» لتصفية الاشتراكات الفعلية', 'حتى ٢ منصات', 'حتى ٩ منصات', 'غير محدود'],
  ['توجيه روابط التنزيل المباشر القانوني للأجهزة', '—', '✓', '✓'],
  ['تنبيهات استباقية لانتهاء التراخيص «هيتشال قريب»', '—', 'تنبيهات بريد وتطبيق', 'واتساب وSMS'],
  ['رصد التوفر الدولي (VPN Geolocation Engine)', 'دولة الإقامة فقط', '٥ دول رئيسية', '+٤٠ دولة حول العالم'],
  ['الدعم الفني والخدمة المخصصة', 'مركز المساعدة', 'تذاكر خلال ٤ ساعات', 'محادثة VIP مباشرة ٢٤/٧'],
];

const faqs = [
  { q: 'هل يتم خصم أي مبلغ من بطاقتي أثناء فترة التجربة المجانية (١٤ يوماً)؟', a: 'لا. يتم التحقق الرمزي فقط من البطاقة، ولن يتم خصم أي مبلغ قبل انتهاء فترة التجربة، ونرسل لك تذكيراً قبلها بـ ٤٨ ساعة.' },
  { q: 'كيف يساعدني موقع Mamatvbox في توفير تكلفة الاشتراكات الفعلية؟', a: 'نحلل الأعمال التي تشاهدها فعلياً ونقترح أقل مجموعة منصات تغطي قائمتك، مع تنبيهك بالاشتراكات غير المستغلة.' },
  { q: 'كيف يمكنني إلغاء الاشتراك؟ وهل هناك أي التزام أو شروط جزائية؟', a: 'يمكنك الإلغاء بضغطة واحدة من صفحة إدارة الاشتراك دون أي رسوم أو شروط جزائية.' },
  { q: 'هل تطلبون كلمات المرور أو بيانات تسجيل الدخول لحساباتي على المنصات؟', a: 'إطلاقاً. نكتفي بمعرفة أسماء المنصات التي تشترك بها فقط ولا نتصل بحساباتك.' },
  { q: 'ما هي طرق الدفع المحلية والعالمية المتاحة للاشتراك؟', a: 'فيزا، ماستركارد، ميزة، المحافظ الذكية وإنستاباي، وكود فوري النقدي، وApple Pay.' },
];

const Cell = ({ v, gold }: { v: string; gold?: boolean }) =>
  v === '✓' ? <Check className={`mx-auto h-5 w-5 ${gold ? 'text-gold' : 'text-teal'}`} /> : v === '—' ? <Minus className="mx-auto h-4 w-4 text-dim" /> : <span className={gold ? 'text-gold' : ''}>{v}</span>;

export default async function PricingPage() {
  const plans = await billingApi.plans();
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12">
      <Reveal className="text-center">
        <Badge tone="gold"><Award className="h-3 w-3" /> استثمارك الأمثل في الترفيه المنزلي</Badge>
        <h1 className="mt-4 font-display text-4xl font-extrabold md:text-5xl">باقات مصممة لعشاق السينما — <span className="text-gold">بدون حيرة</span> وبدون <span className="text-teal">تشتت</span></h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">اختر الخطة المناسبة لك وابدأ تجربة استكشاف ذكية توفر عليك مئات الجنيهات شهرياً عبر منصات البث الرقمي المعتمدة.</p>
      </Reveal>

      <PricingPlans plans={plans} />

      <Reveal className="mt-20">
        <SectionHeader eyebrow="مقارنة الخصائص المتقدمة" title="قارن بين الباقات بالتفصيل الدقيق" />
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="bg-surface text-xs text-muted"><th className="p-4 text-right">الميزة / الخاصية</th><th className="p-4">حساب الزائر المجاني</th><th className="bg-gold/10 p-4 text-gold">العضوية الذهبية</th><th className="p-4">عضوية VIP العائلية</th></tr></thead>
            <tbody>
              {rows.map(([f, a, b, c]) => (
                <tr key={f} className="border-t border-line/50 text-center">
                  <td className="p-4 text-right">{f}</td>
                  <td className="p-4 text-muted"><Cell v={a} /></td>
                  <td className="bg-gold/5 p-4 font-semibold"><Cell v={b} gold /></td>
                  <td className="p-4"><Cell v={c} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal className="mt-14">
        <div className="card grid gap-8 p-8 md:grid-cols-[1fr_340px]">
          <div>
            <Badge tone="teal">محاكي التوفير الذكي</Badge>
            <h3 className="mt-3 font-display text-2xl font-bold">كيف يوفر عليك Mamatvbox أكثر من ٦٠٠ ج.م شهرياً؟</h3>
            <p className="mt-3 text-sm leading-7 text-muted">وفق دراسة السلوك الرقمي للمشاهد العربي، يشترك المستخدم في ٤ منصات بينما يشاهد فعلياً على اثنتين فقط. نظام الذكاء لدينا يكشف ذلك ويقترح عليك الإلغاء المؤقت دون فقدان أي عمل.</p>
          </div>
          <div className="panel space-y-4 p-6">
            <div><div className="mb-1.5 flex justify-between text-xs"><span>بدون Mamatvbox</span><b className="text-danger"><Counter value="٦٨٠ ج.م" /></b></div><Bar value={100} color="bg-danger" /></div>
            <div><div className="mb-1.5 flex justify-between text-xs"><span>مع العضوية الذهبية</span><b className="text-teal"><Counter value="٢١٩ ج.م" /></b></div><Bar value={32} /></div>
            <p className="text-center font-display text-3xl font-extrabold text-gold"><Counter value="وفّر ٧٤٪" /></p>
          </div>
        </div>
      </Reveal>

      <section className="mx-auto mt-16 max-w-3xl">
        <SectionHeader title="الأسئلة الأكثر شيوعاً حول الباقات" />
        <Faq items={faqs} />
      </section>

      <Reveal className="mt-16">
        <div className="card relative overflow-hidden p-12 text-center">
          <div className="glow-gold pointer-events-none absolute inset-0" />
          <h2 className="relative font-display text-3xl font-bold">جاهز للتجربة؟ ابدأ شهرك التجريبي الآن بدون أي مخاطرة</h2>
          <p className="relative mt-3 text-sm text-muted">انضم لأكثر من ٧٥ ألف سينمائي عربي يوفرون أوقاتهم وأموالهم يومياً.</p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Button href="/checkout?plan=gold">اشترك الآن واستمتع بـ ١٤ يوماً مجاناً</Button>
            <Button href="/movies" variant="ghost">تصفح الكتالوج أولاً</Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
