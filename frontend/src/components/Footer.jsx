import React from 'react';
import { ShieldCheck, Heart, Github, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(11, 15, 25, 0.95)',
        padding: '32px 0 20px',
      }}
    >
      <div className="container">
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '20px' }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
              Resolve<span style={{ color: 'var(--purple-500)' }}>X</span>
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              — Enterprise MERN Complaint Lifecycle & Resolution Ecosystem
            </span>
          </div>

          <div className="flex items-center gap-6" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1">
              Built with <Heart size={14} color="var(--red-500)" fill="var(--red-500)" /> MongoDB, Express, React, Node.js & Socket.io
            </span>
          </div>
        </div>

        <div
          className="flex justify-between items-center"
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <span>© {new Date().getFullYear()} ResolveX Systems. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="badge badge-resolved" style={{ fontSize: '0.65rem' }}>
              ● Systems Operational (99.98%)
            </span>
            <span>REST API v2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
