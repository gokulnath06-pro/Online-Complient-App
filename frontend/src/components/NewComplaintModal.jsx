import React, { useState } from 'react';
import { X, UploadCloud, AlertCircle, Laptop, CreditCard, Headphones, Server, PackageCheck, HelpCircle } from 'lucide-react';
import { complaintsAPI } from '../services/api';

const categories = [
  { id: 'Technical', label: 'Technical Issue', icon: Server, color: '#3b82f6' },
  { id: 'Billing', label: 'Billing & Charges', icon: CreditCard, color: '#10b981' },
  { id: 'Hardware', label: 'Hardware Malfunction', icon: Laptop, color: '#f59e0b' },
  { id: 'Service', label: 'Customer Service', icon: Headphones, color: '#8b5cf6' },
  { id: 'Product', label: 'Product Defect', icon: PackageCheck, color: '#ec4899' },
  { id: 'Other', label: 'General / Other', icon: HelpCircle, color: '#94a3b8' },
];

const priorities = [
  { id: 'Low', label: 'Low', desc: 'Minor issue / cosmetic' },
  { id: 'Medium', label: 'Medium', desc: 'Standard business impact' },
  { id: 'High', label: 'High', desc: 'Major operational disruption' },
  { id: 'Urgent', label: 'Urgent', desc: 'Critical system outage / blocked' },
];

export const NewComplaintModal = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technical');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill in both the title and description.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('description', description.trim());

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await complaintsAPI.create(formData);
      onCreated(res.data.complaint);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '28px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Submit New Complaint Ticket</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Provide clear details to help our team resolve your issue quickly
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.875rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category Picker */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
              }}
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(124, 58, 237, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                      border: isSelected ? '1.5px solid var(--purple-500)' : '1px solid var(--border-color)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={20} color={cat.color} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Complaint Title / Summary</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. API Gateway returning 502 bad gateway on customer checkout"
              className="form-input"
              required
            />
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {priorities.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected
                        ? p.id === 'Urgent'
                          ? 'rgba(239, 68, 68, 0.25)'
                          : p.id === 'High'
                          ? 'rgba(249, 115, 22, 0.25)'
                          : 'rgba(124, 58, 237, 0.25)'
                        : 'rgba(15, 23, 42, 0.6)',
                      border: isSelected
                        ? `1.5px solid ${
                            p.id === 'Urgent' ? '#ef4444' : p.id === 'High' ? '#f97316' : '#7c3aed'
                          }`
                        : '1px solid var(--border-color)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, error codes, steps to reproduce, and impacted systems..."
              className="form-textarea"
              rows={4}
              required
            />
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">Attachments (Screenshots / Logs / Documents)</label>
            <div
              style={{
                border: '2px dashed var(--slate-700)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.4)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <UploadCloud size={24} color="var(--purple-400)" style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Click to browse files (PNG, JPG, PDF, TXT)
              </p>
              <input
                id="file-upload-input"
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            {files.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--purple-400)' }}>
                {files.length} file(s) selected: {files.map((f) => f.name).join(', ')}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex justify-between items-center" style={{ marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Registering Ticket...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewComplaintModal;
