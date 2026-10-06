import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { getCleanImageUrl } from '../../services/api';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, items } = useCart();
  const navigate = useNavigate();

  const defaultPlan = product.plans.find(p => p.duration === product.defaultPlan) || product.plans[0];
  const isInCart = items.some(i => i.productId === product.id && i.planDuration === defaultPlan.duration);

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, defaultPlan.duration, 1);
  };

  const imgUrl = getCleanImageUrl(product.image, product.updatedAt);

  return (
    <div className="product-card" onClick={handleCardClick} role="button" tabIndex={0}>
      {/* Media Banner with Brand Styling */}
      <div className="product-card-media" style={{ backgroundColor: product.brandColor || '#0b132b' }}>
        <img 
          src={imgUrl} 
          alt={product.name} 
          loading="lazy"
        />
        <div className="product-card-media-overlay">
          <span className="product-card-brand-logo">
            {product.brandLogoText || product.name}
          </span>
        </div>
        
        {/* Discount Badge */}
        {product.badge && (
          <span className="discount-badge">{product.badge}</span>
        )}
      </div>

      {/* Card Content */}
      <div className="product-card-body">
        <Link 
          to={`/product/${product.slug}`} 
          className="product-card-name" 
          onClick={(e) => e.stopPropagation()}
          title={product.name}
        >
          {product.name}
        </Link>
        <span className="product-card-duration">({defaultPlan.duration})</span>

        {/* Rating Row */}
        <div className="product-card-rating">
          <Star size={14} className="star-filled" fill="#f59e0b" color="#f59e0b" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="product-card-rating-count">({(product.reviewsCount / 1000).toFixed(1)}k)</span>
        </div>

        {/* Price Row */}
        <div className="product-card-pricing">
          <span className="selling-price">₹ {defaultPlan.price}</span>
          <span className="original-price">₹ {defaultPlan.originalPrice}</span>
        </div>

        {/* Action Button: Add to Cart */}
        <button 
          type="button" 
          className={`btn-add-cart ${isInCart ? 'added-state' : ''}`}
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          {isInCart ? (
            <>
              <Check size={16} />
              <span>Added In Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
