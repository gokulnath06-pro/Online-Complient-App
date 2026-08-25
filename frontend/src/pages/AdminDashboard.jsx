import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  TrendingUp,
  Star,
  Activity,
  Layers,
  Search,
  Filter,
  UserCheck,
  Trash2,
  AlertCircle,
  Headphones,
  Sliders,
} from 'lucide-react';
import { analyticsAPI, complaintsAPI, authAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import AssignAgentModal from '../components/AssignAgentModal';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'complaints' | 'users'
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Complaints Table State
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintStatus, setComplaintStatus] = useState('All');
  const [selectedComplaintForAssign, setSelectedComplaintForAssign] = useState(null);

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, complaintsRes, usersRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        complaintsAPI.getAll({ limit: 100 }),
        authAPI.getAllUsers({ limit: 100 }),
      ]);

      setAnalytics(analyticsRes.data);
      setComplaints(complaintsRes.data.complaints || []);
      setUsersList(usersRes.data.users || []);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteComplaint = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this complaint ticket?')) {
      try {
        await complaintsAPI.delete(id);
        setComplaints(complaints.filter((c) => c._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete complaint');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authAPI.updateUserRole(userId, { role: newRole });
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleAssigned = (updatedTicket) => {
    setComplaints((prev) =>
      prev.map((c) => (c._id === updatedTicket._id ? updatedTicket : c))
    );
    // Refresh stats
    fetchDashboardData();
  };

  const metrics = analytics?.metrics || {
    totalComplaints: 0,
    pendingCount: 0,
    inProgressCount: 0,
    resolvedCount: 0,
    resolutionRate: 0,
    avgResolutionHours: 0,
    avgSatisfactionRating: 5.0,
  };

  // Filtered Complaints for Table
  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = complaintStatus === 'All' || c.status === complaintStatus;
    const matchesSearch =
      !complaintSearch ||
      c.title.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.ticketId.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.user?.name?.toLowerCase().includes(complaintSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Users for Table
  const filteredUsers = usersList.filter((u) => {
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    const matchesSearch =
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.department?.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ padding: '36px 0 70px' }}>
      <div className="container">
        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: '4px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: 'var(--red-500)',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Admin Intelligence Hub</h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Comprehensive performance monitoring, agent workload dispatch, and audit controls
            </p>
          </div>

          {/* Navigation Tabs */}
          <div
            className="glass-card"
            style={{
              padding: '6px',
              display: 'flex',
              gap: '6px',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <button
              onClick={() => setActiveTab('analytics')}
              className="btn btn-sm"
              style={{
                background: activeTab === 'analytics' ? 'var(--primary-gradient)' : 'transparent',
                color: activeTab === 'analytics' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
              }}
            >
              <BarChart3 size={15} />
              <span>Analytics & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              className="btn btn-sm"
              style={{
                background: activeTab === 'complaints' ? 'var(--primary-gradient)' : 'transparent',
                color: activeTab === 'complaints' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
              }}
            >
              <Layers size={15} />
              <span>Complaints Matrix ({complaints.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className="btn btn-sm"
              style={{
                background: activeTab === 'users' ? 'var(--primary-gradient)' : 'transparent',
                color: activeTab === 'users' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
              }}
            >
              <Users size={15} />
              <span>Staff & Users ({usersList.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && (
          <div>
            {/* KPI Cards */}
            <div className="grid grid-4" style={{ marginBottom: '28px' }}>
              <StatsCard
                title="Total Tickets"
                value={metrics.totalComplaints}
                icon={Layers}
                colorScheme="purple"
                trend="+12% this week"
                subtitle="All platform grievances"
              />
              <StatsCard
                title="Resolution Rate"
                value={`${metrics.resolutionRate}%`}
                icon={CheckCircle2}
                colorScheme="green"
                trend="Optimal"
                subtitle={`${metrics.resolvedCount} tickets closed`}
              />
              <StatsCard
                title="Avg Resolution Time"
                value={`${metrics.avgResolutionHours} hrs`}
                icon={Clock}
                colorScheme="blue"
                subtitle="Turnaround benchmark"
              />
              <StatsCard
                title="Customer CSAT"
                value={`${metrics.avgSatisfactionRating} / 5`}
                icon={Star}
                colorScheme="yellow"
                subtitle="Average feedback score"
              />
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-2" style={{ marginBottom: '28px' }}>
              {/* Status Breakdown Bar Progress */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="var(--purple-400)" />
                  Complaint Status Distribution
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Pending Assignment', count: metrics.pendingCount, color: 'var(--yellow-500)', bg: 'rgba(245, 158, 11, 0.2)' },
                    { label: 'Assigned to Agent', count: metrics.assignedCount || 0, color: 'var(--purple-500)', bg: 'rgba(124, 58, 237, 0.2)' },
                    { label: 'In Progress (Active)', count: metrics.inProgressCount, color: 'var(--blue-500)', bg: 'rgba(59, 130, 246, 0.2)' },
                    { label: 'Resolved (Closed)', count: metrics.resolvedCount, color: 'var(--green-500)', bg: 'rgba(16, 185, 129, 0.2)' },
                    { label: 'Rejected', count: metrics.rejectedCount || 0, color: 'var(--red-500)', bg: 'rgba(239, 68, 68, 0.2)' },
                  ].map((st) => {
                    const percent = metrics.totalComplaints > 0 ? Math.round((st.count / metrics.totalComplaints) * 100) : 0;
                    return (
                      <div key={st.label}>
                        <div className="flex justify-between items-center" style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{st.label}</span>
                          <span style={{ fontWeight: 700, color: st.color }}>
                            {st.count} ({percent}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '6px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              background: st.color,
                              borderRadius: '6px',
                              transition: 'width 0.6s ease',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="var(--blue-400)" />
                  Issues by Category
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {analytics?.categoryStats?.map((cat) => {
                    const percent = metrics.totalComplaints > 0 ? Math.round((cat.count / metrics.totalComplaints) * 100) : 0;
                    return (
                      <div key={cat._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background:
                                cat._id === 'Technical'
                                  ? 'var(--blue-500)'
                                  : cat._id === 'Billing'
                                  ? 'var(--green-500)'
                                  : cat._id === 'Hardware'
                                  ? 'var(--yellow-500)'
                                  : 'var(--purple-500)',
                            }}
                          />
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cat._id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{percent}%</span>
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
                            {cat.count} tickets
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Agent Performance Scorecard */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Headphones size={20} color="var(--blue-400)" />
                Agent Workload & Performance Scorecard
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>Agent Name</th>
                      <th style={{ padding: '12px 16px' }}>Department</th>
                      <th style={{ padding: '12px 16px' }}>Assigned</th>
                      <th style={{ padding: '12px 16px' }}>Resolved</th>
                      <th style={{ padding: '12px 16px' }}>Resolution Rate</th>
                      <th style={{ padding: '12px 16px' }}>Customer Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.agentLeaderboard?.map((agent) => (
                      <tr key={agent.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#fff' }}>
                          <div className="flex items-center gap-2">
                            <UserCheck size={16} color="var(--blue-400)" />
                            {agent.name}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{agent.department}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>{agent.assigned}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--green-500)', fontWeight: 700 }}>{agent.resolved}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="badge badge-resolved">{agent.rate}%</span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#fbbf24', fontWeight: 700 }}>
                          ⭐ {agent.avgRating} / 5.0
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPLAINTS MANAGEMENT MATRIX */}
        {activeTab === 'complaints' && (
          <div>
            {/* Filter controls */}
            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flex: '1 1 260px' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  placeholder="Search complaints by ID, title, user..."
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>

              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {['All', 'Pending', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setComplaintStatus(st)}
                    className="btn btn-sm"
                    style={{
                      background: complaintStatus === st ? 'var(--primary-gradient)' : 'rgba(15,23,42,0.6)',
                      color: complaintStatus === st ? '#fff' : 'var(--text-secondary)',
                      border: complaintStatus === st ? 'none' : '1px solid var(--border-color)',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Complaints Matrix Table */}
            <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 14px' }}>Ticket ID</th>
                    <th style={{ padding: '12px 14px' }}>Title & Description</th>
                    <th style={{ padding: '12px 14px' }}>Category</th>
                    <th style={{ padding: '12px 14px' }}>Priority</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>User</th>
                    <th style={{ padding: '12px 14px' }}>Assigned Agent</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((item) => (
                    <tr key={item._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="font-mono" style={{ color: 'var(--purple-400)', fontWeight: 700 }}>
                          {item.ticketId}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', maxWidth: '280px' }}>
                        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{item.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.category}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.82rem' }}>
                        {item.user?.name || 'User'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {item.assignedAgent ? (
                          <span style={{ fontSize: '0.82rem', color: 'var(--blue-400)', fontWeight: 600 }}>
                            {item.assignedAgent.name}
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedComplaintForAssign(item)}
                            className="btn btn-warning btn-sm"
                            style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                          >
                            <UserCheck size={12} /> Assign Agent
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div className="flex justify-end gap-2">
                          <Link to={`/complaints/${item._id}`} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
                            Inspect
                          </Link>
                          <button
                            onClick={() => setSelectedComplaintForAssign(item)}
                            className="btn btn-secondary btn-sm"
                            title="Re-assign Agent"
                            style={{ padding: '6px 8px' }}
                          >
                            <UserCheck size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteComplaint(item._id)}
                            className="btn btn-sm"
                            title="Delete Complaint"
                            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'none', padding: '6px 8px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: USER & STAFF MANAGEMENT */}
        {activeTab === 'users' && (
          <div>
            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flex: '1 1 260px' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name, email, department..."
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>

              <div className="flex gap-2">
                {['All', 'USER', 'AGENT', 'ADMIN'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className="btn btn-sm"
                    style={{
                      background: userRoleFilter === r ? 'var(--primary-gradient)' : 'rgba(15,23,42,0.6)',
                      color: userRoleFilter === r ? '#fff' : 'var(--text-secondary)',
                      border: userRoleFilter === r ? 'none' : '1px solid var(--border-color)',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>User</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Department</th>
                    <th style={{ padding: '12px 16px' }}>Current Role</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>
                        {u.name}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{u.department || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          className="badge"
                          style={{
                            background:
                              u.role === 'ADMIN'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : u.role === 'AGENT'
                                ? 'rgba(59, 130, 246, 0.2)'
                                : 'rgba(139, 92, 246, 0.2)',
                            color: u.role === 'ADMIN' ? '#f87171' : u.role === 'AGENT' ? '#60a5fa' : '#a78bfa',
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="form-select"
                          style={{ padding: '6px 10px', fontSize: '0.8rem', width: 'auto', display: 'inline-block' }}
                        >
                          <option value="USER">USER</option>
                          <option value="AGENT">AGENT</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assign Agent Modal */}
        {selectedComplaintForAssign && (
          <AssignAgentModal
            isOpen={!!selectedComplaintForAssign}
            onClose={() => setSelectedComplaintForAssign(null)}
            complaint={selectedComplaintForAssign}
            onAssigned={handleAssigned}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
