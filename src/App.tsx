import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Layout
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/layout/WhatsAppButton';

// Interactive Popups
import { LivePurchasePopup } from './components/common/LivePurchasePopup';
import { PromoOfferModal } from './components/common/PromoOfferModal';

// Pages
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CatalogsPage } from './pages/CatalogsPage';
import { CatalogDetailPage } from './pages/CatalogDetailPage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { CheckoutFailedPage } from './pages/CheckoutFailedPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';

// Toast Notification Renderer
const CartToast: React.FC = () => {
  const { toastMessage, dismissToast } = useCart();
  if (!toastMessage) return null;

  return (
    <div className="app-toast" onClick={dismissToast} role="alert">
      <span>{toastMessage}</span>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* Top Promotional Strip */}
          <AnnouncementBar />

          {/* Sticky Header */}
          <Header />

          {/* Main Route Content */}
          <main style={{ minHeight: 'calc(100vh - 450px)' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/catalogs" element={<CatalogsPage />} />
              <Route path="/catalog/:slug" element={<CatalogDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="/checkout/failed" element={<CheckoutFailedPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/account/orders" element={<OrdersPage />} />
              <Route path="/account/orders/:id" element={<OrderDetailPage />} />
              
              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Live Recent Purchase Popup Notification */}
          <LivePurchasePopup />

          {/* Promotional Offer Discount Modal */}
          <PromoOfferModal />

          {/* Floating WhatsApp Support Button */}
          <WhatsAppButton />

          {/* Toast Notifications */}
          <CartToast />

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />

          {/* Footer */}
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
