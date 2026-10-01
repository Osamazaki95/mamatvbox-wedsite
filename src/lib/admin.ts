'use client';

/** Browser helper for /api/admin/* — redirects to login on 401. */
export async function adminFetch<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    method: init?.method ?? 'GET',
    headers: init?.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
  if (res.status === 401) {
    window.location.href = `/admin-login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new Error('unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data as T;
}

export const kindLabels = {
  subscription: 'اشتراك مدفوع',
  free: 'مجاني قانوني',
  ads: 'مجاني بإعلانات',
  rental: 'تأجير / شراء',
} as const;
