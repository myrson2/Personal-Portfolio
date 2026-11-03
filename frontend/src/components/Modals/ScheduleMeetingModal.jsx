import React, { useState } from 'react';
import { Calendar, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { sendContact } from '../../services/api';

export default function ScheduleMeetingModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferred_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [uiState, setUiState] = useState('idle'); // 'idle' | 'success' | 'error' | 'rateLimit'
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setUiState('idle');
    setFeedbackMsg('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setUiState('error');
      setFeedbackMsg('Please provide your name and a valid work email.');
      return;
    }

    setLoading(true);
    setUiState('idle');
    setFeedbackMsg('');

    try {
      const res = await sendContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        preferred_date: formData.preferred_date || null,
        notes: formData.notes?.trim() || null,
      });

      if (res.status === 'sent' || res.status === 'mock') {
        setUiState('success');
        setFeedbackMsg(res.message || "Message sent! I'll get back to you within 24 hours.");
        setTimeout(() => {
          setFormData({ name: '', email: '', preferred_date: '', notes: '' });
          handleClose();
        }, 3000);
      } else if (res.status === 'rateLimit') {
        setUiState('rateLimit');
        setFeedbackMsg(res.message || 'Too many requests. Please wait a few minutes before trying again.');
      } else {
        setUiState('error');
        setFeedbackMsg(res.message || 'Failed to send. Please try again or email me directly at contact@joseberos.dev.');
      }
    } catch {
      setUiState('error');
      setFeedbackMsg('Failed to send. Please try again or email me directly at contact@joseberos.dev.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pixel-modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="pixel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 fw-bold m-0 d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Calendar size={18} /> Schedule a Meeting
          </h3>
          <button
            onClick={handleClose}
            className="btn btn-sm btn-link text-dark p-0"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {uiState === 'success' ? (
          <div className="alert alert-success d-flex align-items-center gap-2 my-4">
            <CheckCircle size={20} className="text-success flex-shrink-0" />
            <div>
              <div className="fw-semibold">Request Received!</div>
              <div className="small">Message sent! I'll get back to you within 24 hours.</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {uiState === 'rateLimit' && (
              <div className="alert alert-warning d-flex align-items-center gap-2 py-2 small">
                <Clock size={16} className="flex-shrink-0" />
                <div>{feedbackMsg}</div>
              </div>
            )}

            {uiState === 'error' && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small">
                <AlertCircle size={16} className="flex-shrink-0" />
                <div>
                  {feedbackMsg}{' '}
                  <a href="mailto:contact@joseberos.dev" className="text-danger fw-bold text-decoration-underline">
                    contact@joseberos.dev
                  </a>
                </div>
              </div>
            )}

            <div className="w-100">
              <label className="form-label small fw-semibold mb-1 d-block text-start">Your Name *</label>
              <input
                type="text"
                required
                className="form-control form-control-sm rounded-0 border-dark w-100"
                style={{ fontSize: '16px' }}
                placeholder="e.g. Alex Vance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="w-100">
              <label className="form-label small fw-semibold mb-1 d-block text-start">Work Email *</label>
              <input
                type="email"
                required
                className="form-control form-control-sm rounded-0 border-dark w-100"
                style={{ fontSize: '16px' }}
                placeholder="alex@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="w-100">
              <label className="form-label small fw-semibold mb-1 d-block text-start">Preferred Date</label>
              <input
                type="date"
                className="form-control form-control-sm rounded-0 border-dark w-100"
                style={{ fontSize: '16px' }}
                value={formData.preferred_date}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
              />
            </div>

            <div className="w-100">
              <label className="form-label small fw-semibold mb-1 d-block text-start">Topic / Meeting Notes</label>
              <textarea
                rows={3}
                className="form-control form-control-sm rounded-0 border-dark w-100"
                style={{ fontSize: '16px' }}
                placeholder="Briefly describe what you'd like to discuss..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="d-flex justify-content-end align-items-center gap-2 mt-3 w-100">
              <button
                type="button"
                onClick={handleClose}
                className="btn-retro-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-retro-primary"
                style={{ minHeight: '44px' }}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Confirm Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
