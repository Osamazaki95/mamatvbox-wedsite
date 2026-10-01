'use client';

import { motion } from 'framer-motion';
import { authApi } from '@/lib/api';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2-1.9 3.2-4.7 3.2-8.1z" /><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10z" /><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z" /></svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-ink"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9a4.8 4.8 0 0 0-3.8-2c-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9a5 5 0 0 0-4.2 2.6c-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8 2.2-1.3 3.1-2.5a11 11 0 0 0 1.4-2.9 4.5 4.5 0 0 1-2.6-4.1zM13.9 4.9A4.4 4.4 0 0 0 15 1.7a4.6 4.6 0 0 0-3 1.5 4.2 4.2 0 0 0-1.1 3.1 3.8 3.8 0 0 0 3-1.4z" /></svg>
);

export function OAuthButtons({ stacked }: { stacked?: boolean }) {
  return (
    <div className={stacked ? 'space-y-3' : 'grid grid-cols-2 gap-3'}>
      {(['google', 'apple'] as const).map((p) => (
        <motion.a key={p} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} href={authApi.oauthUrl(p)} className="flex h-12 items-center justify-center gap-3 rounded-full bg-panel text-sm font-semibold hover:bg-line hover:text-ink">
          {p === 'google' ? <GoogleIcon /> : <AppleIcon />}
          {stacked ? `المتابعة باستخدام ${p === 'google' ? 'Google' : 'Apple'}` : `حساب ${p === 'google' ? 'Google' : 'Apple'}`}
        </motion.a>
      ))}
    </div>
  );
}

export function Divider({ label }: { label: string }) {
  return <div className="my-6 flex items-center gap-3 text-xs text-dim"><span className="h-px flex-1 bg-line" />{label}<span className="h-px flex-1 bg-line" /></div>;
}
