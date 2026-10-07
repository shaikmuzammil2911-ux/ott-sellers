import { Coupon } from '../types';

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'OTT20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 299,
    maxDiscount: 200,
    description: 'Flat 20% OFF on all orders above ₹299',
    isActive: true
  },
  {
    id: 'cpn-2',
    code: 'SAVE10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 199,
    maxDiscount: 100,
    description: '10% OFF on minimum order ₹199',
    isActive: true
  },
  {
    id: 'cpn-3',
    code: 'WELCOME50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 349,
    description: 'Flat ₹50 OFF for new customers',
    isActive: true
  },
  {
    id: 'cpn-4',
    code: 'BINGE100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 699,
    description: 'Flat ₹100 OFF on bundles and long-term plans',
    isActive: true
  }
];
