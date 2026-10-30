/**
 * Every backend route the frontend talks to, in one place.
 * Replace paths here if your backend uses a different shape.
 */
export const endpoints = {
  titles: {
    list: '/titles',                        // GET  ?type=&platform=&quality=&page=
    trending: '/titles/trending',           // GET  ?region=
    expiring: '/titles/expiring',           // GET  ?days=7
    bySlug: (slug: string) => `/titles/${slug}`,
    similar: (slug: string) => `/titles/${slug}/similar`,
    popular: '/titles/popular',             // GET  ?type=&limit=  (most viewed)
    top10: '/titles/top10',                 // GET
    ramadan: '/titles/ramadan',             // GET
    view: (slug: string) => `/titles/${slug}/view`, // POST (counts a page view)
  },
  config: '/config',                        // GET  public site settings
  people: {
    bySlug: (slug: string) => `/people/${slug}`,
  },
  platforms: {
    list: '/platforms',                     // GET
    bySlug: (id: string) => `/platforms/${id}`,
  },
  search: {
    query: '/search',                       // GET  ?q=
    suggestions: '/search/suggestions',     // GET  ?q=
    trending: '/search/trending',           // GET
    requestTitle: '/search/requests',       // POST { title, year, email }
  },
  auth: {
    magicLink: '/auth/magic-link',          // POST { email }
    login: '/auth/login',                   // POST { email, password }
    signup: '/auth/signup',                 // POST { email, country }
    oauth: (provider: 'google' | 'apple') => `/auth/oauth/${provider}`,
    logout: '/auth/logout',
  },
  me: {
    profile: '/me',                         // GET / PATCH
    watchlist: '/me/watchlist',             // GET / POST { titleId } / DELETE
    platforms: '/me/platforms',             // GET / PUT { platforms }
    preferences: '/me/preferences',         // PUT { ... }
    notifications: '/me/notifications',     // GET
    markAllRead: '/me/notifications/read',  // POST
    alerts: (titleId: string) => `/me/alerts/${titleId}`, // PUT
    devices: '/me/devices',
  },
  billing: {
    plans: '/billing/plans',
    invoices: '/billing/invoices',
    checkout: '/payments/checkout',         // POST PaymentRequest → { redirectUrl }
    cancel: '/billing/cancel',              // POST { reason }
    fawry: '/billing/fawry',                // POST
  },
  meta: {
    countries: '/meta/countries',
    genres: '/meta/genres',
  },
  admin: {
    kpis: '/admin/kpis',
    referrals: '/admin/referrals',
    matrix: '/admin/quality-matrix',
    rows: '/admin/home-rows',
    overrides: (titleId: string) => `/admin/titles/${titleId}/overrides`,
  },
} as const;
