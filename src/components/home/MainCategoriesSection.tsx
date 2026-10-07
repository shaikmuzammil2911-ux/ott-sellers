import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { Category } from '../../types';
import { ottApi } from '../../services/api';
import { CategoryCard } from '../common/CategoryCard';
import './MainCategoriesSection.css';

export const MainCategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => 
    ottApi.getCachedCategoriesAdmin().filter(c => c.status !== 'OFF')
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const data = await ottApi.getCategories();
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();

    const handleUpdate = (e: any) => {
      if (!e?.detail || e.detail.entityType === 'categories') {
        setCategories(ottApi.getCachedCategoriesAdmin().filter(c => c.status !== 'OFF'));
        loadCategories();
      }
    };
    window.addEventListener('ott_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ott_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadCategories]);

  return (
    <section className="section main-categories-section" id="categories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <Compass size={22} className="section-title-icon" color="#e50914" />
            <span>Explore Categories</span>
          </h2>
          <Link to="/catalogs" className="view-all-link">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="main-categories-grid">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="category-skeleton-card"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="categories-empty-state">
            <p>No categories available at the moment.</p>
          </div>
        ) : (
          <div className="main-categories-grid">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
