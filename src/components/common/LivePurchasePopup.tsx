import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ottApi, getCleanImageUrl } from '../../services/api';
import { SiteNotification } from '../../types';
import './LivePurchasePopup.css';

export const LivePurchasePopup: React.FC = () => {
  const [notifications, setNotifications] = useState<SiteNotification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const loadNotifs = useCallback(async () => {
    try {
      const [allNotifs, settings] = await Promise.all([
        ottApi.getNotifications(),
        ottApi.getAdminSettings()
      ]);
      const active = allNotifs.filter(n => n.isActive);
      setNotifications(active);
      setIsEnabled(settings.randomNotificationsActive ?? true);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    loadNotifs();

    const handleUpdate = () => loadNotifs();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadNotifs]);

  useEffect(() => {
    if (dismissed || !isEnabled || notifications.length === 0) return;

    // Show popup after initial 4 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 4000);

    return () => clearTimeout(initialTimer);
  }, [dismissed, isEnabled, notifications.length]);

  useEffect(() => {
    if (dismissed || !isEnabled || notifications.length === 0) return;

    // Cycle notifications: show for 4.5s, hide for 6.5s
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % notifications.length);
        setVisible(true);
      }, 4000);
    }, 11000);

    return () => clearInterval(interval);
  }, [dismissed, isEnabled, notifications.length]);

  if (dismissed || !isEnabled || !visible || notifications.length === 0) return null;

  const current = notifications[currentIdx] || notifications[0];
  const imgUrl = getCleanImageUrl(current.imageUrl, current.updatedAt);

  return (
    <div className="live-purchase-popup" role="status" aria-live="polite">
      <button 
        type="button" 
        className="close-popup-btn" 
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>

      <Link to={`/product/${current.slug || 'netflix-premium'}`} className="popup-content-link">
        <div className="popup-media-box">
          <img src={imgUrl} alt={current.productName} />
          <span className="live-indicator-dot"></span>
        </div>

        <div className="popup-info-col">
          <div className="popup-buyer-row">
            <span className="buyer-name">{current.buyerName}</span>
            <span className="buyer-loc">• {current.location}</span>
          </div>

          <p className="popup-product-title">
            Ordered <strong>{current.productName}</strong>
          </p>

          <div className="popup-meta-row">
            <span className="verified-badge">
              <CheckCircle2 size={12} /> Verified Activation
            </span>
            <span className="popup-time">{current.timeText}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};
