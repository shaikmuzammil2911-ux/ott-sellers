import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles, Flame, ArrowRight } from 'lucide-react';
import './SpecialOffersSection.css';

export const SpecialOffersSection: React.FC = () => {
  const offers = [
    {
      id: 'offer-1',
      badge: 'LIMITED TIME OFFER',
      badgeColor: '#e50914',
      title: 'Save up to 45% on 12-Month Plans',
      desc: 'Lock in uninterrupted 4K Ultra HD streaming for a full year with our extended warranty guarantee.',
      linkTo: '/category/movies-series',
      btnText: 'View 1 Year Plans',
      icon: Flame,
      bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)'
    },
    {
      id: 'offer-2',
      badge: 'BEST VALUE',
      badgeColor: '#0284c7',
      title: 'Quarterly Binge Packs (3 Months)',
      desc: 'Most popular choice! Enjoy maximum flexibility, instant activation, and huge savings compared to retail.',
      linkTo: '/product/netflix-premium',
      btnText: 'Explore Netflix 3M',
      icon: Sparkles,
      bgGradient: 'linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)'
    },
    {
      id: 'offer-3',
      badge: 'MEGA COMBO BUNDLE',
      badgeColor: '#f59e0b',
      title: '4-in-1 Entertainment Super Pack',
      desc: 'Netflix + Prime Video + Disney+ Hotstar + SonyLIV bundled together in one easy monthly recharge.',
      linkTo: '/product/ultimate-binge-combo',
      btnText: 'Grab Combo Pack',
      icon: Tag,
      bgGradient: 'linear-gradient(135deg, #451a03 0%, #1c1917 100%)'
    }
  ];

  return (
    <section className="section special-offers-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span className="bar-indicator"></span>
            <span>Special Promotional Offers</span>
          </h2>
          <Link to="/catalogs" className="view-all-link">
            <span>View All Bundles</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="special-offers-grid">
          {offers.map(offer => {
            const Icon = offer.icon;
            return (
              <div 
                key={offer.id} 
                className="special-offer-card"
                style={{ background: offer.bgGradient }}
              >
                <div className="offer-badge-header">
                  <span className="offer-tag-badge" style={{ backgroundColor: offer.badgeColor }}>
                    <Icon size={13} />
                    <span>{offer.badge}</span>
                  </span>
                </div>

                <div className="offer-card-body">
                  <h3 className="offer-card-title">{offer.title}</h3>
                  <p className="offer-card-desc">{offer.desc}</p>
                </div>

                <Link to={offer.linkTo} className="offer-action-btn">
                  <span>{offer.btnText}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
