import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 border-gold', className)}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-gold"><path d="M7 5v14l12-7z" /></svg>
    </span>
  );
}

export function Logo({ size = 'md', href = '/' }: { size?: 'sm' | 'md' | 'lg'; href?: string }) {
  const text = { sm: 'text-lg', md: 'text-xl sm:text-2xl', lg: 'text-3xl sm:text-4xl' }[size];
  return (
    <Link href={href} translate="no" className="notranslate group flex shrink-0 items-center gap-2.5 whitespace-nowrap hover:text-ink" aria-label="Mamatvbox">
      <span className={cn('font-logo font-bold leading-none tracking-tight text-ink', text)}>Mamatvbox</span>
      <span className="hidden items-center gap-1.5 rounded-md bg-surface px-1.5 py-1 transition-transform duration-300 group-hover:scale-105 sm:flex">
        <LogoMark />
        <span className="text-[11px] font-bold leading-none">
          <span className="border-b border-teal text-ink">Mamatv</span><span className="text-gold">box</span>
        </span>
      </span>
    </Link>
  );
}
