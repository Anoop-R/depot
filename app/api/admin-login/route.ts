import { NextRequest, NextResponse } from 'next/server';
import { sign } from '@/lib/auth';
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'invalid password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('depot_admin', sign('admin'), {
    httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax',
  });
  return res;
}
