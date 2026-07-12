import { NextRequest, NextResponse } from 'next/server';
import { getApp } from '@/lib/apps';
import { restartViaDeployHook } from '@/lib/render';
import { isAdmin } from '@/lib/auth';
export async function POST(req: NextRequest, { params }: { params: { app: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const app = getApp(params.app);
  if (!app?.deployHookUrl) return NextResponse.json({ error: 'no deploy hook configured' }, { status: 400 });
  const result = await restartViaDeployHook(app.deployHookUrl);
  return NextResponse.json(result);
}
