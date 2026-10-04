import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Play, Flame, ShieldCheck, Zap } from 'lucide-react';
import './HeroSection.css';

export const HeroSection: React.FC = () => {
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  const streamingBrands = [
    {
      id: 'netflix',
      name: 'NETFLIX',
      sub: '4K Ultra HD',
      color: '#e50914',
      badgeClass: 'screen-netflix',
      link: '/category/netflix',
      offer: '20% OFF'
    },
    {
      id: 'prime',
      name: 'prime video',
      sub: 'Included With Fast Activation',
      color: '#00A8E1',
      badgeClass: 'screen-prime',
      link: '/category/amazon-prime',
      offer: '15% OFF'
    },
    {
      id: 'hotstar',
      name: 'Disney+ hotstar',
      sub: 'Live Cricket & HBO',
      color: '#0c3b8a',
      badgeClass: 'screen-hotstar',
      link: '/category/disney-hotstar',
      offer: '18% OFF'
    },
    {
      id: 'zee5',
      name: 'ZEE5',
      sub: 'Originals & Regional',
      color: '#8E24AA',
      badgeClass: 'screen-zee5',
      link: '/category/zee5',
      offer: '16% OFF'
    },
    {
      id: 'sonyliv',
      name: 'SONY LIV',
      sub: 'Champions League & WWE',
      color: '#002B49',
      badgeClass: 'screen-sonyliv',
      link: '/category/sonyliv',
      offer: '10% OFF'
    },
    {
      id: 'youtube',
      name: 'YouTube Premium',
      sub: 'Zero Ads + Music',
      color: '#FF0000',
      badgeClass: 'screen-youtube',
      link: '/category/youtube-premium',
      offer: '12% OFF'
    }
  ];

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-banner-card cinematic-bg-container">
          {/* Animated Light Sweep Effect */}
          <div className="hero-light-sweep"></div>
          
          {/* Ambient Glow Orbs */}
          <div className="hero-ambient-orb orb-red"></div>
          <div className="hero-ambient-orb orb-blue"></div>
          <div className="hero-ambient-orb orb-gold"></div>

          {/* Left Dark Gradient Overlay for Maximum Readability */}
          <div className="hero-content-gradient-overlay"></div>

          <div className="hero-grid">
            {/* Left Content Column */}
            <div className="hero-text-col">
              <div className="hero-pill-badge animated-badge">
                <Sparkles size={14} className="hero-sparkle-icon" />
                <span>Your Entertainment, Our Priority</span>
                <span className="live-pulse-dot"></span>
              </div>

              <h1 className="hero-title">
                All Your Favourite{' '}
                <span className="ott-brand-letters">
                  <span className="letter-o">O</span>
                  <span className="letter-t1">T</span>
                  <span className="letter-t2">T</span>
                </span>{' '}
                Subscriptions in One Place
              </h1>

              <div className="hero-genre-tags">
                <span className="genre-pill">Movies</span>
                <span className="bullet">•</span>
                <span className="genre-pill">Web Series</span>
                <span className="bullet">•</span>
                <span className="genre-pill">Live TV</span>
                <span className="bullet">•</span>
                <span className="genre-pill">Sports</span>
                <span className="bullet">•</span>
                <span className="genre-pill">More</span>
              </div>

              <div className="hero-ctas-row">
                <Link to="/catalogs" className="btn-hero-primary animated-cta">
                  <span>Shop Now</span>
                  <ArrowRight size={18} className="cta-arrow" />
                </Link>

                <a href="#categories" className="btn-hero-secondary">
                  <span>Explore Categories</span>
                </a>
              </div>

              {/* Instant Trust Micro-points */}
              <div className="hero-trust-bullets">
                <div className="trust-bullet-item">
                  <Zap size={16} className="trust-bullet-icon zap" />
                  <span>Instant WhatsApp Delivery</span>
                </div>
                <div className="trust-bullet-item">
                  <ShieldCheck size={16} className="trust-bullet-icon shield" />
                  <span>Full Replacement Warranty</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Animated Screens Area */}
            <div className="hero-interactive-screens-col">
              {/* Floating Animated OTT Brand Screen Cards */}
              <div className="interactive-screen-overlays">
                {streamingBrands.map((brand, idx) => (
                  <Link
                    key={brand.id}
                    to={brand.link}
                    className={`floating-screen-badge ${brand.badgeClass} ${activeBrand === brand.id ? 'hovered' : ''}`}
                    onMouseEnter={() => setActiveBrand(brand.id)}
                    onMouseLeave={() => setActiveBrand(null)}
                    style={{ animationDelay: `${idx * 0.25}s` }}
                  >
                    <div className="badge-glow-ring"></div>
                    <span className="floating-badge-logo">{brand.name}</span>
                    <span className="floating-badge-offer">{brand.offer}</span>
                  </Link>
                ))}
              </div>

              {/* Floating Center Badge with 3D Hover & Pulsing Glow */}
              <div className="hero-floating-offer-badge animated-floating-badge">
                <div className="floating-badge-inner">
                  <span className="offer-badge-title">SPECIAL DISCOUNT</span>
                  <span className="offer-badge-value">UP TO 70% OFF</span>
                  <span className="offer-badge-subtext">Instant WhatsApp Activation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live Streaming Ticker Strip */}
          <div className="hero-bottom-ticker">
            <div className="ticker-track">
              <span className="ticker-item"><Flame size={13} color="#f97316" /> 240+ Subscriptions Activated Today</span>
              <span className="ticker-dot">•</span>
              <span className="ticker-item"><Zap size={13} color="#38bdf8" /> Average Dispatch Speed: 5-15 Mins</span>
              <span className="ticker-dot">•</span>
              <span className="ticker-item"><ShieldCheck size={13} color="#22c55e" /> 100% Genuine Profiles with PIN Lock</span>
              <span className="ticker-dot">•</span>
              <span className="ticker-item"><Sparkles size={13} color="#f59e0b" /> 50,000+ Verified Customers Nationwide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
