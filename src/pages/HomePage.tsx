import React, { useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { MainCategoriesSection } from '../components/home/MainCategoriesSection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { WhyChooseUsSection } from '../components/home/WhyChooseUsSection';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const HomePage: React.FC = () => {
  // Dynamic smooth scroll reveal animations
  useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page-wrapper">
      {/* 1. COMPACT PROMOTIONAL HERO BANNER */}
      <HeroSection />

      {/* 2. CATEGORIES / PRODUCT DISCOVERY */}
      <div className="reveal-on-scroll">
        <MainCategoriesSection />
      </div>

      {/* 3. FEATURED PRODUCTS LISTING */}
      <div className="reveal-on-scroll reveal-delay-1">
        <FeaturedSection />
      </div>

      {/* 4. SHOPPING TRUST & ADVANTAGE */}
      <div className="reveal-on-scroll">
        <WhyChooseUsSection />
      </div>
    </div>
  );
};

export default HomePage;

