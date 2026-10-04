import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PromoOfferModal.css';

export const PromoOfferModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('ott_promo_modal_seen');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('ott_promo_modal_seen', 'true');
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('OTT20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="promo-modal-backdrop" onClick={() => setIsOpen(false)}>
      <div className="promo-modal-card" onClick={(e) => e.stopPropagation()}>
        <button 
          className="promo-modal-close" 
          onClick={() => setIsOpen(false)}
          aria-label="Close promotion modal"
        >
          <X size={20} />
        </button>

        <div className="promo-modal-decor-glow"></div>

        <div className="promo-modal-header">
          <div className="promo-tag-pill">
            <Flame size={14} className="promo-flame" />
            <span>LIMITED TIME PROMO</span>
          </div>
          <h2 className="promo-modal-title">
            Unlock Extra 20% OFF Your First Subscription!
          </h2>
          <p className="promo-modal-subtitle">
            Get instant access to Netflix, Prime Video, Hotstar, and SonyLIV with our exclusive festival promo coupon code.
          </p>
        </div>

        <div className="promo-coupon-container">
          <div className="coupon-code-box">
            <span className="coupon-label">COUPON CODE</span>
            <span className="coupon-code-text">OTT20</span>
          </div>

          <button 
            type="button" 
            className="btn-copy-code"
            onClick={handleCopyCode}
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="promo-modal-features">
          <div className="feature-pill">⚡ 5-Min WhatsApp Delivery</div>
          <div className="feature-pill">🔒 100% Replacement Warranty</div>
        </div>

        <Link 
          to="/catalogs" 
          className="btn-claim-deal"
          onClick={() => setIsOpen(false)}
        >
          <span>Claim Deal & Browse Plans</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
