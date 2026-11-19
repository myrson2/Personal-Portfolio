import React from 'react';

export default function AboutSection({ overviewData }) {
  const reposCount = overviewData?.total_repos ?? 49;
  const commitsCount = overviewData?.total_commits != null
    ? (overviewData.total_commits >= 1000
      ? `${Math.floor(overviewData.total_commits / 1000)}k+`
      : `${overviewData.total_commits}`)
    : '5k+';

  return (
    <section className="editorial-section" id="about">
      <div className="editorial-label">About</div>
      <div className="editorial-content">
        <p className="about-narrative">
          I am a full-stack engineer who turns messy business workflows into clean, scalable software.
          I design systems with a focus on efficiency, reliability, and maintainability while leveraging AI tools.
        </p>
        <p className="about-narrative">
          Beyond professional work, I build side projects for the joy of learning and exploring new technologies.
          Driven purely by curiosity and a love for the craft.
        </p>

        {/* Inline Socials */}
        <div className="about-socials">
          <a href="https://github.com/myrson2" target="_blank" rel="noopener noreferrer">github</a>
          <span>/</span>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">linkedin</a>
          <span>/</span>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">facebook</a>
          <span>/</span>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">instagram</a>
        </div>

        {/* 4-Column Proof of Work Stat Bar */}
        <div className="stat-bar border-top pt-3 mt-1">
          <div className="stat-item">
            <div className="stat-counter">10</div>
            <div className="stat-label">Tech Stacks</div>
          </div>
          <div className="stat-item">
            <div className="stat-counter">{reposCount}</div>
            <div className="stat-label">Repositories</div>
          </div>
          <div className="stat-item">
            <div className="stat-counter">10x</div>
            <div className="stat-label">Hackathons</div>
          </div>
          <div className="stat-item">
            <div className="stat-counter">{commitsCount}</div>
            <div className="stat-label">Commits</div>
          </div>
        </div>

        {overviewData?.is_mock && (
          <div className="small text-muted font-monospace mt-1">
            * Displaying sample telemetry (fallback mode)
          </div>
        )}
      </div>
    </section>
  );
}

