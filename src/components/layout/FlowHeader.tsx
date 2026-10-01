import { ArrowRight, Lock, User } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from './Logo';

/** Minimal header used by focused flows (onboarding, checkout). */
export function FlowHeader({ center, end }: { center?: ReactNode; end?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1300px] items-center justify-between gap-4 px-5">
        <Logo />
        <div className="hidden md:block">{center}</div>
        {end}
      </div>
    </header>
  );
}

export function SecureBadge() {
  return (
    <span className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs">
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-teal" /> اتصال مشفر بتشفير SSL-256 bit <Lock className="h-4 w-4 text-teal" />
    </span>
  );
}

export function CancelHome() {
  return (
    <div className="flex items-center gap-3">
      <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-teal"><ArrowRight className="h-4 w-4" /> إلغاء والعودة للرئيسية</Link>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-teal text-bg"><User className="h-5 w-5" /></span>
    </div>
  );
}
