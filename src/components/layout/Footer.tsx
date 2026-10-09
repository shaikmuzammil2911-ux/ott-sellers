import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Send } from 'lucide-react';
import { ottApi, DEFAULT_FOOTER_SETTINGS } from '../../services/api';
import { FooterSettings } from '../../types';
import './Footer.css';

export const Footer: React.FC = () => {
  const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);

  const loadFooter = useCallback(async () => {
    try {
      const data = await ottApi.getFooterSettings();
      if (data) setFooter(data);
    } catch {}
  }, []);

  useEffect(() => {
    loadFooter();

    const handleUpdate = (e: any) => {
      if (!e?.detail || e.detail.entityType === 'footer' || e.detail.entityType === 'settings') {
        loadFooter();
      }
    };
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadFooter]);

  const whatsappLink = footer.whatsappNumber 
    ? `https://wa.me/${footer.whatsappNumber.replace(/[^0-9]/g, '')}` 
    : 'https://wa.me/919441323332';

  return (
    <footer className="site-footer">
      <div className="container footer-content-grid">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-logo-link">
            <img src="/logo.png" alt="OTT Sellers" className="footer-logo-img" />
          </Link>
          <div className="footer-brand-tagline">
            <span className="dash-green">—</span> {footer.tagline || 'STREAM MORE. PAY LESS.'} <span className="dash-blue">—</span>
          </div>
          <p className="footer-desc">
            {footer.description || DEFAULT_FOOTER_SETTINGS.description}
          </p>
          <div className="footer-safe-badge">
            <ShieldCheck size={18} className="shield-icon" />
            <span>100% Secure Payments & Genuine Profiles</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            {(footer.quickLinks || DEFAULT_FOOTER_SETTINGS.quickLinks).map((link, idx) => (
              <li key={idx}>
                {link.url.startsWith('http') ? (
                  <a href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
                ) : (
                  <Link to={link.url}>{link.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Support */}
        <div className="footer-col">
          <h4 className="footer-col-title">Customer Support</h4>
          <ul className="footer-links">
            {(footer.customerSupportLinks || DEFAULT_FOOTER_SETTINGS.customerSupportLinks).map((link, idx) => (
              <li key={idx}>
                {link.url.startsWith('http') ? (
                  <a href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
                ) : (
                  <Link to={link.url}>{link.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Social & Payments */}
        <div className="footer-col stay-connected-col">
          <h4 className="footer-col-title">Stay Connected</h4>
          <div className="social-links">
            {footer.socialInstagram && (
              <a href={footer.socialInstagram} target="_blank" rel="noreferrer" className="social-btn" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
            )}
            {footer.socialYoutube && (
              <a href={footer.socialYoutube} target="_blank" rel="noreferrer" className="social-btn" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                  <polygon points="10 15 15 12 10 9"/>
                </svg>
              </a>
            )}
            {footer.socialTelegram && (
              <a href={footer.socialTelegram} target="_blank" rel="noreferrer" className="social-btn" aria-label="Telegram">
                <Send size={18} />
              </a>
            )}
          </div>

          <div className="payment-methods-wrapper">
            <span className="payment-methods-title">We Accept</span>
            <div className="payment-badges-row">
              <span className="pay-badge upi">UPI</span>
              <span className="pay-badge visa">VISA</span>
              <span className="pay-badge mc">Mastercard</span>
              <span className="pay-badge rupay">RuPay</span>
            </div>
          </div>

          <div className="entertainment-badge">
            <span className="badge-script">Entertainment</span>
            <span className="badge-bold">Made Easy</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-container">
          <p>{footer.copyrightText || `© ${new Date().getFullYear()} OTT Sellers. All rights reserved.`}</p>
          <div className="footer-bottom-tagline">
            <span>Binge More</span>
            <span className="dot">•</span>
            <span>Save More</span>
            <span className="dot">•</span>
            <span>OTT Sellers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
