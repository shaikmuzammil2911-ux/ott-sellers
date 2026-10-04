import React from 'react';
import { BadgePercent, Zap, ShieldCheck, Headphones } from 'lucide-react';
import './WhyChooseUsSection.css';

export const WhyChooseUsSection: React.FC = () => {
  const trustPoints = [
    {
      icon: BadgePercent,
      title: 'Unbeatable Best Prices',
      desc: 'Save up to 70% compared to official pricing with our direct wholesale bulk volume subscription plans.',
      color: '#0284c7'
    },
    {
      icon: Zap,
      title: 'Lightning Instant Delivery',
      desc: 'No waiting hours! Automated credentials and profile assignment dispatched via WhatsApp & Email within 5-15 mins.',
      color: '#f59e0b'
    },
    {
      icon: ShieldCheck,
      title: '100% Genuine & Safe',
      desc: 'Legitimate personal and family slots with complete duration replacement warranty and zero ban risk.',
      color: '#10b981'
    },
    {
      icon: Headphones,
      title: 'Dedicated WhatsApp Care',
      desc: 'Real human support available 24/7 on WhatsApp for setup troubleshooting, device logins and instant renewals.',
      color: '#25d366'
    }
  ];

  return (
    <section className="section why-choose-section">
      <div className="container">
        <div className="section-header center-aligned">
          <div className="center-header-content">
            <span className="subtitle-badge">THE OTT SELLERS ADVANTAGE</span>
            <h2 className="section-title centered">Why Thousands of Streamers Trust Us</h2>
            <p className="section-subtitle">
              We make premium digital entertainment accessible, affordable, and completely hassle-free.
            </p>
          </div>
        </div>

        <div className="why-choose-grid">
          {trustPoints.map((point, idx) => {
            const Icon = point.icon;
            return (
              <div key={idx} className="why-trust-card">
                <div className="trust-icon-container" style={{ backgroundColor: `${point.color}15`, color: point.color }}>
                  <Icon size={28} />
                </div>
                <h3 className="trust-card-title">{point.title}</h3>
                <p className="trust-card-desc">{point.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
