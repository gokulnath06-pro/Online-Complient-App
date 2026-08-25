import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShieldCheck, Clock, Layers, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { complaintsAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Timeline from '../components/Timeline';

export const PublicTracker = () => {
  const [searchParams] = useSearchParams();
  const [ticketInput, setTicketInput] = useState(searchParams.get('ticket') || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (ticketIdToQuery) => {
    const id = ticketIdToQuery || ticketInput;
    if (!id.trim()) return;

    try {
      setLoading(true);
      setError('');
      const res = await complaintsAPI.trackPublic(id.trim().toUpperCase());
      setComplaint(res.data.complaint);
    } catch (err) {
      setComplaint(null);
      setError(
        err.response?.data?.message ||
          'Ticket ID not found. Please verify the format (e.g. TKT-1024) and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get('ticket');
    if (query) {
      setTicketInput(query);
      handleSearch(query);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div style={{ padding: '50px 0 80px' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-gradient)',
              margin: '0 auto 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: 'var(--shadow-glow-purple)',
            }}
          >
            <Search size={22} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Public Complaint Status Tracker</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Check the real-time resolution status of any ticket without logging in
          </p>
        </div>

        {/* Search Box */}
        <div
          className="glass-card"
          style={{
            padding: '12px 18px',
            marginBottom: '36px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-glow-purple)',
          }}
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Search size={20} color="var(--purple-400)" style={{ marginLeft: '4px' }} />
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Enter Ticket ID (e.g. TKT-1024, TKT-2048, TKT-3096)..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '1rem',
                padding: '8px',
              }}
            />
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Lookup Ticket'}
            </button>
          </form>
        </div>

        {/* Demo Quick Lookup Chips */}
        <div className="flex justify-center items-center gap-2" style={{ marginBottom: '32px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Try Demo Tickets:</span>
          {['TKT-1024', 'TKT-2048', 'TKT-3096', 'TKT-4120'].map((tkt) => (
            <button
              key={tkt}
              onClick={() => {
                setTicketInput(tkt);
                handleSearch(tkt);
              }}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
            >
              {tkt}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div
            className="glass-card"
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              textAlign: 'center',
            }}
          >
            <AlertCircle size={24} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {/* Result Details */}
        {complaint && (
          <div className="animate-fade-in">
            <div
              className="glass-card"
              style={{
                padding: '28px',
                marginBottom: '28px',
                borderLeft: `5px solid ${
                  complaint.status === 'Resolved'
                    ? 'var(--green-500)'
                    : complaint.status === 'In Progress'
                    ? 'var(--blue-500)'
                    : 'var(--yellow-500)'
                }`,
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: 'var(--purple-400)',
                      background: 'rgba(124, 58, 237, 0.15)',
                      padding: '4px 12px',
                      borderRadius: '8px',
                    }}
                  >
                    {complaint.ticketId}
                  </span>
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Filed: {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '10px' }}>
                {complaint.title}
              </h2>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                {complaint.description}
              </p>

              {complaint.assignedAgent && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Handling Specialist:
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--blue-400)', fontSize: '0.9rem' }}>
                    {complaint.assignedAgent.name} ({complaint.assignedAgent.department})
                  </span>
                </div>
              )}
            </div>

            {/* Lifecycle Timeline */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px' }}>
                Public Resolution Progress
              </h3>
              <Timeline timeline={complaint.timeline} currentStatus={complaint.status} />
            </div>

            {/* Login Call to Action for Chat */}
            <div
              className="glass-card"
              style={{
                padding: '24px',
                textAlign: 'center',
                background: 'rgba(124, 58, 237, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                marginTop: '28px',
              }}
            >
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                Need to chat with your support agent?
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Log in to access live WebSocket chat, submit additional logs, and rate resolution.
              </p>
              <Link to={`/complaints/${complaint._id}`} className="btn btn-primary btn-sm">
                Open Ticket Workspace <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTracker;
