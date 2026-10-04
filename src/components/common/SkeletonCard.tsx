import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="product-card" style={{ pointerEvents: 'none' }}>
      <div className="product-card-media skeleton" style={{ minHeight: '160px' }}></div>
      <div className="product-card-body" style={{ gap: '10px' }}>
        <div className="skeleton" style={{ height: '18px', width: '80%', borderRadius: '4px' }}></div>
        <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }}></div>
        <div className="skeleton" style={{ height: '14px', width: '50%', borderRadius: '4px' }}></div>
        <div className="skeleton" style={{ height: '24px', width: '60%', borderRadius: '4px', marginTop: '12px' }}></div>
        <div className="skeleton" style={{ height: '38px', width: '100%', borderRadius: '8px', marginTop: 'auto' }}></div>
      </div>
    </div>
  );
};
