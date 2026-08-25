import React from 'react';
import { Clock, UserCheck, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export const StatusBadge = ({ status, className = '' }) => {
  const getBadgeConfig = (st) => {
    switch (st) {
      case 'Pending':
        return {
          cssClass: 'badge-pending',
          icon: <Clock size={13} />,
          text: 'Pending',
        };
      case 'Assigned':
        return {
          cssClass: 'badge-assigned',
          icon: <UserCheck size={13} />,
          text: 'Assigned',
        };
      case 'In Progress':
        return {
          cssClass: 'badge-in-progress',
          icon: <RefreshCw size={13} className="animate-spin-slow" />,
          text: 'In Progress',
        };
      case 'Resolved':
        return {
          cssClass: 'badge-resolved',
          icon: <CheckCircle2 size={13} />,
          text: 'Resolved',
        };
      case 'Rejected':
        return {
          cssClass: 'badge-rejected',
          icon: <XCircle size={13} />,
          text: 'Rejected',
        };
      default:
        return {
          cssClass: 'badge-pending',
          icon: <Clock size={13} />,
          text: st || 'Unknown',
        };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <span className={`badge ${config.cssClass} ${className}`}>
      {config.icon}
      <span>{config.text}</span>
    </span>
  );
};

export default StatusBadge;
