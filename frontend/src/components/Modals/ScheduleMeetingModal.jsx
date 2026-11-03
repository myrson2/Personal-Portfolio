import React, { useState } from 'react';
import { Calendar, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { postContactPlaceholder } from '../../services/api';

export default function ScheduleMeetingModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferred_date: '',
    notes: '',
    type: 'meeting',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await postContactPlaceholder(formData);
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg('');
        setFormData({ name: '', email: '', preferred_date: '', notes: '', type: 'meeting' });
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Error recording meeting request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pixel-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pixel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 fw-bold m-0 d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Calendar size={18} /> Schedule a Meeting
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-link text-dark p-0"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {successMsg ? (
          <div className="alert alert-success d-flex align-items-center gap-2 my-4">
            <CheckCircle size={20} className="text-success flex-shrink-0" />
            <div>
              <div className="fw-semibold">Request Received!</div>
              <div className="small">{successMsg}</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {errorMsg && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <div className="w-100">
              <label className="form-label small fw-semibold mb-1 d-block text-start">Your Name *</label>
              <input
                type="text"
                required
                className="form-control form-control-sm rounded-0 border-dark w-100"
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
                value={formData.preferred_date}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
              />
            </div>

            <div className="w-100">
              <label className="form-label small fw-semibold mb-1 d-block text-start">Topic / Meeting Notes</label>
              <textarea
                rows={3}
                className="form-control form-control-sm rounded-0 border-dark w-100"
                placeholder="Briefly describe what you'd like to discuss..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="d-flex justify-content-end align-items-center gap-2 mt-3 w-100">
              <button
                type="button"
                onClick={onClose}
                className="btn-retro-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-retro-primary"
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

