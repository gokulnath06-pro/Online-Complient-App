import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  Layers,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { complaintsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatsCard from '../components/StatsCard';
import NewComplaintModal from '../components/NewComplaintModal';

export const UserDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintsAPI.getMy({
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        search,
      });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Failed to load user complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter, search]);

  // Real-time status update listener
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchComplaints();
    };
    socket.on('ticket_updated', handleUpdate);
    return () => socket.off('ticket_updated', handleUpdate);
  }, [socket]);

  // Calculated Stats
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  const handleCreated = (newComplaint) => {
    setComplaints([newComplaint, ...complaints]);
  };

  return (
    <div style={{ padding: '36px 0 60px' }}>
      <div className="container">
        {/* Header Title & New Complaint Action */}
        <div className="flex justify-between items-center" style={{ marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>User Grievance Dashboard</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Welcome back, <strong style={{ color: '#fff' }}>{user?.name}</strong>. Track your submitted tickets and live agent communications.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-lg"
          >
            <PlusCircle size={18} />
            <span>File New Complaint</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-4" style={{ marginBottom: '32px' }}>
          <StatsCard
            title="Total Complaints"
            value={totalCount}
            icon={Layers}
            colorScheme="purple"
            subtitle="All grievances registered"
          />
          <StatsCard
            title="Pending Review"
            value={pendingCount}
            icon={Clock}
            colorScheme="yellow"
            subtitle="Awaiting agent assignment"
          />
          <StatsCard
            title="In Progress"
            value={inProgressCount}
            icon={RefreshCw}
            colorScheme="blue"
            subtitle="Currently under investigation"
          />
          <StatsCard
            title="Resolved"
            value={resolvedCount}
            icon={CheckCircle2}
            colorScheme="green"
            subtitle="Successfully closed"
          />
        </div>

        {/* Search & Filter Toolbar */}
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
          {/* Search Box */}
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
              placeholder="Search by title, Ticket ID (e.g. TKT-1024)..."
              className="form-input"
              style={{ paddingLeft: '38px', paddingRight: '12px' }}
            />
          </div>

          {/* Status Pills */}
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {['All', 'Pending', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className="btn btn-sm"
                style={{
                  background: statusFilter === st ? 'var(--primary-gradient)' : 'rgba(15, 23, 42, 0.6)',
                  color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                  border: statusFilter === st ? 'none' : '1px solid var(--border-color)',
                  fontWeight: 600,
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Billing">Billing</option>
            <option value="Hardware">Hardware</option>
            <option value="Service">Service</option>
            <option value="Product">Product</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Complaints Table / Cards */}
        {loading ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <RefreshCw className="animate-spin" size={28} color="var(--purple-500)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading your complaint tickets...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Layers size={48} style={{ opacity: 0.3, margin: '0 auto 16px', color: 'var(--purple-400)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No Complaints Found</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              You haven't submitted any complaints matching this filter.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <PlusCircle size={16} /> File a Complaint Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {complaints.map((item) => (
              <div
                key={item._id}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div style={{ flex: '1 1 350px' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--purple-400)',
                        background: 'rgba(124, 58, 237, 0.15)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {item.ticketId}
                    </span>
                    <StatusBadge status={item.status} />
                    <PriorityBadge priority={item.priority} />
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                    {item.title}
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
                    {item.description}
                  </p>
                </div>

                {/* Assigned Agent & Date & Action */}
                <div className="flex items-center gap-6" style={{ flexWrap: 'wrap' }}>
                  {item.assignedAgent ? (
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--slate-800)',
                          overflow: 'hidden',
                          border: '1.5px solid var(--blue-500)',
                        }}
                      >
                        {item.assignedAgent.avatar ? (
                          <img
                            src={item.assignedAgent.avatar}
                            alt={item.assignedAgent.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <UserCheck size={16} color="var(--blue-500)" />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.assignedAgent.name}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {item.assignedAgent.department || 'Support Agent'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--yellow-500)', fontStyle: 'italic' }}>
                      ⏳ Awaiting Agent Assignment
                    </span>
                  )}

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Filed: {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link to={`/complaints/${item._id}`} className="btn btn-secondary btn-sm">
                    <span>View & Chat</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Complaint Modal */}
        <NewComplaintModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      </div>
    </div>
  );
};

export default UserDashboard;
