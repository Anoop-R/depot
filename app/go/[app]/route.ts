import { NextRequest, NextResponse } from 'next/server';
import { getApp, getHealthUrl } from '@/lib/apps';
import { checkHealth, resumeService } from '@/lib/render';
import { sendTelegramAlert } from '@/lib/telegram';
import { verifyCode, createSession, getSession, logAccess } from '@/lib/whitelist';
import { loginFormHtml, wakingUpHtml } from '@/lib/gateHtml';

function html(body: string, status = 200) {
  return new NextResponse(body, { status, headers: { 'Content-Type': 'text/html' } });
}

export async function GET(req: NextRequest, { params }: { params: { app: string } }) {
  const key = params.app;
  const app = getApp(key);
  if (!app) return new NextResponse('Unknown app', { status: 404 });
  if (app.public || !app.requiresBackend) return NextResponse.redirect(app.prodUrl);
  const token = req.cookies.get('depot_session')?.value;
  const session = await getSession(token);
  if (!session) return html(loginFormHtml(key));
  const name = String(session.name);
  const health = await checkHealth(getHealthUrl(app));
  if (health.ok) {
    logAccess(name, key, true);
    return NextResponse.redirect(app.prodUrl);
  }
  if (app.renderServiceId) resumeService(app.renderServiceId).catch(() => {});
  sendTelegramAlert(`${name} is opening ${app.name} — resuming now`);
  logAccess(name, key, true);
  return html(wakingUpHtml(app.name));
}

export async function POST(req: NextRequest, { params }: { params: { app: string } }) {
  const key = params.app;
  const app = getApp(key);
  if (!app) return new NextResponse('Unknown app', { status: 404 });
  const form = await req.formData();
  const name = String(form.get('name') || '').trim();
  const code = String(form.get('code') || '').trim();
  const ok = Boolean(name) && (await verifyCode(code));
  logAccess(name || 'unknown', key, ok);
  if (!ok) {
    sendTelegramAlert(`Unauthorized attempt on ${key} (name: "${name}")`);
    return html(loginFormHtml(key, true));
  }
  const token = await createSession(name);
  const res = NextResponse.redirect(new URL(`/go/${key}`, req.url));
  res.cookies.set('depot_session', token, {
    httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/', sameSite: 'lax',
  });
  return res;
}
