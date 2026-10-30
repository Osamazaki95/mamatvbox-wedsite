'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { currentLang, languages, setLang, type LangCode } from '@/lib/i18n';
import { dictFor, norm } from '@/lib/i18n-dict';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate: { TranslateElement: new (o: object, id: string) => unknown } };
  }
}

const AR_LETTER = /[\u0621-\u064A]/;
const AR_DIGIT = /[٠-٩]/g;
const SKIP = 'script,style,textarea,input,.notranslate,[translate="no"]';
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const toLatin = (s: string) => s.replace(AR_DIGIT, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/٫/g, '.').replace(/٬/g, ',').replace(/٪/g, '%').replace(/،/g, ',');

/** Manual translation of the whole page from i18n-dict.ts, then automatic fallback for leftovers. */
export function Translator() {
  useEffect(() => {
    const lang = currentLang();
    if (lang === 'ar' || window.location.pathname.startsWith('/admin')) return;
    const map = dictFor(lang);

    const tr = (s: string): string | null => {
      const t = norm(s);
      if (!t) return null;
      if (!AR_LETTER.test(t)) return AR_DIGIT.test(t) ? toLatin(s) : null;
      let out = map.get(t);
      if (out === undefined) {
        const nums: string[] = [];
        const key = t.replace(/[+]?[0-9٠-٩][0-9٠-٩.,٫٬]*/g, (m) => { nums.push(m); return '{n}'; });
        const tpl = nums.length ? map.get(key) : undefined;
        if (tpl) { let j = 0; out = tpl.replace(/\{n\}/g, () => toLatin(nums[j++] ?? '')); }
      }
      if (out === undefined) return null;
      const lead = s.match(/^\s*/)?.[0] ?? '';
      const trail = s.match(/\s*$/)?.[0] ?? '';
      return lead + out + trail;
    };

    const doText = (n: Text) => { const r = tr(n.nodeValue ?? ''); if (r !== null && r !== n.nodeValue) n.nodeValue = r; };
    const doEl = (el: Element) => ATTRS.forEach((a) => { const v = el.getAttribute(a); if (v) { const r = tr(v); if (r !== null && r !== v) el.setAttribute(a, r); } });
    const walk = (root: Node) => {
      const el = root.nodeType === 1 ? (root as Element) : root.parentElement;
      if (!el || el.closest(SKIP)) {
        if (root.nodeType === 1 && (root as Element).matches('input,textarea')) doEl(root as Element);
        return;
      }
      if (root.nodeType === 3) { doText(root as Text); return; }
      doEl(el);
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
        acceptNode: (n) => (n.nodeType === 1 && (n as Element).matches(SKIP) && !(n as Element).matches('input,textarea') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
      });
      for (let n = tw.nextNode(); n; n = tw.nextNode()) { if (n.nodeType === 3) doText(n as Text); else doEl(n as Element); }
    };

    walk(document.body);
    const t = tr(document.title); if (t) document.title = t;
    const mo = new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.type === 'characterData') walk(m.target);
        else if (m.type === 'attributes') doEl(m.target as Element);
        else m.addedNodes.forEach(walk);
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });

    // Automatic fallback for sentences that aren't in the dictionary yet.
    const holder = document.createElement('div');
    holder.id = 'google_translate_element';
    holder.style.display = 'none';
    document.body.appendChild(holder);
    window.googleTranslateElementInit = () => {
      if (window.google) new window.google.translate.TranslateElement({ pageLanguage: 'ar', autoDisplay: false }, 'google_translate_element');
    };
    const timer = window.setTimeout(() => {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(s);
    }, 400);

    return () => { mo.disconnect(); window.clearTimeout(timer); };
  }, []);
  return null;
}

export function LanguageSwitcher({ full = false }: { full?: boolean }) {
  const [lang, setCur] = useState<LangCode>('ar');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setCur(currentLang()); }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const cur = languages.find((l) => l.code === lang) ?? languages[0];

  if (full) {
    return (
      <div className="notranslate grid grid-cols-3 gap-2" translate="no">
        {languages.map((l) => (
          <button key={l.code} onClick={() => l.code !== lang && setLang(l.code)} className={cn('h-11 rounded-xl text-sm font-semibold', l.code === lang ? 'bg-teal text-bg' : 'bg-panel text-ink/85')}>{l.label}</button>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="notranslate relative" translate="no">
      <button onClick={() => setOpen((v) => !v)} aria-label="Language" aria-expanded={open} className="flex h-10 items-center gap-1.5 rounded-full bg-surface px-3 text-xs font-semibold transition hover:bg-panel">
        <Globe className="h-4 w-4 text-teal" />
        <span>{cur.short}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown className="h-3.5 w-3.5 text-muted" /></motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }} transition={{ duration: 0.16 }} className="absolute end-0 top-12 z-50 w-44 overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-card">
            {languages.map((l) => (
              <li key={l.code}>
                <button onClick={() => { setOpen(false); if (l.code !== lang) setLang(l.code); }} className={cn('flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-panel', l.code === lang && 'text-teal')}>
                  <span>{l.label}</span>
                  {l.code === lang && <Check className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
