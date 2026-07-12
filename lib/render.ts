const RENDER_API = 'https://api.render.com/v1';

export async function checkHealth(healthUrl: string, timeoutMs = 4000) {
  if (!healthUrl) return { ok: false, latencyMs: 0 };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(healthUrl, { signal: controller.signal, cache: 'no-store' });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  } finally {
    clearTimeout(timer);
  }
}

function renderHeaders() {
  return {
    Authorization: `Bearer ${process.env.RENDER_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

export async function resumeService(serviceId: string) {
  if (!serviceId || !process.env.RENDER_API_KEY) return { ok: false };
  const res = await fetch(`${RENDER_API}/services/${serviceId}/resume`, {
    method: 'POST', headers: renderHeaders(),
  });
  return { ok: res.ok };
}

export async function suspendService(serviceId: string) {
  if (!serviceId || !process.env.RENDER_API_KEY) return { ok: false };
  const res = await fetch(`${RENDER_API}/services/${serviceId}/suspend`, {
    method: 'POST', headers: renderHeaders(),
  });
  return { ok: res.ok };
}

export async function restartViaDeployHook(hookUrl: string) {
  if (!hookUrl) return { ok: false };
  const res = await fetch(hookUrl, { method: 'POST' });
  return { ok: res.ok };
}
