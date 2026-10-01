'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CountUp } from '@/components/motion';

const chips = ['كيرة والجن', 'أوبنهايمر', 'الحشاشين', 'أفلام 4K', 'متاح للتنزيل'];

export function HomeHero() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const go = (v = q) => v.trim() && router.push(`/search?q=${encodeURIComponent(v)}`);

  const word = { hidden: { opacity: 0, y: 30, filter: 'blur(8px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)' } };

  return (
    <section className="relative overflow-hidden">
      <div className="glow-teal pointer-events-none absolute inset-0" />
      <motion.div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-teal/10 blur-[120px]" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity }} />

      <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-20 text-center">
        <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 rounded-full bg-panel px-4 py-1.5 text-xs text-teal">
          <Sparkles className="h-3.5 w-3.5" /> محرك البحث والتوجيه السينمائي الأول عربياً
        </motion.span>

        <motion.h1 initial="hidden" animate="show" transition={{ staggerChildren: 0.08, delayChildren: 0.15 }} className="mt-6 font-display text-4xl font-extrabold !leading-[1.45] md:text-6xl">
          {['اعرف', 'فين', 'تتفرج', 'على', 'أي'].map((w) => <motion.span key={w} variants={word} className="inline-block px-1.5">{w}</motion.span>)}
          <motion.span variants={word} className="inline-block px-1.5 text-gold">فيلم</motion.span>
          <motion.span variants={word} className="inline-block px-1.5">أو</motion.span>
          <motion.span variants={word} className="inline-block px-1.5 text-teal">مسلسل...</motion.span>
          <br />
          <motion.span variants={word} className="inline-block px-1.5">قانونياً وبأعلى جودة</motion.span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mx-auto mt-5 max-w-2xl text-muted">
          قارن التوفر وجودة العرض والتنزيل عبر ٩ منصات رقمية معتمدة في مكان واحد ويدون تشتت.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}
          onSubmit={(e) => { e.preventDefault(); go(); }}
          className="mx-auto mt-9 flex h-16 max-w-3xl items-center gap-3 rounded-full border border-line bg-card ps-6 pe-2 shadow-card transition focus-within:border-teal/60 focus-within:shadow-teal"
        >
          <Search className="h-5 w-5 text-teal" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="اكتب اسم أي فيلم، مسلسل، أو ممثل (مثال: كيرة والجن، Oppenheimer...)" className="flex-1 bg-transparent outline-none placeholder:text-dim" />
          <button className="flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-sm font-bold text-bg shadow-gold transition hover:-translate-y-0.5">ابحث الآن <ArrowLeft className="h-4 w-4" /></button>
        </motion.form>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <span className="text-dim">بحث سريع:</span>
          {chips.map((c) => <button key={c} onClick={() => go(c)} className="rounded-full bg-panel px-3 py-1 text-muted transition hover:bg-line hover:text-ink">{c}</button>)}
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { v: 48000, s: '+', l: 'عمل سينمائي وتلفزيوني' },
            { v: 9, s: '', l: 'منصات رسمية مرخصة' },
            { v: 100, s: '%', l: 'توجيه قانوني بدون قرصنة' },
            { v: 0.4, s: 'ث', l: 'زمن الاستجابة ومقارنة الأسعار', d: 1 },
          ].map((k, i) => (
            <motion.div key={k.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + i * 0.08 }} className="card p-5">
              <CountUp to={k.v} suffix={k.s} decimals={k.d ?? 0} className="font-display text-3xl font-extrabold" />
              <p className="mt-1 text-xs text-muted">{k.l}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
