// Edge-safe (used by middleware and route handlers).
export const ADMIN_COOKIE = 'mtb_admin';

export async function adminToken(password = process.env.ADMIN_PASSWORD ?? ''): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`mtb-admin:${password}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function isAdmin(cookieValue?: string): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD || !cookieValue) return false;
  return cookieValue === (await adminToken());
}
