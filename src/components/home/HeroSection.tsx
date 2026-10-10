import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Play
} from 'lucide-react';
import { HeroBanner } from '../../types';
import { ottApi, getCleanImageUrl } from '../../services/api';
import './HeroSection.css';

export const HeroSection: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const autoPlayRef = useRef<any>(null);

  // Load banners dynamically from API / storage
  const loadBanners = useCallback(async () => {
    try {
      const data = await ottApi.getBanners();
      if (data && data.length > 0) {
        setBanners(data);
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
    }
  }, []);

  useEffect(() => {
    loadBanners();

    // Listen for live admin updates and storage events
    const handleUpdate = () => loadBanners();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('resize', handleResize);
    };
  }, [loadBanners]);

  // Next / Prev slide handlers
  const handleNext = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % banners.length);
  }, [banners.length]);

  const handlePrev = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Auto-scrolling logic with loop & pause-on-hover
  useEffect(() => {
    if (banners.length <= 1 || isPaused) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 5500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [banners.length, isPaused, handleNext]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (diff > minSwipeDistance) {
      handleNext(); // Swiped left -> next
    } else if (diff < -minSwipeDistance) {
      handlePrev(); // Swiped right -> prev
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  if (!banners || banners.length === 0) {
    return (
      <section className="hero-section">
        <div className="container">
          <div className="hero-banner-card hero-skeleton-card">
            <div className="hero-skeleton-loader"></div>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex] || banners[0];
  const activeBg = isMobile 
    ? (currentBanner.mobileImage || currentBanner.desktopImage) 
    : currentBanner.desktopImage;

  const bgUrl = getCleanImageUrl(activeBg, currentBanner.updatedAt);

  return (
    <section 
      className="hero-section" 
      aria-label="OTT Streaming Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <div 
          className={`hero-banner-card mode-${currentBanner.mode || 'image-only'}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            backgroundColor: currentBanner.mode === 'solid-color' 
              ? (currentBanner.solidColor || '#070d1e') 
              : '#070d1e'
          }}
        >
          {/* Background Image Layer */}
          {currentBanner.mode !== 'solid-color' && (
            <div 
              className={`hero-bg-media-layer ${currentBanner.mode === 'image-blur' ? 'is-blurred' : 'is-sharp'}`}
              style={{
                backgroundImage: `url(${bgUrl})`
              }}
            >
              {/* Responsive <img> tag for optimal SEO and browser decoding */}
              <img 
                src={bgUrl} 
                alt={currentBanner.title || 'OTT Sellers Banner'} 
                className="hero-media-preload"
                loading="eager"
              />
            </div>
          )}

          {/* Readability treatment only when text is enabled */}
          {currentBanner.showText !== false && currentBanner.mode !== 'solid-color' && (
            <div className={`hero-readability-scrim align-${currentBanner.textPosition || 'left'}`}></div>
          )}

          {/* Animated Light Sheen Sweep Effect */}
          <div className="hero-light-sweep" aria-hidden="true"></div>

          {/* Ambient Glow Orbs */}
          <div className="hero-ambient-orb orb-red" aria-hidden="true"></div>
          <div className="hero-ambient-orb orb-blue" aria-hidden="true"></div>
          <div className="hero-ambient-orb orb-gold" aria-hidden="true"></div>

          {/* Slide Main Content */}
          <div className={`hero-slide-wrapper text-${currentBanner.textPosition || 'left'}`}>
            {currentBanner.showText !== false && (
              <div className="hero-content-box">
                {currentBanner.badgeText && (
                  <div 
                    className="hero-pill-badge animated-badge"
                    style={currentBanner.badgeColor ? { color: currentBanner.badgeColor, borderColor: currentBanner.badgeColor } : undefined}
                  >
                    <Sparkles size={14} className="hero-sparkle-icon" />
                    <span>{currentBanner.badgeText}</span>
                    <span className="live-pulse-dot" style={currentBanner.badgeColor ? { backgroundColor: currentBanner.badgeColor } : undefined}></span>
                  </div>
                )}

                <h1 
                  className="hero-title"
                  style={currentBanner.titleColor ? { color: currentBanner.titleColor } : undefined}
                >
                  {currentBanner.title}
                </h1>

                {currentBanner.subtitle && (
                  <p 
                    className="hero-subtitle"
                    style={currentBanner.subtitleColor ? { color: currentBanner.subtitleColor } : undefined}
                  >
                    {currentBanner.subtitle}
                  </p>
                )}

                {currentBanner.description && (
                  <p 
                    className="hero-description-note"
                    style={{
                      margin: '4px 0 10px',
                      fontSize: '0.82rem',
                      color: currentBanner.descriptionColor || '#94a3b8'
                    }}
                  >
                    {currentBanner.description}
                  </p>
                )}

                {/* Action CTA Buttons */}
                <div className="hero-ctas-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
                  {/* If custom buttons array configured */}
                  {currentBanner.buttons && currentBanner.buttons.length > 0 ? (
                    currentBanner.buttons.map(btn => {
                      const isExternal = btn.link.startsWith('http');
                      const customStyle = {
                        backgroundColor: btn.bgColor || currentBanner.btnBgColor || '#0284c7',
                        color: btn.textColor || currentBanner.btnTextColor || '#ffffff',
                        borderColor: btn.borderColor || currentBanner.btnBorderColor || 'transparent'
                      };
                      if (isExternal) {
                        return (
                          <a
                            key={btn.id}
                            href={btn.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-hero-primary animated-cta"
                            style={customStyle}
                          >
                            <span>{btn.label}</span>
                            <ArrowRight size={15} className="cta-arrow" />
                          </a>
                        );
                      }
                      return (
                        <Link
                          key={btn.id}
                          to={btn.link}
                          className="btn-hero-primary animated-cta"
                          style={customStyle}
                        >
                          <span>{btn.label}</span>
                          <ArrowRight size={15} className="cta-arrow" />
                        </Link>
                      );
                    })
                  ) : (
                    <>
                      {currentBanner.ctaText && (
                        <Link 
                          to={currentBanner.ctaLink || '/items'} 
                          className="btn-hero-primary animated-cta"
                          style={{
                            backgroundColor: currentBanner.btnBgColor || '#0284c7',
                            color: currentBanner.btnTextColor || '#ffffff',
                            borderColor: currentBanner.btnBorderColor || 'transparent'
                          }}
                        >
                          <span>{currentBanner.ctaText}</span>
                          <ArrowRight size={15} className="cta-arrow" />
                        </Link>
                      )}

                      {currentBanner.secondaryCtaText && (
                        <a 
                          href={currentBanner.secondaryCtaLink || '#categories'} 
                          className="btn-hero-secondary"
                        >
                          <Play size={13} className="play-icon" />
                          <span>{currentBanner.secondaryCtaText}</span>
                        </a>
                      )}
                    </>
                  )}

                  {/* Instant Trust Micro-points */}
                  <div className="hero-trust-bullets">
                    <div className="trust-bullet-item">
                      <Zap size={13} className="trust-bullet-icon zap" />
                      <span>Instant WhatsApp Delivery</span>
                    </div>
                    <div className="trust-bullet-item">
                      <ShieldCheck size={13} className="trust-bullet-icon shield" />
                      <span>Full Duration Warranty</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation Arrows */}
          {banners.length > 1 && (
            <div className="hero-slider-arrows desktop-only">
              <button 
                type="button" 
                className="hero-arrow-btn prev-btn" 
                onClick={handlePrev}
                aria-label="Previous Slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                type="button" 
                className="hero-arrow-btn next-btn" 
                onClick={handleNext}
                aria-label="Next Slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Pagination Indicators / Dots */}
          {banners.length > 1 && (
            <div className="hero-pagination-dots" role="tablist">
              {banners.map((b, idx) => (
                <button
                  key={b.id || idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentIndex}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`pagination-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <span className="dot-fill"></span>
                </button>
              ))}
            </div>
          )}

          {/* Bottom Live Streaming Ticker Strip */}
          <div className="hero-bottom-ticker">
            <div className="ticker-track">
              <span className="ticker-item"><Flame size={13} color="#f97316" /> 240+ Subscriptions Activated Today</span>
              <span className="ticker-dot">•</span>
              <span className="ticker-item"><Zap size={13} color="#38bdf8" /> Instant Dispatch: 5-15 Mins</span>
              <span className="ticker-dot">•</span>
              <span className="ticker-item"><ShieldCheck size={13} color="#22c55e" /> 100% Genuine Profiles with PIN Lock</span>
              <span className="ticker-dot">•</span>
              <span className="ticker-item"><Sparkles size={13} color="#f59e0b" /> 50,000+ Happy Streamers Nationwide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
