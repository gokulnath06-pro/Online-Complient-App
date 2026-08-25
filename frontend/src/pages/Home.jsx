import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Zap,
  ArrowRight,
  Headphones,
  CheckCircle2,
  BarChart2,
  MessageSquare,
  Sparkles,
  Lock,
  Flame,
  Layers,
  Activity,
  Star,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const [trackId, setTrackId] = useState('');
  const navigate = useNavigate();
  const { fastDemoLogin, isAuthenticated, user } = useAuth();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackId.trim()) {
      navigate(`/track?ticket=${encodeURIComponent(trackId.trim().toUpperCase())}`);
    }
  };

  const handleDemoClick = async (role) => {
    await fastDemoLogin(role);
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'AGENT') navigate('/agent');
    else navigate('/dashboard');
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '80px 0 60px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div className="container" style={{ maxWidth: '900px' }}>
          {/* Top Pill Badge */}
          <div
            className="badge"
            style={{
              background: 'rgba(124, 58, 237, 0.15)',
              color: 'var(--purple-400)',
              border: '1px solid rgba(124, 58, 237, 0.35)',
              padding: '6px 16px',
              fontSize: '0.82rem',
              marginBottom: '24px',
              display: 'inline-flex',
            }}
          >
            <Sparkles size={14} color="#a78bfa" />
            <span>Next-Gen Full-Stack MERN Complaint Handling Platform</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-0.03em',
            }}
          >
            Resolve Customer Issues{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              10x Faster
            </span>{' '}
            with Real-Time Transparency
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              marginBottom: '36px',
              lineHeight: 1.6,
            }}
          >
            Empower your users to file and track grievances with end-to-end auditability.
            Equip support agents with live chat workspaces, and give admins automated resolution analytics.
          </p>

          {/* Quick Ticket Tracker Bar */}
          <div
            className="glass-card"
            style={{
              padding: '10px 14px',
              maxWidth: '560px',
              margin: '0 auto 36px',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-glow-purple)',
            }}
          >
            <form onSubmit={handleTrackSubmit} className="flex items-center gap-2">
              <Search size={20} color="var(--purple-400)" style={{ marginLeft: '8px' }} />
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Enter Ticket ID (e.g. TKT-1024 or TKT-2048)..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.95rem',
                  padding: '8px',
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
                Track Status
              </button>
            </form>
          </div>

          {/* 1-Click Interactive Demo Access Bar */}
          <div
            className="glass-card"
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(15, 23, 42, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              border: '1px solid rgba(124, 58, 237, 0.25)',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Zap size={16} color="#fbbf24" fill="#fbbf24" />
              Instant 1-Click Testing Login:
            </span>

            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDemoClick('USER')}
                className="btn btn-sm"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                👤 Test as User
              </button>
              <button
                onClick={() => handleDemoClick('AGENT')}
                className="btn btn-sm"
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                🎧 Test as Agent
              </button>
              <button
                onClick={() => handleDemoClick('ADMIN')}
                className="btn btn-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                🛡️ Test as Admin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Highlights Bar */}
      <section style={{ padding: '20px 0 60px' }}>
        <div className="container">
          <div className="grid grid-4">
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderTop: '3px solid var(--purple-500)' }}>
              <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--purple-400)' }}>99.2%</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Resolution Success Rate</p>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderTop: '3px solid var(--blue-500)' }}>
              <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--blue-500)' }}>&lt; 2.4 hrs</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Average Turnaround Time</p>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderTop: '3px solid var(--green-500)' }}>
              <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--green-500)' }}>4.9 / 5</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Customer CSAT Rating</p>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderTop: '3px solid var(--yellow-500)' }}>
              <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--yellow-500)' }}>Live</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Socket.io Chat Sync</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Lifecycle Workflow */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
              How ResolveX Automates Complaint Lifecycle
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              From initial complaint registration to final post-resolution rating
            </p>
          </div>

          <div className="grid grid-4">
            {/* Step 1 */}
            <div className="glass-card glass-card-interactive" style={{ padding: '28px 24px', position: 'relative' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Layers size={22} />
              </div>
              <span className="badge badge-pending" style={{ marginBottom: '12px' }}>Step 1 — Register</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Lodge Complaint</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Users select category, priority level, attach screenshots, and receive an instant tracking ID.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card glass-card-interactive" style={{ padding: '28px 24px', position: 'relative' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(124, 58, 237, 0.15)',
                  color: '#a78bfa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Users size={22} />
              </div>
              <span className="badge badge-assigned" style={{ marginBottom: '12px' }}>Step 2 — Assign</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Smart Agent Dispatch</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Admin assigns tickets to specialized agents based on department (Tech, Billing, Hardware).
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card glass-card-interactive" style={{ padding: '28px 24px', position: 'relative' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <MessageSquare size={22} />
              </div>
              <span className="badge badge-in-progress" style={{ marginBottom: '12px' }}>Step 3 — Collab</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Real-Time Live Chat</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Bidirectional WebSocket chat enables users and agents to exchange updates, logs, and diagnostic files.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card glass-card-interactive" style={{ padding: '28px 24px', position: 'relative' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Star size={22} />
              </div>
              <span className="badge badge-resolved" style={{ marginBottom: '12px' }}>Step 4 — Review</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Resolution & Feedback</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Agent documents resolution summary; user verifies fix and submits 5-star rating and satisfaction review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section>
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: '48px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)',
              border: '1px solid rgba(124, 58, 237, 0.4)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
              Ready to streamline your complaint resolution operations?
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 28px' }}>
              Get started now by logging in or trying out any role with instant demo credentials.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Account <ArrowRight size={18} />
              </Link>
              <Link to="/track" className="btn btn-secondary btn-lg">
                Track Existing Ticket
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
