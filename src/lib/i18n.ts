/**
 * Site languages. Arabic is the source. Other languages use the manual
 * dictionary in i18n-dict.ts; any sentence not in the dictionary falls back
 * to automatic translation so the page is never half Arabic.
 */
export const languages = [
  { code: 'ar', g: 'ar', label: 'العربية', short: 'ع', dir: 'rtl' },
  { code: 'en', g: 'en', label: 'English', short: 'EN', dir: 'ltr' },
  { code: 'fr', g: 'fr', label: 'Français', short: 'FR', dir: 'ltr' },
  { code: 'es', g: 'es', label: 'Español', short: 'ES', dir: 'ltr' },
  { code: 'zh', g: 'zh-CN', label: '中文', short: '中', dir: 'ltr' },
  { code: 'pt', g: 'pt', label: 'Português', short: 'PT', dir: 'ltr' },
] as const;

export type LangCode = (typeof languages)[number]['code'];

export function currentLang(): LangCode {
  if (typeof window === 'undefined') return 'ar';
  let v = '';
  try { v = localStorage.getItem('mtb_lang') ?? ''; } catch { /* ignore */ }
  if (!v) v = (document.cookie.match(/(?:^|; )mtb_lang=([a-z]+)/) ?? [])[1] ?? 'ar';
  return (languages.find((l) => l.code === v)?.code ?? 'ar') as LangCode;
}

function clearGoogleCookie() {
  const host = window.location.hostname;
  ['', host, `.${host.replace(/^www\./, '')}`].forEach((d) => {
    document.cookie = `googtrans=; path=/${d ? `; domain=${d}` : ''}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
}

export function setLang(code: LangCode) {
  const lang = languages.find((l) => l.code === code) ?? languages[0];
  try { localStorage.setItem('mtb_lang', lang.code); } catch { /* ignore */ }
  document.cookie = `mtb_lang=${lang.code}; path=/; max-age=31536000; samesite=lax`;
  clearGoogleCookie();
  if (lang.code !== 'ar') document.cookie = `googtrans=/ar/${lang.g}; path=/; max-age=31536000`;
  window.location.reload();
}

/** Runs before React: sets direction + keeps React safe if the fallback translator rewraps text. */
export const earlyLangScript = `(function(){try{var l=localStorage.getItem('mtb_lang')||'ar';if(l==='ar'||location.pathname.indexOf('/admin')===0){document.cookie='googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';return;}var h=document.documentElement;h.setAttribute('dir','ltr');h.setAttribute('lang',l);var P=Node.prototype,rc=P.removeChild,ib=P.insertBefore;P.removeChild=function(c){return c.parentNode!==this?c:rc.apply(this,arguments)};P.insertBefore=function(n,r){return r&&r.parentNode!==this?n:ib.apply(this,arguments)}}catch(e){}})();`;
