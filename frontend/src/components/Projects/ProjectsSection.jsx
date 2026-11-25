import React, { useState, useEffect } from 'react';
import { ArrowRight, Github } from 'lucide-react';
import { fetchProjects } from '../../services/api';

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchProjects()
      .then((data) => {
        if (!isMounted) return;
        setProjects(Array.isArray(data?.projects) ? data.projects : []);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setProjects([]);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="editorial-section" id="projects">
      <div className="editorial-label">Projects</div>
      <div className="editorial-content">
        <div className="compact-projects-list">
          {loading ? (
            <div className="compact-projects-skeleton" aria-label="Loading projects">
              {[1, 2, 3].map((n) => (
                <div key={n} className="compact-project-row skeleton-row">
                  <div className="compact-project-name">
                    <span className="skeleton-line skeleton-title" />
                  </div>
                  <div className="compact-project-body">
                    <span className="skeleton-line skeleton-desc" />
                    <span className="skeleton-line skeleton-badge" />
                  </div>
                  <div className="compact-project-actions">
                    <span className="skeleton-line skeleton-icon" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="compact-projects-empty text-muted small py-3 font-monospace">
              No repositories currently available to display.
            </div>
          ) : (
            projects.map((proj) => (
              <div key={proj.name} className="compact-project-row">
                <div className="compact-project-name">{proj.name}</div>
                <div className="compact-project-body">
                  {proj.description && (
                    <div className="compact-project-desc">{proj.description}</div>
                  )}
                  {proj.language && (
                    <div className="project-tags">
                      <span className="project-tag font-monospace">{proj.language}</span>
                    </div>
                  )}
                </div>
                <div className="compact-project-actions">
                  {proj.html_url && (
                    <a
                      href={proj.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="compact-project-github-btn"
                      aria-label={`View ${proj.name} repository on GitHub`}
                    >
                      <Github size={18} />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* All Projects Link */}
        <div className="section-link-wrapper">
          <a
            href="https://github.com/myrson2?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="section-link"
          >
            All Projects <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
