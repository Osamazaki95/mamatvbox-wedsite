'use client';

import { Bell, Calculator, CheckCircle2, ChevronLeft, CreditCard, Crown, Edit, HeartCrack, Hourglass, PiggyBank, Snowflake, Sparkles, Zap } from 'lucide-react';
import { PageSkeleton, useLoad } from '@/components/Loader';
import { Bar, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { platformsApi } from '@/lib/api';


export default function SubscriptionPage() {
  const all = useLoad(() => platformsApi.list());
  if (!all) return <PageSkeleton />;
  const platforms = all.slice(0, 5);
  return (
    <>
      <Reveal>
        <div className="card relative grid gap-8 overflow-hidden rounded-[2.5rem] border-l-4 border-l-gold p-8 lg:grid-cols-[1fr_340px]">
          <div className="glow-teal pointer-events-none absolute inset-0" />
          <div className="relative">
            <div className="flex flex-wrap gap-2"><Badge tone="gold">العضوية الذهبية (Cinema Member)</Badge><Badge tone="teal" dot>تجربة مجانية نشطة</Badge><span className="text-xs text-muted">تاريخ البدء: ١٢ أكتوبر ٢٠٢٥</span></div>
            <h1 className="mt-4 font-display text-4xl font-extrabold">أنت حالياً تستمتع بكافة مزايا صالون <span className="text-gold">VIP الذهبي</span></h1>
            <p className="mt-3 text-sm text-muted">استكشف كتالوجات البث القانونية بالكامل، تتبع أسعار وترقيات المنصات، واستقبل إشعارات مغادرة المحتوى قبل إزالته رسمياً بجودة فائقة.</p>
            <div className="mt-6 bg-bg/60 p-5">
              <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><Hourglass className="h-4 w-4 text-gold" /> متبقي ١٠ أيام على نهاية تجربتك المجانية</span><b className="font-mono text-gold">اليوم ٤ من ١٤</b></div>
              <Bar value={29} className="mt-3 h-2.5" color="bg-teal" />
              <p className="mt-3 text-xs text-muted">لن يتم خصم أي مبالغ حتى انتهاء التجربة في ٢٦ أكتوبر ٢٠٢٥ الساعة ٠٦:٠٠ مساءً.</p>
            </div>
          </div>
          <div className="panel relative space-y-4 p-6">
            <div className="flex items-center justify-between"><div><p className="text-xs text-muted">التجديد التلقائي القادم</p><p className="font-display text-2xl font-bold">٤٦٨ ج.م / سنوياً</p><p className="text-xs text-teal">يعادل ٣٩ ج.م/شهرياً • وفر ٢٠٪</p></div><PiggyBank className="h-9 w-9 text-gold" /></div>
            <div className="flex justify-between bg-surface p-3 text-xs"><span className="text-muted">حالة التجديد التلقائي:</span><Badge tone="teal" dot>مفعل تلقائياً</Badge></div>
            <Button pill={false} className="w-full" icon={<Zap className="h-4 w-4" />}>ترقية إلى باقة العائلة و VIP (٧٩ ج.م/شهر)</Button>
            <Button pill={false} variant="dark" className="w-full">التحويل إلى الدفع الشهري (٤٩ ج.م/شهر)</Button>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Reveal className="card rounded-[2.5rem] p-7">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">مزايا باقتك الذهبية النشطة</h2><Badge tone="teal">مفعلة بالكامل</Badge></div>
          <Stagger className="mt-5 grid gap-3 sm:grid-cols-2">
            {[{ i: Sparkles, t: 'كشف جودات 4K HDR الفعلي', d: 'فحص حقيقي لمعدلات الترميز ودعم Dolby Vision وAtmos في كل منصة.' }, { i: Bell, t: 'رادار «هيتشال قريب» قبل ١٤ يوماً', d: 'تنبيهات مسبقة للأفلام التي توشك تراخيصها على الانتهاء.' }, { i: Calculator, t: 'حاسبة وفر الاشتراكات الذكية', d: 'اكتشاف التكرارات واقتراح إلغاء أو تجميد المنصات الخاملة.' }, { i: Crown, t: 'دعم فني سينمائي VIP مخصص', d: 'قناة تواصل ذات أولوية مباشرة مع مديري الـ Curation.' }].map((b) => (
              <StaggerItem key={b.t} className="panel p-5"><b.i className="h-5 w-5 text-teal" /><b className="mt-3 block text-sm">{b.t}</b><p className="mt-1 text-xs leading-6 text-muted">{b.d}</p></StaggerItem>
            ))}
          </Stagger>
          <div className="mt-4 flex items-center justify-between bg-surface p-5"><div><p className="text-sm">وفرت اشتراكاتك هذا العام بفضل تنبيهات Mamatvbox</p><p className="font-display text-2xl font-bold text-gold">١,٢٤٠ ج.م</p></div><Button size="sm" variant="ghost" className="text-teal">عرض تقرير التوفير <ChevronLeft className="h-4 w-4" /></Button></div>
        </Reveal>
        <div className="space-y-6">
          <Reveal className="card rounded-[2.5rem] p-7">
            <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">وسيلة الدفع المعتمدة</h2><Badge tone="teal" dot>نشطة وموثقة</Badge></div>
            <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-panel to-surface p-6 transition hover:-translate-y-1">
              <div className="flex justify-between"><b className="font-logo text-2xl">VISA</b><span className="text-xs text-muted">البنك الأهلي المصري (NBE)</span></div>
              <p dir="ltr" className="mt-6 text-right font-mono tracking-[0.3em] text-muted">•••• •••• •••• ٤٥٧١</p>
              <div className="mt-4 flex justify-between text-xs"><span>AHMED EL SAEED</span><span className="font-mono">08 / 28</span></div>
            </div>
            <Button pill={false} variant="dark" className="mt-4 w-full" icon={<Edit className="h-4 w-4" />}>تغيير وسيلة الدفع الأساسية</Button>
            <Button pill={false} variant="dark" className="mt-2 w-full" icon={<CreditCard className="h-4 w-4" />}>إضافة بطاقة بديلة أو محفظة ذكية</Button>
          </Reveal>
          <Reveal className="card rounded-[2.5rem] p-7">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Snowflake className="h-5 w-5 text-violet" /> تجميد الاشتراك مؤقتاً</h2>
            <p className="mt-2 text-xs leading-6 text-muted">مسافر أو مقبل على فترة امتحانات؟ جمّد حسابك مؤقتاً وسنحتفظ بكافة قوائمك وتنبيهاتك دون أن تخسر أيام اشتراكك المدفوعة.</p>
            <Button pill={false} variant="dark" className="mt-4 w-full">بدء تجميد الحساب الآن</Button>
          </Reveal>
        </div>
      </div>

      <Reveal className="card mt-6 rounded-[2.5rem] p-7">
        <h2 className="font-display text-xl font-bold">المنصات المتصلة بالرصد الموحد</h2>
        <div className="mt-5 flex flex-wrap gap-3">{platforms.map((p, i) => <span key={p.id} className="flex items-center gap-2 rounded-full bg-panel px-4 py-2 text-sm"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} /> {p.name} <Badge tone={i === 4 ? 'solidGold' : 'teal'}>{i === 4 ? 'ينتهي قريباً' : 'متصل'}</Badge></span>)}</div>
      </Reveal>

      <Reveal className="card mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[2.5rem] p-7">
        <div className="flex items-center gap-3"><HeartCrack className="h-6 w-6 text-danger" /><div><b className="font-display text-lg">هل ترغب في إنهاء العضوية أو إلغاء التجربة؟</b><p className="text-xs text-muted">إذا ألغيت الآن، ستظل تستمتع بالمزايا حتى ٢٦ أكتوبر ٢٠٢٥ ولن يتم سحب أي مبلغ.</p></div></div>
        <div className="flex gap-2"><Button variant="dark" pill={false}>تقديم ملاحظات</Button><Button variant="danger" pill={false} href="/account/cancel" icon={<CheckCircle2 className="h-4 w-4 rotate-45" />}>إلغاء تجربة العضوية المجانية</Button></div>
      </Reveal>
    </>
  );
}
