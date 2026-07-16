import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getApp } from '@/lib/apps';

export async function GET(req: NextRequest, { params }: { params: { app: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const app = getApp(params.app);
  if (!app) return NextResponse.json({ error: 'unknown app' }, { status: 404 });
  if (app.renderServiceId && process.env.RENDER_API_KEY) {
    try {
      const res = await fetch(`https://api.render.com/v1/services/${app.renderServiceId}/deploys?limit=1`, {
        headers: { Authorization: `Bearer ${process.env.RENDER_API_KEY}`, Accept: 'application/json' }, cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const latest = data[0]?.deploy;
        if (latest) return NextResponse.json({ platform: 'render', status: latest.status, createdAt: latest.createdAt, commitMessage: latest.commit?.message });
      }
    } catch { }
  }
  return NextResponse.json({ platform: 'vercel', status: 'check-vercel-dashboard' });
}
