'use client';
import { useEffect, useState } from 'react';

interface AppStatus {
  key: string; name: string; status: string;
  latencyMs: number; prodUrl: string; gateUrl: string;
}
interface LogEntry {
  name: string; app: string; allowed: number; ts: string;
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('depot-theme');
    if (stored === 'dark') {
      setDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('depot-theme', next ? 'dark' : 'light');
  }
  return (
    <button className="theme-toggle" onClick={toggle}>
      {dark ? '☀ Light' : '◑ Dark'}
    </button>
  );
}

function StatusDot({ status }: { status: string }) {
  const cls = status === 'awake' ? 'awake' : status === 'asleep-or-suspended' ? 'suspended' : 'down';
  return <span className={`status-dot ${cls}`} />;
}

export default function AdminDashboard() {
  const [apps, setApps] = useState<AppStatus[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function loadApps() {
    const res = await fetch('/api/status');
    if (res.ok) { setApps(await res.json()); setLastRefresh(new Date()); }
  }
  async function loadLog() {
    const res = await fetch('/api/whitelist');
    if (res.ok) { const d = await res.json(); setLog(d.log || []); }
  }

  useEffect(() => {
    loadApps(); loadLog();
    const id = setInterval(() => { loadApps(); loadLog(); }, 15000);
    return () => clearInterval(id);
  }, []);

  async function action(key: string, kind: 'restart' | 'suspend' | 'resume') {
    setBusy(key + kind);
    await fetch(`/api/${kind}/${key}`, { method: 'POST' });
    await loadApps();
    setBusy(null);
  }

  return (
    <div className="depot-shell">
      <header className="depot-header">
        <div className="depot-wordmark">De<span>pot</span></div>
        <div className="depot-header-right">
          <span className="depot-refresh-time">
            updated {lastRefresh.toLocaleTimeString()}
          </span>
          <ThemeToggle />
        </div>
      </header>

      <div className="section-label">Services</div>
      <div className="app-list">
        {apps.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
            Loading…
          </p>
        )}
        {apps.map((app) => (
          <div className="app-card" key={app.key}>
            <div className="app-left">
              <StatusDot status={app.status} />
              <span className="app-name">{app.name}</span>
              <div className="app-meta">
                <span className="app-latency">
                  {app.status === 'awake' ? `${app.latencyMs}ms` : app.status.replace('-', ' ')}
                </span>
                <a className="app-link" href={app.gateUrl} target="_blank" rel="noreferrer">
                  {app.gateUrl}
                </a>
              </div>
            </div>
            <div className="app-controls">
              <button className="btn btn-primary"
                disabled={busy === app.key + 'resume'}
                onClick={() => action(app.key, 'resume')}>
                Wake
              </button>
              <button className="btn"
                disabled={busy === app.key + 'restart'}
                onClick={() => action(app.key, 'restart')}>
                Restart
              </button>
              <button className="btn btn-danger"
                disabled={busy === app.key + 'suspend'}
                onClick={() => action(app.key, 'suspend')}>
                Suspend
              </button>
              <a className="btn btn-edit" href={`/ai/${app.key}`}>Edit</a>
            </div>
          </div>
        ))}
      </div>

      {log.length > 0 && (
        <>
          <div className="section-label">Recent access</div>
          <div className="log-card">
            <table className="log-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>App</th>
                  <th>Result</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {log.slice(0, 10).map((entry, i) => (
                  <tr key={i}>
                    <td>{entry.name || '—'}</td>
                    <td>{entry.app}</td>
                    <td className={entry.allowed ? 'log-allowed' : 'log-denied'}>
                      {entry.allowed ? '✓ Allowed' : '✗ Denied'}
                    </td>
                    <td className="log-time">
                      {new Date(entry.ts).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
