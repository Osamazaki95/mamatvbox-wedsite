/**
 * Service layer — the only thing pages/components import.
 * Each function hits the real endpoint when NEXT_PUBLIC_USE_MOCK=false,
 * otherwise it resolves the matching mock data.
 */
import { apiFetch, mockDelay, USE_MOCK } from './client';
import { endpoints } from './endpoints';
import * as mock from '../mock/data';
import type {
  AdminKpi, AppNotification, Country, Invoice, PaymentRequest, PaymentResult,
  Person, Plan, Platform, PlatformId, ReferralShare, SearchResult, Title,
  TitleType, UserProfile,
} from './types';

export interface TitleFilters {
  type?: TitleType;
  platform?: PlatformId;
  quality?: string;
  inPlan?: boolean;
  page?: number;
}

export const titlesApi = {
  list(filters: TitleFilters = {}): Promise<Title[]> {
    if (USE_MOCK) {
      let rows = mock.titles;
      if (filters.type) rows = rows.filter((x) => x.type === filters.type);
      if (filters.platform) rows = rows.filter((x) => x.platforms.includes(filters.platform!));
      if (filters.inPlan) rows = rows.filter((x) => x.inPlan);
      return mockDelay(rows, 0);
    }
    return apiFetch(endpoints.titles.list, { query: { ...filters }, revalidate: 300 });
  },
  trending(region = 'EG'): Promise<Title[]> {
    if (USE_MOCK) return mockDelay(mock.titles.slice(0, 8), 0);
    return apiFetch(endpoints.titles.trending, { query: { region }, revalidate: 600 });
  },
  expiring(days = 7): Promise<Title[]> {
    if (USE_MOCK) return mockDelay(mock.titles.filter((x) => x.expiresInDays), 0);
    return apiFetch(endpoints.titles.expiring, { query: { days }, revalidate: 600 });
  },
  bySlug(slug: string): Promise<Title | null> {
    if (USE_MOCK) return mockDelay(mock.titles.find((x) => x.slug === slug) ?? null, 0);
    return apiFetch(endpoints.titles.bySlug(slug), { revalidate: 300 });
  },
  similar(slug: string): Promise<Title[]> {
    if (USE_MOCK) return mockDelay(mock.titles.filter((x) => x.slug !== slug).slice(0, 4), 0);
    return apiFetch(endpoints.titles.similar(slug), { revalidate: 900 });
  },
};

export const peopleApi = {
  bySlug(slug: string): Promise<(Person & { works: Title[] }) | null> {
    if (USE_MOCK) {
      const p = mock.people.find((x) => x.slug === slug);
      if (!p) return mockDelay(null, 0);
      return mockDelay({ ...p, works: mock.titles.filter((x) => p.titles.includes(x.id) || x.cast.includes(p.name)) }, 0);
    }
    return apiFetch('/people', { query: { name: slug } });
  },
};

export const platformsApi = {
  list(): Promise<Platform[]> {
    if (USE_MOCK) return mockDelay(mock.platforms, 0);
    return apiFetch(endpoints.platforms.list, { revalidate: 3600 });
  },
};

export const searchApi = {
  query(q: string): Promise<SearchResult> {
    if (USE_MOCK) {
      const s = q.trim();
      const titles = s ? mock.titles.filter((x) => x.title.includes(s) || x.originalTitle?.toLowerCase().includes(s.toLowerCase())) : [];
      const people = s ? mock.people.filter((x) => x.name.includes(s)) : [];
      return mockDelay({ titles, people, total: titles.length + people.length }, 250);
    }
    return apiFetch(endpoints.search.query, { query: { q } });
  },
  trending(): Promise<string[]> {
    if (USE_MOCK) return mockDelay(mock.trendingSearches, 0);
    return apiFetch(endpoints.search.trending, { revalidate: 900 });
  },
  requestTitle(body: { title: string; year: string; email: string }): Promise<{ ok: boolean }> {
    if (USE_MOCK) return mockDelay({ ok: true }, 700);
    return apiFetch(endpoints.search.requestTitle, { method: 'POST', body });
  },
};

export const authApi = {
  sendMagicLink(email: string): Promise<{ ok: boolean; expiresIn: number }> {
    if (USE_MOCK) return mockDelay({ ok: true, expiresIn: 900 }, 800);
    return apiFetch(endpoints.auth.magicLink, { method: 'POST', body: { email } });
  },
  signup(email: string, country: string): Promise<{ ok: boolean }> {
    if (USE_MOCK) return mockDelay({ ok: true }, 800);
    return apiFetch(endpoints.auth.signup, { method: 'POST', body: { email, country } });
  },
  oauthUrl(provider: 'google' | 'apple') {
    return `/api/auth/oauth/${provider}`;
  },
};

export const meApi = {
  profile(): Promise<UserProfile> {
    if (USE_MOCK) return mockDelay(mock.currentUser, 0);
    return apiFetch(endpoints.me.profile);
  },
  updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
    if (USE_MOCK) return mockDelay({ ...mock.currentUser, ...patch }, 600);
    return apiFetch(endpoints.me.profile, { method: 'PATCH', body: patch });
  },
  watchlist(): Promise<Title[]> {
    if (USE_MOCK) return mockDelay(mock.titles.filter((x) => mock.currentUser.watchlist.includes(x.id)), 0);
    return apiFetch(endpoints.me.watchlist);
  },
  toggleWatchlist(titleId: string, add: boolean): Promise<{ ok: boolean }> {
    if (USE_MOCK) return mockDelay({ ok: true }, 300);
    return apiFetch(endpoints.me.watchlist, { method: add ? 'POST' : 'DELETE', body: { titleId } });
  },
  savePlatforms(platforms: PlatformId[]): Promise<{ ok: boolean }> {
    if (USE_MOCK) return mockDelay({ ok: true }, 500);
    return apiFetch(endpoints.me.platforms, { method: 'PUT', body: { platforms } });
  },
  savePreferences(prefs: Record<string, unknown>): Promise<{ ok: boolean }> {
    if (USE_MOCK) return mockDelay({ ok: true }, 500);
    return apiFetch(endpoints.me.preferences, { method: 'PUT', body: prefs });
  },
  notifications(): Promise<AppNotification[]> {
    if (USE_MOCK) return mockDelay(mock.notifications, 0);
    return apiFetch(endpoints.me.notifications);
  },
  markAllRead(): Promise<{ ok: boolean }> {
    if (USE_MOCK) return mockDelay({ ok: true }, 300);
    return apiFetch(endpoints.me.markAllRead, { method: 'POST' });
  },
  saveAlerts(titleId: string, rules: Record<string, boolean>): Promise<{ ok: boolean }> {
    if (USE_MOCK) return mockDelay({ ok: true }, 600);
    return apiFetch(endpoints.me.alerts(titleId), { method: 'PUT', body: rules });
  },
};

export const billingApi = {
  plans(): Promise<Plan[]> {
    if (USE_MOCK) return mockDelay(mock.plans, 0);
    return apiFetch(endpoints.billing.plans, { revalidate: 3600 });
  },
  invoices(): Promise<Invoice[]> {
    if (USE_MOCK) return mockDelay(mock.invoices, 0);
    return apiFetch(endpoints.billing.invoices);
  },
  checkout(req: PaymentRequest): Promise<PaymentResult> {
    if (USE_MOCK) {
      const failed = req.card?.number.replace(/\s/g, '').endsWith('0000');
      return mockDelay(
        failed
          ? { status: 'failed', transactionId: 'MTB-984210-EG', errorCode: 'BANK_AUTH_DECLINED_104' }
          : req.method === 'fawry'
            ? { status: 'pending', transactionId: 'MTB-984210-EG', fawryCode: '945812730' }
            : { status: 'success', transactionId: 'MTB-984210-EG' },
        2600,
      );
    }
    return apiFetch(endpoints.billing.checkout, { method: 'POST', body: req });
  },
  cancel(reason: string): Promise<{ ok: boolean }> {
    if (USE_MOCK) return mockDelay({ ok: true }, 700);
    return apiFetch(endpoints.billing.cancel, { method: 'POST', body: { reason } });
  },
};

export const metaApi = {
  countries(): Promise<Country[]> {
    if (USE_MOCK) return mockDelay(mock.countries, 0);
    return apiFetch(endpoints.meta.countries, { revalidate: 86400 });
  },
};

export const adminApi = {
  kpis(): Promise<AdminKpi[]> {
    if (USE_MOCK) return mockDelay(mock.adminKpis, 0);
    return apiFetch(endpoints.admin.kpis);
  },
  referrals(): Promise<ReferralShare[]> {
    if (USE_MOCK) return mockDelay(mock.referrals, 0);
    return apiFetch(endpoints.admin.referrals);
  },
  saveOverrides(titleId: string, body: Record<string, unknown>): Promise<{ ok: boolean }> {
    if (USE_MOCK) return mockDelay({ ok: true }, 700);
    return apiFetch(endpoints.admin.overrides(titleId), { method: 'PUT', body });
  },
};
