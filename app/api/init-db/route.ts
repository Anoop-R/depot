import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { initSchema } from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    await initSchema();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ 
      error: err?.message || 'unknown error',
      stack: err?.stack?.split('\n').slice(0,3)
    }, { status: 500 });
  }
}
