import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { SUBCATEGORIES_DATA } from '../../data/categoriesData';
import './SubCategoriesSection.css';

export const SubCategoriesSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="section subcategories-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span className="bar-indicator"></span>
            <span>Sub Categories</span>
          </h2>
          <div className="carousel-nav-arrows">
            <button 
              type="button" 
              className="carousel-arrow-btn" 
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              type="button" 
              className="carousel-arrow-btn" 
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="subcategories-carousel-wrapper" ref={scrollRef}>
          {SUBCATEGORIES_DATA.map((sub) => (
            <Link
              key={sub.id}
              to={`/category/${sub.slug}`}
              className="subcategory-pill-card"
            >
              <div 
                className="sub-pill-logo-box" 
                style={{ backgroundColor: sub.brandColor }}
              >
                <span className="sub-pill-initial">
                  {sub.name.charAt(0)}
                </span>
              </div>
              <span className="sub-pill-name">{sub.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
