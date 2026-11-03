import React from 'react';
import {
  Home,
  User,
  Folder,
  Award,
  GitCommit,
  Mail,
  MapPin,
  ArrowRight,
  Download,
  Users,
  Github,
  Linkedin,
  Facebook,
  Instagram
} from 'lucide-react';

export default function ProfileHeader({
  onScheduleMeeting,
  onDownloadCV,
  onJoinCommunity,
  status = 'Online'
}) {
  return (
    <header className="hero-wrapper">
      {/* Floating Pill Navigation Bar */}
      <nav className="hero-nav-container" aria-label="Main Navigation">
        <div className="hero-nav-pill">
          <a href="#home" className="nav-pill-item active">
            <Home size={14} /> <span>Home</span>
          </a>
          <a href="#about" className="nav-pill-item">
            <User size={14} /> <span>About</span>
          </a>
          <a href="#projects" className="nav-pill-item">
            <Folder size={14} /> <span>Projects</span>
          </a>
          <a href="#certifications" className="nav-pill-item">
            <Award size={14} /> <span>Certifications</span>
          </a>
          <a href="#contributions" className="nav-pill-item">
            <GitCommit size={14} /> <span>Activity</span>
          </a>
          <button
            type="button"
            className="nav-pill-item nav-pill-btn"
            onClick={onScheduleMeeting}
          >
            <Mail size={14} /> <span>Contact</span>
          </button>
        </div>
      </nav>

      {/* Hero Section Split Layout */}
      <div className="hero-content-grid" id="home">
        {/* Left Column: Bio & CTAs */}
        <div className="hero-left-column">
          {/* Status Badge */}
          <div className="hero-status-pill">
            <span className="status-dot"></span>
            <span>Available for freelance & engineering roles</span>
          </div>

          {/* Large Main Heading */}
          <h1 className="hero-main-title">
            Hi, I'm <br className="d-none d-sm-inline" />
            <span className="hero-name-highlight">Jose Myrson O. Beros</span>
          </h1>

          {/* Subtitle with Blinking Typewriter Cursor */}
          <h2 className="hero-role-title">
            <span>Software Engineer</span> & AI Engineer
            <span className="hero-blinking-cursor">|</span>
          </h2>

          {/* Hero Pitch Description */}
          <p className="hero-pitch-text">
            I create intelligent, scalable, and user-centered digital software.
            Turning messy business workflows into clean, reliable, high-impact systems.
          </p>

          {/* Location & Metadata Badges */}
          <div className="hero-metadata-row">
            <span className="pixel-badge">
              <MapPin size={13} /> Philippines
            </span>
            <span className="pixel-badge">
              <Mail size={13} /> Email
            </span>
            <span className="pixel-badge status-online">
              <span className="status-dot"></span> {status}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-retro-primary"
              onClick={onScheduleMeeting}
            >
              <ArrowRight size={15} /> Schedule meeting
            </button>
            <button
              type="button"
              className="btn-retro-secondary"
              onClick={onDownloadCV}
            >
              <Download size={15} /> Download CV
            </button>
            <button
              type="button"
              className="btn-retro-secondary"
              onClick={onJoinCommunity}
            >
              <Users size={15} /> Join Community
            </button>
          </div>

          <hr className="hero-subtle-divider" />

          {/* Follow Me Social Row */}
          <div className="hero-follow-row">
            <span className="hero-follow-label">Follow me:</span>
            <div className="hero-social-icons">
              <a
                href="https://github.com/myrson2"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-social-icon"
                aria-label="GitHub"
              >
                <Github size={17} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-social-icon"
                aria-label="LinkedIn"
              >
                <Linkedin size={17} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-social-icon"
                aria-label="Facebook"
              >
                <Facebook size={17} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-social-icon"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Character / Illustration Card */}
        <div className="hero-right-column">
          <div className="hero-character-card">
            <img
              src="/image/luffy.webp"
              alt="Jose Myrson O. Beros"
              className="hero-character-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/image/mypicture.jpg';
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
