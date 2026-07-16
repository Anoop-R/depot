import { cookies } from 'next/headers';
import { verify } from '@/lib/auth';
import { getApp } from '@/lib/apps';
import { redirect } from 'next/navigation';
import AiEditor from './AiEditor';

export default function AiPage({ params }: { params: { app: string } }) {
  const token = cookies().get('depot_admin')?.value;
  if (verify(token) !== 'admin') redirect('/admin');
  const app = getApp(params.app);
  if (!app?.repoName) return <div className="depot-shell"><p>App not found or no repo configured.</p></div>;
  return <AiEditor appKey={app.key} appName={app.name} repoName={app.repoName!} prodUrl={app.prodUrl} deployHookUrl={app.deployHookUrl} renderServiceId={app.renderServiceId} />;
}
