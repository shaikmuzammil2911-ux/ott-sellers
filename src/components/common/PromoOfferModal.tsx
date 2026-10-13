import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ottApi } from '../../services/api';
import { PromoOfferModalSettings } from '../../types';
import './PromoOfferModal.css';

export const PromoOfferModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<PromoOfferModalSettings>(() => {
    try {
      const cached = localStorage.getItem('ott_promo_modal_cms');
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
      isEnabled: true,
      badgeText: 'LIMITED TIME PROMO',
      title: 'Unlock Extra 20% OFF Your First Subscription!',
      description: 'Get instant access to Netflix, Prime Video, Hotstar, and SonyLIV with our exclusive festival promo coupon code.',
      couponCode: 'OTT20',
      buttonText: 'Claim Deal & Browse Plans',
      buttonLink: '/items',
      features: ['⚡ 5-Min WhatsApp Delivery', '🔒 100% Replacement Warranty'],
      delaySeconds: 5
    };
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await ottApi.getPromoModalSettings();
        if (data) setSettings(data);
      } catch (e) {
        console.error(e);
      }
    };
    loadSettings();

    const handleUpdate = () => loadSettings();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isEnabled = settings.isActive !== false && settings.isEnabled !== false;
  const modalTitle = settings.heading || settings.title || 'Unlock Special Discount!';
  const featuresList: string[] = settings.features && settings.features.length > 0 
    ? settings.features 
    : [settings.feature1, settings.feature2].filter(Boolean) as string[];

  useEffect(() => {
    if (!isEnabled) return;
    const hasSeenModal = sessionStorage.getItem('ott_promo_modal_seen');
    if (!hasSeenModal) {
      const delayMs = Math.max(1, (settings.delaySeconds || 5)) * 1000;
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('ott_promo_modal_seen', 'true');
      }, delayMs);
      return () => clearTimeout(timer);
    }
  }, [isEnabled, settings.delaySeconds]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(settings.couponCode || 'OTT20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen || !isEnabled) return null;

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
          {settings.badgeText && (
            <div className="promo-tag-pill">
              <Flame size={14} className="promo-flame" />
              <span>{settings.badgeText}</span>
            </div>
          )}
          <h2 className="promo-modal-title">
            {modalTitle}
          </h2>
          {settings.description && (
            <p className="promo-modal-subtitle">
              {settings.description}
            </p>
          )}
        </div>

        <div className="promo-coupon-container">
          <div className="coupon-code-box">
            <span className="coupon-label">COUPON CODE</span>
            <span className="coupon-code-text">{settings.couponCode || 'OTT20'}</span>
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

        {featuresList.length > 0 && (
          <div className="promo-modal-features">
            {featuresList.map((feat: string, idx: number) => (
              <div key={idx} className="feature-pill">{feat}</div>
            ))}
          </div>
        )}

        <Link 
          to={settings.buttonLink || '/items'} 
          className="btn-claim-deal"
          onClick={() => setIsOpen(false)}
        >
          <span>{settings.buttonText || 'Claim Deal & Browse Plans'}</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
