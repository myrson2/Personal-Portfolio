import React, { useState, useEffect } from 'react';
import {
  X,
  Github,
  ExternalLink,
  Layers,
  Cpu,
  ShieldAlert,
  Terminal,
  BarChart3,
  CheckCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { fetchProjectDetails } from '../../services/api';

export default function ProjectDeepDiveModal({ slug, isOpen, onClose }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [terminalHistory, setTerminalHistory] = useState([]);

  const handleClose = () => {
    if (window.location.hash && window.location.hash.startsWith('#project/')) {
      window.location.hash = '#projects';
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !slug) return;

    let isMounted = true;
    setLoading(true);
    setNotFound(false);
    setActiveTab('overview');
    setActiveStepIndex(0);
    setTerminalHistory([]);

    fetchProjectDetails(slug).then((res) => {
      if (!isMounted) return;
      if (res.status === 'success' && res.data) {
        setProject(res.data);
        setNotFound(false);
        if (res.data.simulated_steps && res.data.simulated_steps.length > 0) {
          setTerminalHistory([res.data.simulated_steps[0]]);
        }
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Gracefully auto-exit if project not found
  useEffect(() => {
    if (notFound && isOpen) {
      const timer = setTimeout(() => {
        handleClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [notFound, isOpen]);

  if (!isOpen) return null;

  const handleRunNextStep = () => {
    if (!project?.simulated_steps) return;
    const nextIdx = (activeStepIndex + 1) % project.simulated_steps.length;
    setActiveStepIndex(nextIdx);
    setTerminalHistory((prev) => [...prev, project.simulated_steps[nextIdx]]);
  };

  const handleResetTerminal = () => {
    setActiveStepIndex(0);
    if (project?.simulated_steps?.[0]) {
      setTerminalHistory([project.simulated_steps[0]]);
    } else {
      setTerminalHistory([]);
    }
  };

  return (
    <div className="pixel-modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="deep-dive-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="deep-dive-header d-flex justify-content-between align-items-start">
          <div>
            {loading ? (
              <h3 className="h5 fw-bold m-0 font-monospace">Loading Case Study...</h3>
            ) : notFound ? (
              <h3 className="h5 fw-bold m-0 text-danger font-monospace">Project Not Found</h3>
            ) : (
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge rounded-0 bg-dark text-white text-uppercase small">
                    {project.category}
                  </span>
                  <span className="small text-muted font-monospace">case-study://{project.slug}</span>
                </div>
                <h2 className="h4 fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>
                  {project.title}
                </h2>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="btn btn-sm btn-link text-dark p-0"
            aria-label="Close case study modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="p-5 text-center text-muted font-monospace">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Fetching architectural specifications...
          </div>
        )}

        {/* Not Found state */}
        {!loading && notFound && (
          <div className="p-4 text-center">
            <div className="alert alert-warning border border-dark rounded-0 mb-3">
              <p className="fw-semibold mb-1">
                This project case study is not yet implemented or does not exist.
              </p>
              <p className="small text-muted mb-0">Returning you back to the projects catalog...</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="btn-retro-primary mt-2"
            >
              Back to Projects
            </button>
          </div>
        )}

        {/* Loaded Project Content */}
        {!loading && !notFound && project && (
          <div>
            <p className="text-muted small mb-3">{project.tagline}</p>

            {/* Navigation Tabs */}
            <div className="deep-dive-nav">
              <button
                type="button"
                className={`deep-dive-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <BarChart3 size={14} className="me-1 d-inline" /> Overview & Metrics
              </button>
              <button
                type="button"
                className={`deep-dive-tab-btn ${activeTab === 'architecture' ? 'active' : ''}`}
                onClick={() => setActiveTab('architecture')}
              >
                <Layers size={14} className="me-1 d-inline" /> Architecture
              </button>
              <button
                type="button"
                className={`deep-dive-tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
                onClick={() => setActiveTab('challenges')}
              >
                <ShieldAlert size={14} className="me-1 d-inline" /> Engineering Challenges
              </button>
              <button
                type="button"
                className={`deep-dive-tab-btn ${activeTab === 'rationale' ? 'active' : ''}`}
                onClick={() => setActiveTab('rationale')}
              >
                <Cpu size={14} className="me-1 d-inline" /> Tech Rationale
              </button>
              <button
                type="button"
                className={`deep-dive-tab-btn ${activeTab === 'sandbox' ? 'active' : ''}`}
                onClick={() => setActiveTab('sandbox')}
              >
                <Terminal size={14} className="me-1 d-inline" /> Live Sandbox Demo
              </button>
            </div>

            {/* Tab 1: Overview & Metrics */}
            {activeTab === 'overview' && (
              <div>
                <h4 className="h6 fw-bold font-monospace text-uppercase mb-2">Quantifiable Impact</h4>
                <div className="deep-dive-metrics-grid">
                  {project.metrics?.map((metric, idx) => (
                    <div key={idx} className="deep-dive-metric-card">
                      <div className="deep-dive-metric-value">{metric.value}</div>
                      <div className="deep-dive-metric-label">{metric.label}</div>
                      <div className="small text-muted mt-1">{metric.description}</div>
                    </div>
                  ))}
                </div>

                <div className="deep-dive-card">
                  <h4 className="h6 fw-bold font-monospace text-uppercase mb-2">System Overview</h4>
                  <p className="small mb-0 text-dark" style={{ lineHeight: '1.6' }}>
                    {project.architecture_overview}
                  </p>
                </div>

                <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
                  <span className="small fw-semibold text-muted font-monospace">Tech Stack:</span>
                  {project.tags?.map((tag) => (
                    <span key={tag} className="badge bg-light text-dark border border-dark rounded-0 small">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Architecture Components */}
            {activeTab === 'architecture' && (
              <div>
                <h4 className="h6 fw-bold font-monospace text-uppercase mb-3">Subsystem Architecture</h4>
                <div className="d-flex flex-column gap-3">
                  {project.components?.map((comp, idx) => (
                    <div key={idx} className="deep-dive-card mb-0">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-dark">{comp.name}</span>
                        <span className="badge rounded-0 bg-light text-dark border border-dark small font-monospace">
                          {comp.tech}
                        </span>
                      </div>
                      <p className="small text-muted mb-0">{comp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Challenges & Solutions */}
            {activeTab === 'challenges' && (
              <div>
                <h4 className="h6 fw-bold font-monospace text-uppercase mb-3">Engineering Roadblocks & Solutions</h4>
                <div className="d-flex flex-column gap-3">
                  {project.challenges?.map((item, idx) => (
                    <div key={idx} className="deep-dive-card mb-0">
                      <div className="mb-2">
                        <span className="badge bg-danger-subtle text-danger border border-danger rounded-0 small font-monospace me-2">
                          CHALLENGE
                        </span>
                        <span className="fw-semibold text-dark small">{item.challenge}</span>
                      </div>
                      <div className="mb-2 ps-3 border-start border-2 border-dark">
                        <div className="small text-muted">
                          <strong>Solution:</strong> {item.solution}
                        </div>
                      </div>
                      <div className="ps-3 border-start border-2 border-primary">
                        <div className="small text-primary fw-semibold">
                          <CheckCircle size={14} className="me-1 d-inline" /> Impact: {item.impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Tech Rationale */}
            {activeTab === 'rationale' && (
              <div>
                <h4 className="h6 fw-bold font-monospace text-uppercase mb-3">Technology Selection Rationale</h4>
                <div className="d-flex flex-column gap-3">
                  {project.tech_rationale?.map((item, idx) => (
                    <div key={idx} className="deep-dive-card mb-0">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark font-monospace">{item.technology}</span>
                        <span className="small text-muted font-monospace">{item.role}</span>
                      </div>
                      <p className="small text-muted mb-0">{item.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Live Simulated Sandbox */}
            {activeTab === 'sandbox' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="h6 fw-bold font-monospace text-uppercase mb-0">Interactive Sandbox Terminal</h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      onClick={handleRunNextStep}
                      className="btn btn-sm btn-outline-dark rounded-0 font-monospace d-flex align-items-center gap-1"
                    >
                      <Play size={12} /> Run Next Command
                    </button>
                    <button
                      type="button"
                      onClick={handleResetTerminal}
                      className="btn btn-sm btn-outline-secondary rounded-0 font-monospace d-flex align-items-center gap-1"
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                  </div>
                </div>

                <p className="small text-muted mb-2">{project.demo_instructions}</p>

                <div className="simulated-terminal">
                  <div className="terminal-header">
                    <span>bash - portfolio-sandbox-env</span>
                    <span>status: active</span>
                  </div>
                  <div>
                    {terminalHistory.map((step, idx) => (
                      <div key={idx} className="mb-3">
                        <div className="text-info fw-bold font-monospace mb-1">
                          $ {step.command}
                        </div>
                        <div className="terminal-output">{step.output}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-dark">
              <div className="d-flex gap-2">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-dark rounded-0 d-flex align-items-center gap-1"
                  >
                    <Github size={14} /> Repository
                  </a>
                )}
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary rounded-0 d-flex align-items-center gap-1"
                  >
                    <ExternalLink size={14} /> Live Demo
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="btn-retro-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
