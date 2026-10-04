import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import './EmptyState.css';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText: string;
  actionTo: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionTo
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon-wrapper">
        <Icon size={44} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      <Link to={actionTo} className="btn-primary empty-state-btn">
        {actionText}
      </Link>
    </div>
  );
};
