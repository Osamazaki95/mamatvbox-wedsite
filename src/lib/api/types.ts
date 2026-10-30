/** Platform ids are free-form so new platforms can be added from the dashboard or by sync. */
export type PlatformId = string;
export type PlatformKind = 'subscription' | 'free' | 'ads' | 'rental';

export type Quality = '4K UHD' | '4K HDR' | 'IMAX 4K' | '1080p FHD' | 'HD 720p';
export type TitleType = 'movie' | 'series' | 'kids' | 'program';

export interface Platform {
  id: PlatformId;
  name: string;
  nameAr: string;
  tagline: string;
  color: string;
  priceMonthly: number;
  currency: string;
  maxQuality: string;
  hdr: string | null;
  audio: string;
  screens: number;
  offline: boolean;
  trialDays: number;
  catalogSize: number;
  kind?: PlatformKind;
  url?: string;
  logo?: string;
  active?: boolean;
  /** TMDB / JustWatch provider ids mapped to this platform (used by auto-sync). */
  tmdbProviderIds?: number[];
  regions?: string[];
  /** true when created automatically by the sync job */
  auto?: boolean;
  /** shown first in the home-page platforms section */
  featured?: boolean;
}

export interface Title {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string;
  type: TitleType;
  year: number;
  genres: string[];
  rating: number;
  runtime: string;
  quality: Quality;
  platforms: PlatformId[];
  inPlan: boolean;
  download: boolean;
  poster?: string;
  tint: string;
  overview: string;
  director: string;
  cast: string[];
  expiresInDays?: number;
  tmdbId?: number;
  source?: 'tmdb' | 'manual';
  /** platform ids per region code, e.g. { EG: ['shahid'], SA: ['netflix'] } */
  availability?: Record<string, PlatformId[]>;
  /** locked titles keep admin edits and are not overwritten by sync */
  locked?: boolean;
  adminOverrides?: Record<string, unknown>;
  /** official page of this title on each platform (platform id → URL) */
  links?: Record<string, string>;
  updatedAt?: string;
  /** country / language group from the dashboard taxonomy (مصري، أجنبي، ياباني ...) */
  origin?: string | null;
  /** listed in the Ramadan section */
  ramadan?: boolean;
  /** page views counted by the site */
  views?: number;
  /** TMDB popularity (synced titles) */
  popularity?: number;
}

export interface Person {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo?: string;
  titles: string[];
}

export interface Country {
  code: string;
  name: string;
  official: string;
  flag: string;
  currency: string;
  currencyName: string;
}

export interface Plan {
  id: 'free' | 'gold' | 'family';
  name: string;
  badge: string;
  monthly: number;
  yearly: number;
  features: { label: string; included: boolean }[];
  highlight?: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  description: string;
  method: string;
  amount: number;
  status: 'paid' | 'free' | 'refunded' | 'failed';
}

export interface AppNotification {
  id: string;
  kind: 'expiring' | 'quality' | 'new' | 'billing' | 'available';
  title: string;
  body: string;
  time: string;
  read: boolean;
  titleSlug?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  memberSince: string;
  plan: Plan['id'];
  trialEndsAt: string;
  platforms: PlatformId[];
  watchlist: string[];
}

export interface SearchResult {
  titles: Title[];
  people: Person[];
  total: number;
}

export interface AdminKpi {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
}

export interface ReferralShare {
  platform: string;
  clicks: number;
  share: number;
  color: string;
}

export interface PaymentRequest {
  method: 'card' | 'wallet' | 'fawry';
  planId: Plan['id'];
  billing: 'monthly' | 'yearly';
  card?: { number: string; expiry: string; cvv: string; holder: string };
}

export interface SeoSettings {
  siteName: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonicalUrl: string;
  googleVerification: string;
  twitterHandle: string;
  indexing: boolean;
}

export interface SyncSettings {
  enabled: boolean;
  intervalHours: number;
  regions: string[];
  pages: number;
  autoAddProviders: boolean;
  lastRunAt?: string;
}

export interface PaymentSettings {
  provider: 'paymob' | 'none';
  currency: string;
  testMode: boolean;
  integrationIds: { card: string; wallet: string; kiosk: string };
}

export interface FeatureFlags {
  /** login, sign-up and member pages */
  accounts: boolean;
  /** plans page and checkout */
  pricing: boolean;
}

export interface HomeSettings {
  platformsCount: number;
  top10: { enabled: boolean; title: string };
  ramadan: { enabled: boolean; title: string; subtitle: string };
  mostWatched: { enabled: boolean };
}

export type SocialNetwork =
  | 'facebook' | 'instagram' | 'x' | 'tiktok' | 'youtube' | 'snapchat' | 'whatsapp' | 'telegram'
  | 'threads' | 'linkedin' | 'pinterest' | 'discord' | 'twitch' | 'spotify' | 'email' | 'website';

export interface SocialLink {
  id: string;
  network: SocialNetwork;
  url: string;
  label?: string;
  active: boolean;
}

export interface TaxonomyGroup { origins: string[]; genres: string[] }
export type Taxonomy = Record<TitleType, TaxonomyGroup>;

export interface SiteSettings {
  seo: SeoSettings;
  sync: SyncSettings;
  payments: PaymentSettings;
  features: FeatureFlags;
  home: HomeSettings;
  social: SocialLink[];
  taxonomy: Taxonomy;
}

/** Public part of the settings (GET /api/config). */
export interface SiteConfig {
  features: FeatureFlags;
  home: HomeSettings;
  social: SocialLink[];
  taxonomy: Taxonomy;
  siteName: string;
  /** published titles (for the home-page counters) */
  titleCount?: number;
}

export interface SyncLog {
  at: string;
  ok: boolean;
  message: string;
  scanned: number;
  added: number;
  updated: number;
  newPlatforms: string[];
}

export interface DiscoveredProvider {
  id: number;
  name: string;
  logo: string;
  platformId?: string;
}

export interface PaymentRecord {
  id: string;
  at: string;
  planId: string;
  billing: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  method: string;
  email?: string;
  providerRef?: string;
}

export interface IntegrationStatus {
  tmdbConfigured: boolean;
  paymobConfigured: boolean;
  hmacConfigured: boolean;
  siteUrl: string;
  lastRunAt?: string;
  running: boolean;
  logs: SyncLog[];
  settings: SiteSettings;
  discovered: DiscoveredProvider[];
  counts: { titles: number; synced: number; demo: number; payments: number };
}

export interface PaymentResult {
  status: 'success' | 'failed' | 'pending';
  transactionId: string;
  errorCode?: string;
  fawryCode?: string;
  /** hosted checkout page (Paymob) — the browser is redirected here */
  redirectUrl?: string;
}
