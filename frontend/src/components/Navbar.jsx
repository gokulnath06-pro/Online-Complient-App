import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  LayoutDashboard,
  BarChart3,
  LogOut,
  User,
  Zap,
  Sparkles,
  ChevronDown,
  Layers,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isAgent, isUser, logout, fastDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const handleDemoSwitch = async (role) => {
    setDemoDropdownOpen(false);
    await fastDemoLogin(role);
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'AGENT') navigate('/agent');
    else navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 0',
      }}
    >
      <div className="container flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow-purple)',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                }}
              >
                Resolve<span style={{ color: 'var(--purple-500)' }}>X</span>
              </span>
              <span
                className="badge"
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: 'var(--blue-500)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                MERN v2.0
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6" style={{ display: 'flex' }}>
          <Link
            to="/"
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: location.pathname === '/' ? '#ffffff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Home
          </Link>

          <Link
            to="/track"
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: location.pathname === '/track' ? '#ffffff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Search size={15} />
            Track Ticket
          </Link>

          {isAuthenticated && (
            <>
              {isUser && (
                <Link
                  to="/dashboard"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: location.pathname === '/dashboard' ? 'var(--purple-400)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <LayoutDashboard size={15} />
                  My Complaints
                </Link>
              )}

              {(isAgent || isAdmin) && (
                <Link
                  to="/agent"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: location.pathname === '/agent' ? 'var(--blue-500)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Headphones size={15} />
                  Agent Workspace
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: location.pathname === '/admin' ? 'var(--green-500)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <BarChart3 size={15} />
                  Admin Hub
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Actions & Demo Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.78rem',
                border: '1px solid rgba(124, 58, 237, 0.4)',
                background: 'rgba(124, 58, 237, 0.12)',
                color: 'var(--purple-400)',
              }}
            >
              <Zap size={14} color="#a78bfa" />
              <span>1-Click Switch</span>
              <ChevronDown size={12} />
            </button>

            {demoDropdownOpen && (
              <div
                className="glass-card"
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '240px',
                  padding: '8px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    padding: '4px 8px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Switch Demo Account
                </span>

                <button
                  onClick={() => handleDemoSwitch('ADMIN')}
                  className="btn btn-sm"
                  style={{
                    justifyContent: 'flex-start',
                    background: user?.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                    color: '#f87171',
                    border: 'none',
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>Admin (Alex Vance)</span>
                </button>

                <button
                  onClick={() => handleDemoSwitch('AGENT')}
                  className="btn btn-sm"
                  style={{
                    justifyContent: 'flex-start',
                    background: user?.role === 'AGENT' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    color: '#60a5fa',
                    border: 'none',
                  }}
                >
                  <Headphones size={14} />
                  <span>Agent (David Miller)</span>
                </button>

                <button
                  onClick={() => handleDemoSwitch('USER')}
                  className="btn btn-sm"
                  style={{
                    justifyContent: 'flex-start',
                    background: user?.role === 'USER' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    color: '#34d399',
                    border: 'none',
                  }}
                >
                  <User size={14} />
                  <span>User (John Doe)</span>
                </button>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* User Avatar & Role */}
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'var(--slate-800)',
                    overflow: 'hidden',
                    border: '2px solid var(--purple-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={18} color="var(--text-secondary)" />
                  )}
                </div>
                <div style={{ display: 'none', flexDirection: 'column' }} className="user-text">
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{user?.name}</span>
                </div>
              </div>

              {/* Role Pill */}
              <span
                className="badge"
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  background: isAdmin
                    ? 'rgba(239, 68, 68, 0.2)'
                    : isAgent
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'rgba(139, 92, 246, 0.2)',
                  color: isAdmin ? '#f87171' : isAgent ? '#60a5fa' : '#a78bfa',
                  border: '1px solid currentColor',
                }}
              >
                {user?.role}
              </span>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Sign Out"
                style={{ padding: '8px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
