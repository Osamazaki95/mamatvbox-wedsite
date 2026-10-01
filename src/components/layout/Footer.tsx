import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { PlatformId } from '@/lib/api/types';
import { Logo } from './Logo';
import { PlatformChip } from '../title/PlatformChip';

const order: PlatformId[] = ['shahid', 'watchit', 'netflix', 'osn', 'yango', 'prime', 'starzplay', 'appletv', 'youtube'];
const legal = [
  { href: '/legal#privacy', label: 'سياسة الخصوصية' },
  { href: '/legal', label: 'الشروط والأحكام' },
  { href: '/search', label: 'إضافة منصة جديدة' },
  { href: '/notifications', label: 'تنبيهات التوفر' },
  { href: '/legal#ip', label: 'حقوق الملكية الفكرية' },
  { href: '/legal#contact', label: 'تواصل معنا' },
];

export function Footer() {
  return (
    <footer className="mt-24 pb-10">
      <div className="mx-auto max-w-[1400px] px-5">
        <div className="card flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-soft"><ShieldCheck className="h-6 w-6 text-teal" /></span>
            <div>
              <h3 className="font-display text-xl font-bold">منصة توجيه وبحث قانونية وموثوقة</h3>
              <p className="mt-1.5 text-sm text-muted">«لا يستضيف [Mamatvbox] أي ملفات وسائط أو محتوى فيديو؛ نحن محرك بحث وتوجيه سينمائي قانوني يساعدك في معرفة أين تشاهد وبأي جودة وأسعار الاشتراك.»</p>
            </div>
          </div>
          <div className="flex gap-2 text-xs font-semibold text-muted">
            <span className="rounded-full bg-panel px-3 py-1.5">TMDB Verified Partner</span>
            <span className="rounded-full bg-panel px-3 py-1.5">JustWatch API</span>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <Logo />
            <p className="mt-3 text-xs leading-6 text-muted">منصتك الشاملة لاستكشاف البث السينمائي ومقارنة توفر الأعمال السينمائية عبر كافة الاشتراكات العالمية والعربية بدقة سينمائية فاخرة.</p>
          </div>
          <div>
            <p className="mb-3 text-xs text-dim">المنصات المرخصة المدعومة</p>
            <div className="flex max-w-3xl flex-wrap gap-2.5">
              {order.map((id) => <PlatformChip key={id} id={id} />)}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 border-t border-line/50 pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>جميع الحقوق محفوظة © 2025 لمنصة Mamatvbox دليل الترفيه السينمائي الرقمي.</p>
          <nav className="flex flex-wrap gap-5">
            {legal.map((l) => <Link key={l.label} href={l.href}>{l.label}</Link>)}
          </nav>
        </div>
      </div>
    </footer>
  );
}
