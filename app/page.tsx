import { APPS } from '@/lib/apps';
export default function Home() {
  return (
    <div className="depot-shell">
      <div className="portfolio-header">
        <div className="portfolio-title">App<span> portfolio</span></div>
        <div className="portfolio-sub">
          Hobby projects in mining tech, logistics, and AI tooling.
          Gated apps are available on request.
        </div>
      </div>
      <div className="portfolio-grid">
        {APPS.map((app) => (
          <div className="portfolio-card" key={app.key}>
            <div className="portfolio-card-name">{app.name}</div>
            <div className="portfolio-card-desc">{app.description}</div>
            <div className="portfolio-card-stack">{app.techStack}</div>
            <div className="portfolio-card-footer">
              {app.public && app.prodUrl ? (
                <a href={app.prodUrl} target="_blank" rel="noreferrer"
                  style={{ fontSize: 13, fontWeight: 500 }}>
                  Live demo →
                </a>
              ) : (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Available on request
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
