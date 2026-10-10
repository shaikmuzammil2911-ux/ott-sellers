import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Layout
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/layout/WhatsAppButton';

// Interactive Popups
import { LivePurchasePopup } from './components/common/LivePurchasePopup';
import { PromoOfferModal } from './components/common/PromoOfferModal';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
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
import { ItemsPage } from './pages/ItemsPage';
import { OffersPage } from './pages/OffersPage';

// Admin Components & Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminForgotPasswordPage } from './pages/admin/AdminForgotPasswordPage';
import { AdminResetPasswordPage } from './pages/admin/AdminResetPasswordPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminProvidersPage } from './pages/admin/AdminProvidersPage';
import { AdminHeroCMSPage } from './pages/admin/AdminHeroCMSPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';

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

// Main App Shell
const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Top Promotional Strip - Customer only */}
      {!isAdminRoute && <AnnouncementBar />}

      {/* Sticky Header - Customer only */}
      {!isAdminRoute && <Header />}

      {/* Main Route Content */}
      <main style={{ minHeight: isAdminRoute ? '100vh' : 'calc(100vh - 450px)' }}>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/categories" element={<ItemsPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/item/:slug" element={<ProductDetailPage />} />
          <Route path="/items/:slug" element={<ProductDetailPage />} />
          <Route path="/subscription/:slug" element={<ProductDetailPage />} />
          <Route path="/courses" element={<ItemsPage />} />
          <Route path="/course/:slug" element={<CourseDetailPage />} />
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

          {/* Admin Authentication Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
          <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="providers" element={<AdminProvidersPage />} />
            <Route path="hero" element={<AdminHeroCMSPage />} />
            <Route path="banners" element={<AdminBannersPage />} />
            <Route path="banner" element={<AdminBannersPage />} />
            <Route path="hero-banners" element={<AdminBannersPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Customer Extras */}
      {!isAdminRoute && (
        <>
          <LivePurchasePopup />
          <PromoOfferModal />
          <WhatsAppButton />
          <CartToast />
          <MobileBottomNav />
          <Footer />
        </>
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
