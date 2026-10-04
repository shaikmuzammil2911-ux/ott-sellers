import React from 'react';
import { Zap, ShieldCheck, Clock, Users } from 'lucide-react';
import './AnnouncementBar.css';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="announcement-bar">
      <div className="container announcement-content">
        <div className="announcement-item highlight">
          <Zap size={14} className="announcement-icon" />
          <span>Get Your Favorite OTT Subscriptions at <strong>Best Prices!</strong></span>
        </div>
        <div className="announcement-divider">•</div>
        <div className="announcement-item">
          <Clock size={14} className="announcement-icon" />
          <span>Instant Delivery within 15 Mins</span>
        </div>
        <div className="announcement-divider">•</div>
        <div className="announcement-item">
          <ShieldCheck size={14} className="announcement-icon" />
          <span>100% Genuine & Safe</span>
        </div>
        <div className="announcement-divider">•</div>
        <div className="announcement-item">
          <Users size={14} className="announcement-icon" />
          <span>Trusted by 50,000+ Streamers</span>
        </div>
      </div>
    </div>
  );
};
