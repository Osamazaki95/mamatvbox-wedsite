'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Save, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge, Field, Toggle, inputClass } from '@/components/ui/primitives';
import { adminFetch } from '@/lib/admin';
import type { SeoSettings, SiteSettings } from '@/lib/api/types';
import { cn } from '@/lib/utils';

export default function SeoPage() {
  const [s, setS] = useState<SeoSettings | null>(null);
  const [kw, setKw] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { adminFetch<SiteSettings>('settings').then((d) => setS(d.seo)); }, []);
  if (!s) return <div className="skeleton h-96" />;

  const set = <K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) => setS({ ...s, [k]: v });
  const addKeywords = (raw: string) => {
    const words = raw.split(/[,،\n]+/).map((w) => w.trim()).filter(Boolean);
    if (words.length) set('keywords', [...new Set([...s.keywords, ...words])]);
    setKw('');
  };
  const save = async () => {
    setBusy(true);
    await adminFetch('settings', { method: 'PUT', body: { seo: s } });
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const titleLen = s.title.length;
  const descLen = s.description.length;
  const host = (s.canonicalUrl || 'https://your-domain.com').replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-card p-5 sm:p-7">
        <Badge tone="gold"><Globe className="h-3 w-3" /> تحسين الظهور في محركات البحث</Badge>
        <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">إعدادات SEO والكلمات المفتاحية</h1>
        <p className="mt-1 text-sm text-muted">التعديلات تُطبّق فوراً على كل صفحات الموقع وخريطة الموقع (sitemap.xml) وملف robots.txt.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="space-y-4 bg-card p-5 sm:p-7">
            <h2 className="font-display text-lg font-bold">البيانات الأساسية</h2>
            <Field label="اسم الموقع"><input value={s.siteName} onChange={(e) => set('siteName', e.target.value)} className={inputClass} /></Field>
            <Field label="عنوان الصفحة الرئيسية (Title)" hint={<span className={cn(titleLen > 60 ? 'text-danger' : 'text-teal')}>{titleLen} / 60</span>}><input value={s.title} onChange={(e) => set('title', e.target.value)} className={inputClass} /></Field>
            <Field label="الوصف (Meta Description)" hint={<span className={cn(descLen > 160 ? 'text-danger' : 'text-teal')}>{descLen} / 160</span>}>
              <textarea rows={4} value={s.description} onChange={(e) => set('description', e.target.value)} className={`${inputClass} h-auto py-3`} />
            </Field>
          </section>

          <section className="bg-card p-5 sm:p-7">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Tag className="h-5 w-5 text-gold" /> الكلمات المفتاحية</h2>
            <p className="mt-1 text-xs text-muted">اكتب الكلمة واضغط Enter، أو الصق عدة كلمات مفصولة بفاصلة.</p>
            <input value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeywords(kw); } }} onBlur={() => kw && addKeywords(kw)} placeholder="مثال: أفلام عربي 2025، مسلسلات رمضان" className={`${inputClass} mt-4`} />
            <div className="mt-4 flex flex-wrap gap-2">
              <AnimatePresence>
                {s.keywords.map((k) => (
                  <motion.span layout key={k} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1.5 text-sm text-teal">
                    {k}<button onClick={() => set('keywords', s.keywords.filter((x) => x !== k))} aria-label={`حذف ${k}`}><X className="h-3.5 w-3.5" /></button>
                  </motion.span>
                ))}
              </AnimatePresence>
              {s.keywords.length === 0 && <p className="text-sm text-dim">لا توجد كلمات مفتاحية بعد</p>}
            </div>
          </section>

          <section className="grid gap-4 bg-card p-5 sm:grid-cols-2 sm:p-7">
            <h2 className="font-display text-lg font-bold sm:col-span-2">الروابط والتحقق</h2>
            <Field label="رابط الموقع الأساسي (Canonical)"><input dir="ltr" value={s.canonicalUrl} onChange={(e) => set('canonicalUrl', e.target.value)} placeholder="https://mamatvbox.com" className={inputClass} /></Field>
            <Field label="صورة المشاركة (OG Image URL)"><input dir="ltr" value={s.ogImage} onChange={(e) => set('ogImage', e.target.value)} placeholder="https://.../og.jpg (1200×630)" className={inputClass} /></Field>
            <Field label="كود تحقق Google Search Console"><input dir="ltr" value={s.googleVerification} onChange={(e) => set('googleVerification', e.target.value)} placeholder="abc123..." className={inputClass} /></Field>
            <Field label="حساب X / Twitter"><input dir="ltr" value={s.twitterHandle} onChange={(e) => set('twitterHandle', e.target.value)} placeholder="@mamatvbox" className={inputClass} /></Field>
            <label className="flex items-center justify-between gap-3 rounded-xl bg-panel p-4 text-sm sm:col-span-2">
              <span><b>السماح لمحركات البحث بأرشفة الموقع</b><span className="block text-xs text-muted">أوقفه فقط أثناء التجربة قبل الإطلاق الرسمي</span></span>
              <Toggle checked={s.indexing} onChange={(v) => set('indexing', v)} />
            </label>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="bg-card p-5">
            <p className="text-xs text-muted">معاينة نتيجة Google</p>
            <div className="mt-3 rounded-xl bg-white p-4 text-right" dir="rtl">
              <p className="truncate text-xs text-[#202124]" dir="ltr">{host}</p>
              <p className="mt-1 line-clamp-1 text-lg text-[#1a0dab]">{s.title || 'عنوان الصفحة'}</p>
              <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{s.description || 'وصف الصفحة'}</p>
            </div>
          </div>
          <div className="space-y-2 bg-card p-5 text-xs text-muted">
            <p><b className="text-ink">خريطة الموقع:</b> <span dir="ltr" className="font-mono">/sitemap.xml</span> — تتحدث تلقائياً مع كل عمل جديد.</p>
            <p><b className="text-ink">robots.txt:</b> <span dir="ltr" className="font-mono">/robots.txt</span> — يحجب الأدمن والحسابات والدفع.</p>
            <p><b className="text-ink">صفحات الأعمال:</b> تحصل على عنوان ووصف وصورة وبيانات Schema.org تلقائياً.</p>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:right-[320px]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-sm text-muted">{saved ? <span className="text-teal">✓ تم الحفظ والتطبيق على الموقع</span> : 'تذكّر حفظ التعديلات'}</p>
          <Button pill={false} loading={busy} onClick={save} icon={<Save className="h-4 w-4" />}>حفظ إعدادات SEO</Button>
        </div>
      </div>
    </div>
  );
}
