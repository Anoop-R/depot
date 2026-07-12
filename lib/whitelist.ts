import { randomUUID } from 'crypto';
import { db } from './db';

function getDbExecutor() {
  return (db as unknown as { execute: (...args: unknown[]) => Promise<any> }).execute.bind(db);
}

export async function verifyCode(code: string) {
  if (!code) return false;
  const execute = getDbExecutor();
  const res = await execute({
    sql: 'SELECT 1 FROM whitelist WHERE code = ? AND active = 1',
    args: [code],
  });
  return res.rows.length > 0;
}

export async function addToWhitelist(name: string, code: string) {
  const execute = getDbExecutor();
  await execute({
    sql: 'INSERT OR REPLACE INTO whitelist (code, name, active) VALUES (?, ?, 1)',
    args: [code, name],
  });
}

export async function removeFromWhitelist(code: string) {
  const execute = getDbExecutor();
  await execute({ sql: 'UPDATE whitelist SET active = 0 WHERE code = ?', args: [code] });
}

export async function listWhitelist() {
  const execute = getDbExecutor();
  const res = await execute('SELECT code, name, active FROM whitelist ORDER BY created_at DESC');
  return res.rows;
}

export async function getWhitelist() {
  return listWhitelist();
}

export async function setWhitelist(codes: string[]) {
  const existing = await listWhitelist();
  const currentCodes = new Set(existing.map((row: any) => String(row.code)));
  const incoming = new Set(codes.map((code) => code.trim()).filter(Boolean));

  for (const code of Array.from(currentCodes)) {
    if (!incoming.has(code as string)) {
      await removeFromWhitelist(code as string);
    }
  }

  for (const code of incoming) {
    if (!currentCodes.has(code)) {
      await addToWhitelist(code, code);
    }
  }
}

export async function logAccess(name: string, app: string, allowed: boolean) {
  const execute = getDbExecutor();
  try {
    await execute({
      sql: 'INSERT INTO access_log (name, app, allowed) VALUES (?, ?, ?)',
      args: [name || 'unknown', app, allowed ? 1 : 0],
    });
  } catch {}
}

export async function recentAccessLog(limit = 25) {
  const execute = getDbExecutor();
  const res = await execute({
    sql: 'SELECT name, app, allowed, ts FROM access_log ORDER BY ts DESC LIMIT ?',
    args: [limit],
  });
  return res.rows;
}

export async function createSession(name: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const execute = getDbExecutor();
  await execute({
    sql: 'INSERT INTO sessions (token, name, expires) VALUES (?, ?, ?)',
    args: [token, name, expires],
  });
  return token;
}

export async function getSession(token: string | undefined) {
  if (!token) return null;
  const execute = getDbExecutor();
  try {
    const res = await execute({
      sql: "SELECT name FROM sessions WHERE token = ? AND expires > datetime('now')",
      args: [token],
    });
    return res.rows[0] || null;
  } catch { return null; }
}
