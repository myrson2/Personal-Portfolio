import React, { useState, useEffect } from 'react';
import { ArrowRight, Github, BookOpen } from 'lucide-react';
import ProjectDeepDiveModal from '../Modals/ProjectDeepDiveModal';

const FEATURED_PROJECTS = [
  {
    id: 1,
    slug: 'smartstock-ai',
    title: 'SmartStock AI',
    description: 'AI‑powered stock analysis platform with real‑time data, predictive insights and interactive dashboards.',
    tags: ['Python 3.12', 'FastAPI', 'React', 'Vite'],
    github: 'https://github.com/myrson2/SmartStockAI',
    demo: '#',
  },
  {
    id: 2,
    slug: 'depths-descents',
    title: 'Depths Descents: Game Engine',
    description: 'Open‑source game engine for 2D/3D adventure games, featuring modular rendering, physics, and scripting.',
    tags: ['C++', 'OpenGL', 'Game Engine', 'Modular'],
    github: 'https://github.com/myrson2/DepthsDescents',
    demo: '#',
  },
];

const COMPACT_PROJECTS = [
  {
    name: 'Personal Portfolio Architecture',
    description: 'Editorial developer portfolio featuring tactile retro pixel-art styling, in-memory TTL caching, and zero secret leakage proxy.',
  },
  {
    name: 'GDG PUP Community Portal',
    description: 'Event registration and automated digital badge issuing platform for student engineers and campus hackathon participants.',
  },
  {
    name: 'AWS Cloud Club Assistant',
    description: 'Serverless Discord integration providing cloud architectural quiz challenges and real-time contributor leaderboards.',
  },
];

export default function ProjectsSection() {
  const [activeModalSlug, setActiveModalSlug] = useState(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#project/')) {
        const slug = hash.replace('#project/', '').trim();
        if (slug) {
          setActiveModalSlug(slug);
        }
      } else if (!hash || hash === '#projects') {
        setActiveModalSlug(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openCaseStudy = (slug) => {
    window.location.hash = `#project/${slug}`;
    setActiveModalSlug(slug);
  };

  return (
    <section className="editorial-section" id="projects">
      <div className="editorial-label">Projects</div>
      <div className="editorial-content">
        {/* 2 Featured Hero Cards */}
        <div className="featured-projects-grid">
          {FEATURED_PROJECTS.map((project) => (
            <div key={project.id} className="featured-project-card">
              <div className="featured-card-preview">
                <div className="d-flex flex-column align-items-center justify-content-center text-muted">
                  <span className="small font-monospace fw-semibold">[ {project.title} Preview ]</span>
                </div>
              </div>
              <div className="featured-card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <h3 className="featured-card-title">{project.title}</h3>
                  <div className="d-flex gap-2">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark hover-opacity"
                      aria-label="GitHub Repository"
                    >
                      <Github size={16} />
                    </a>
                  </div>
                </div>
                <p className="featured-card-desc">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="project-tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-top border-dark-subtle d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    onClick={() => openCaseStudy(project.slug)}
                    className="btn btn-sm btn-outline-dark rounded-0 font-monospace d-flex align-items-center gap-1"
                    aria-label={`Open case study for ${project.title}`}
                  >
                    <BookOpen size={14} /> Case Study <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compact Tabular Row Items */}
        <div className="compact-projects-list">
          {COMPACT_PROJECTS.map((proj, idx) => (
            <div key={idx} className="compact-project-row">
              <div className="compact-project-name">{proj.name}</div>
              <div className="compact-project-desc">{proj.description}</div>
            </div>
          ))}
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

      {/* Interactive Case Study Modal */}
      <ProjectDeepDiveModal
        slug={activeModalSlug}
        isOpen={Boolean(activeModalSlug)}
        onClose={() => setActiveModalSlug(null)}
      />
    </section>
  );
}
