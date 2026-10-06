import { PRODUCTS_DATA } from '../data/productsData';
import { CATEGORIES_DATA, SUBCATEGORIES_DATA } from '../data/categoriesData';
import { CATALOGS_DATA } from '../data/catalogsData';
import { INITIAL_BANNERS } from '../data/bannersData';
import { INITIAL_ORDERS, INITIAL_USER } from '../data/mockOrders';
import { Product, Category, SubCategory, Catalog, Order, User, HeroBanner } from '../types';

// Storage keys for local persistence & real-time sync with Admin Panel
export const STORAGE_KEYS = {
  ORDERS: 'ott_sellers_orders',
  USER: 'ott_sellers_user',
  CART: 'ott_sellers_cart',
  BANNERS: 'ott_sellers_banners',
  CATEGORIES: 'ott_sellers_categories',
  PRODUCTS: 'ott_sellers_products',
  SUBCATEGORIES: 'ott_sellers_subcategories'
};

// Cache-busting helper to ensure main website always renders latest images when changed in Admin Panel
export const getCleanImageUrl = (url?: string, timestamp?: number | string): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (!timestamp) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${timestamp}`;
};

// Simulated delay helper for realistic loading states & skeleton previews
const delay = (ms: number = 50) => new Promise(resolve => setTimeout(resolve, ms));

// Broadcast update helper to notify any listening views in real-time
export const broadcastDataUpdate = (entityType: string) => {
  try {
    window.dispatchEvent(new CustomEvent('ott_data_updated', { detail: { entityType, timestamp: Date.now() } }));
  } catch {
    // Ignore in non-browser context
  }
};

export const ottApi = {
  // Hero Banners (Admin controlled)
  async getBanners(): Promise<HeroBanner[]> {
    await delay(30);
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (stored) {
        const parsed: HeroBanner[] = JSON.parse(stored);
        return parsed
          .filter(b => b.status !== 'OFF')
          .sort((a, b) => a.displayOrder - b.displayOrder);
      }
    } catch (e) {
      console.warn('Error reading stored banners:', e);
    }
    return INITIAL_BANNERS
      .filter(b => b.status !== 'OFF')
      .sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async getAllBannersAdmin(): Promise<HeroBanner[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [...INITIAL_BANNERS];
  },

  async saveBanners(banners: HeroBanner[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
      broadcastDataUpdate('banners');
    } catch (e) {
      console.error('Failed to save banners:', e);
    }
  },

  // Categories (Admin controlled)
  async getCategories(): Promise<Category[]> {
    await delay(30);
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        const parsed: Category[] = JSON.parse(stored);
        return parsed
          .filter(c => c.status !== 'OFF')
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
    } catch {
      // fallback
    }
    return [...CATEGORIES_DATA]
      .filter(c => c.status !== 'OFF')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  },

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      broadcastDataUpdate('categories');
    } catch (e) {
      console.error('Failed to save categories:', e);
    }
  },

  // Subcategories
  async getSubcategories(): Promise<SubCategory[]> {
    await delay(30);
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return [...SUBCATEGORIES_DATA];
  },

  async getSubcategoryBySlug(slug: string): Promise<SubCategory | undefined> {
    const subcats = await this.getSubcategories();
    return subcats.find(s => s.slug.toLowerCase() === slug.toLowerCase());
  },

  // Products & Items (Admin controlled)
  async getProducts(): Promise<Product[]> {
    await delay(40);
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        const parsed: Product[] = JSON.parse(stored);
        return parsed
          .filter(p => p.status !== 'OFF')
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
    } catch {
      // fallback
    }
    return [...PRODUCTS_DATA]
      .filter(p => p.status !== 'OFF')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find(p => p.slug.toLowerCase() === slug.toLowerCase());
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(p => (p.isFeatured ?? p.isPopular ?? false) && p.status !== 'OFF');
  },

  async getOfferProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(p => {
      if (p.status === 'OFF') return false;
      if (p.inOffers === true) return true;
      const discount = p.plans?.[0]?.discountPercentage || 0;
      return discount >= 15;
    });
  },

  async getTrendingProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(p => p.isTrending && p.status !== 'OFF');
  },

  async getPopularProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(p => p.isPopular && p.status !== 'OFF');
  },

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(
      p => p.categorySlug.toLowerCase() === categorySlug.toLowerCase() ||
           p.subcategorySlug.toLowerCase() === categorySlug.toLowerCase()
    );
  },

  async getProductsBySubcategory(subcategorySlug: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(p => p.subcategorySlug.toLowerCase() === subcategorySlug.toLowerCase());
  },

  async searchProducts(query: string): Promise<Product[]> {
    await delay(50);
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const products = await this.getProducts();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.subcategoryName.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.features.some(f => f.toLowerCase().includes(q))
    );
  },

  async saveProducts(products: Product[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      broadcastDataUpdate('products');
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  },

  // Catalogs
  async getCatalogs(): Promise<Catalog[]> {
    await delay(30);
    return [...CATALOGS_DATA];
  },

  async getCatalogBySlug(slug: string): Promise<Catalog | undefined> {
    await delay(30);
    return CATALOGS_DATA.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  },

  async getProductsForCatalog(catalogSlug: string): Promise<Product[]> {
    const catalog = await this.getCatalogBySlug(catalogSlug);
    if (!catalog) return [];
    const allProducts = await this.getProducts();
    return allProducts.filter(p => catalog.productSlugs.includes(p.slug));
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    await delay(50);
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return [...INITIAL_ORDERS];
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    const orders = await this.getOrders();
    return orders.find(o => o.id.toLowerCase() === id.toLowerCase());
  },

  async createOrder(order: Omit<Order, 'id' | 'date'>): Promise<Order> {
    await delay(150);
    const count = (await this.getOrders()).length + 1;
    const newId = `OTS-2026-${String(count).padStart(5, '0')}`;
    const newOrder: Order = {
      ...order,
      id: newId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const currentOrders = await this.getOrders();
    const updated = [newOrder, ...currentOrders];
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    return newOrder;
  },

  // User Profile
  async getUser(): Promise<User | null> {
    await delay(30);
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return INITIAL_USER;
  },

  async updateUser(user: User): Promise<User> {
    await delay(50);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {
      // Fallback
    }
    return user;
  }
};
