'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, CalendarCheck, CheckCircle2, Clapperboard, MailCheck, MonitorSmartphone, Receipt, Rocket, Ticket } from 'lucide-react';
import confettiColors from './palette';
import { Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';

const next = [
  { n: '١', tag: 'في باقتك', i: Clapperboard, t: 'حدد منصاتك المشترك بها', d: 'لتفعيل ميزة "في باقتك" وعرض أعمال منصاتك المتاحة لك ببلاش أولاً وتجنب دفع تكاليف إضافية.', cta: 'إضافة منصاتي الآن', href: '/account/platforms', primary: true },
  { n: '٢', tag: 'تنبيهات فورية', i: Bookmark, t: 'ابنِ قائمة المشاهدة (Watchlist)', d: 'أضف أفلامك ومسلسلاتك لننبهك فور صدورها بجودة 4K HDR أو قبل موعد حذف ترخيصها من المنصة.', cta: 'استكشاف الأفلام والمسلسلات', href: '/movies' },
  { n: '٣', tag: 'وصول فائق', i: MonitorSmartphone, t: 'حمّل اختصار Mamatvbox', d: 'أضف المنصة لشاشتك الرئيسية لتصل لكل محركات البحث بضغطة زر واحدة ومن أي جهاز ذكي تملكه.', cta: 'إضافة للشاشة الرئيسية', href: '#' },
];

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-[1300px] px-5 py-14">
      <div className="relative text-center">
        {confettiColors.map((c, i) => (
          <motion.span key={i} className="absolute left-1/2 top-16 h-2 w-2 rounded-sm" style={{ background: c }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(i) * (140 + i * 9), y: Math.sin(i) * 120 - 40, opacity: 0, rotate: 360 }}
            transition={{ duration: 1.6, delay: 0.4, ease: 'easeOut' }} />
        ))}
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180 }} className="relative mx-auto grid h-28 w-28 place-items-center rounded-3xl bg-panel shadow-gold">
          <Ticket className="h-12 w-12 text-gold" />
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="absolute -bottom-3 -right-3 grid h-11 w-11 place-items-center rounded-2xl bg-teal text-bg"><CheckCircle2 className="h-6 w-6" /></motion.span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Badge tone="gold" className="mt-7" dot>🎉 مبروك! تم تفعيل اشتراكك بنجاح</Badge>
          <h1 className="mt-4 font-display text-4xl font-extrabold md:text-5xl">أهلاً بك في العضوية الذهبية لـ <span className="text-gold">Mamatvbox!</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">فترتك التجريبية المجانية نشطة الآن حتى <b className="border-b-2 border-gold text-ink">٢٦ أكتوبر ٢٠٢٥</b>. استمتع بأدق محرك توجيه سينمائي في الوطن العربي بدون أي قيود.</p>
        </motion.div>
      </div>

      <Stagger className="card mx-auto mt-10 max-w-4xl rounded-[2.5rem] p-6">
        <div className="grid gap-3 md:grid-cols-3">
          {[{ i: CalendarCheck, l: 'تاريخ انتهاء التجربة وبداية التجديد', v: '٢٦ أكتوبر ٢٠٢٥', c: 'text-teal' }, { i: Receipt, l: 'المبلغ الذي تم سحبه اليوم', v: '٠,٠٠ ج.م (مجاناً)', c: 'text-gold' }, { i: MailCheck, l: 'تم إرسال الفاتورة والتفاصيل إلى', v: 'ahmed.cinema@example.com', c: 'text-ink' }].map((k) => (
            <StaggerItem key={k.l} className="panel flex items-center gap-3 p-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-surface"><k.i className={`h-5 w-5 ${k.c}`} /></span><div><p className="text-[11px] text-muted">{k.l}</p><b className="text-sm">{k.v}</b></div></StaggerItem>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-surface p-3 text-xs"><span className="text-muted">✓ يمكنك إلغاء الاشتراك في أي لحظة قبل موعد التجديد بدون أي رسوم إضافية.</span><a href="/account/subscription" className="font-bold text-gold">إدارة وتفاصيل الاشتراك من ملفك الشخصي ←</a></div>
      </Stagger>

      <h2 className="mt-16 font-display text-3xl font-bold">الخطوات القادمة لتخصيص تجربتك</h2>
      <Stagger className="mt-6 grid gap-5 md:grid-cols-3">
        {next.map((s) => (
          <StaggerItem key={s.n} className="card flex flex-col rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-full bg-panel text-sm font-bold text-teal">{s.n}</span><Badge tone="teal">{s.tag}</Badge></div>
            <div className="my-5 grid h-32 place-items-center bg-surface"><s.i className="h-12 w-12 text-muted" /></div>
            <h3 className="font-display text-xl font-bold">{s.t}</h3>
            <p className="mt-2 flex-1 text-sm leading-7 text-muted">{s.d}</p>
            <Button href={s.href} variant={s.primary ? 'teal' : 'ghost'} pill={false} className="mt-5 w-full">{s.cta}</Button>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Button href="/" size="lg" pill={false} icon={<Rocket className="h-5 w-5" />}>الانتقال إلى الصفحة الرئيسية وبدء الاستكشاف</Button>
        <Button href="/platforms" size="lg" pill={false} variant="ghost">تصفح باقات وتراخيص المنصات <ArrowLeft className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
