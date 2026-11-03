import React, { useState } from 'react';
import { Users, X, Copy, Check, ExternalLink } from 'lucide-react';

export default function JoinCommunityModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const communityLink = "https://discord.gg/pup-developer-circle";

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(communityLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pixel-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pixel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 fw-bold m-0 d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Users size={18} /> Join Developer Community
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-link text-dark p-0" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <p className="small text-secondary mb-3">
          Connect with Jose Myrson Beros and fellow engineering builders across the <strong>GDG PUP Web Dev Team</strong>, <strong>AWS Cloud Club</strong>, and student developer circles.
        </p>

        <div className="p-3 bg-light border border-dark mb-4">
          <div className="small fw-semibold text-dark mb-1">Community Hub:</div>
          <div className="d-flex align-items-center justify-content-between bg-white border p-2">
            <span className="small text-truncate font-monospace">{communityLink}</span>
            <button
              onClick={handleCopy}
              className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1 rounded-0"
              title="Copy Link"
            >
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              <span className="small">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" onClick={onClose} className="btn-retro-secondary">
            Dismiss
          </button>
          <a
            href={communityLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-retro-primary text-decoration-none"
          >
            <ExternalLink size={14} /> Open Channel
          </a>
        </div>
      </div>
    </div>
  );
}

