import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Headphones,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  MessageSquare,
  ArrowRight,
  User,
  Star,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { complaintsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatsCard from '../components/StatsCard';
import ResolutionModal from '../components/ResolutionModal';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const { socket, broadcastStatusChange } = useSocket();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicketForResolution, setSelectedTicketForResolution] = useState(null);

  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintsAPI.getAssigned({
        status: statusFilter,
        priority: priorityFilter,
        search,
      });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Failed to load agent complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedComplaints();
  }, [statusFilter, priorityFilter, search]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchAssignedComplaints();
    };
    socket.on('ticket_updated', handleUpdate);
    return () => socket.off('ticket_updated', handleUpdate);
  }, [socket]);

  // Quick Action: Transition to In-Progress
  const handleStartWork = async (ticket) => {
    try {
      const res = await complaintsAPI.updateStatus(ticket._id, {
        status: 'In Progress',
        note: `Agent ${user.name} commenced investigation and diagnostic analysis.`,
      });

      broadcastStatusChange({
        complaintId: ticket._id,
        status: 'In Progress',
      });

      setComplaints((prev) =>
        prev.map((c) => (c._id === ticket._id ? res.data.complaint : c))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleResolved = (updatedTicket) => {
    broadcastStatusChange({
      complaintId: updatedTicket._id,
      status: 'Resolved',
    });
    setComplaints((prev) =>
      prev.map((c) => (c._id === updatedTicket._id ? updatedTicket : c))
    );
  };

  // Metrics
  const totalAssigned = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const pendingCount = complaints.filter((c) => c.status === 'Assigned' || c.status === 'Pending').length;

  return (
    <div style={{ padding: '36px 0 60px' }}>
      <div className="container">
        {/* Header Title */}
        <div className="flex justify-between items-center" style={{ marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: '4px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: 'var(--blue-500)',
                }}
              >
                <Headphones size={22} />
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Agent Resolution Center</h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Assigned Specialist: <strong style={{ color: '#fff' }}>{user?.name}</strong> • Department:{' '}
              <span style={{ color: 'var(--blue-400)' }}>{user?.department || 'Technical Support'}</span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-4" style={{ marginBottom: '32px' }}>
          <StatsCard
            title="Assigned Queue"
            value={totalAssigned}
            icon={Headphones}
            colorScheme="blue"
            subtitle="Total tickets in your queue"
          />
          <StatsCard
            title="Needs Action"
            value={pendingCount}
            icon={Clock}
            colorScheme="yellow"
            subtitle="Assigned & awaiting start"
          />
          <StatsCard
            title="In Progress"
            value={inProgressCount}
            icon={RefreshCw}
            colorScheme="purple"
            subtitle="Under active troubleshooting"
          />
          <StatsCard
            title="Resolved Tickets"
            value={resolvedCount}
            icon={CheckCircle2}
            colorScheme="green"
            subtitle="Successfully closed tickets"
          />
        </div>

        {/* Filters */}
        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assigned tickets by user, title, or ID..."
              className="form-input"
              style={{ paddingLeft: '38px', paddingRight: '12px' }}
            />
          </div>

          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {['All', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className="btn btn-sm"
                style={{
                  background: statusFilter === st ? 'var(--blue-600)' : 'rgba(15, 23, 42, 0.6)',
                  color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                  border: statusFilter === st ? 'none' : '1px solid var(--border-color)',
                  fontWeight: 600,
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Assigned Tickets List */}
        {loading ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <RefreshCw className="animate-spin" size={28} color="var(--blue-500)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading assigned tickets...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <CheckCircle2 size={48} style={{ opacity: 0.3, margin: '0 auto 16px', color: 'var(--green-500)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Queue is Clear!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              No complaints currently assigned matching this criteria.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {complaints.map((ticket) => (
              <div
                key={ticket._id}
                className="glass-card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderLeft:
                    ticket.priority === 'Urgent'
                      ? '4px solid var(--red-500)'
                      : ticket.priority === 'High'
                      ? '4px solid var(--warning-500, #f59e0b)'
                      : '4px solid var(--blue-500)',
                }}
              >
                <div style={{ flex: '1 1 360px' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--blue-400)',
                        background: 'rgba(59, 130, 246, 0.15)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {ticket.ticketId}
                    </span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {ticket.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                    {ticket.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {ticket.description}
                  </p>

                  <div className="flex items-center gap-2" style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Raised by:</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {ticket.user?.name} ({ticket.user?.email})
                    </span>
                  </div>
                </div>

                {/* Workflow Action Buttons */}
                <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                  {ticket.status === 'Assigned' && (
                    <button
                      onClick={() => handleStartWork(ticket)}
                      className="btn btn-warning btn-sm"
                    >
                      <RefreshCw size={14} />
                      <span>Start Working</span>
                    </button>
                  )}

                  {ticket.status === 'In Progress' && (
                    <button
                      onClick={() => setSelectedTicketForResolution(ticket)}
                      className="btn btn-success btn-sm"
                    >
                      <CheckCircle2 size={14} />
                      <span>Resolve Ticket</span>
                    </button>
                  )}

                  <Link to={`/complaints/${ticket._id}`} className="btn btn-primary btn-sm">
                    <MessageSquare size={14} />
                    <span>Workspace & Chat</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resolution Modal */}
        {selectedTicketForResolution && (
          <ResolutionModal
            isOpen={!!selectedTicketForResolution}
            onClose={() => setSelectedTicketForResolution(null)}
            complaint={selectedTicketForResolution}
            onResolved={handleResolved}
          />
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
