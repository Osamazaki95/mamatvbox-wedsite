'use client';

import { animate, motion, useInView, type Variants } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function Reveal({ children, delay = 0, className, y = 24 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className, gap = 0.07 }: { children: ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} variants={fadeUp}>{children}</motion.div>;
}

/* ---------- Count-up numbers ---------- */

const AR = '٠١٢٣٤٥٦٧٨٩';
const toLatin = (s: string) => s.replace(/[٠-٩]/g, (d) => String(AR.indexOf(d))).replace(/٫/g, '.');
const toArabic = (s: string) => s.replace(/\d/g, (d) => AR[Number(d)]);
const NUMBER = /[\d٠-٩]+(?:[,٬][\d٠-٩]{3})*(?:[.٫][\d٠-٩]+)?/;

interface Parsed { before: string; after: string; target: number; decimals: number; arabic: boolean; grouped: boolean }

function parse(value: string): Parsed | null {
  const m = value.match(NUMBER);
  if (!m || m.index === undefined) return null;
  const raw = m[0];
  const latin = toLatin(raw).replace(/[,٬]/g, '');
  return {
    before: value.slice(0, m.index),
    after: value.slice(m.index + raw.length),
    target: parseFloat(latin),
    decimals: latin.includes('.') ? latin.split('.')[1].length : 0,
    arabic: /[٠-٩]/.test(raw),
    grouped: /[,٬]/.test(raw),
  };
}

function format(n: number, p: Parsed) {
  let s = p.grouped
    ? n.toLocaleString('en-US', { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals })
    : n.toFixed(p.decimals);
  if (p.arabic) s = toArabic(s).replace('.', '٫');
  return p.before + s + p.after;
}

/**
 * Animates the first number found inside any string, keeping its surrounding
 * text, digit system (Arabic/Latin), grouping and decimals — e.g.
 * "٤٨٢,٥٠٠ ج.م", "+48,000", "٪٩٩.٨", "42.8 MB". Starts when scrolled into view.
 */
export function Counter({ value, className, duration = 1.8 }: { value: string | number; className?: string; duration?: number }) {
  const text = String(value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const parsed = parse(text);

  useEffect(() => {
    if (!inView || !parsed || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, parsed.target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { el.textContent = format(v, parsed); },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, text]);

  return <span ref={ref} className={className}>{parsed ? format(0, parsed) : text}</span>;
}

/** Numeric convenience wrapper around <Counter>. */
export function CountUp({ to, suffix = '', prefix = '', decimals = 0, className }: { to: number; suffix?: string; prefix?: string; decimals?: number; className?: string }) {
  const n = to.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <Counter value={`${prefix}${n}${suffix}`} className={className} />;
}

/** Progress bar that fills from zero when visible. */
export function Bar({ value, className, color = 'bg-teal' }: { value: number; className?: string; color?: string }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-line ${className ?? ''}`}>
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease }}
      />
    </div>
  );
}
