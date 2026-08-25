import React from 'react';
import { CheckCircle2, Clock, UserCheck, RefreshCw, XCircle } from 'lucide-react';

export const Timeline = ({ timeline = [], currentStatus = 'Pending' }) => {
  const statusSteps = [
    { key: 'Pending', label: 'Registered', icon: Clock },
    { key: 'Assigned', label: 'Assigned', icon: UserCheck },
    { key: 'In Progress', label: 'In Progress', icon: RefreshCw },
    { key: 'Resolved', label: 'Resolved', icon: CheckCircle2 },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Assigned':
        return 1;
      case 'In Progress':
        return 2;
      case 'Resolved':
        return 3;
      case 'Rejected':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
      {/* Horizontal Lifecycle Stepper */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Background Connecting Line */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '40px',
              right: '40px',
              height: '3px',
              background: 'var(--slate-800)',
              zIndex: 1,
            }}
          />

          {/* Active Colored Progress Line */}
          {currentIndex >= 0 && (
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '40px',
                width: `${(currentIndex / (statusSteps.length - 1)) * 82}%`,
                height: '3px',
                background: 'var(--primary-gradient)',
                zIndex: 2,
                transition: 'width 0.5s ease',
              }}
            />
          )}

          {statusSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentIndex >= idx;
            const isCurrent = currentIndex === idx;

            return (
              <div
                key={step.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 3,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCompleted
                      ? 'var(--purple-600)'
                      : 'var(--slate-900)',
                    color: isCompleted ? '#ffffff' : 'var(--slate-500)',
                    border: isCurrent
                      ? '3px solid var(--blue-500)'
                      : isCompleted
                      ? '2px solid var(--purple-400)'
                      : '2px solid var(--slate-700)',
                    boxShadow: isCurrent
                      ? 'var(--shadow-glow-purple)'
                      : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Icon size={18} />
                </div>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCompleted
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Activity History Audit Feed */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h4
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '18px',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={16} color="var(--purple-500)" />
          Resolution Activity Audit Trail
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {timeline && timeline.length > 0 ? (
            timeline.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '16px',
                  position: 'relative',
                  paddingLeft: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background:
                        item.status === 'Resolved'
                          ? 'var(--green-500)'
                          : item.status === 'In Progress'
                          ? 'var(--blue-500)'
                          : item.status === 'Rejected'
                          ? 'var(--red-500)'
                          : 'var(--yellow-500)',
                      boxShadow: '0 0 8px currentColor',
                    }}
                  />
                  {idx !== timeline.length - 1 && (
                    <div
                      style={{
                        width: '2px',
                        flexGrow: 1,
                        background: 'var(--slate-800)',
                        marginTop: '6px',
                      }}
                    />
                  )}
                </div>

                <div style={{ flex: 1, paddingBottom: '14px' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                    >
                      Status: {item.status}
                    </span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.note}
                  </p>
                  {item.updatedBy && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--purple-400)',
                        marginTop: '4px',
                        display: 'inline-block',
                      }}
                    >
                      Updated by: {item.updatedBy.name || 'System'} ({item.updatedBy.role || 'Staff'})
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No timeline history recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
