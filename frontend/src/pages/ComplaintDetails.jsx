import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Paperclip,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  Star,
  MessageSquare,
  Shield,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { complaintsAPI, feedbackAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Timeline from '../components/Timeline';
import ChatBox from '../components/ChatBox';
import FeedbackModal from '../components/FeedbackModal';
import AssignAgentModal from '../components/AssignAgentModal';
import ResolutionModal from '../components/ResolutionModal';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAgent, isUser } = useAuth();
  const { socket, broadcastStatusChange } = useSocket();

  const [complaint, setComplaint] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await complaintsAPI.getById(id);
      setComplaint(res.data.complaint);
      setFeedback(res.data.feedback);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchComplaintDetails();
    };
    socket.on('ticket_updated', handleUpdate);
    return () => socket.off('ticket_updated', handleUpdate);
  }, [socket]);

  // Quick Action: Mark In-Progress
  const handleMarkInProgress = async () => {
    try {
      const res = await complaintsAPI.updateStatus(complaint._id, {
        status: 'In Progress',
        note: `Status moved to In Progress by ${user.name}.`,
      });
      broadcastStatusChange({ complaintId: complaint._id, status: 'In Progress' });
      setComplaint(res.data.complaint);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--purple-500)" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading complaint workspace...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171', marginBottom: '12px' }}>
            Ticket Not Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {error || 'The requested complaint ticket does not exist or access is restricted.'}
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = complaint.user?._id === user?._id || complaint.user === user?._id;
  const isAssignedAgent = complaint.assignedAgent?._id === user?._id;
  const canManage = isAdmin || isAssignedAgent;

  return (
    <div style={{ padding: '36px 0 70px' }}>
      <div className="container">
        {/* Top Back Link & Ticket Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            {/* Action buttons for Agent/Admin */}
            {canManage && (
              <>
                {complaint.status === 'Pending' && (
                  <button onClick={() => setIsAssignOpen(true)} className="btn btn-warning btn-sm">
                    <UserCheck size={14} /> Assign Agent
                  </button>
                )}

                {complaint.status === 'Assigned' && (
                  <button onClick={handleMarkInProgress} className="btn btn-secondary btn-sm">
                    <RefreshCw size={14} /> Start Working
                  </button>
                )}

                {complaint.status === 'In Progress' && (
                  <button onClick={() => setIsResolutionOpen(true)} className="btn btn-success btn-sm">
                    <CheckCircle2 size={14} /> Mark Resolved
                  </button>
                )}
              </>
            )}

            {/* Feedback button for Ticket Owner */}
            {isOwner && complaint.status === 'Resolved' && !feedback && (
              <button onClick={() => setIsFeedbackOpen(true)} className="btn btn-success btn-sm">
                <Star size={14} fill="#fbbf24" color="#fbbf24" /> Rate Resolution Experience
              </button>
            )}
          </div>
        </div>

        {/* Ticket Banner Card */}
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

            <div className="flex items-center gap-4" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> Filed on: {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Layers size={14} /> Category: <strong style={{ color: '#fff' }}>{complaint.category}</strong>
              </span>
            </div>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            {complaint.title}
          </h2>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: '20px',
              whiteSpace: 'pre-line',
            }}
          >
            {complaint.description}
          </div>

          {/* Attachments Section */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Attachments & Proofs ({complaint.attachments.length})
              </h4>
              <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
                {complaint.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <Paperclip size={14} />
                    <span>Attachment #{idx + 1}</span>
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* User & Agent Metadata Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Grievance Creator
              </span>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginTop: '2px' }}>
                {complaint.user?.name}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {complaint.user?.email} • {complaint.user?.department || 'User'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Assigned Support Agent
              </span>
              {complaint.assignedAgent ? (
                <>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--blue-400)', marginTop: '2px' }}>
                    {complaint.assignedAgent.name}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {complaint.assignedAgent.department} • {complaint.assignedAgent.email}
                  </p>
                </>
              ) : (
                <p style={{ color: 'var(--yellow-500)', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '2px' }}>
                  ⏳ Pending Agent Assignment
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resolution Notes Banner (if resolved) */}
        {complaint.status === 'Resolved' && complaint.resolutionNotes && (
          <div
            className="glass-card"
            style={{
              padding: '24px',
              marginBottom: '28px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div className="flex items-center gap-2" style={{ color: 'var(--green-500)', marginBottom: '8px' }}>
              <CheckCircle2 size={20} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Resolution Summary & Verified Solution</h3>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {complaint.resolutionNotes}
            </p>
            {complaint.resolvedAt && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', display: 'inline-block' }}>
                Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Customer Feedback Card (if already rated) */}
        {feedback && (
          <div
            className="glass-card"
            style={{
              padding: '24px',
              marginBottom: '28px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              background: 'rgba(245, 158, 11, 0.06)',
            }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
              <div className="flex items-center gap-2">
                <Star size={20} color="#fbbf24" fill="#fbbf24" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Customer Resolution Rating</h3>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24' }}>
                ⭐ {feedback.rating} / 5.0 Rating
              </span>
            </div>

            {feedback.comment && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', fontStyle: 'italic' }}>
                "{feedback.comment}"
              </p>
            )}

            {feedback.tags && feedback.tags.length > 0 && (
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {feedback.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="badge"
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2-Column Split: Lifecycle Stepper & Live Support Chat */}
        <div className="grid grid-2" style={{ gap: '28px' }}>
          {/* Left Column: Lifecycle Timeline */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '12px' }}>
              Lifecycle Status & Audit History
            </h3>
            <Timeline timeline={complaint.timeline} currentStatus={complaint.status} />
          </div>

          {/* Right Column: Embedded Live Support Chat */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '12px' }}>
              Real-Time Ticket Conversation
            </h3>
            <ChatBox complaintId={complaint._id} complaintTitle={complaint.title} />
          </div>
        </div>

        {/* Modals */}
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          complaintId={complaint._id}
          onSubmitted={(newFeedback) => setFeedback(newFeedback)}
        />

        <AssignAgentModal
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          complaint={complaint}
          onAssigned={(updated) => setComplaint(updated)}
        />

        <ResolutionModal
          isOpen={isResolutionOpen}
          onClose={() => setIsResolutionOpen(false)}
          complaint={complaint}
          onResolved={(updated) => setComplaint(updated)}
        />
      </div>
    </div>
  );
};

export default ComplaintDetails;
