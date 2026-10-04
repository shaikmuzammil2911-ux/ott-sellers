import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES_DATA } from '../../data/categoriesData';
import { CategoryCard } from '../common/CategoryCard';
import './MainCategoriesSection.css';

export const MainCategoriesSection: React.FC = () => {
  return (
    <section className="section main-categories-section" id="categories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span className="bar-indicator"></span>
            <span>Main Categories</span>
          </h2>
          <Link to="/catalogs" className="view-all-link">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="main-categories-grid">
          {CATEGORIES_DATA.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
};
