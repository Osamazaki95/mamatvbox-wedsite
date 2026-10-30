'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  providers: { password: boolean; google: boolean; apple: boolean };
  createdAt: string;
  watchlist: string[];
  platforms: string[];
}

let cache: Promise<User | null> | null = null;
const listeners = new Set<(u: User | null) => void>();

async function req<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
    cache: 'no-store',
  });
  const d = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(d.error ?? `http_${res.status}`);
  return d as T;
}

export const auth = {
  me(force = false): Promise<User | null> {
    if (!cache || force) cache = req<{ user: User | null }>('auth/me').then((d) => d.user).catch(() => null);
    return cache;
  },
  set(u: User | null) {
    cache = Promise.resolve(u);
    listeners.forEach((l) => l(u));
  },
  async login(email: string, password: string, remember: boolean) {
    const d = await req<{ user: User }>('auth/login', 'POST', { email, password, remember });
    auth.set(d.user);
    return d.user;
  },
  async signup(name: string, email: string, password: string) {
    const d = await req<{ user: User }>('auth/signup', 'POST', { name, email, password });
    auth.set(d.user);
    return d.user;
  },
  async logout() {
    await req('auth/logout', 'POST').catch(() => undefined);
    auth.set(null);
  },
  forgot: (email: string) => req<{ ok: boolean }>('auth/forgot', 'POST', { email }),
  async reset(token: string, password: string) {
    const d = await req<{ user: User }>('auth/reset', 'POST', { token, password });
    auth.set(d.user);
    return d.user;
  },
  changePassword: (current: string, password: string) => req<{ ok: boolean }>('auth/password', 'POST', { current, password }),
  async updateProfile(name: string, phone: string) {
    const u = await req<User>('me', 'PATCH', { name, phone });
    auth.set(u);
    return u;
  },
  async deleteAccount() {
    await req('me', 'DELETE');
    auth.set(null);
  },
  async toggleWatchlist(titleId: string, add: boolean) {
    const u = await req<User>('me/watchlist', add ? 'POST' : 'DELETE', { titleId });
    auth.set(u);
    return u;
  },
  oauthUrl: (provider: 'google' | 'apple', next?: string) =>
    `/api/auth/oauth/${provider}${next ? `?next=${encodeURIComponent(next)}` : ''}`,
};

/** undefined = still loading, null = guest */
export function useUser(): User | null | undefined {
  const [u, setU] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    let on = true;
    auth.me().then((x) => { if (on) setU(x); });
    const l = (x: User | null) => setU(x);
    listeners.add(l);
    return () => { on = false; listeners.delete(l); };
  }, []);
  return u;
}

/** Only for pages behind login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (user === null) router.replace(`/login/?next=${encodeURIComponent(path)}`);
  }, [user, router, path]);
  if (!user) {
    return (
      <div className="mx-auto max-w-[1300px] px-5 py-10">
        <div className="skeleton h-40 rounded-3xl" />
        <div className="mt-6 grid gap-4 md:grid-cols-2"><div className="skeleton h-64 rounded-3xl" /><div className="skeleton h-64 rounded-3xl" /></div>
      </div>
    );
  }
  return <>{children}</>;
}

export const authErrors: Record<string, string> = {
  invalid_email: 'اكتب بريد إلكتروني صحيح',
  weak_password: 'كلمة المرور لازم تكون ٨ حروف أو أرقام على الأقل',
  email_exists: 'البريد ده مسجل قبل كده — سجّل دخولك',
  email_exists_oauth: 'البريد ده مسجل بحساب Google أو Apple — استخدم نفس الطريقة',
  invalid_credentials: 'البريد أو كلمة المرور غير صحيحة',
  use_social_login: 'الحساب ده متسجل بـ Google أو Apple — ادخل بنفس الطريقة أو اعمل «نسيت كلمة المرور»',
  too_many_attempts: 'محاولات كتير — استنى ١٥ دقيقة وجرب تاني',
  invalid_token: 'الرابط انتهى أو غير صالح — اطلب رابط جديد',
  wrong_password: 'كلمة المرور الحالية غير صحيحة',
  mail_failed: 'تعذر إرسال الإيميل — تواصل مع الدعم',
  google_not_configured: 'تسجيل الدخول بجوجل لسه ما اتفعّلش على الموقع',
  apple_not_configured: 'تسجيل الدخول بأبل لسه ما اتفعّلش على الموقع',
  oauth_cancelled: 'تم إلغاء تسجيل الدخول',
  oauth_state: 'انتهت الجلسة — جرّب تاني',
  oauth_failed: 'تعذر تسجيل الدخول — جرّب تاني',
  oauth_no_email: 'الحساب مفيهوش بريد إلكتروني',
  unauthorized: 'لازم تسجل دخولك الأول',
};
export const authError = (e: unknown) => authErrors[(e as Error)?.message] ?? 'حصل خطأ غير متوقع — جرّب تاني';
