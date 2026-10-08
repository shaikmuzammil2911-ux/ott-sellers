import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ottApi, DEFAULT_WHATSAPP_SETTINGS } from '../../services/api';
import { WhatsAppSettings } from '../../types';
import './WhatsAppButton.css';

interface WhatsAppButtonProps {
  customMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ customMessage }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [settings, setSettings] = useState<WhatsAppSettings>(DEFAULT_WHATSAPP_SETTINGS);
  const location = useLocation();

  const loadSettings = useCallback(async () => {
    try {
      const data = await ottApi.getWhatsAppSettings();
      if (data) setSettings(data);
    } catch {}
  }, []);

  useEffect(() => {
    loadSettings();

    const handleUpdate = (e: any) => {
      if (!e?.detail || e.detail.entityType === 'whatsapp' || e.detail.entityType === 'settings') {
        loadSettings();
      }
    };
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadSettings]);

  if (settings && !settings.isActive) {
    return null;
  }

  const getWhatsAppMessage = (): string => {
    if (customMessage) return customMessage;

    const path = location.pathname;
    if (path.startsWith('/product/')) {
      const slug = path.replace('/product/', '');
      return `Hi OTT Sellers, I am interested in ${slug.replace(/-/g, ' ')}. Could you assist me with plans and instant activation?`;
    }
    if (path === '/cart') {
      return 'Hi OTT Sellers, I need help with my cart and payment verification.';
    }
    if (path.startsWith('/account/orders/')) {
      const orderId = path.split('/').pop();
      return `Hi OTT Sellers, I need help with Order ${orderId}.`;
    }
    return 'Hi OTT Sellers! I have an enquiry regarding subscription plans and instant delivery.';
  };

  const phone = (settings?.number || '919441323332').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(getWhatsAppMessage())}`;

  return (
    <div className={`floating-whatsapp-container ${settings.position === 'bottom-left' ? 'pos-left' : ''}`}>
      {showTooltip && (
        <div className="whatsapp-tooltip-card">
          <div className="tooltip-header">
            <strong>OTT Sellers Support</strong>
            <button 
              className="tooltip-close" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTooltip(false); }}
            >
              <X size={14} />
            </button>
          </div>
          <p className="tooltip-text">
            {settings.tagMessage || DEFAULT_WHATSAPP_SETTINGS.tagMessage}
          </p>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Chat with OTT Sellers on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
      >
        <MessageCircle size={28} className="whatsapp-icon" />
        <span className="whatsapp-label">{settings.buttonText || 'Chat with Us'}</span>
        <span className="online-indicator"></span>
      </a>
    </div>
  );
};

export default WhatsAppButton;
