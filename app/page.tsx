import { APPS } from '@/lib/apps';
export default function Home() {
  return (
    <main>
      <h1>App portfolio</h1>
      <p style={{ color: '#666', fontSize: 14 }}>
        A set of hobby/side projects. Gated apps show a live demo on request.
      </p>
      <div className="grid">
        {APPS.map((app) => (
          <div className="card" key={app.key}>
            <h2>{app.name}</h2>
            <p>{app.description}</p>
            <p className="stack">{app.techStack}</p>
            {app.public ? (
              <p><a href={app.prodUrl} target="_blank" rel="noreferrer">Live demo →</a></p>
            ) : (
              <p style={{ color: '#888' }}>Live demo available on request</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
