import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Send } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-content-grid">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-logo-link">
            <img src="/logo.png" alt="OTT Sellers" className="footer-logo-img" />
          </Link>
          <div className="footer-brand-tagline">
            <span className="dash-green">—</span> STREAM MORE. PAY LESS. <span className="dash-blue">—</span>
          </div>
          <p className="footer-desc">
            India's most trusted digital subscription platform. Enjoy verified premium OTT accounts, instant automated credentials delivery, full replacement guarantee and 24/7 dedicated WhatsApp support.
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
            <li><Link to="/">Home</Link></li>
            <li><Link to="/category/movies-series">Categories</Link></li>
            <li><Link to="/catalogs">Catalogs & Bundles</Link></li>
            <li><Link to="/search?q=trending">Trending Offers</Link></li>
            <li><Link to="/account">My Account</Link></li>
            <li><Link to="/account/orders">My Orders</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="footer-col">
          <h4 className="footer-col-title">Customer Support</h4>
          <ul className="footer-links">
            <li><Link to="/account/orders">Track Order Status</Link></li>
            <li><a href="https://wa.me/919441323332" target="_blank" rel="noreferrer">WhatsApp 24/7 Helpline (+91 9441323332)</a></li>
            <li><Link to="/search?q=faq">FAQs & Help Center</Link></li>
            <li><a href="#terms">Terms & Conditions</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#refund">Instant Replacement Policy</a></li>
          </ul>
        </div>

        {/* Social & Payments */}
        <div className="footer-col stay-connected-col">
          <h4 className="footer-col-title">Stay Connected</h4>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-btn" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                <polygon points="10 15 15 12 10 9"/>
              </svg>
            </a>
            <a href="https://t.me" target="_blank" rel="noreferrer" className="social-btn" aria-label="Telegram">
              <Send size={18} />
            </a>
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
          <p>© {new Date().getFullYear()} OTT Sellers. All rights reserved.</p>
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
