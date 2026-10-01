'use client';

import { motion } from 'framer-motion';
import { CreditCard, LayoutGrid, Receipt, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/account', label: 'الملف الشخصي', icon: User },
  { href: '/account/subscription', label: 'إدارة الاشتراك', icon: CreditCard },
  { href: '/account/billing', label: 'سجل الفواتير', icon: Receipt },
  { href: '/account/platforms', label: 'منصاتي المشترك بها', icon: LayoutGrid, count: 3 },
  { href: '/account/settings', label: 'إعدادات الحساب', icon: Settings },
];

export function AccountTabs() {
  const path = usePathname();
  return (
    <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto border-b border-line/60 pb-3">
      {tabs.map((t) => {
        const active = path === t.href;
        return (
          <Link key={t.href} href={t.href} className={cn('relative flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm', active ? 'font-bold text-bg hover:text-bg' : 'text-muted')}>
            {active && <motion.span layoutId="acc-tab" className="absolute inset-0 -z-10 rounded-full bg-teal" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <t.icon className="h-4 w-4" /> {t.label}
            {t.count && <span className="grid h-5 w-5 place-items-center rounded-full bg-panel text-[10px] text-ink">{t.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="mb-6 flex items-center gap-2 text-xs text-muted">
      <Link href="/">الرئيسية</Link>
      {items.map((it, i) => <span key={it} className="flex items-center gap-2">‹ <span className={i === items.length - 1 ? 'font-bold text-ink' : ''}>{it}</span></span>)}
    </nav>
  );
}
