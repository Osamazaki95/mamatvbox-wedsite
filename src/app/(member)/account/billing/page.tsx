'use client';

import { motion } from 'framer-motion';
import { CalendarClock, CreditCard, Download, Eye, FileText, Receipt, Search, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';
import type { Invoice } from '@/lib/api/types';
import { billingApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const statusMap: Record<Invoice['status'], { l: string; t: 'teal' | 'danger' | 'gold' }> = {
  paid: { l: 'مكتملة', t: 'teal' },
  free: { l: 'ناجحة / مجانية', t: 'teal' },
  refunded: { l: 'مستردة', t: 'gold' },
  failed: { l: 'ملغاة من البنك', t: 'danger' },
};

export default function BillingPage() {
  const [q, setQ] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  useEffect(() => { billingApi.invoices().then(setInvoices); }, []);
  const rows = useMemo(() => invoices.filter((i) => i.id.includes(q) || i.description.includes(q) || i.method.includes(q)), [q, invoices]);

  return (
    <>
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div><Badge tone="gold">مركز الرقابة المالية والمحاسبة</Badge><h1 className="mt-3 font-display text-4xl font-extrabold">سجل الفواتير والمعاملات المالية</h1><p className="mt-2 text-sm text-muted">استعرض كافة عمليات الشراء السابقة، أرصدة الاشتراكات، وحمّل إيصالاتك الضريبية المعتمدة لجميع باقات سينما Mamatvbox.</p></div>
        <div className="flex gap-2"><Button variant="ghost" pill icon={<FileText className="h-4 w-4" />}>تحميل تقرير ضريبي شامل (PDF)</Button><Button variant="teal">تحديث بيانات الفوترة الضريبية</Button></div>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
        {[{ i: Wallet, l: 'إجمالي المدفوع حتى الآن', v: '٠,٠٠ جنيه مصري', s: 'باقة VIP الذهبية مفعلة مجاناً لمدة ١٤ يوماً', b: 'في فترة التجربة المجانية' }, { i: CalendarClock, l: 'تاريخ الفاتورة القادمة', v: '٢٦ أكتوبر ٢٠٢٥', s: 'المبلغ المتوقع: ٤٦٨ ج.م / اشتراك سنوي', b: 'تجديد تلقائي محمي', gold: true }, { i: CreditCard, l: 'وسيلة الدفع الافتراضية', v: 'VISA •••• ٤٥٧١', s: 'البنك الأهلي المصري (NBE) • تنتهي ٠٨/٢٨', b: 'صالحة وموثوقة' }].map((k) => (
          <StaggerItem key={k.l} className="card rounded-[2rem] p-6">
            <div className="flex items-start justify-between"><div><p className="text-xs text-muted">{k.l}</p><Badge tone={k.gold ? 'gold' : 'teal'} className="mt-2">{k.b}</Badge></div><span className="grid h-11 w-11 place-items-center rounded-full bg-panel"><k.i className="h-5 w-5 text-teal" /></span></div>
            <p className="mt-6 font-display text-2xl font-bold">{k.v}</p><p className="mt-1 text-xs text-muted">{k.s}</p>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="card mt-6 flex flex-wrap items-center gap-3 rounded-[2rem] p-4">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-panel px-4"><Search className="h-4 w-4 text-dim" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث برقم الفاتورة، تفاصيل الباقة، أو وسيلة الدفع..." className="h-11 flex-1 bg-transparent text-sm outline-none" /></div>
        <span className="text-xs text-muted">إجمالي العمليات: <b className="text-ink">{rows.length} معاملات</b></span>
        <button className="flex items-center gap-1 text-xs text-muted"><Download className="h-4 w-4" /> تصدير CSV</button>
      </div>

      <Reveal className="card mt-6 overflow-hidden rounded-[2rem]">
        <div className="flex items-center justify-between p-6"><h2 className="flex items-center gap-2 font-display text-xl font-bold"><span className="h-2.5 w-2.5 rounded-full bg-teal" /> جدول الفواتير التفصيلي</h2><span className="text-xs text-muted">مرتبة تنازلياً حسب تاريخ العملية</span></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-surface text-xs text-muted"><tr>{['رقم الفاتورة', 'التاريخ', 'تفاصيل العملية والباقة', 'وسيلة الدفع', 'المبلغ الإجمالي', 'الحالة', 'الإجراء'].map((h) => <th key={h} className="p-4 text-right font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((inv, i) => (
                <motion.tr key={inv.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="border-t border-line/50 hover:bg-panel/40">
                  <td className={`p-4 font-mono font-bold ${inv.status === 'failed' ? 'text-dim line-through' : ''}`}><Receipt className="me-1 inline h-4 w-4 text-teal" />#{inv.id}</td>
                  <td className="p-4 text-muted">{inv.date}</td>
                  <td className="p-4 font-semibold">{inv.description}</td>
                  <td className="p-4 text-muted">{inv.method}</td>
                  <td className="p-4 font-bold text-teal">{formatPrice(inv.amount)}</td>
                  <td className="p-4"><Badge tone={statusMap[inv.status].t} dot>{statusMap[inv.status].l}</Badge></td>
                  <td className="p-4">{inv.status === 'failed' ? <button className="text-xs text-danger">تفاصيل الرفض</button> : <div className="flex gap-2"><Button size="sm" variant={i === 0 ? 'teal' : 'dark'} icon={<Download className="h-3.5 w-3.5" />}>تحميل PDF</Button>{i === 0 && <Button size="sm" variant="dark" icon={<Eye className="h-3.5 w-3.5" />}>عرض</Button>}</div>}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </>
  );
}
