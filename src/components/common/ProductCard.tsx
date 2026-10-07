import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, Zap } from 'lucide-react';
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

  const defaultPlan = product.plans?.[0] || {
    duration: product.defaultPlan || '1 Month',
    price: product.price || 199,
    originalPrice: product.comparePrice || 499,
    discountPercentage: 0
  };

  const isInCart = items.some(i => i.productId === product.id && i.planDuration === defaultPlan.duration);

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, defaultPlan.duration, 1);
  };

  const imgUrl = getCleanImageUrl(product.image, product.updatedAt);
  const effectivePrice = product.inOffers && product.offerPrice ? product.offerPrice : defaultPlan.price;
  const originalPrice = product.inOffers && product.offerOriginalPrice ? product.offerOriginalPrice : defaultPlan.originalPrice;

  return (
    <div className="product-card" onClick={handleCardClick} role="button" tabIndex={0}>
      {/* 1. Large 1:1 Square Product Image (Main Visual Focus) */}
      <div className="product-card-media" style={{ backgroundColor: product.brandColor || '#0b132b' }}>
        <img 
          src={imgUrl} 
          alt={product.name} 
          loading="lazy"
        />
        
        {/* Subtle Brand Watermark */}
        <div className="product-card-media-overlay">
          <span className="product-card-brand-logo">
            {product.brandLogoText || product.name.split(' ')[0]}
          </span>
        </div>
        
        {/* Discount Badge */}
        {(product.badge || (originalPrice > effectivePrice)) && (
          <span className="discount-badge">
            {product.badge || `${Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)}% OFF`}
          </span>
        )}
      </div>

      {/* 2. Card Body: Name -> Price -> Action */}
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
          <Star size={13} className="star-filled" fill="#f59e0b" color="#f59e0b" />
          <span>{product.rating ? product.rating.toFixed(1) : '4.9'}</span>
          <span className="product-card-rating-count">({((product.reviewsCount || 120) / 100).toFixed(1)}k)</span>
        </div>

        {/* Price Row (Compact Amount) */}
        <div className="product-card-pricing">
          <span className="selling-price">₹ {effectivePrice}</span>
          {originalPrice > effectivePrice && (
            <span className="original-price">₹ {originalPrice}</span>
          )}
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
              <Check size={15} />
              <span>Added In Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart size={15} />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
