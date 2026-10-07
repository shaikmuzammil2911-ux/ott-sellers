import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, PlanDuration, Product, Coupon } from '../types';
import { ottApi } from '../services/api';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, planDuration?: PlanDuration, quantity?: number) => void;
  removeFromCart: (productId: string, planDuration: PlanDuration) => void;
  updateQuantity: (productId: string, planDuration: PlanDuration, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  discountTotal: number;
  totalPrice: number;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  removeCoupon: () => void;
  toastMessage: string | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ott_sellers_cart_v2';
const COUPON_STORAGE_KEY = 'ott_sellers_applied_coupon_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [couponError, setCouponError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {}
  }, [appliedCoupon]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(current => (current === msg ? null : current));
    }, 3000);
  };

  const addToCart = (product: Product, planDuration?: PlanDuration, quantity: number = 1) => {
    const selectedDuration = planDuration || product.defaultPlan || '1 Month';
    const plan = product.plans?.find(p => p.duration === selectedDuration) || product.plans?.[0] || {
      duration: selectedDuration,
      price: product.price || 199,
      originalPrice: product.comparePrice || 499
    };

    const effectivePrice = product.inOffers && product.offerPrice ? product.offerPrice : plan.price;
    const originalPrice = product.inOffers && product.offerOriginalPrice ? product.offerOriginalPrice : plan.originalPrice;

    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === product.id && item.planDuration === selectedDuration
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        showToast(`Updated ${product.name} (${selectedDuration}) quantity in cart!`);
        return next;
      }

      showToast(`Added ${product.name} (${selectedDuration}) to cart!`);
      return [
        ...prev,
        {
          productId: product.id,
          productSlug: product.slug,
          name: product.name,
          image: product.image,
          categoryName: product.categoryName,
          planDuration: selectedDuration,
          price: effectivePrice,
          originalPrice: originalPrice,
          quantity
        }
      ];
    });
  };

  const removeFromCart = (productId: string, planDuration: PlanDuration) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.planDuration === planDuration)));
  };

  const updateQuantity = (productId: string, planDuration: PlanDuration, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, planDuration);
      return;
    }
    setItems(prev =>
      prev.map(i => {
        if (i.productId === productId && i.planDuration === planDuration) {
          return { ...i, quantity };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  // Pricing calculations
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const rawTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const regularDiscount = Math.max(0, subtotal - rawTotal);

  // Calculate Coupon Discount
  let couponDiscount = 0;
  if (appliedCoupon && rawTotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = Math.round((rawTotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
        couponDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      couponDiscount = appliedCoupon.discountValue;
    }
    couponDiscount = Math.min(couponDiscount, rawTotal);
  }

  const totalPrice = Math.max(0, rawTotal - couponDiscount);
  const discountTotal = regularDiscount + couponDiscount;

  const applyCoupon = async (code: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    setCouponError(null);
    if (!code.trim()) {
      const err = 'Please enter a valid coupon code.';
      setCouponError(err);
      return { success: false, error: err };
    }

    try {
      const res = await ottApi.validateCoupon(code, rawTotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponError(null);
        showToast(`Coupon "${res.coupon.code}" applied! You saved ₹${res.discountAmount}.`);
        return { success: true, message: `Coupon applied successfully!` };
      } else {
        const err = res.error || 'Invalid or expired coupon code.';
        setCouponError(err);
        return { success: false, error: err };
      }
    } catch {
      const err = 'Unable to validate coupon at this moment.';
      setCouponError(err);
      return { success: false, error: err };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    showToast('Coupon removed.');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal,
        discountTotal,
        totalPrice,
        appliedCoupon,
        couponDiscount,
        couponError,
        applyCoupon,
        removeCoupon,
        toastMessage,
        dismissToast: () => setToastMessage(null)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
