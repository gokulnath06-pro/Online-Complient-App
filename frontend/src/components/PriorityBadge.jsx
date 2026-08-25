import React from 'react';
import { AlertCircle, AlertTriangle, Flame, Shield } from 'lucide-react';

export const PriorityBadge = ({ priority, className = '' }) => {
  const getPriorityConfig = (pr) => {
    switch (pr) {
      case 'Low':
        return {
          cssClass: 'priority-low',
          icon: <Shield size={12} />,
          text: 'Low',
        };
      case 'Medium':
        return {
          cssClass: 'priority-medium',
          icon: <AlertCircle size={12} />,
          text: 'Medium',
        };
      case 'High':
        return {
          cssClass: 'priority-high',
          icon: <AlertTriangle size={12} />,
          text: 'High',
        };
      case 'Urgent':
        return {
          cssClass: 'priority-urgent',
          icon: <Flame size={12} />,
          text: 'Urgent',
        };
      default:
        return {
          cssClass: 'priority-medium',
          icon: <AlertCircle size={12} />,
          text: pr || 'Normal',
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span className={`badge ${config.cssClass} ${className}`}>
      {config.icon}
      <span>{config.text}</span>
    </span>
  );
};

export default PriorityBadge;
