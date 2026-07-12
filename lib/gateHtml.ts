const shell = (body: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Depot</title>
<style>
body{font-family:system-ui,sans-serif;max-width:420px;margin:80px auto;padding:0 20px;color:#222}
input{display:block;width:100%;padding:10px;margin:8px 0;font-size:16px;box-sizing:border-box}
button{width:100%;padding:10px;font-size:16px;cursor:pointer}
.err{color:#b3261e;font-size:14px}
.muted{color:#666;font-size:14px}
</style></head><body>${body}</body></html>`;

export function loginFormHtml(appKey: string, showError = false) {
  return shell(`
    <h2>Access ${appKey}</h2>
    <p class="muted">Enter the name and code your host gave you.</p>
    ${showError ? '<p class="err">Not recognized — check your code and try again.</p>' : ''}
    <form method="POST" action="/go/${appKey}">
      <input name="name" placeholder="Your name" required />
      <input name="code" placeholder="Access code" required />
      <button type="submit">Continue</button>
    </form>
  `);
}

export function wakingUpHtml(appName: string) {
  return shell(`
    <h2>Waking up ${appName}&hellip;</h2>
    <p class="muted">This can take about a minute on the first request. This page will retry automatically.</p>
    <script>setTimeout(() => location.reload(), 12000)</script>
  `);
}
