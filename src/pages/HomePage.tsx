import React, { useState, useEffect } from 'react';
import { ottApi } from '../services/api';
import { Product } from '../types';
import { HeroSection } from '../components/home/HeroSection';
import { MainCategoriesSection } from '../components/home/MainCategoriesSection';
import { SubCategoriesSection } from '../components/home/SubCategoriesSection';
import { TrendingSection } from '../components/home/TrendingSection';
import { PopularCategorySection } from '../components/home/PopularCategorySection';
import { SpecialOffersSection } from '../components/home/SpecialOffersSection';
import { WhyChooseUsSection } from '../components/home/WhyChooseUsSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { TrustSection } from '../components/home/TrustSection';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);

  // Enable dynamic scroll animations
  useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadHomeData = async () => {
      const [allProds, trendProds] = await Promise.all([
        ottApi.getProducts(),
        ottApi.getTrendingProducts()
      ]);
      setProducts(allProds);
      setTrending(trendProds);
    };
    loadHomeData();
  }, []);

  return (
    <div className="home-page-wrapper">
      {/* Hero Banner with Cinematic Background & Animated Brand Screens */}
      <HeroSection />

      {/* Main Categories with Scroll Animation */}
      <div className="reveal-on-scroll">
        <MainCategoriesSection />
      </div>

      {/* Sub Categories Horizontal Pill Carousel with Scroll Animation */}
      <div className="reveal-on-scroll reveal-delay-1">
        <SubCategoriesSection />
      </div>

      {/* Trending Items Grid with Scroll Animation */}
      <div className="reveal-on-scroll reveal-delay-1">
        <TrendingSection products={trending.length > 0 ? trending : products.slice(0, 5)} />
      </div>

      {/* Popular Products with Category & Price Filter Sidebar with Scroll Animation */}
      <div className="reveal-on-scroll">
        <PopularCategorySection products={products} />
      </div>

      {/* Special Promotional Offers with Scroll Animation */}
      <div className="reveal-on-scroll reveal-delay-1">
        <SpecialOffersSection />
      </div>

      {/* Why Choose OTT Sellers (Trust Pillars) with Scroll Animation */}
      <div className="reveal-on-scroll">
        <WhyChooseUsSection />
      </div>

      {/* How It Works (4 Simple Steps) with Scroll Animation */}
      <div className="reveal-on-scroll">
        <HowItWorksSection />
      </div>

      {/* Trust & Quick Action Cards with Scroll Animation */}
      <div className="reveal-on-scroll">
        <TrustSection />
      </div>
    </div>
  );
};
