import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Play, Flame } from 'lucide-react';
import './HeroSection.css';

export const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-banner-card">
          {/* Subtle Ambient Glows */}
          <div className="hero-ambient-glow glow-red"></div>
          <div className="hero-ambient-glow glow-blue"></div>

          <div className="hero-grid">
            {/* Left Content Column */}
            <div className="hero-text-col">
              <div className="hero-pill-badge">
                <Sparkles size={14} className="hero-sparkle-icon" />
                <span>Your Entertainment, Our Priority</span>
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
                <span>Movies</span>
                <span className="bullet">•</span>
                <span>Web Series</span>
                <span className="bullet">•</span>
                <span>Live TV</span>
                <span className="bullet">•</span>
                <span>Sports</span>
                <span className="bullet">•</span>
                <span>More</span>
              </div>

              <div className="hero-ctas-row">
                <Link to="/catalogs" className="btn-hero-primary">
                  <span>Shop Now</span>
                  <ArrowRight size={18} />
                </Link>

                <a href="#categories" className="btn-hero-secondary">
                  <span>Explore Categories</span>
                </a>
              </div>

              {/* Instant Trust Micro-points */}
              <div className="hero-trust-bullets">
                <div className="trust-bullet-item">
                  <CheckCircle2 size={16} className="trust-bullet-icon" />
                  <span>Instant WhatsApp Delivery</span>
                </div>
                <div className="trust-bullet-item">
                  <CheckCircle2 size={16} className="trust-bullet-icon" />
                  <span>Full Replacement Warranty</span>
                </div>
              </div>
            </div>

            {/* Right Cinematic Showcase Graphic Column */}
            <div className="hero-media-col">
              <div className="hero-collage-container">
                {/* Streaming Badges Showcase */}
                <div className="streaming-services-floating-grid">
                  <div className="floating-brand-badge brand-netflix">
                    <span className="brand-badge-text">NETFLIX</span>
                    <span className="brand-badge-sub">4K UHD</span>
                  </div>

                  <div className="floating-brand-badge brand-prime">
                    <span className="brand-badge-text">prime video</span>
                    <span className="brand-badge-sub">Included</span>
                  </div>

                  <div className="floating-brand-badge brand-hotstar">
                    <span className="brand-badge-text">Disney+ hotstar</span>
                    <span className="brand-badge-sub">Live Sports</span>
                  </div>

                  <div className="floating-brand-badge brand-zee5">
                    <span className="brand-badge-text">ZEE5</span>
                    <span className="brand-badge-sub">Originals</span>
                  </div>

                  <div className="floating-brand-badge brand-sonyliv">
                    <span className="brand-badge-text">SONY LIV</span>
                    <span className="brand-badge-sub">Champions League</span>
                  </div>

                  <div className="floating-brand-badge brand-youtube">
                    <span className="brand-badge-text">YouTube Premium</span>
                    <span className="brand-badge-sub">Zero Ads</span>
                  </div>
                </div>

                {/* Center Cinema Screen Card */}
                <div className="hero-main-screen-preview">
                  <img
                    src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=900&auto=format&fit=crop&q=80"
                    alt="Cinematic Streaming Showcase"
                    className="hero-screen-img"
                  />
                  <div className="hero-screen-overlay">
                    <div className="hero-play-icon-glow">
                      <Play size={22} fill="#ffffff" color="#ffffff" />
                    </div>
                    <div className="hero-screen-caption">
                      <div className="hero-screen-badge">
                        <Flame size={14} /> Hot Releases
                      </div>
                      <p className="hero-screen-title">5,000+ Movies, Originals & Sports</p>
                    </div>
                  </div>
                </div>

                {/* Floating Discount Pill */}
                <div className="hero-floating-offer-badge">
                  <span className="offer-badge-title">SPECIAL DISCOUNT</span>
                  <span className="offer-badge-value">UP TO 70% OFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
