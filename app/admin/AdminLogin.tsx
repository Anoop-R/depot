'use client';
import { useState } from 'react';
export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) window.location.reload();
    else setError(true);
  }
  return (
    <main style={{ maxWidth: 360 }}>
      <h1>Depot admin</h1>
      <form onSubmit={submit}>
        <input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Log in</button>
      </form>
      {error && <p style={{ color: '#a02020' }}>Wrong password.</p>}
    </main>
  );
}
