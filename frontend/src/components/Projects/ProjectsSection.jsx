import React from 'react';
import { ArrowRight, ExternalLink, Github } from 'lucide-react';

const FEATURED_PROJECTS = [
  {
    id: 1,
    title: 'SmartStock AI',
    description: 'Autonomous inventory optimization system leveraging predictive AI models to forecast supply volatility and reduce stockouts.',
    tags: ['Python', 'FastAPI', 'React', 'Gemini AI'],
    github: 'https://github.com/myrson2',
    demo: '#',
  },
  {
    id: 2,
    title: 'Depths Descents: Game Engine',
    description: 'High-performance interactive game experience built with custom procedural generation, physics calculations, and netcode sync.',
    tags: ['Lua', 'Roblox Studio', 'Physics Engine'],
    github: 'https://github.com/myrson2',
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
    </section>
  );
}

