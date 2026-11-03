import React, { useState, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Award, RefreshCw } from 'lucide-react';

const CERTIFICATIONS = [
  {
    id: 1,
    title: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services (AWS)',
    date: '2025',
    category: 'Cloud Architecture',
  },
  {
    id: 2,
    title: 'Google Cloud Certified Professional',
    issuer: 'Google Cloud Platform',
    date: '2025',
    category: 'Data & AI Systems',
  },
  {
    id: 3,
    title: 'Full-Stack Engineering Fellow',
    issuer: 'Polytechnic University of the Philippines',
    date: '2026',
    category: 'Software Engineering',
  },
  {
    id: 4,
    title: 'GDG PUP Tech Leadership',
    issuer: 'Google Developer Groups',
    date: '2026',
    category: 'Web Ecosystem',
  },
];

const COUNT = CERTIFICATIONS.length;
// 2 full sets per track so each track is amply populated (8 cards = ~1968px)
const TRACK_ITEMS = [...CERTIFICATIONS, ...CERTIFICATIONS];

export default function CertificationsCarousel() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % COUNT);
    if (scrollRef.current && typeof scrollRef.current.scrollBy === 'function') {
      scrollRef.current.scrollBy({ left: 246, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setActiveStep((prev) => (prev - 1 + COUNT) % COUNT);
    if (scrollRef.current && typeof scrollRef.current.scrollBy === 'function') {
      scrollRef.current.scrollBy({ left: -246, behavior: 'smooth' });
    }
  };

  const activeNumber = activeStep + 1;

  const renderCards = (items, prefix) =>
    items.map((cert, index) => {
      const isLead = (index % COUNT) === activeStep;
      return (
        <div
          key={`${prefix}-${cert.id}-${index}`}
          className={`cert-card ${isLead ? 'active-lead' : ''}`}
        >
          <div className="d-flex justify-content-between align-items-center">
            <span className="cert-badge">{cert.category}</span>
            <Award size={16} className="text-muted" />
          </div>
          <h4 className="cert-title">{cert.title}</h4>
          <p className="cert-issuer">
            {cert.issuer} • {cert.date}
          </p>
        </div>
      );
    });

  return (
    <div
      className="certifications-block"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="certifications-carousel-container">
        {/* Two identical tracks gliding in a mathematically seamless infinite loop */}
        <div className="carousel-viewport" ref={scrollRef}>
          <div className={`carousel-track ${isPaused ? 'is-paused' : ''}`}>
            {renderCards(TRACK_ITEMS, 'primary')}
          </div>
          <div className={`carousel-track ${isPaused ? 'is-paused' : ''}`} aria-hidden="true">
            {renderCards(TRACK_ITEMS, 'clone')}
          </div>
        </div>

        {/* Navigation Step Controls and Loop Status */}
        <div className="carousel-controls">
          <div className="carousel-step-btns">
            <button
              type="button"
              onClick={handlePrev}
              className="btn btn-sm btn-outline-dark rounded-0 px-2 py-1"
              aria-label="Previous Certification"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-sm btn-outline-dark rounded-0 px-2 py-1"
              aria-label="Next Certification"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="section-link-wrapper mt-2">
        <a href="#certifications" className="section-link">
          Certifications <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}
