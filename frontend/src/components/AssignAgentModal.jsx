import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle, Shield } from 'lucide-react';
import { authAPI, complaintsAPI } from '../services/api';

export const AssignAgentModal = ({ isOpen, onClose, complaint, onAssigned }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchAgents = async () => {
      try {
        setFetching(true);
        const res = await authAPI.getAgents();
        setAgents(res.data.agents || []);
        if (complaint?.assignedAgent?._id) {
          setSelectedAgentId(complaint.assignedAgent._id);
        } else if (res.data.agents?.length > 0) {
          setSelectedAgentId(res.data.agents[0]._id);
        }
      } catch (err) {
        setError('Failed to load active agents list.');
      } finally {
        setFetching(false);
      }
    };

    fetchAgents();
  }, [isOpen, complaint]);

  if (!isOpen) return null;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedAgentId) {
      setError('Please select an agent to assign.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await complaintsAPI.assignAgent(complaint._id, {
        agentId: selectedAgentId,
      });
      onAssigned(res.data.complaint);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign agent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '24px', maxWidth: '480px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Dispatch Ticket to Agent</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Ticket: <span className="font-mono" style={{ color: 'var(--purple-400)' }}>{complaint?.ticketId}</span>
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

        <form onSubmit={handleAssign}>
          <div className="form-group">
            <label className="form-label">Select Support Agent</label>
            {fetching ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading agents...</p>
            ) : (
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="form-select"
                required
              >
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} — ({agent.department || 'Support'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-between items-center" style={{ marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading || fetching} className="btn btn-primary">
              <UserCheck size={16} />
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignAgentModal;
