'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  files?: { path: string; explanation: string; ok: boolean }[];
  summary?: string;
  committed?: boolean;
}

interface Props {
  appKey: string;
  appName: string;
  repoName: string;
  prodUrl: string;
  deployHookUrl?: string;
  renderServiceId?: string;
}

export default function AiEditor({ appKey, appName, repoName, prodUrl, deployHookUrl, renderServiceId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deployStatus, setDeployStatus] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const instruction = input.trim();
    setInput('');
    setLoading(true);
    const userMsg: Message = { role: 'user', content: instruction };
    setMessages((prev) => [...prev, userMsg]);
    try {
      const res = await fetch('/api/ai-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appKey, instruction }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else if (!data.committed || !data.files?.length) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.summary || 'No changes needed.', committed: false }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.summary, files: data.files, committed: true }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error — please try again.' }]);
    }
    setLoading(false);
  }

  async function deployDev() {
    setDeploying(true);
    setDeployStatus('Triggering deploy…');
    await fetch(`/api/restart/${appKey}`, { method: 'POST' });
    setDeployStatus('Deploy triggered — check Render dashboard for status');
    setDeploying(false);
  }

  async function checkStatus() {
    const res = await fetch(`/api/deploy-status/${appKey}`);
    const data = await res.json();
    setDeployStatus(`${data.platform}: ${data.status}${data.commitMessage ? ` — "${data.commitMessage}"` : ''}`);
  }

  return (
    <div className="ai-editor">
      <div className="ai-header">
        <div>
          <div className="ai-title">{appName} <span style={{ color: 'var(--accent)' }}>/ AI Editor</span></div>
          <div className="ai-subtitle">Repo: <code>Anoop-R/{repoName}</code> — changes commit to <code>dev</code> branch</div>
        </div>
        <div className="ai-actions">
          {deployHookUrl && (
            <button className="btn btn-primary" onClick={deployDev} disabled={deploying}>
              {deploying ? 'Deploying…' : 'Deploy Dev'}
            </button>
          )}
          <button className="btn" onClick={checkStatus}>Check Status</button>
          {prodUrl && <a className="btn" href={prodUrl} target="_blank" rel="noreferrer">View Live ↗</a>}
        </div>
      </div>

      {deployStatus && <div className="ai-status-bar">{deployStatus}</div>}

      <div className="ai-messages">
        {messages.length === 0 && (
          <div className="ai-empty">
            <div className="ai-empty-title">Describe a change</div>
            <div className="ai-empty-sub">
              Claude reads the relevant files, makes the edit, and commits to the dev branch.
              Use Deploy Dev to push, or open claude.ai/code for npm installs and tests.
            </div>
            <div className="ai-suggestions">
              {['Fix the login page styling', 'Add error handling to API calls', 'Update the README', 'Change the button text on the main page'].map((s) => (
                <button key={s} className="ai-suggestion" onClick={() => setInput(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`ai-message ai-message-${msg.role}`}>
            <div className="ai-message-label">{msg.role === 'user' ? 'You' : 'Claude'}</div>
            <div className="ai-message-content">{msg.content}</div>
            {msg.files && msg.files.length > 0 && (
              <div className="ai-changed-files">
                <div className="ai-changed-label">Files changed:</div>
                {msg.files.map((f, j) => (
                  <div key={j} className={`ai-file ${f.ok ? 'ai-file-ok' : 'ai-file-err'}`}>
                    <span className="ai-file-path">{f.path}</span>
                    <span className="ai-file-exp">{f.explanation}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="ai-message ai-message-assistant">
            <div className="ai-message-label">Claude</div>
            <div className="ai-thinking">Reading files and making changes…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="ai-input-row">
        <textarea
          className="ai-input"
          placeholder="Describe what to change… (Enter to send, Shift+Enter for new line)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={3}
        />
        <button className="btn btn-primary ai-send" onClick={send} disabled={loading || !input.trim()}>
          {loading ? '…' : 'Send'}
        </button>
      </div>

      <div className="ai-footer">
        <span>Shift+Enter for new line · Enter to send</span>
        <span>For npm installs & tests → <a href="https://claude.ai/code" target="_blank" rel="noreferrer">claude.ai/code</a></span>
      </div>
    </div>
  );
}
