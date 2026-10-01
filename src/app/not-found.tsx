'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Clapperboard, Home, Search, Tv } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

export default function NotFound() {
  const router = useRouter();
  const [q, setQ] = useState('');
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <div className="glow-teal pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center">
          <div className="relative mx-auto h-40 w-40">
            <motion.svg viewBox="0 0 100 100" className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
              <circle cx="50" cy="50" r="46" fill="none" stroke="#4FE3D0" strokeWidth="1.5" strokeDasharray="6 4" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#A78BFA" strokeOpacity=".5" />
              {[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1="50" y1="50" x2={50 + 40 * Math.cos((a * Math.PI) / 180)} y2={50 + 40 * Math.sin((a * Math.PI) / 180)} stroke="#F2F4F7" strokeOpacity=".5" />)}
            </motion.svg>
            <motion.svg viewBox="0 0 100 100" className="absolute inset-0" animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}><circle cx="50" cy="50" r="49" fill="none" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="30 120" /></motion.svg>
            <span className="absolute inset-0 grid place-items-center"><span className="grid h-12 w-12 place-items-center rounded-full border-2 border-teal bg-bg shadow-teal"><span className="h-3 w-3 rounded-full bg-teal" /></span></span>
          </div>
          <p className="mt-10 text-xs text-gold">إشارة مفقودة</p>
          <motion.h1 initial={{ opacity: 0, scale: 0.8, letterSpacing: '0.4em' }} animate={{ opacity: 1, scale: 1, letterSpacing: '0.02em' }} transition={{ duration: 0.9 }} className="text-gradient-brand font-logo text-7xl font-bold">404</motion.h1>
          <h2 className="mt-3 font-display text-3xl font-bold leading-snug md:text-4xl">عذراً، يبدو أن هذا العمل أو الصفحة غادرت صالة العرض!</h2>
          <p className="mt-4 text-muted">الرابط الذي تحاول الوصول إليه غير موجود؛ ربما تم تغيير مساره، أو انتهت حقوق توفره في منطقتك، أو حدث خطأ أثناء كتابة العنوان.</p>
          <form onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(q)}`); }} className="mx-auto mt-8 flex h-14 max-w-2xl items-center gap-3 rounded-full bg-card ps-5 pe-1.5">
            <Search className="h-5 w-5 text-teal" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم الفيلم، المسلسل، الممثل، أو المنصة..." className="flex-1 bg-transparent outline-none placeholder:text-dim" />
            <button className="flex h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-bold text-bg">استكشاف <ArrowLeft className="h-4 w-4" /></button>
          </form>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {[{ h: '/', l: 'العودة للرئيسية', i: Home, gold: true }, { h: '/movies', l: 'تصفح أحدث الأفلام', i: Clapperboard }, { h: '/series', l: 'أفضل المسلسلات المتوفرة', i: Tv }, { h: '/watchlist', l: 'قائمة المشاهدة الخاصة بي', i: Bookmark }].map((b) => (
              <Link key={b.h} href={b.h} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${b.gold ? 'bg-gold text-bg hover:text-bg' : 'bg-panel'}`}><b.i className="h-4 w-4" /> {b.l}</Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
