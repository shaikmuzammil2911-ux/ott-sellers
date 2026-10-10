import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Star } from 'lucide-react';
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

  const imgUrl = getCleanImageUrl(product.image, product.updatedAt) || '/placeholder-ott.png';
  const effectivePrice = product.inOffers && product.offerPrice ? product.offerPrice : defaultPlan.price;
  const originalPrice = product.inOffers && product.offerOriginalPrice ? product.offerOriginalPrice : defaultPlan.originalPrice;
  const savings = originalPrice > effectivePrice ? originalPrice - effectivePrice : 0;

  return (
    <div className="product-card" onClick={handleCardClick} role="button" tabIndex={0}>
      {/* 1. Large 1:1 Square Product Image */}
      <div className="product-card-media" style={{ backgroundColor: product.brandColor || '#0b132b' }}>
        <img 
          src={imgUrl} 
          alt={product.name} 
          loading="lazy"
        />
        
        {/* Discount / Savings Badge or Out of Stock Badge */}
        {!product.inStock ? (
          <span className="out-of-stock-badge" style={{ position: 'absolute', top: '8px', right: '8px', background: '#dc2626', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', zIndex: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Out of Stock
          </span>
        ) : savings > 0 ? (
          <span className="discount-badge">
            Save ₹{savings}
          </span>
        ) : null}
      </div>

      {/* 2. Compact Body: Name, Category, Pricing, Add to Cart */}
      <div className="product-card-body">
        {/* Category & Provider Pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
          <span className="product-card-category-tag">
            {product.categoryName || 'OTT Subscription'}
          </span>
          {product.providerName && (
            <span style={{ fontSize: '0.68rem', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              {product.providerName}
            </span>
          )}
        </div>

        {/* Item Name */}
        <Link 
          to={`/product/${product.slug}`} 
          className="product-card-name" 
          onClick={(e) => e.stopPropagation()}
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Pricing Row: Our Price & Actual Strikethrough Price */}
        <div className="product-card-pricing-block">
          <div className="product-card-pricing">
            <span className="selling-price">₹{effectivePrice}</span>
            {originalPrice > effectivePrice && (
              <span className="original-price">₹{originalPrice}</span>
            )}
          </div>
          {savings > 0 && (
            <span className="you-saved-text">You Save ₹{savings}</span>
          )}
        </div>

        {/* Action Button: Add to Cart / Out of Stock */}
        <button 
          type="button" 
          className={`btn-add-cart ${isInCart ? 'added-state' : ''} ${!product.inStock ? 'out-of-stock' : ''}`}
          onClick={product.inStock ? handleAddToCart : (e) => e.stopPropagation()}
          disabled={!product.inStock}
          aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
          style={!product.inStock ? { background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', border: '1px solid #cbd5e1' } : undefined}
        >
          {!product.inStock ? (
            <span>Out of Stock</span>
          ) : isInCart ? (
            <>
              <Check size={14} />
              <span>In Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart size={14} />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
