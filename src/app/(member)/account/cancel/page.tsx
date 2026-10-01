'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BellOff, Calculator, Gift, HeartHandshake, MonitorX, ShieldCheck, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import { billingApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const reasons = [
  { k: 'price', t: 'الاشتراك مكلف بالنسبة لي حالياً', d: 'نحن نوفر خيارات دفع مرنة وباقات توفير تناسب ميزانيتك.' },
  { k: 'usage', t: 'لا أستخدم المنصة بما يكفي', d: 'يمكنك تلقي ملخص أسبوعي بالبريد أو واتساب لأبرز الإضافات.' },
  { k: 'coverage', t: 'المنصات التي أتابعها غير مدعومة بالكامل', d: 'نضيف شهرياً مصادر وتطبيقات بث جديدة.' },
  { k: 'hard', t: 'واجهت صعوبة في فهم بعض المزايا أو ضبط التنبيهات', d: 'فريق الدعم الفني جاهز لمساعدتك بمكالمة توجيه مجانية.' },
  { k: 'other', t: 'سبب آخر (اختياري)', d: 'أخبرنا بما يمكننا فعله لنكون أفضل.' },
];

export default function CancelPage() {
  const router = useRouter();
  const [reason, setReason] = useState('price');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const cancel = async () => { setBusy(true); await billingApi.cancel(reason); setBusy(false); setDone(true); };

  return (
    <div className="mx-auto max-w-4xl">
      <Reveal className="card overflow-hidden rounded-[2.5rem] border-t-4 border-t-gold p-8">
        <Badge tone="gold">تغيير حالة التجديد • حساب رقم: #VIP-94821</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold">هل أنت متأكد من رغبتك في إلغاء العضوية الذهبية؟</h1>
        <p className="mt-2 text-sm text-muted">تجربتك المجانية مستمرة حتى <b className="text-gold">٢٦ أكتوبر ٢٠٢٥</b>، وإلغاؤها الآن سيفقدك المزايا السينمائية الحصرية فور انتهاء المدة المحددة.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{[['الخطة الحالية', 'VIP بريميوم سنوي'], ['تاريخ التجديد القادم', '٢٦ أكتوبر ٢٠٢٥'], ['الأعمال المرصودة', '١٤٨ عملاً بقائمتك'], ['التوفير التراكمي المقدر', '٣٤٠ ج.م شهرياً']].map(([l, v]) => <div key={l} className="panel p-4"><p className="text-[11px] text-muted">{l}</p><b className="text-sm">{v}</b></div>)}</div>
      </Reveal>

      <Reveal className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold"><span className="grid h-7 w-7 place-items-center rounded-full bg-teal text-xs text-bg">١</span> استطلاع سبب الإلغاء</h2>
        <div className="card space-y-2 rounded-[2rem] p-4">
          {reasons.map((r) => (
            <button key={r.k} onClick={() => setReason(r.k)} className={cn('flex w-full items-center gap-4 rounded-xl p-4 text-right transition-colors', reason === r.k ? 'bg-panel' : 'hover:bg-panel/50')}>
              <span className={cn('grid h-5 w-5 place-items-center rounded-full border-2', reason === r.k ? 'border-gold' : 'border-muted')}>{reason === r.k && <motion.span layoutId="reason" className="h-2.5 w-2.5 rounded-full bg-gold" />}</span>
              <span><b className="text-sm">{r.t}</b><p className="text-xs text-muted">{r.d}</p></span>
            </button>
          ))}
        </div>
      </Reveal>

      <AnimatePresence>
        {reason === 'price' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-8 rounded-[2.5rem] border-2 border-line bg-card p-8">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div><Badge tone="gold"><Gift className="h-3 w-3" /> عرض حصري لك تقديراً لذوقك السينمائي</Badge><h3 className="mt-3 font-display text-2xl font-bold">خليك معانا ووفّر ٥٠٪ على أول شهر بعد التجربة!</h3><p className="mt-2 text-sm text-muted">نعلم أن ميزانيات البث تتراكم، لذا نمنحك فرصة تمديد التجربة بنصف التكلفة لضمان استمرار رصد أعمالك دون انقطاع.</p></div>
                <div className="bg-bg p-5 text-center"><p className="text-xs text-muted line-through">٣٩ ج.م</p><p className="font-display text-4xl font-extrabold text-gold">١٩ ج.م</p><p className="text-[11px] text-teal">خصم نصف السعر</p></div>
              </div>
              <Button className="mt-6" icon={<ArrowRight className="h-4 w-4 rotate-180" />} onClick={() => router.push('/account/subscription')}>قبول العرض الخاص وتجديد بخصم ٥٠٪</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="mb-4 mt-10 font-display text-xl font-bold">المزايا التي ستفقدها عند تأكيد الإلغاء</h2>
      <Stagger className="grid gap-4 md:grid-cols-3">
        {[{ i: BellOff, t: 'تنبيهات «هيتشال قريب»', d: 'ضياع تنبيهات سحب التراخيص الحصرية من نتفليكس وشاهد قبل انتهاء حقوق العرض بـ ٧ أيام.' }, { i: MonitorX, t: 'كاشف 4K UHD و Dolby Atmos', d: 'فقدان القدرة على كشف أعلى دقة متوفرة فعلياً ومقارنة الصوت المحيطي.' }, { i: Calculator, t: 'حاسبة التوفير للدمج الذكي', d: 'تعطيل حاسبة التوفير الذكية التي توضح لك متى تشترك ومتى تلغي باقات المنصات.' }].map((b) => (
          <StaggerItem key={b.t} className="card rounded-[2rem] p-6 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-danger-soft"><b.i className="h-5 w-5 text-danger" /></span><b className="mt-4 block font-display text-lg">{b.t}</b><p className="mt-2 text-xs leading-6 text-muted">{b.d}</p></StaggerItem>
        ))}
      </Stagger>

      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-6">
        <p className="flex items-center gap-2 text-sm"><ShieldCheck className="h-5 w-5 text-teal" /> يمكنك إعادة تفعيل اشتراكك في أي لحظة بنقرة واحدة ودون فقدان قائمتك.</p>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-danger">تم إيقاف التجديد التلقائي — المزايا متاحة حتى ٢٦ أكتوبر</motion.p>
          ) : (
            <motion.div key="btns" className="flex gap-3"><Button variant="teal" href="/account" icon={<HeartHandshake className="h-4 w-4" />}>الاحتفاظ بالعضوية والعودة لحسابي</Button><Button variant="danger" loading={busy} onClick={cancel} icon={<XCircle className="h-4 w-4" />}>متابعة إلغاء التجديد التلقائي</Button></motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
