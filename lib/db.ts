import { createClient } from '@libsql/client';

let client: ReturnType<typeof createClient> | null = null;

function getDb() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) {
      client = {
        execute: async () => ({ rows: [], rowsAffected: 0, lastInsertRowid: null, columns: [] }),
      } as unknown as ReturnType<typeof createClient>;
      return client;
    }
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });
  }
  return client;
}

export const db = new Proxy({} as Record<string, unknown>, {
  get(_target, prop) {
    if (prop === 'execute') {
      return (...args: unknown[]) => {
        const dbClient = getDb();
        return (dbClient as { execute: (...args: unknown[]) => Promise<unknown> }).execute(...args);
      };
    }
    return (...args: unknown[]) => {
      throw new Error(`Database client does not support '${String(prop)}'`);
    };
  },
});

export async function initSchema() {
  const dbClient = getDb();
  await (dbClient as { execute: (sql: string) => Promise<unknown> }).execute(`CREATE TABLE IF NOT EXISTS whitelist (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  await (dbClient as { execute: (sql: string) => Promise<unknown> }).execute(`CREATE TABLE IF NOT EXISTS access_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, app TEXT, allowed INTEGER,
    ts TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  await (dbClient as { execute: (sql: string) => Promise<unknown> }).execute(`CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    expires TEXT NOT NULL
  )`);
}

export async function initDb() {
  await initSchema();
}
