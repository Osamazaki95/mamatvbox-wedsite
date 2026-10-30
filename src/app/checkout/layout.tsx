import { ShieldCheck } from 'lucide-react';
import { CancelHome, FlowHeader, SecureBadge } from '@/components/layout/FlowHeader';
import { LanguageSwitcher } from '@/components/i18n/Language';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FlowHeader center={<SecureBadge />} end={<div className="flex items-center gap-2"><LanguageSwitcher /><CancelHome /></div>} />
      <main className="min-h-[70vh]">{children}</main>
      <footer className="mt-20 bg-surface py-8 text-xs text-muted">
        <div className="mx-auto flex max-w-[1300px] flex-wrap items-center justify-between gap-4 px-5">
          <div className="flex flex-wrap gap-3">
            {['متوافق PCI-DSS', 'حماية الدفع 3D Secure', 'تشفير مصرفي معتمد'].map((b) => (
              <span key={b} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 font-semibold text-ink"><ShieldCheck className="h-4 w-4 text-teal" /> {b}</span>
            ))}
          </div>
          <p>شركاء التوثيق والبيانات: <b className="text-gold">JustWatch</b> • <b className="text-teal">TMDB</b> • <b className="text-ink">SHA-256</b></p>
        </div>
        <p className="mx-auto mt-6 max-w-[1300px] px-5">© Mamatvbox 2024. محرك البحث والاكتشاف السينمائي المرخص. جميع الحقوق محفوظة.</p>
      </footer>
    </>
  );
}
