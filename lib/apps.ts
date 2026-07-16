export interface AppConfig {
  key: string;
  name: string;
  description: string;
  techStack: string;
  prodUrl: string;
  healthPath?: string;
  healthUrl?: string;
  renderServiceId?: string;
  deployHookUrl?: string;
  requiresBackend: boolean;
  public: boolean;
  repoName?: string;
  defaultBranch?: string;
  editablePaths?: string[];
}

export const APPS: AppConfig[] = [
  {
    key: 'stratum',
    name: 'Stratum',
    description: 'Full-stack mining geology file viewer — 3D visualization, multi-format parsers, AI-assisted QC.',
    techStack: 'React, Vite, Three.js, Express, TypeScript',
    prodUrl: process.env.APP_URL_STRATUM || '',
    healthUrl: process.env.HEALTH_URL_STRATUM || process.env.APP_URL_STRATUM || '',
    renderServiceId: process.env.RENDER_SERVICE_ID_STRATUM,
    deployHookUrl: process.env.RENDER_HOOK_STRATUM,
    requiresBackend: true,
    public: false,
    repoName: 'stratum',
    defaultBranch: 'main',
    editablePaths: [
      'backend/src/index.ts',
      'backend/src/app.ts',
      'frontend/src/App.tsx',
      'frontend/src/lib/api.ts',
      'frontend/src/styles/app.css',
      'README.md',
    ],
  },
  {
    key: 'loadpilot',
    name: 'LoadPilot',
    description: 'JMeter LLM toolkit — AI-assisted performance test analysis, script review, and load generation.',
    techStack: 'React, Vite, Express, TypeScript, Turso, NeDB',
    prodUrl: process.env.APP_URL_LOADPILOT || '',
    renderServiceId: process.env.RENDER_SERVICE_ID_LOADPILOT,
    deployHookUrl: process.env.RENDER_HOOK_LOADPILOT,
    requiresBackend: true,
    public: false,
    repoName: 'loadpilot',
    defaultBranch: 'main',
    editablePaths: [
      'backend/src/server.ts',
      'backend/src/routes/auth.ts',
      'backend/src/db/nedb.ts',
      'frontend/src/App.tsx',
      'README.md',
    ],
  },
  {
    key: 'depot',
    name: 'Depot',
    description: 'Control panel — app status, gate URLs, AI editor, deploy triggers.',
    techStack: 'Next.js 14, Vercel, Turso, GitHub API',
    prodUrl: 'https://depot-ecru.vercel.app',
    requiresBackend: false,
    public: false,
    repoName: 'depot',
    defaultBranch: 'main',
    editablePaths: [
      'lib/apps.ts',
      'app/admin/AdminDashboard.tsx',
      'app/page.tsx',
      'app/globals.css',
      'README.md',
    ],
  },
  {
    key: 'ai-pulse',
    name: 'AI Pulse',
    description: 'Personalized AI news scanner with automated weekly delivery.',
    techStack: 'Single-file HTML, GitHub Actions cron',
    prodUrl: process.env.APP_URL_AI_PULSE || '',
    requiresBackend: false,
    public: true,
  },
  {
    key: 'prompt-bench',
    name: 'Prompt Bench',
    description: 'Self-contained prompt optimization and testing tool.',
    techStack: 'Single-file HTML, GitHub Pages',
    prodUrl: process.env.APP_URL_PROMPT_BENCH || '',
    requiresBackend: false,
    public: true,
  },
  {
    key: 'trip-ledger',
    name: 'Trip Ledger',
    description: 'Coal mine daily production report reconciliation dashboard.',
    techStack: 'Single-file HTML',
    prodUrl: process.env.APP_URL_TRIP_LEDGER || '',
    requiresBackend: false,
    public: true,
  },
];

export function getApp(key: string) {
  return APPS.find((a) => a.key === key);
}

export function getHealthUrl(app: AppConfig) {
  const base = app.healthUrl || app.prodUrl;
  return `${base.replace(/\/$/, '')}${app.healthPath || '/health'}`;
}
