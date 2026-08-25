import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { complaintsAPI } from '../services/api';

export const ResolutionModal = ({ isOpen, onClose, complaint, onResolved }) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [status, setStatus] = useState('Resolved');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setError('Please provide resolution notes explaining how the issue was addressed.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await complaintsAPI.updateStatus(complaint._id, {
        status,
        resolutionNotes: resolutionNotes.trim(),
        note: `Marked as ${status} with resolution summary: "${resolutionNotes.trim()}"`,
      });

      if (status === 'Resolved') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#7c3aed'],
        });
      }

      onResolved(res.data.complaint);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '24px', maxWidth: '520px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Complete Complaint Resolution</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Ticket: <span className="font-mono" style={{ color: 'var(--green-500)' }}>{complaint?.ticketId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Resolution Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select"
            >
              <option value="Resolved">Resolved — Solution verified & working</option>
              <option value="Rejected">Rejected — Not reproducible / out of scope</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Resolution Summary & Steps Taken</label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe the root cause diagnosis, patches applied, and confirmation testing..."
              className="form-textarea"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-between items-center" style={{ marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-success">
              <CheckCircle2 size={16} />
              {loading ? 'Submitting...' : 'Mark as Resolved'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResolutionModal;
