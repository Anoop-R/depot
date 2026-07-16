// GitHub REST API helpers — all calls are server-side only.
const OWNER = process.env.GITHUB_OWNER || 'Anoop-R';
const TOKEN = process.env.GITHUB_TOKEN || '';

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

export interface GithubFile {
  path: string;
  content: string;
  sha: string;
  encoding: string;
}

export async function getFile(repo: string, path: string, branch = 'main'): Promise<GithubFile | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}/contents/${path}?ref=${branch}`,
      { headers: headers(), cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { path, content, sha: data.sha, encoding: data.encoding };
  } catch { return null; }
}

export async function putFile(repo: string, path: string, content: string, sha: string, message: string, branch = 'dev'): Promise<{ ok: boolean; commitSha?: string }> {
  try {
    const encoded = Buffer.from(content).toString('base64');
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}/contents/${path}`,
      { method: 'PUT', headers: headers(), body: JSON.stringify({ message, content: encoded, sha, branch }) }
    );
    if (!res.ok) { console.error('putFile error:', await res.json()); return { ok: false }; }
    const data = await res.json();
    return { ok: true, commitSha: data.commit?.sha };
  } catch (e) { console.error('putFile exception:', e); return { ok: false }; }
}

export async function listFiles(repo: string, path = '', branch = 'main'): Promise<{ name: string; path: string; type: 'file' | 'dir' }[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}/contents/${path}?ref=${branch}`,
      { headers: headers(), cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map((f: any) => ({ name: f.name, path: f.path, type: f.type })) : [];
  } catch { return []; }
}

export async function getBranch(repo: string, branch: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}/git/ref/heads/${branch}`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.object?.sha || null;
  } catch { return null; }
}

export async function createBranch(repo: string, newBranch: string, fromBranch = 'main'): Promise<boolean> {
  try {
    const sha = await getBranch(repo, fromBranch);
    if (!sha) return false;
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}/git/refs`,
      { method: 'POST', headers: headers(), body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha }) }
    );
    return res.ok || res.status === 422;
  } catch { return false; }
}

export async function getMultipleFiles(repo: string, paths: string[], branch = 'main'): Promise<GithubFile[]> {
  const results = await Promise.all(paths.map((p) => getFile(repo, p, branch)));
  return results.filter(Boolean) as GithubFile[];
}
