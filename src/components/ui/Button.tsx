'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'gold' | 'teal' | 'ghost' | 'outline' | 'violet' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  gold: 'bg-gold text-bg hover:bg-[#FCD34D] shadow-gold',
  teal: 'bg-teal text-bg hover:bg-[#6EF0DF] shadow-teal',
  violet: 'bg-violet text-bg hover:bg-[#C4B5FD]',
  ghost: 'bg-panel text-ink hover:bg-line',
  outline: 'border border-line text-ink hover:border-teal/60 hover:text-teal',
  danger: 'bg-danger-soft text-danger hover:bg-danger/25',
  dark: 'bg-surface text-ink hover:bg-panel',
};

// min-height instead of fixed height: long Arabic labels wrap cleanly instead of overflowing.
const sizes: Record<Size, string> = {
  sm: 'min-h-8 px-3 py-1.5 text-xs gap-1.5',
  md: 'min-h-11 px-5 py-2.5 text-sm gap-2',
  lg: 'min-h-14 px-6 py-3 text-sm sm:px-8 sm:text-base gap-2.5',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  icon?: ReactNode;
  loading?: boolean;
  pill?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'gold', size = 'md', href, icon, loading, pill = true, className, children, disabled, ...rest },
  ref,
) {
  const classes = cn(
    'relative inline-flex select-none items-center justify-center text-center font-semibold leading-snug transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
    pill ? 'rounded-full' : 'rounded-lg',
    variants[variant], sizes[size], className,
  );
  const content = (
    <>
      {loading ? <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" /> : icon && <span className="shrink-0">{icon}</span>}
      {children}
    </>
  );

  if (href) {
    return (
      <motion.span whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className={cn('inline-flex', className?.includes('w-full') && 'w-full')}>
        <Link href={href} className={cn(classes, 'hover:text-current')}>{content}</Link>
      </motion.span>
    );
  }

  return (
    <motion.button
      ref={ref}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={classes}
      disabled={disabled || loading}
      {...(rest as object)}
    >
      {content}
    </motion.button>
  );
});
