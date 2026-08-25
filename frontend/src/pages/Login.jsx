import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ShieldCheck, Headphones, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, fastDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'ADMIN') navigate('/admin');
        else if (res.user.role === 'AGENT') navigate('/agent');
        else navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleFastDemo = async (role) => {
    setLoading(true);
    setError('');
    const res = await fastDemoLogin(role);
    setLoading(false);
    if (res.success) {
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'AGENT') navigate('/agent');
      else navigate('/dashboard');
    }
  };

  return (
    <div style={{ padding: '60px 0 80px' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="glass-card" style={{ padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-gradient)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: 'var(--shadow-glow-purple)',
              }}
            >
              <Lock size={24} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Welcome Back</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Sign in to manage and track your complaint tickets
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '20px',
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
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                <label className="form-label">Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* 1-Click Fast Login Section */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '12px',
              }}
            >
              ⚡ 1-Click Demo Accounts
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleFastDemo('ADMIN')}
                className="btn btn-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  flexDirection: 'column',
                  padding: '10px 6px',
                  gap: '4px',
                }}
              >
                <ShieldCheck size={16} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemo('AGENT')}
                className="btn btn-sm"
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  flexDirection: 'column',
                  padding: '10px 6px',
                  gap: '4px',
                }}
              >
                <Headphones size={16} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Agent</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemo('USER')}
                className="btn btn-sm"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  flexDirection: 'column',
                  padding: '10px 6px',
                  gap: '4px',
                }}
              >
                <User size={16} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>User</span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--purple-400)', fontWeight: 700 }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
