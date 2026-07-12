import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getWhitelist, setWhitelist } from '@/lib/whitelist';
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json(await getWhitelist());
}
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { codes } = await req.json();
  await setWhitelist(codes || []);
  return NextResponse.json({ ok: true });
}
