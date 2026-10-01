'use client';

import { motion } from 'framer-motion';
import { Database, RefreshCw, Server, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/primitives';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [countdown, setCountdown] = useState(15);
  useEffect(() => { console.error(error); }, [error]);
  useEffect(() => {
    if (countdown <= 0) { reset(); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, reset]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-5 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full bg-card px-5 py-3 text-xs">
          <span className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse-dot rounded-full bg-gold" /> حالة الخدمة والمزامنة: أنت تتصفح بدون اتصال بالإنترنت (Offline Mode)</span>
          <span className="flex gap-2"><Badge>التخزين المحلي: نشط ومحمي</Badge><Badge tone="danger">HTTP 500</Badge></span>
        </div>
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
          <div>
            <Badge tone="gold">PWA OFFLINE SHIELD V3.4</Badge>
            <h1 className="mt-4 font-display text-5xl font-extrabold leading-tight">انقطع الاتصال بالخادم،<br /><span className="text-teal">لكن سينما</span> <span className="text-gradient-brand font-logo">Mamatvbox</span> لم <span className="text-gold">تتوقف!</span></h1>
            <p className="mt-4 text-muted">نواجه ضغطاً استثنائياً على خوادم دليل البث، أو أن اتصالك بالإنترنت غير مستقر حالياً. تم حفظ بيانات قائمة المشاهدة وآخر الأعمال المفحوصة محلياً على جهازك عبر تقنية PWA.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={() => { setCountdown(15); reset(); }} icon={<RefreshCw className="h-4 w-4" />}>إعادة محاولة الاتصال <span className="rounded-full bg-bg/20 px-2 text-xs">تلقائي بعد {countdown}ث</span></Button>
              <Button variant="ghost" href="/watchlist">تصفح قائمتي المحفوظة محلياً</Button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">{[['حجم الذاكرة المحلية', '42.8 MB'], ['عناصر المشاهدة', '16 عملاً'], ['آخر مزامنة سحابية', 'منذ ١٤ د']].map(([l, v]) => <div key={l} className="card p-4"><p className="text-[11px] text-muted">{l}</p><b className="font-display text-xl text-gold">{v}</b></div>)}</div>
          </div>
          <div className="card grid aspect-square place-items-center rounded-[2.5rem]">
            <div className="relative h-56 w-56">
              <motion.div className="absolute inset-0 rounded-full border-4 border-gold" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <motion.div className="absolute inset-4 rounded-full border border-dashed border-teal/50" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
              <span className="absolute inset-0 grid place-items-center"><span className="grid h-20 w-20 place-items-center rounded-2xl bg-panel"><Server className="h-9 w-9 text-teal" /></span></span>
              <Badge tone="teal" className="absolute -bottom-2 left-1/2 -translate-x-1/2">OFFLINE</Badge>
            </div>
          </div>
        </div>
        <div className="card mt-12 rounded-[2.5rem] p-8">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold"><WifiOff className="h-5 w-5 text-danger" /> لوحة الفحص التقني للخطأ (Technical Diagnostic Drawer)</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-4 text-center text-xs">
            {[['رمز الخطأ التقني', 'HTTP_500_TIMEOUT'], ['Cloudflare Ray ID', error.digest ?? '8f92a3bc0192e4-CAI'], ['زمن استجابة الخادم', '> 12,450 ms'], ['حالة Service Worker PWA', 'Active & Resilient']].map(([l, v]) => <div key={l} className="panel p-4"><p className="text-muted">{l}</p><b className="mt-1 block font-mono text-teal">{v}</b></div>)}
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted"><Database className="h-4 w-4" /> تحقق من اتصال جهازك بشبكة الـ Wi-Fi أو بيانات الهاتف، وإن استمر الخلل يمكنك متابعة مشاهدة الأعمال المحفوظة.</p>
        </div>
      </main>
    </>
  );
}
