import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';

interface TrendingSectionProps {
  products: Product[];
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ products }) => {
  return (
    <section className="section trending-section" id="trending">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <Flame size={24} className="trending-title-icon" color="#ea580c" fill="#ea580c" />
            <span>Trending Items</span>
          </h2>
          <Link to="/catalogs" className="view-all-link">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="product-grid five-cols">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
