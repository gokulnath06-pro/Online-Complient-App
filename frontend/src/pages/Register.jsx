import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [department, setDepartment] = useState('Product Operations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        department,
      });

      if (res.success) {
        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'AGENT') navigate('/agent');
        else navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Registration failed. Please verify the entered data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px 0 80px' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="glass-card" style={{ padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
              <UserPlus size={24} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Create New Account</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Join ResolveX to lodge complaints and resolve tickets seamlessly
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
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (min 6 characters)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                minLength={6}
                required
              />
            </div>

            <div className="grid grid-2" style={{ gap: '12px', marginBottom: '8px' }}>
              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                >
                  <option value="USER">User (Customer / Employee)</option>
                  <option value="AGENT">Support Agent</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Technical Support"
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '16px' }}
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--purple-400)', fontWeight: 700 }}>
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
