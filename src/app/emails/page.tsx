'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, BellRing, Clapperboard, CreditCard, Hourglass, MailCheck, Play, RefreshCw, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '@/components/layout/Logo';
import { Badge } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

const tabs = [
  { k: 'welcome', l: 'تأكيد الاشتراك' },
  { k: 'receipt', l: 'إيصال الفاتورة' },
  { k: 'failed', l: 'تنبيه الأمان' },
  { k: 'newsletter', l: 'النشرة السينمائية' },
] as const;
type Tab = (typeof tabs)[number]['k'];

const subjects: Record<Tab, string> = {
  welcome: '🎬 أهلاً بك في العضوية الذهبية! بدأت تجربتك المجانية لمدة ١٤ يوماً.',
  receipt: 'إيصال دفع — فاتورة إلكترونية ضريبية INV-2024-00918#',
  failed: '⚠️ تعذر تجديد اشتراكك في Mamatvbox — يُرجى تحديث وسيلة الدفع لتفادي إيقاف التنبيهات',
  newsletter: '🎬 نزل الآن: «موضوع عائلي ٣» أصبح متاحاً على شاهد VIP بجودة Full HD',
};

const Btn = ({ children, gold = true }: { children: React.ReactNode; gold?: boolean }) => (
  <a href="#" className={cn('flex h-14 w-full items-center justify-center gap-2 text-sm font-bold', gold ? 'bg-gold text-bg hover:text-bg' : 'bg-panel')}>{children}</a>
);

export default function EmailPreviewPage() {
  const [tab, setTab] = useState<Tab>('welcome');
  return (
    <div className="min-h-screen bg-bg">
      <header className="flex h-16 items-center justify-between border-b border-line/60 px-6">
        <div className="flex items-center gap-3"><Logo size="sm" /><Badge>معاين البريد الإلكتروني</Badge></div>
        <nav className="no-scrollbar flex max-w-[55vw] gap-1 overflow-x-auto whitespace-nowrap">{tabs.map((t) => <button key={t.k} onClick={() => setTab(t.k)} className={cn('relative rounded-full px-4 py-2 text-sm', tab === t.k ? 'font-bold text-teal' : 'text-muted')}>{tab === t.k && <motion.span layoutId="etab" className="absolute inset-0 -z-10 rounded-full bg-panel" />}{t.l}</button>)}</nav>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-teal text-bg"><User className="h-4 w-4" /></span>
      </header>
      <div className="bg-surface px-6 py-4 text-sm"><div className="mx-auto flex max-w-[600px] justify-between"><div><p><Badge tone="teal">مرسل موثوق</Badge> <b>Mamatvbox ‹alerts@mamatvbox.com›</b></p><p className="mt-1 text-muted">إلى: subscriber@cinema.hub</p></div><div className="text-left text-xs text-muted">الآن<br /><Badge tone="solidGold">معاينة العميل (600px)</Badge></div></div></div>

      <div className="mx-auto max-w-[600px] px-4 py-8">
        <div className="mb-5 flex items-center gap-2 rounded-full bg-card px-5 py-3 text-xs"><span className="h-2 w-2 rounded-full bg-gold" /> الموضوع: <b>{subjects[tab]}</b></div>
        <AnimatePresence mode="wait">
          <motion.article key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="space-y-5 rounded-[2.5rem] bg-card p-6">
            <div className="flex items-center justify-between bg-surface p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-panel"><Clapperboard className="h-5 w-5 text-gold" /></span><div><b className="font-logo text-xl text-teal">Mamatvbox</b><p className="text-[11px] text-muted">الصالون السينمائي الموحد</p></div></div><Badge tone={tab === 'failed' ? 'danger' : 'gold'}>{tab === 'failed' ? 'تنبيه فوترة عاجل' : tab === 'receipt' ? 'ETA معتمدة' : 'عضوية VIP سينمائية'}</Badge></div>

            {tab === 'welcome' && (
              <>
                <div className="bg-gradient-to-l from-panel to-surface p-6"><p className="text-xs text-gold">مرحلة الانطلاق الحصري</p><h1 className="mt-2 font-display text-2xl font-bold">مرحباً بك يا أحمد في صالونك السينمائي الموحد!</h1><p className="mt-3 text-sm leading-7 text-muted">استمتع بكافة المزايا الذهبية مجاناً بالكامل حتى <b className="text-gold">٢٦ أكتوبر ٢٠٢٥</b>. لن يتم سحب أي مليم قبل هذا الموعد، ويمكنك الإلغاء في أي وقت بضغطة زر واحدة.</p></div>
                <div className="bg-surface p-5"><div className="flex justify-between"><b>ملخص تفاصيل باقتك الذهبية</b><Badge tone="teal">تجربة نشطة</Badge></div><dl className="mt-4 space-y-3 bg-bg p-4 text-sm">{[['نوع العضوية', 'سينما VIP (Cinema Member)'], ['فترة التجربة', '١٤ يوماً مجاناً (تنتهي في ٢٦ أكتوبر)'], ['التكلفة بعد التجربة', '٣٩ ج.م / شهرياً'], ['وسيلة السداد المعتمدة', 'فيزا البنك الأهلي (•••• ٤٥٧١)']].map(([a, b]) => <div key={a} className="flex justify-between"><dt className="text-muted">{a}</dt><dd className="font-bold">{b}</dd></div>)}</dl></div>
                <Btn>ابدأ استكشاف الأعمال وبناء قائمتك</Btn>
              </>
            )}

            {tab === 'receipt' && (
              <>
                <div className="bg-bg p-8 text-center"><motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal-soft"><MailCheck className="h-7 w-7 text-teal" /></motion.span><p className="mt-3 text-xs text-teal">عملية دفع مكتملة</p><h1 className="font-display text-2xl font-bold">تم استلام دفعتك بنجاح</h1><div className="mx-auto mt-5 w-fit bg-panel px-10 py-5"><p className="text-xs text-muted">المبلغ المسدد</p><p className="font-display text-5xl font-extrabold text-gold">٤٦٨,٠٠ <span className="text-lg">ج.م</span></p><Badge className="mt-2">شامل ضريبة القيمة المضافة ١٤٪</Badge></div></div>
                <div className="grid grid-cols-2 gap-3 bg-surface p-5 text-sm">{[['رقم الفاتورة', '#INV-2024-00918'], ['تاريخ العملية', '٢٦ أكتوبر ٢٠٢٥ - ١٤:٢٠'], ['وسيلة الدفع', 'فيزا البنك الأهلي (•••• ٤٥٧١)'], ['كود المعاملة البنكية (RRN)', 'RRN-892401825']].map(([a, b]) => <div key={a} className="bg-bg p-4"><p className="text-xs text-muted">{a}</p><b className="font-mono">{b}</b></div>)}</div>
                <Btn>تحميل الفاتورة الضريبية الرسمية (PDF)</Btn>
              </>
            )}

            {tab === 'failed' && (
              <>
                <div className="bg-danger-deep/20 p-6"><Badge tone="danger">فشل المعاملة التلقائية</Badge><h1 className="mt-3 flex items-start gap-3 font-display text-2xl font-bold"><CreditCard className="h-8 w-8 shrink-0 text-danger" /> تعذر إتمام عملية خصم اشتراك العضوية الذهبية بقيمة ٣٩ ج.م</h1><p className="mt-3 text-sm text-muted">حاول نظام الدفع تجديد باقتك الشهرية اليوم، إلا أن البنك المصدر للبطاقة رفض العملية المصرفية.</p><div className="mt-4 bg-bg p-4 text-xs"><span className="flex items-center gap-1 text-muted"><AlertCircle className="h-4 w-4" /> رمز الاستجابة البنكية:</span><code className="mt-1 block font-mono font-bold text-danger">Bank Auth Declined 104</code></div></div>
                <div className="bg-surface p-5"><b className="flex items-center gap-2 text-teal"><Hourglass className="h-5 w-5" /> فترة سماح نشطة لمدة ٤٨ ساعة</b><p className="mt-2 text-sm text-muted">لا تقلق! حسابك وتنبيهاتك السينمائية ستظل نشطة بالكامل لمدة ٤٨ ساعة إضافية.</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-line"><motion.div className="h-full bg-gradient-to-l from-teal to-gold" initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1.2 }} /></div><p className="mt-2 flex justify-between text-[11px] text-muted"><span>متبقي: ٤٧ ساعة و ١٨ دقيقة</span><span>انتهاء المهلة: بعد غد ٠٣:٠٠ م</span></p></div>
                <Btn><RefreshCw className="h-4 w-4" /> تحديث وسيلة الدفع وإعادة المحاولة الآن</Btn>
                <Btn gold={false}>تغيير طريقة السداد إلى كود فوري النقدي</Btn>
              </>
            )}

            {tab === 'newsletter' && (
              <>
                <div className="flex items-center gap-4 bg-panel p-5"><span className="grid h-11 w-11 place-items-center rounded-full bg-teal text-bg"><BellRing className="h-5 w-5" /></span><div><p className="text-xs text-teal">تنبيه فوري من قائمة أمنياتك</p><b className="font-display text-lg">عمل من قائمة مشاهدتك أصبح متاحاً الآن في باقتك المشترك بها!</b></div></div>
                <div className="grid gap-4 rounded-3xl bg-bg p-5 sm:grid-cols-[180px_1fr]"><div className="aspect-[3/4] bg-[#0f766e]" /><div><div className="flex gap-1"><Badge>دراما كوميدية</Badge><Badge tone="teal">عرض أول</Badge></div><h2 className="mt-2 font-display text-2xl font-bold">موضوع عائلي</h2><p className="text-sm text-muted">الموسم الثالث — الحلقات كاملة</p><div className="mt-3 flex gap-1"><Badge>FULL HD 1080P</Badge><Badge>Stereo 2.0</Badge></div><p className="mt-3 text-xs leading-6 text-muted">يعود «إبراهيم» في مغامرة عائلية جديدة مع بنته وزوجها وسط مواقف كوميدية وإنسانية دافئة.</p></div></div>
                <Btn><Play className="h-4 w-4" /> شاهد الآن على شاهد VIP مباشرة</Btn>
              </>
            )}

            <div className="bg-surface p-5 text-center text-[11px] leading-6 text-muted"><p className="flex items-center justify-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> تم إرسال هذا البريد تلقائياً إلى <b className="font-mono text-ink">subscriber@cinema.hub</b> لأنك مشترك في خدمة Mamatvbox Cinema Radar.</p><p className="mt-2 text-teal">إدارة الحساب • سياسة الخصوصية • إلغاء الاشتراك في التنبيهات</p></div>
          </motion.article>
        </AnimatePresence>
      </div>
      <footer className="bg-surface py-6 text-center text-xs text-muted">© Mamatvbox Cinema 2024. نظام إرسال المعاملات الفورية • معتمد DKIM & SPF</footer>
    </div>
  );
}
