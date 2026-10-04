import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, PlanDuration, Product } from '../types';

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
  toastMessage: string | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ott_sellers_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [
      {
        productId: 'prod-netflix-premium',
        productSlug: 'netflix-premium',
        name: 'Netflix Premium',
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
        categoryName: 'Movies & Series',
        planDuration: '1 Month',
        price: 399,
        originalPrice: 499,
        quantity: 1
      },
      {
        productId: 'prod-amazon-prime',
        productSlug: 'amazon-prime-video',
        name: 'Amazon Prime Video',
        image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80',
        categoryName: 'Movies & Series',
        planDuration: '1 Month',
        price: 299,
        originalPrice: 349,
        quantity: 1
      }
    ];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(current => (current === msg ? null : current));
    }, 3000);
  };

  const addToCart = (product: Product, planDuration?: PlanDuration, quantity: number = 1) => {
    const selectedDuration = planDuration || product.defaultPlan;
    const plan = product.plans.find(p => p.duration === selectedDuration) || product.plans[0];

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
        showToast(`Updated ${product.name} (${selectedDuration}) in cart!`);
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
          price: plan.price,
          originalPrice: plan.originalPrice,
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
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountTotal = subtotal - totalPrice;

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
