import React from 'react';
import { Link } from 'react-router-dom';
import { User, ShieldCheck, MessageCircle, ShoppingBag, ChevronRight } from 'lucide-react';
import './TrustSection.css';

export const TrustSection: React.FC = () => {
  const cards = [
    {
      title: 'My Account & Order History',
      desc: 'Track your orders, manage subscriptions',
      to: '/account/orders',
      icon: User,
      bgColor: '#e0f2fe',
      iconColor: '#0284c7'
    },
    {
      title: 'Secure Payment Gateway',
      desc: 'UPI, Cards, Net Banking & More',
      to: '/cart',
      icon: ShieldCheck,
      bgColor: '#d1fae5',
      iconColor: '#10b981'
    },
    {
      title: 'WhatsApp Order Updates',
      desc: 'Get real-time order notifications',
      to: 'https://wa.me/919441323332',
      isExternal: true,
      icon: MessageCircle,
      bgColor: '#dcfce7',
      iconColor: '#25d366'
    },
    {
      title: 'Easy Cart & Checkout',
      desc: 'Add, manage & buy in seconds',
      to: '/cart',
      icon: ShoppingBag,
      bgColor: '#e0f2fe',
      iconColor: '#0284c7'
    }
  ];

  return (
    <section className="section trust-section">
      <div className="container">
        <div className="trust-cards-grid">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            const content = (
              <div className="trust-action-card">
                <div 
                  className="trust-action-icon-box"
                  style={{ backgroundColor: card.bgColor, color: card.iconColor }}
                >
                  <Icon size={24} />
                </div>
                <div className="trust-action-info">
                  <h4 className="trust-action-title">{card.title}</h4>
                  <p className="trust-action-desc">{card.desc}</p>
                </div>
                <ChevronRight size={18} className="trust-action-arrow" />
              </div>
            );

            return card.isExternal ? (
              <a 
                key={idx} 
                href={card.to} 
                target="_blank" 
                rel="noreferrer" 
                className="trust-card-anchor"
              >
                {content}
              </a>
            ) : (
              <Link key={idx} to={card.to} className="trust-card-anchor">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
