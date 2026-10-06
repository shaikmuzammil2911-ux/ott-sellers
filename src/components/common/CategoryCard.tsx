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

  return (
    <Link 
      to={`/category/${category.slug}`} 
      className="main-category-card"
      style={{ backgroundImage: bgImage ? `url(${bgImage})` : undefined }}
    >
      <div className="category-card-overlay" style={{ background: category.bgGradient }}>
        <div className="category-icon-wrapper" style={{ backgroundColor: category.badgeColor }}>
          {getIcon()}
        </div>

        <div className="category-card-info">
          <h3 className="category-card-title">{category.name}</h3>
          <p className="category-card-count">{category.titlesCount}</p>
        </div>

        <div className="category-arrow-btn" aria-hidden="true">
          <ChevronRight size={18} />
        </div>
      </div>
    </Link>
  );
};
