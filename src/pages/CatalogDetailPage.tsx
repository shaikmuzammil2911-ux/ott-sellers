import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, Layers, Tag, ArrowLeft } from 'lucide-react';
import { ottApi } from '../services/api';
import { Catalog, Product } from '../types';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { ProductCard } from '../components/common/ProductCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import './CatalogsPage.css';

export const CatalogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadCatalogDetails = async () => {
      if (!slug) return;
      setLoading(true);
      const cat = await ottApi.getCatalogBySlug(slug);
      if (cat) {
        setCatalog(cat);
        const prods = await ottApi.getProductsForCatalog(cat.slug);
        setProducts(prods);
      }
      setLoading(false);
    };

    loadCatalogDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p>Loading catalog items...</p>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Catalog Not Found</h2>
        <p>We could not find the catalog collection you requested.</p>
        <Link to="/catalogs" className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Catalogs
        </Link>
      </div>
    );
  }

  return (
    <div className="catalog-detail-page">
      <div className="container">
        <Breadcrumb
          items={[
            { label: 'Catalogs', to: '/catalogs' },
            { label: catalog.name }
          ]}
        />

        {/* Catalog Banner */}
        <div 
          className="catalog-detail-banner"
          style={{ backgroundImage: `url(${catalog.image})` }}
        >
          <div className="catalog-detail-overlay">
            <div className="catalog-badge-row">
              <span className="detail-badge-pill">
                <Sparkles size={14} /> {catalog.badge}
              </span>
              <span className="detail-discount-chip">
                <Tag size={14} /> {catalog.discountText}
              </span>
            </div>

            <h1 className="catalog-detail-title">{catalog.name}</h1>
            <p className="catalog-detail-desc">{catalog.longDescription}</p>

            <div className="catalog-meta-row">
              <span className="meta-item">
                <Layers size={16} /> {products.length} Handpicked Subscriptions
              </span>
            </div>
          </div>
        </div>

        {/* Back Link & Title */}
        <div className="catalog-products-header">
          <Link to="/catalogs" className="back-link">
            <ArrowLeft size={16} />
            <span>All Catalogs</span>
          </Link>
          <h2 className="catalog-section-subhead">
            Available Subscriptions in this Catalog
          </h2>
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {products.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
};
