'use client';

import { motion } from 'framer-motion';
import { CreditCard, CreditCardIcon, Headset, Info, RefreshCw, ShieldCheck, Store, Wallet, Wand2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';

function FailedInner() {
  const code = useSearchParams().get('code') ?? 'BANK_AUTH_DECLINED_104';
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card rounded-[3rem] p-10">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1, x: [0, -8, 8, -6, 6, 0] }} transition={{ scale: { type: 'spring' }, x: { delay: 0.4, duration: 0.5 } }} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-panel">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-danger-deep"><CreditCardIcon className="h-9 w-9 text-danger/90" /></span>
          </motion.div>
          <Badge tone="danger" dot className="mt-5">تعذر إتمام عملية الدفع مؤقتاً</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold">عذراً، لم نتمكن من تأكيد وسيلة الدفع</h1>
          <p className="mt-3 text-muted">لم يتم خصم أي مبالغ من حسابك إطلاقاً. عادةً ما يحدث هذا بسبب قيود الشراء عبر الإنترنت أو خطأ في إدخال بيانات البطاقة.</p>
        </div>

        <div className="panel mt-8 border-r-4 border-gold p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><b className="flex items-center gap-2"><Info className="h-5 w-5 text-danger" /> سبب الرفض المصرفي</b><code className="rounded-full bg-bg px-3 py-1 text-xs font-bold text-danger">{code}</code></div>
          <p className="mt-2 text-sm text-muted">تم رفض العملية من قبل البنك المصدر للبطاقة. يُرجى مراجعة الصلاحيات أو الاتصال بخدمة عملاء مصرفك.</p>
          <p className="mt-2 text-sm text-gold">تأكد من تفعيل خدمة الشراء أونلاين على بطاقتك أو وجود رصيد كافٍ لعملية التحقق الرمزي (١ دولار / يعاد فوراً).</p>
        </div>

        <h2 className="mt-8 flex items-center gap-2 font-display text-xl font-bold"><Wand2 className="h-5 w-5 text-teal" /> حلول سريعة مقترحة للاشتراك</h2>
        <Stagger className="mt-4 grid gap-3 md:grid-cols-3">
          {[{ i: CreditCard, c: 'text-teal', t: 'بطاقة مصرفية أخرى', d: 'فيزا، ماستركارد، أو بطاقات ميزة المحلية الفورية.' }, { i: Wallet, c: 'text-gold', t: 'المحافظ و InstaPay', d: 'فودافون كاش، محفظتي، أو شبكة المدفوعات إنستاباي.' }, { i: Store, c: 'text-violet', t: 'كود سداد نقدي (فوري)', d: 'ادفع نقداً برقم مرجعي من أي نقطة بيع أو متجر مجاور.' }].map((o, i) => (
            <StaggerItem key={o.t} className="panel rounded-3xl p-5 transition hover:-translate-y-1">
              <div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-full bg-surface"><o.i className={`h-6 w-6 ${o.c}`} /></span><span className={`text-xs font-bold ${o.c}`}>الخيار {i + 1}</span></div>
              <b className="mt-4 block">{o.t}</b><p className="mt-1 text-xs leading-6 text-muted">{o.d}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Button href="/checkout" pill={false} size="lg" className="mt-8 w-full" icon={<RefreshCw className="h-5 w-5" />}>إعادة المحاولة وتغيير وسيلة الدفع</Button>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Button href="/checkout/fawry" variant="ghost" pill={false} icon={<Store className="h-4 w-4 text-gold" />}>الدفع بواسطة كود فوري نقداً</Button>
          <Button variant="ghost" pill={false} className="text-teal" icon={<Headset className="h-4 w-4" />}>الدعم الفني المباشر (متاح ٢٤/٧)</Button>
        </div>
        <div className="panel mt-8 flex flex-wrap items-center justify-between gap-3 rounded-full p-4">
          <p className="text-sm"><Badge tone="gold">العضوية الذهبية VIP</Badge> <b className="text-teal">Cinema Member</b> — ١٤ يوماً تجربة مجانية كاملة بدون أي التزام أو مخاطرة</p>
          <Badge tone="teal"><ShieldCheck className="h-3 w-3" /> ضمان الحماية المشفرة Bit-256</Badge>
        </div>
      </motion.div>
    </div>
  );
}

export default function FailedPage() {
  return <Suspense><FailedInner /></Suspense>;
}
