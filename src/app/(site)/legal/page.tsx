import { AtSign, Printer, Scale, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';

export const metadata = { title: 'المركز القانوني وسياسات الاستخدام' };

const sections = [
  { id: 'identity', title: 'مقدمة وهوية المنصة المحايدة', body: 'مرحباً بك في منصة Mamatvbox. تمثل هذه الوثيقة العقد الملزم الذي يحكم استخدامك لمنظومتنا الرقمية المتطورة للبحث وتنسيق خيارات البث العربي. صُممت المنصة لتوفير تجربة استكشاف فنية دقيقة تجمع عشاق السينما بأعمالهم المفضلة بطرق مشروعة.' },
  { id: 'service', title: 'طبيعة الخدمة الإرشادية (دليل ملاحة محايد)', body: 'Mamatvbox هي محرك بحث وتوجيه إرشادي للمحتوى القانوني فقط. لا نستضيف أي ملف وسائط، ولا نقوم بإعادة رفع أو تشغيل أي محتوى محمي، ويقتصر دورنا على توجيهك إلى الصفحة الرسمية للعمل لدى المنصة صاحبة حقوق العرض (Deep Linking).' },
  { id: 'affiliate', title: 'إفصاح الشراكات التسويقية وروابط الإحالة (Affiliate Disclosure)', body: 'التزاماً بمعايير الشفافية الدولية، نفصح بأن بعض روابط التوجيه للمنصات مثل Shahid VIP وWatch It وOSN+ هي روابط إحالة قد نحصل من خلالها على عمولة رمزية عند اشتراكك، دون أي تكلفة إضافية عليك، ودون أن يؤثر ذلك على حيادية الترتيب والتقييم.' },
  { id: 'privacy', title: 'سياسة الخصوصية وحماية البيانات الشخصية', body: 'نحترم خصوصيتك ونعتبرها ركناً أساسياً. نلتزم بمبادئ حماية البيانات الشخصية GDPR والقوانين الإقليمية. لا نطلب أو نخزن كلمات مرور حساباتك على المنصات، ولا نتعامل مع بيانات البطاقات مباشرة؛ تتم معالجة المدفوعات عبر بوابات معتمدة PCI-DSS.' },
  { id: 'accuracy', title: 'دقة أسعار وتراخيص المنصات وتنويه إخلاء المسؤولية', body: 'نحدث الأسعار والتوفر دورياً عبر شركاء البيانات، ومع ذلك قد تتغير أسعار الاشتراكات أو تنتهي حقوق التوزيع دون إشعار مسبق من المنصات. ننصح دائماً بمراجعة الصفحة الرسمية قبل الاشتراك.' },
  { id: 'ip', title: 'الملكية الفكرية وحقوق العلامات التجارية', body: 'جميع أسماء المنصات والشعارات وملصقات الأفلام المعروضة هي ملك لأصحابها، وتُستخدم لأغراض التعريف والإرشاد وفق مبدأ الاستخدام العادل (Fair Use & Identification).' },
  { id: 'contact', title: 'التواصل مع الفريق القانوني والاستفسار', body: 'لأي استفسارات تخص هذه الشروط أو البلاغات عن خطأ في بيانات تراخيص منصة معينة، يرجى التواصل عبر compliance@mamatvbox.com أو قسم حقوق النشر dmca@mamatvbox.com.' },
];

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-[1300px] px-5 py-10">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Badge tone="gold"><Scale className="h-3 w-3" /> ركائز الشفافية والامتثال التقني</Badge>
            <h1 className="mt-4 font-display text-4xl font-extrabold">المركز القانوني وسياسات الاستخدام لمنصة <span className="text-gradient-brand font-logo">Mamatvbox</span></h1>
            <p className="mt-3 max-w-3xl text-sm text-muted">المرجع التعاقدي والتنظيمي الشامل الذي يحدد حقوق والتزامات المستخدمين وآليات الشفافية التسويقية في توجيه عشاق السينما عبر الشرق الأوسط وشمال أفريقيا.</p>
          </div>
          <Button icon={<Printer className="h-4 w-4" />}>طباعة النسخة الرسمية</Button>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="card space-y-1 p-4 text-sm">
            <p className="mb-2 text-xs text-dim">فهرس البنود والوثائق</p>
            {sections.map((s, i) => <a key={s.id} href={`#${s.id}`} className="block rounded-lg px-3 py-2 text-muted hover:bg-panel">{i + 1}. {s.title.split('(')[0]}</a>)}
          </nav>
          <div className="card mt-4 flex items-center gap-3 p-4 text-sm"><AtSign className="h-5 w-5 text-teal" /> legal@mamatvbox.com</div>
        </aside>
        <div className="space-y-6">
          {sections.map((s, i) => (
            <Reveal key={s.id}>
              <section id={s.id} className="card scroll-mt-24 p-8">
                <h2 className="flex items-center gap-3 font-display text-2xl font-bold"><span className="grid h-8 w-8 place-items-center rounded-full bg-teal-soft text-sm text-teal">{i + 1}</span>{s.title}</h2>
                <p className="mt-4 leading-8 text-ink/80">{s.body}</p>
                {s.id === 'service' && (
                  <div className="panel mt-5 flex items-start gap-3 p-4 text-sm"><ShieldCheck className="h-5 w-5 shrink-0 text-gold" /> تأكيد عالي وتقني قاطع: إن منصة Mamatvbox هي محرك بحث وتوجيه إرشادي للمحتوى القانوني فقط.</div>
                )}
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
