import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';
import { ottApi } from '../services/api';
import { Catalog } from '../types';
import { Breadcrumb } from '../components/common/Breadcrumb';
import './CatalogsPage.css';

export const CatalogsPage: React.FC = () => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadCatalogs = async () => {
      setLoading(true);
      const data = await ottApi.getCatalogs();
      setCatalogs(data);
      setLoading(false);
    };
    loadCatalogs();
  }, []);

  return (
    <div className="catalogs-page">
      <div className="container">
        <Breadcrumb items={[{ label: 'Catalogs & Collections' }]} />

        <div className="catalogs-page-hero">
          <div className="catalogs-hero-badge">
            <Sparkles size={14} />
            <span>Curated Streaming Collections</span>
          </div>
          <h1 className="catalogs-page-title">Explore Subscription Catalogs</h1>
          <p className="catalogs-page-desc">
            Browse our specially curated packs tailored for entertainment lovers, live sports enthusiasts, families, and digital creators.
          </p>
        </div>

        {loading ? (
          <div className="catalogs-grid">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="catalog-card-skeleton skeleton" style={{ height: '360px' }}></div>
            ))}
          </div>
        ) : (
          <div className="catalogs-grid">
            {catalogs.map(catalog => (
              <div key={catalog.id} className="catalog-overview-card">
                <div 
                  className="catalog-card-media"
                  style={{ backgroundImage: `url(${catalog.image})` }}
                >
                  <div className="catalog-card-overlay">
                    <span className="catalog-badge-pill">{catalog.badge}</span>
                    <span className="catalog-savings-pill">{catalog.discountText}</span>
                  </div>
                </div>

                <div className="catalog-card-body">
                  <div className="catalog-count-row">
                    <Layers size={15} />
                    <span>{catalog.productCount} Premium Services Included</span>
                  </div>

                  <h3 className="catalog-card-title">{catalog.name}</h3>
                  <p className="catalog-card-desc">{catalog.description}</p>

                  <Link to={`/catalog/${catalog.slug}`} className="btn-explore-catalog">
                    <span>Explore Catalog</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
