import { NextRequest, NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  await initDb();
  return NextResponse.json({ ok: true });
}
