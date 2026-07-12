import { NextRequest, NextResponse } from 'next/server';
import { APPS, getHealthUrl } from '@/lib/apps';
import { checkHealth } from '@/lib/render';
import { isAdmin } from '@/lib/auth';
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const results = await Promise.all(
    APPS.filter((a) => a.requiresBackend).map(async (a) => {
      const health = await checkHealth(getHealthUrl(a));
      return { key: a.key, name: a.name, status: health.ok ? 'awake' : 'asleep-or-suspended', latencyMs: health.latencyMs, prodUrl: a.prodUrl, gateUrl: `/go/${a.key}` };
    })
  );
  return NextResponse.json(results);
}
