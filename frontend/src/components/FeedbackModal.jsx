import React, { useState } from 'react';
import { Star, X, Check, ThumbsUp, AlertCircle, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { feedbackAPI } from '../services/api';

const availableTags = [
  'Lightning Fast',
  'Clear Solution',
  'Polite & Professional',
  'High Quality',
  'Accurate',
  'Great Communication',
];

export const FeedbackModal = ({ isOpen, onClose, complaintId, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [speedRating, setSpeedRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Clear Solution', 'Polite & Professional']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await feedbackAPI.submit(complaintId, {
        rating,
        speedRating,
        serviceRating,
        comment: comment.trim(),
        tags: selectedTags,
      });

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b'],
      });

      if (onSubmitted) onSubmitted(res.data.feedback);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '28px', maxWidth: '520px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={20} color="var(--red-500)" fill="var(--red-500)" />
              Rate Your Resolution Experience
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Your feedback helps us continuously improve support quality
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
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
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
          {/* Main Star Rating */}
          <div
            style={{
              textAlign: 'center',
              padding: '16px 0',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '20px',
              border: '1px solid var(--border-color)',
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Overall Satisfaction
            </span>
            <div className="flex justify-center gap-2" style={{ marginTop: '8px', marginBottom: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      transition: 'transform 0.15s',
                      transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    <Star
                      size={32}
                      color={isFilled ? '#fbbf24' : 'var(--slate-600)'}
                      fill={isFilled ? '#fbbf24' : 'transparent'}
                    />
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>
              {rating === 5
                ? '⭐⭐⭐⭐⭐ Exceptional Service'
                : rating === 4
                ? '⭐⭐⭐⭐ Good / Met Expectations'
                : rating === 3
                ? '⭐⭐⭐ Average'
                : '⭐ Needs Improvement'}
            </span>
          </div>

          {/* Quick Tag Badges */}
          <div className="form-group">
            <label className="form-label">What went well?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                      border: isSelected ? '1px solid var(--green-500)' : '1px solid var(--border-color)',
                      color: isSelected ? '#34d399' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review comment */}
          <div className="form-group">
            <label className="form-label">Feedback Comments (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked about the support agent or how we can do better..."
              className="form-textarea"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center" style={{ marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Skip / Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-success">
              <ThumbsUp size={16} />
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
