import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Compass, Film, Tv, Trophy, Smile, Crown, Layers 
} from 'lucide-react';
import { Category } from '../../types';
import { ottApi } from '../../services/api';
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

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Film': return <Film size={15} />;
      case 'Tv': return <Tv size={15} />;
      case 'Trophy': return <Trophy size={15} />;
      case 'Smile': return <Smile size={15} />;
      case 'Crown': return <Crown size={15} />;
      default: return <Film size={15} />;
    }
  };

  return (
    <section className="section home-categories-strip-section" id="categories">
      <div className="container">
        <div className="home-categories-header">
          <div className="home-categories-title-wrap">
            <span className="home-categories-dot"></span>
            <h2 className="home-categories-heading">Popular OTT Categories</h2>
          </div>
          <Link to="/items" className="home-categories-view-all">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Compact Horizontal Category Chips Container */}
        <div className="home-categories-chips-scroll">
          <Link to="/items" className="home-category-chip all-chip">
            <Layers size={14} />
            <span>All Subscriptions</span>
          </Link>

          {categories.map((cat) => (
            <Link 
              key={cat.id || cat.slug}
              to={`/items?category=${cat.slug}`}
              className="home-category-chip"
            >
              <span className="chip-icon-wrap" style={{ color: cat.badgeColor || '#0284c7' }}>
                {getCategoryIcon(cat.iconName)}
              </span>
              <span className="chip-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
