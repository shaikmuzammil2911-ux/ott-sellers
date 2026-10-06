import React, { useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { MainCategoriesSection } from '../components/home/MainCategoriesSection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { HomeCatalogPreview } from '../components/home/HomeCatalogPreview';
import { SpecialOffersSection } from '../components/home/SpecialOffersSection';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const HomePage: React.FC = () => {
  // Dynamic smooth scroll reveal animations
  useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page-wrapper">
      {/* 1. HERO / BANNERS (Cinematic Auto-Sliding Banners with Mobile & Desktop Grand Views) */}
      <HeroSection />

      {/* 2. CATEGORIES (Explore Categories - Simple, Clean, Dynamic Admin Controlled) */}
      <div className="reveal-on-scroll">
        <MainCategoriesSection />
      </div>

      {/* 3. FEATURED / POPULAR (Admin Selected Items Only) */}
      <div className="reveal-on-scroll reveal-delay-1">
        <FeaturedSection />
      </div>

      {/* 4. ITEMS / CATALOG (Clean Preview with Filters + View Full Catalog CTA) */}
      <div className="reveal-on-scroll">
        <HomeCatalogPreview />
      </div>

      {/* 5. 🔥 SPECIAL OFFERS (Admin Selected Offers Only) */}
      <div className="reveal-on-scroll reveal-delay-1">
        <SpecialOffersSection />
      </div>
    </div>
  );
};

export default HomePage;
