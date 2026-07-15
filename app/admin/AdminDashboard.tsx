'use client';
import { useEffect, useState } from 'react';
interface AppStatus {
  key: string; name: string; status: string;
  latencyMs: number; prodUrl: string; gateUrl: string;
}
export default function AdminDashboard() {
  const [apps, setApps] = useState<AppStatus[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  async function load() {
    const res = await fetch('/api/status');
    if (res.ok) setApps(await res.json());
  }
  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);
  async function action(key: string, kind: 'restart' | 'suspend' | 'resume') {
    setBusy(key + kind);
    await fetch(`/api/${kind}/${key}`, { method: 'POST' });
    await load();
    setBusy(null);
  }
  return (
    <main>
      <h1>Depot — status</h1>
      
      {apps.map((app) => (
        <div className="row" key={app.key}>
          <div>
            <span className={`badge ${app.status === 'awake' ? 'awake' : 'down'}`}>{app.status}</span>
            <strong>{app.name}</strong>
            <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>
              {app.latencyMs}ms · <a href={app.gateUrl}>{app.gateUrl}</a>
            </span>
          </div>
          <div>
            <button disabled={busy === app.key + 'resume'} onClick={() => action(app.key, 'resume')}>Wake</button>
            <button disabled={busy === app.key + 'restart'} onClick={() => action(app.key, 'restart')}>Restart</button>
            <button disabled={busy === app.key + 'suspend'} onClick={() => action(app.key, 'suspend')}>Suspend</button>
          </div>
        </div>
      ))}
      {apps.length === 0 && <p>No backend apps configured yet.</p>}
    </main>
  );
}
