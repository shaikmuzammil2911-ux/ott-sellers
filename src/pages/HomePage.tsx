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

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadHomeData = async () => {
      setLoading(true);
      const [allProds, trendProds] = await Promise.all([
        ottApi.getProducts(),
        ottApi.getTrendingProducts()
      ]);
      setProducts(allProds);
      setTrending(trendProds);
      setLoading(false);
    };
    loadHomeData();
  }, []);

  return (
    <div className="home-page-wrapper">
      {/* Hero Banner */}
      <HeroSection />

      {/* Main Categories */}
      <MainCategoriesSection />

      {/* Sub Categories Horizontal Pill Carousel */}
      <SubCategoriesSection />

      {/* Trending Items Grid */}
      <TrendingSection products={trending.length > 0 ? trending : products.slice(0, 5)} />

      {/* Popular Products with Category & Price Filter Sidebar */}
      <PopularCategorySection products={products} />

      {/* Special Promotional Offers */}
      <SpecialOffersSection />

      {/* Why Choose OTT Sellers (Trust Pillars) */}
      <WhyChooseUsSection />

      {/* How It Works (4 Simple Steps) */}
      <HowItWorksSection />

      {/* Trust & Quick Action Cards */}
      <TrustSection />
    </div>
  );
};
