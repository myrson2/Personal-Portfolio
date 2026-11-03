import React from 'react';
import { Download, X, FileText, CheckCircle } from 'lucide-react';

export default function DownloadCVModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleDownload = () => {
    // Simulated placeholder download
    const dummyBlob = new Blob(
      [
        "Jose Myrson O. Beros - Software & AI Engineer Curriculum Vitae\n\nPolytechnic University of the Philippines\nSkills: Java, Python, React, FastAPI, AI Integration\nContact: beros.josemyrson.oreo1@gmail.com\nGitHub: https://github.com/myrson2"
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Jose_Myrson_Beros_CV.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pixel-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pixel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 fw-bold m-0 d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <FileText size={18} /> Curriculum Vitae
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-link text-dark p-0" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <p className="small text-secondary mb-3">
          Download the verified Curriculum Vitae for <strong>Jose Myrson O. Beros</strong> detailing education, AI engineering prototypes, and system leadership experience.
        </p>

        <div className="p-3 bg-light border border-dark mb-4">
          <div className="small fw-semibold text-dark">Document Metadata:</div>
          <ul className="small text-muted mb-0 ps-3 mt-1">
            <li>Format: PDF / Text Portfolio Summary</li>
            <li>Last Updated: November 2026</li>
            <li>Role: Software & AI Engineer</li>
          </ul>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" onClick={onClose} className="btn-retro-secondary">
            Close
          </button>
          <button type="button" onClick={handleDownload} className="btn-retro-primary">
            <Download size={14} /> Download File
          </button>
        </div>
      </div>
    </div>
  );
}

