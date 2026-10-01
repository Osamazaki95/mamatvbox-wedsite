'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Cookie, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Badge, Toggle } from '../ui/primitives';

const KEY = 'mtb_cookie_consent';
const groups = [
  { k: 'necessary', t: 'ملفات تعريف الارتباط الضرورية جداً (Strictly Necessary)', d: 'حفظ تسجيل الدخول الآمن، حماية حساب VIP المشترك، وضمان تشغيل واجهة الاستكشاف دون انقطاع.', locked: true },
  { k: 'personalization', t: 'ملفات التفضيلات والتخصيص السينمائي (Personalization & Region)', d: 'تذكر دولتك المحددة، عملة الاشتراكات، والمنصات التي تشترك بها.' },
  { k: 'analytics', t: 'ملفات الأداء والتحليلات (Analytics & Performance)', d: 'قياس سرعة استجابة محرك البحث وسلاسة تصفح مكتبات الأفلام.' },
  { k: 'affiliate', t: 'ملفات الإعلانات التوجيهية وتتبع الإحالات (Affiliate & Referral Tracking)', d: 'توثيق نقرات التحول إلى منصات البث الشريكة لاحتساب عمولات الرعاية التشغيلية.' },
] as const;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [custom, setCustom] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ necessary: true, personalization: true, analytics: false, affiliate: false });

  useEffect(() => { if (!localStorage.getItem(KEY)) setTimeout(() => setVisible(true), 1200); }, []);
  const store = (p: Record<string, boolean>) => { localStorage.setItem(KEY, JSON.stringify(p)); setVisible(false); setCustom(false); };

  return (
    <>
      <AnimatePresence>
        {visible && !custom && (
          <motion.div initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-5xl rounded-2xl border border-line bg-card/95 p-5 shadow-card backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-soft"><Cookie className="h-5 w-5 text-gold" /></span><div><b className="flex items-center gap-2 text-sm">إشعار ملفات تعريف الارتباط والخصوصية <Badge tone="teal">شفافية رقمية</Badge></b><p className="mt-1 text-xs text-muted">نستخدم ملفات الارتباط لمنحك تجربة سينمائية مخصصة حسب دولتك، وربط عروض المنصات بأفضل جودة متوفرة لديك.</p></div></div>
              <div className="flex gap-2"><button onClick={() => store({ necessary: true })} className="px-3 text-xs text-muted">رفض الكل</button><Button size="sm" variant="ghost" onClick={() => setCustom(true)} icon={<SlidersHorizontal className="h-3.5 w-3.5" />}>تخصيص الخيارات</Button><Button size="sm" onClick={() => store({ necessary: true, personalization: true, analytics: true, affiliate: true })}>قبول الكل</Button></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {custom && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-bg/80 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-2xl rounded-3xl bg-card p-7">
              <p className="text-xs font-bold text-gold">خصوصية Mamatvbox</p>
              <h2 className="font-display text-xl font-bold">إعدادات الخصوصية وملفات تعريف الارتباط (Cookie Preferences)</h2>
              <div className="mt-5 space-y-3">
                {groups.map((g) => (
                  <div key={g.k} className="flex items-center justify-between gap-4 bg-surface p-4"><div><b className="text-sm">{g.t}</b> {'locked' in g && <Badge tone="teal">إلزامية للتشغيل</Badge>}<p className="mt-1 text-xs text-muted">{g.d}</p></div><Toggle checked={prefs[g.k]} onChange={(v) => !('locked' in g) && setPrefs({ ...prefs, [g.k]: v })} /></div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button onClick={() => store({ necessary: true })} className="text-xs text-muted">رفض الكل غير الضروري</button><div className="flex gap-2"><Button size="sm" variant="ghost" className="text-teal" onClick={() => store({ necessary: true, personalization: true, analytics: true, affiliate: true })}>قبول الكل</Button><Button size="sm" onClick={() => store(prefs)}>حفظ تفضيلاتي المحددة</Button></div></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
