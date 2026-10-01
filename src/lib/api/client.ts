/** Empty = use this app's built-in API (/api). Set it only for an external backend. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
/** Demo mode (no server data). Default is live data from the built-in API. */
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
  /** Next.js cache revalidation in seconds (server components only) */
  revalidate?: number;
}

function baseUrl() {
  if (API_BASE_URL) return API_BASE_URL.replace(/\/$/, '');
  if (typeof window !== 'undefined') return '/api';
  // Server components call the same app over loopback.
  return `${process.env.INTERNAL_API_URL || `http://127.0.0.1:${process.env.PORT || 3000}`}/api`;
}

function buildUrl(path: string, query?: Query) {
  const qs = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  });
  const s = qs.toString();
  return `${baseUrl()}${path}${s ? `?${s}` : ''}`;
}

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = window.localStorage.getItem('mtb_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, body, revalidate, headers, ...init } = options;

  const res = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...authHeader(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(revalidate !== undefined ? { next: { revalidate } } : { cache: 'no-store' as const }),
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
