/** Empty = the PHP API shipped with the site (/api). Set only for an external backend. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
/** Demo mode (local `npm run dev` without the PHP API). */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export class ApiError extends Error {
  constructor(public status: number, message: string, public payload?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

type Query = Record<string, string | number | boolean | undefined>;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  query?: Query;
  body?: unknown;
  /** kept for API compatibility; ignored in static mode */
  revalidate?: number;
}

function buildUrl(path: string, query?: Query) {
  const base = API_BASE_URL ? API_BASE_URL.replace(/\/$/, '') : '/api';
  const qs = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  });
  const s = qs.toString();
  return `${base}${path}${s ? `?${s}` : ''}`;
}

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = window.localStorage.getItem('mtb_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, body, headers, revalidate: _r, ...init } = options;
  void _r;

  const res = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...authHeader(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    let payload: unknown;
    try { payload = await res.json(); } catch { /* empty body */ }
    throw new ApiError(res.status, `Request failed: ${res.status} ${path}`, payload);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Simulated latency for mock mode so loading states are visible. */
export const mockDelay = <T,>(value: T, ms = 350) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));
