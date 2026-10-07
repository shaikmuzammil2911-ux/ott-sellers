import React, { useEffect, useState, useCallback } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { MainCategoriesSection } from '../components/home/MainCategoriesSection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { CoursesSection } from '../components/home/CoursesSection';
import { CustomerReviewsSection } from '../components/home/CustomerReviewsSection';
import { WhyChooseUsSection } from '../components/home/WhyChooseUsSection';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ottApi } from '../services/api';
import { HomepageSectionCMS } from '../types';

export const HomePage: React.FC = () => {
  useScrollReveal();
  const [sections, setSections] = useState<HomepageSectionCMS[]>(() => ottApi.getCachedSectionsAdmin());

  const loadSections = useCallback(async () => {
    try {
      const data = await ottApi.getHomepageSections();
      if (data && data.length > 0) {
        setSections(data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadSections();

    const handleUpdate = () => loadSections();
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadSections]);

  // Section Renderer Map
  const renderSection = (sec: HomepageSectionCMS) => {
    if (!sec.isActive) return null;

    switch (sec.sectionKey) {
      case 'hero':
        return <HeroSection key={sec.id || 'hero'} />;
      case 'categories':
        return (
          <div key={sec.id || 'categories'} className="reveal-on-scroll">
            <MainCategoriesSection />
          </div>
        );
      case 'featured':
        return (
          <div key={sec.id || 'featured'} className="reveal-on-scroll reveal-delay-1">
            <FeaturedSection />
          </div>
        );
      case 'courses':
        return (
          <div key={sec.id || 'courses'} className="reveal-on-scroll">
            <CoursesSection />
          </div>
        );
      case 'reviews':
        return (
          <div key={sec.id || 'reviews'} className="reveal-on-scroll">
            <CustomerReviewsSection />
          </div>
        );
      case 'why_choose_us':
        return (
          <div key={sec.id || 'why_choose_us'} className="reveal-on-scroll">
            <WhyChooseUsSection />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="home-page-wrapper">
      {sections.map(sec => renderSection(sec))}
    </div>
  );
};

export default HomePage;
