'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'gold' | 'teal' | 'violet' | 'danger' | 'muted' | 'solidGold' | 'solidTeal';

const tones: Record<Tone, string> = {
  gold: 'bg-gold-soft text-gold',
  teal: 'bg-teal-soft text-teal',
  violet: 'bg-violet-soft text-violet',
  danger: 'bg-danger-soft text-danger',
  muted: 'bg-panel text-muted',
  solidGold: 'bg-gold text-bg',
  solidTeal: 'bg-teal text-bg',
};

export function Badge({ tone = 'muted', children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold', tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Toggle({ checked, onChange, tone = 'teal', label }: { checked: boolean; onChange: (v: boolean) => void; tone?: 'teal' | 'gold'; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300', checked ? (tone === 'teal' ? 'bg-teal' : 'bg-gold') : 'bg-line')}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={cn('absolute top-1 h-5 w-5 rounded-full shadow', checked ? 'left-1 bg-bg' : 'right-1 bg-muted')}
      />
    </button>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors', checked ? 'border-teal bg-teal' : 'border-line bg-panel')}
      >
        <motion.svg initial={false} animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }} viewBox="0 0 24 24" className="h-3.5 w-3.5 text-bg" fill="none" stroke="currentColor" strokeWidth={3.5}>
          <motion.path d="M5 12l4 4 10-10" initial={false} animate={{ pathLength: checked ? 1 : 0 }} transition={{ duration: 0.25 }} />
        </motion.svg>
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, action, icon }: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="eyebrow mb-2 text-teal">{eyebrow}</div>}
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold md:text-[28px]">
          {icon && <span className="text-gold">{icon}</span>}
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
        <span>{label}</span>
        {hint}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  'h-12 w-full rounded-xl border border-transparent bg-panel px-4 text-sm text-ink placeholder:text-dim outline-none transition focus:border-teal/60 focus:bg-surface focus:shadow-[0_0_0_4px_#4FE3D014]';
