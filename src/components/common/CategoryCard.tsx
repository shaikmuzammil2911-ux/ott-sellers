import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Film, Tv, Trophy, Smile, Crown } from 'lucide-react';
import { Category } from '../../types';
import { getCleanImageUrl } from '../../services/api';
import './CategoryCard.css';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const getIcon = () => {
    switch (category.iconName) {
      case 'Film':
        return <Film size={22} />;
      case 'Tv':
        return <Tv size={22} />;
      case 'Trophy':
        return <Trophy size={22} />;
      case 'Smile':
        return <Smile size={22} />;
      case 'Crown':
        return <Crown size={22} />;
      default:
        return <Film size={22} />;
    }
  };

  const bgImage = getCleanImageUrl(category.image, category.updatedAt);
  const overlayGradient = category.bgGradient || 'linear-gradient(135deg, rgba(7, 13, 30, 0.85) 0%, rgba(15, 23, 42, 0.9) 100%)';

  return (
    <Link 
      to={`/category/${category.slug}`} 
      className="main-category-card"
      style={{ 
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundColor: '#070d1e'
      }}
    >
      <div className="category-card-overlay" style={{ background: overlayGradient }}>
        <div className="category-icon-wrapper" style={{ backgroundColor: category.badgeColor || '#0284c7' }}>
          {getIcon()}
        </div>

        <div className="category-card-info">
          <h3 className="category-card-title">{category.name}</h3>
          <p className="category-card-count">{category.titlesCount || 'Multiple Plans'}</p>
        </div>

        <div className="category-arrow-btn" aria-hidden="true">
          <ChevronRight size={18} />
        </div>
      </div>
    </Link>
  );
};
