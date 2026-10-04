import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import './LivePurchasePopup.css';

interface PurchaseNotification {
  name: string;
  location: string;
  product: string;
  slug: string;
  plan: string;
  time: string;
  image: string;
}

const PURCHASES: PurchaseNotification[] = [
  {
    name: 'Rahul V.',
    location: 'Mumbai',
    product: 'Netflix Premium (4K UHD)',
    slug: 'netflix-premium',
    plan: '3 Months',
    time: '2 mins ago',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sneha K.',
    location: 'Bangalore',
    product: 'Amazon Prime Video',
    slug: 'amazon-prime-video',
    plan: '12 Months',
    time: '4 mins ago',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'Arjun M.',
    location: 'Hyderabad',
    product: 'Ultimate Binge Combo 4-in-1',
    slug: 'ultimate-binge-combo',
    plan: '6 Months',
    time: '1 min ago',
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'Kavita P.',
    location: 'Delhi NCR',
    product: 'Disney+ Hotstar Premium',
    slug: 'disney-hotstar-premium',
    plan: '3 Months',
    time: 'Just now',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'Faizan A.',
    location: 'Pune',
    product: 'YouTube Premium Ad-Free',
    slug: 'youtube-premium',
    plan: '12 Months',
    time: '3 mins ago',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'Manoj S.',
    location: 'Chennai',
    product: 'SonyLIV Premium (Live Sports)',
    slug: 'sonyliv-premium',
    plan: '1 Month',
    time: '5 mins ago',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&auto=format&fit=crop&q=80'
  }
];

export const LivePurchasePopup: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Show popup after initial 4 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 3500);

    return () => clearTimeout(initialTimer);
  }, [dismissed]);

  useEffect(() => {
    if (dismissed) return;

    // Cycle notifications every 10 seconds: show for 4.5s, hide for 5.5s
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % PURCHASES.length);
        setVisible(true);
      }, 3500);
    }, 11000);

    return () => clearInterval(interval);
  }, [dismissed]);

  if (dismissed || !visible) return null;

  const current = PURCHASES[currentIdx];

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

      <Link to={`/product/${current.slug}`} className="popup-content-link">
        <div className="popup-media-box">
          <img src={current.image} alt={current.product} />
          <span className="live-indicator-dot"></span>
        </div>

        <div className="popup-info-col">
          <div className="popup-buyer-row">
            <span className="buyer-name">{current.name}</span>
            <span className="buyer-loc">• {current.location}</span>
          </div>

          <p className="popup-product-title">
            Ordered <strong>{current.product}</strong>
          </p>

          <div className="popup-meta-row">
            <span className="verified-badge">
              <CheckCircle2 size={12} /> Verified Activation
            </span>
            <span className="popup-time">{current.time}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};
