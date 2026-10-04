import React from 'react';
import { Search, Calendar, CreditCard, Tv } from 'lucide-react';
import './HowItWorksSection.css';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Choose Your Product',
      desc: 'Browse through Netflix, Prime Video, Disney+ Hotstar, SonyLIV, ZEE5 or Combo bundles.',
      icon: Search
    },
    {
      step: '02',
      title: 'Select Your Plan',
      desc: 'Pick your preferred duration: 1 Month, 3 Months, 6 Months or 1 Year with massive savings.',
      icon: Calendar
    },
    {
      step: '03',
      title: 'Quick & Safe Payment',
      desc: 'Pay instantly via UPI (GPay/PhonePe/Paytm), Cards or Net Banking & upload screenshot.',
      icon: CreditCard
    },
    {
      step: '04',
      title: 'Instant Activation',
      desc: 'Receive active credentials, private profile PIN and login guide on your WhatsApp & Email in minutes.',
      icon: Tv
    }
  ];

  return (
    <section className="section how-it-works-section">
      <div className="container">
        <div className="section-header center-aligned">
          <div className="center-header-content">
            <span className="subtitle-badge">SIMPLE 4-STEP PROCESS</span>
            <h2 className="section-title centered">How It Works</h2>
            <p className="section-subtitle">
              Getting your premium subscription up and streaming is as simple as 1-2-3-4.
            </p>
          </div>
        </div>

        <div className="steps-process-grid">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="step-card">
                <div className="step-number-pill">{item.step}</div>
                <div className="step-icon-box">
                  <Icon size={24} />
                </div>
                <h3 className="step-card-title">{item.title}</h3>
                <p className="step-card-desc">{item.desc}</p>
                {idx < steps.length - 1 && (
                  <div className="step-connector-arrow">→</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
