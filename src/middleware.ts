import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, isAdmin } from './lib/server/auth';

export async function middleware(req: NextRequest) {
  if (await isAdmin(req.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith('/api/')) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = '/admin-login';
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
