'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Crown, Star, X } from 'lucide-react';
import { useState } from 'react';
import type { Plan } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/primitives';

export function PricingPlans({ plans }: { plans: Plan[] }) {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      <div className="mx-auto mt-8 flex w-fit items-center gap-1 rounded-full bg-panel p-1.5">
        {[{ k: false, l: 'اشتراك شهري' }, { k: true, l: 'اشتراك سنوي' }].map((o) => (
          <button key={o.l} onClick={() => setYearly(o.k)} className={cn('relative rounded-full px-6 py-2.5 text-sm font-semibold transition', yearly === o.k ? 'text-bg' : 'text-muted')}>
            {yearly === o.k && <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-teal" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
            <span className="relative">{o.l}</span>
          </button>
        ))}
        <Badge tone="gold" className="ms-2">وفّر ٢٠٪ — شهرين مجاناً</Badge>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {plans.map((p, i) => {
          const price = yearly ? Math.round(p.yearly / 12) : p.monthly;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className={cn('card relative flex flex-col p-7', p.highlight && 'border-gold/60 bg-gradient-to-b from-gold/[0.08] to-card shadow-gold lg:-mt-4')}
            >
              {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold text-bg">الأكثر اختياراً لعشاق السينما</span>}
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                <Badge tone={p.id === 'family' ? 'violet' : p.highlight ? 'gold' : 'muted'}>{p.badge}</Badge>
              </div>
              <div className="panel mt-5 flex items-end gap-2 p-5">
                <AnimatePresence mode="wait">
                  <motion.span key={price} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="font-display text-5xl font-extrabold">{price}</motion.span>
                </AnimatePresence>
                <span className="pb-2 text-sm text-muted">ج.م / شهرياً</span>
              </div>
              {p.highlight && <p className="mt-2 text-center text-xs text-gold">خصم سنوي متاح عند الدفع دفعة واحدة</p>}
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f.label} className={cn('flex items-start gap-2.5', !f.included && 'text-dim line-through')}>
                    {f.included ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" /> : <X className="mt-0.5 h-4 w-4 shrink-0" />}
                    {f.label}
                  </li>
                ))}
              </ul>
              <Button
                href={p.id === 'free' ? undefined : `/checkout?plan=${p.id}&billing=${yearly ? 'yearly' : 'monthly'}`}
                variant={p.id === 'free' ? 'ghost' : p.id === 'family' ? 'violet' : 'gold'}
                className="mt-7 w-full"
                icon={p.id === 'family' ? <Crown className="h-4 w-4" /> : p.highlight ? <Star className="h-4 w-4" /> : undefined}
                disabled={p.id === 'free'}
              >
                {p.id === 'free' ? 'حسابك الحالي النشط' : p.highlight ? 'ابدأ تجربتك المجانية (١٤ يوماً)' : 'اشترك في باقة العائلة'}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
