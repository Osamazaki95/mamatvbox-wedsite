import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminToken } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (password !== process.env.ADMIN_PASSWORD) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }
  const proto = req.headers.get('x-forwarded-proto') ?? new URL(req.url).protocol.replace(':', '');
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await adminToken(), {
    httpOnly: true, sameSite: 'lax', secure: proto === 'https', path: '/', maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
