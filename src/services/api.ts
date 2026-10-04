import { PRODUCTS_DATA } from '../data/productsData';
import { CATEGORIES_DATA, SUBCATEGORIES_DATA } from '../data/categoriesData';
import { CATALOGS_DATA } from '../data/catalogsData';
import { INITIAL_ORDERS, INITIAL_USER } from '../data/mockOrders';
import { Product, Category, SubCategory, Catalog, Order, User } from '../types';

// Storage keys for local persistence
const STORAGE_KEYS = {
  ORDERS: 'ott_sellers_orders',
  USER: 'ott_sellers_user',
  CART: 'ott_sellers_cart'
};

// Simulated delay helper for realistic loading states & skeleton previews
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const ottApi = {
  // Products
  async getProducts(): Promise<Product[]> {
    await delay(60);
    return [...PRODUCTS_DATA];
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    await delay(60);
    return PRODUCTS_DATA.find(p => p.slug.toLowerCase() === slug.toLowerCase());
  },

  async getTrendingProducts(): Promise<Product[]> {
    await delay(60);
    return PRODUCTS_DATA.filter(p => p.isTrending);
  },

  async getPopularProducts(): Promise<Product[]> {
    await delay(60);
    return PRODUCTS_DATA.filter(p => p.isPopular);
  },

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    await delay(60);
    return PRODUCTS_DATA.filter(
      p => p.categorySlug.toLowerCase() === categorySlug.toLowerCase() ||
           p.subcategorySlug.toLowerCase() === categorySlug.toLowerCase()
    );
  },

  async getProductsBySubcategory(subcategorySlug: string): Promise<Product[]> {
    await delay(60);
    return PRODUCTS_DATA.filter(p => p.subcategorySlug.toLowerCase() === subcategorySlug.toLowerCase());
  },

  async searchProducts(query: string): Promise<Product[]> {
    await delay(80);
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS_DATA.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.subcategoryName.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.features.some(f => f.toLowerCase().includes(q))
    );
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    await delay(40);
    return [...CATEGORIES_DATA];
  },

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    await delay(40);
    return CATEGORIES_DATA.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  },

  // Subcategories
  async getSubcategories(): Promise<SubCategory[]> {
    await delay(40);
    return [...SUBCATEGORIES_DATA];
  },

  async getSubcategoryBySlug(slug: string): Promise<SubCategory | undefined> {
    await delay(40);
    return SUBCATEGORIES_DATA.find(s => s.slug.toLowerCase() === slug.toLowerCase());
  },

  // Catalogs
  async getCatalogs(): Promise<Catalog[]> {
    await delay(50);
    return [...CATALOGS_DATA];
  },

  async getCatalogBySlug(slug: string): Promise<Catalog | undefined> {
    await delay(50);
    return CATALOGS_DATA.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  },

  async getProductsForCatalog(catalogSlug: string): Promise<Product[]> {
    const catalog = await this.getCatalogBySlug(catalogSlug);
    if (!catalog) return [];
    return PRODUCTS_DATA.filter(p => catalog.productSlugs.includes(p.slug));
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    await delay(80);
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
    await delay(200);
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
    await delay(40);
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
    await delay(80);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {
      // Fallback
    }
    return user;
  }
};
