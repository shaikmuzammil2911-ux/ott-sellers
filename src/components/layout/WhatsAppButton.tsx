import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './WhatsAppButton.css';

interface WhatsAppButtonProps {
  customMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ customMessage }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const location = useLocation();

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

  const phone = '919876543210';
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(getWhatsAppMessage())}`;

  return (
    <div className="floating-whatsapp-container">
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
            Need instant help or quick subscription activation? Chat with us live on WhatsApp!
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
        <span className="whatsapp-label">Chat with Us</span>
        <span className="online-indicator"></span>
      </a>
    </div>
  );
};
