'use client';
import { useState } from 'react';
export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) window.location.reload();
    else setError(true);
  }
  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-title">De<span>pot</span></div>
        <div className="login-sub">Control centre — admin access only</div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '9px', marginTop: 4 }}
            disabled={loading}
          >
            {loading ? 'Verifying…' : 'Enter'}
          </button>
        </form>
        {error && <div className="error-text">Incorrect password — try again.</div>}
      </div>
    </div>
  );
}
