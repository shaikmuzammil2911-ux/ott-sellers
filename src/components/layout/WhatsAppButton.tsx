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
        aria-label="Contact us on WhatsApp"
        title="Contact us on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
      >
        {/* Official WhatsApp Brand SVG Icon */}
        <svg 
          viewBox="0 0 24 24" 
          width="26" 
          height="26" 
          fill="currentColor" 
          className="whatsapp-icon"
          aria-hidden="true"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        <span className="whatsapp-label">{settings.buttonText || 'Contact on WhatsApp'}</span>
        <span className="online-indicator"></span>
      </a>
    </div>
  );
};

export default WhatsAppButton;
