import crypto from 'crypto';
import { NextRequest } from 'next/server';

const SECRET = process.env.SESSION_SECRET || 'change-me-in-env';

export function sign(payload: string) {
  const h = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${h}`;
}

export function verify(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return sig === expected ? payload : null;
}

export function isAdmin(req: NextRequest) {
  const token = req.cookies.get('depot_admin')?.value;
  return verify(token) === 'admin';
}
