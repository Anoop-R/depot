import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getApp } from '@/lib/apps';
import { getMultipleFiles, putFile, createBranch, getFile } from '@/lib/github';

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { appKey, instruction, filePaths } = await req.json();
  const app = getApp(appKey);
  if (!app?.repoName) return NextResponse.json({ error: 'app not found or no repo configured' }, { status: 400 });

  const repo = app.repoName;
  const branch = app.defaultBranch || 'main';

  await createBranch(repo, 'dev', branch);

  let pathsToFetch: string[] = filePaths || app.editablePaths || [];

  if (!filePaths && instruction) {
    const planRes = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6', max_tokens: 500,
        system: `You are a code assistant for ${app.name} (${app.techStack}). Available files: ${JSON.stringify(app.editablePaths || [])}. Respond with ONLY a JSON array of file paths needed. Example: ["src/App.tsx"]`,
        messages: [{ role: 'user', content: instruction }],
      }),
    });
    if (planRes.ok) {
      const planData = await planRes.json();
      try { pathsToFetch = JSON.parse((planData.content?.[0]?.text || '[]').replace(/```json|```/g, '').trim()); } catch { }
    }
  }

  const files = await getMultipleFiles(repo, pathsToFetch, 'dev');
  const fileContext = files.map((f) => `### FILE: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');

  const editRes = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6', max_tokens: 8000,
      system: `You are an expert developer for ${app.name} (${app.techStack}). Return ONLY JSON: { "changes": [{ "path": "...", "content": "full file content", "explanation": "..." }], "summary": "one sentence" }. Return complete file content, not diffs.`,
      messages: [{ role: 'user', content: `${fileContext}\n\n---\nInstruction: ${instruction}` }],
    }),
  });

  if (!editRes.ok) return NextResponse.json({ error: 'Claude API error' }, { status: 500 });

  const editData = await editRes.json();
  const rawText = editData.content?.[0]?.text || '';
  let parsed: { changes: { path: string; content: string; explanation: string }[]; summary: string };
  try { parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim()); }
  catch { return NextResponse.json({ error: 'Could not parse Claude response', raw: rawText.slice(0, 500) }, { status: 500 }); }

  if (!parsed.changes?.length) return NextResponse.json({ committed: false, summary: parsed.summary || 'No changes needed', files: [] });

  const committed: { path: string; explanation: string; ok: boolean }[] = [];
  for (const change of parsed.changes) {
    const existing = await getFile(repo, change.path, 'dev');
    if (!existing) { committed.push({ path: change.path, explanation: change.explanation, ok: false }); continue; }
    const result = await putFile(repo, change.path, change.content, existing.sha, `ai: ${parsed.summary}`, 'dev');
    committed.push({ path: change.path, explanation: change.explanation, ok: result.ok });
  }

  return NextResponse.json({ committed: true, summary: parsed.summary, files: committed, devBranch: 'dev' });
}
