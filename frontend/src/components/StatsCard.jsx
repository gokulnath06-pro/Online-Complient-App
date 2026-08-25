import React from 'react';

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  colorScheme = 'purple',
}) => {
  const colorMap = {
    purple: {
      border: 'rgba(124, 58, 237, 0.3)',
      bgIcon: 'rgba(124, 58, 237, 0.15)',
      textIcon: '#a78bfa',
      glow: 'var(--shadow-glow-purple)',
    },
    blue: {
      border: 'rgba(59, 130, 246, 0.3)',
      bgIcon: 'rgba(59, 130, 246, 0.15)',
      textIcon: '#60a5fa',
      glow: 'var(--shadow-glow-blue)',
    },
    yellow: {
      border: 'rgba(245, 158, 11, 0.3)',
      bgIcon: 'rgba(245, 158, 11, 0.15)',
      textIcon: '#fbbf24',
      glow: '0 0 25px rgba(245, 158, 11, 0.25)',
    },
    green: {
      border: 'rgba(16, 185, 129, 0.3)',
      bgIcon: 'rgba(16, 185, 129, 0.15)',
      textIcon: '#34d399',
      glow: 'var(--shadow-glow-green)',
    },
    red: {
      border: 'rgba(239, 68, 68, 0.3)',
      bgIcon: 'rgba(239, 68, 68, 0.15)',
      textIcon: '#f87171',
      glow: '0 0 25px rgba(239, 68, 68, 0.25)',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.purple;

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${scheme.textIcon}`,
      }}
    >
      <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: scheme.bgIcon,
              color: scheme.textIcon,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        <h3
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {value}
        </h3>
        {trend && (
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: trend.startsWith('+') ? 'var(--green-500)' : 'var(--blue-500)',
            }}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginTop: '8px',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatsCard;
