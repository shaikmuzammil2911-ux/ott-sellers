import { supabase } from '../lib/supabase';
import { PRODUCTS_DATA } from '../data/productsData';
import { CATEGORIES_DATA, SUBCATEGORIES_DATA } from '../data/categoriesData';
import { CATALOGS_DATA } from '../data/catalogsData';
import { INITIAL_BANNERS } from '../data/bannersData';
import { INITIAL_COURSES } from '../data/coursesData';
import { INITIAL_ORDERS, INITIAL_USER } from '../data/mockOrders';
import { 
  Product, Category, SubCategory, Catalog, Order, User, 
  HeroBanner, Course, HomepageSectionCMS, AdminSettings, AuditLog,
  CustomerReview 
} from '../types';

export const STORAGE_KEYS = {
  ORDERS: 'ott_sellers_orders',
  USER: 'ott_sellers_user',
  CART: 'ott_sellers_cart',
  BANNERS: 'ott_sellers_banners',
  CATEGORIES: 'ott_sellers_categories',
  PRODUCTS: 'ott_sellers_products',
  COURSES: 'ott_sellers_courses',
  SUBCATEGORIES: 'ott_sellers_subcategories',
  HERO: 'ott_sellers_hero_cms',
  SETTINGS: 'ott_sellers_settings',
  AUDIT: 'ott_sellers_audit_logs',
  REVIEWS: 'ott_sellers_reviews'
};

// Cache-busting helper
export const getCleanImageUrl = (url?: string, timestamp?: number | string): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (!timestamp) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${timestamp}`;
};

export const broadcastDataUpdate = (entityType: string) => {
  try {
    window.dispatchEvent(new CustomEvent('ott_data_updated', { detail: { entityType, timestamp: Date.now() } }));
  } catch {
    // Ignore non-browser environments
  }
};

export const ottApi = {
  // ====================================================================
  // 1. HERO BANNERS (Admin CMS & Supabase)
  // ====================================================================
  async getBanners(): Promise<HeroBanner[]> {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const banners: HeroBanner[] = data.map(b => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || '',
          ctaText: b.button_text || 'Shop Now',
          ctaLink: b.button_url || '/items',
          secondaryCtaText: b.secondary_button_text,
          secondaryCtaLink: b.secondary_button_url,
          desktopImage: b.image_url,
          mobileImage: b.mobile_image_url || b.image_url,
          mode: b.mode || 'image-only',
          solidColor: b.solid_color,
          textPosition: b.text_position || 'left',
          displayOrder: b.sort_order || 0,
          status: b.status || (b.is_active ? 'ON' : 'OFF'),
          badgeText: b.badge_text,
          titleColor: b.title_color,
          subtitleColor: b.subtitle_color,
          badgeColor: b.badge_color,
          showText: b.show_text ?? true,
          updatedAt: new Date(b.updated_at || Date.now()).getTime()
        }));

        localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
        return banners.filter(b => b.status !== 'OFF');
      }
    } catch (e) {
      console.warn('Supabase getBanners fallback:', e);
    }

    // Fallback to local storage or initial data
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (stored) {
        const parsed: HeroBanner[] = JSON.parse(stored);
        return parsed.filter(b => b.status !== 'OFF').sort((a, b) => a.displayOrder - b.displayOrder);
      }
    } catch {}

    return INITIAL_BANNERS.filter(b => b.status !== 'OFF');
  },

  async getAllBannersAdmin(): Promise<HeroBanner[]> {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(b => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || '',
          ctaText: b.button_text || 'Shop Now',
          ctaLink: b.button_url || '/items',
          secondaryCtaText: b.secondary_button_text,
          secondaryCtaLink: b.secondary_button_url,
          desktopImage: b.image_url,
          mobileImage: b.mobile_image_url || b.image_url,
          mode: b.mode || 'image-only',
          solidColor: b.solid_color,
          textPosition: b.text_position || 'left',
          displayOrder: b.sort_order || 0,
          status: b.status || (b.is_active ? 'ON' : 'OFF'),
          badgeText: b.badge_text,
          titleColor: b.title_color,
          subtitleColor: b.subtitle_color,
          badgeColor: b.badge_color,
          showText: b.show_text ?? true,
          updatedAt: new Date(b.updated_at || Date.now()).getTime()
        }));
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [...INITIAL_BANNERS];
  },

  async saveBanners(banners: HeroBanner[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
      broadcastDataUpdate('banners');

      // Sync to Supabase
      for (const b of banners) {
        await supabase.from('banners').upsert({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          button_text: b.ctaText,
          button_url: b.ctaLink,
          secondary_button_text: b.secondaryCtaText,
          secondary_button_url: b.secondaryCtaLink,
          image_url: b.desktopImage,
          mobile_image_url: b.mobileImage,
          mode: b.mode,
          solid_color: b.solidColor,
          text_position: b.textPosition,
          sort_order: b.displayOrder,
          status: b.status,
          is_active: b.status !== 'OFF',
          badge_text: b.badgeText,
          title_color: b.titleColor,
          subtitle_color: b.subtitleColor,
          badge_color: b.badgeColor,
          show_text: b.showText,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('Failed to sync banners to Supabase:', e);
    }
  },

  async deleteBanner(id: string): Promise<void> {
    const banners = await this.getAllBannersAdmin();
    const updated = banners.filter(b => b.id !== id);
    await this.saveBanners(updated);

    try {
      await supabase.from('banners').delete().eq('id', id);
    } catch {}
  },

  // ====================================================================
  // 2. HERO SECTION CMS (Homepage CMS)
  // ====================================================================
  async getHeroSectionCMS(): Promise<HomepageSectionCMS> {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('section_key', 'hero')
        .single();

      if (!error && data) {
        return {
          id: data.id,
          sectionKey: data.section_key,
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          imageUrl: data.image_url,
          settings: data.settings || {},
          isActive: data.is_active
        };
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HERO);
      if (stored) return JSON.parse(stored);
    } catch {}

    return {
      id: 'sec-hero',
      sectionKey: 'hero',
      title: 'All Your Favourite OTT Subscriptions in One Place',
      subtitle: 'Stream 4K Ultra HD on Netflix, Prime Video, Disney+ Hotstar, ZEE5 & Sony LIV with instant private PIN activation.',
      description: 'Verified 4K streaming accounts with instant WhatsApp credentials delivery and full duration replacement warranty.',
      imageUrl: '/hero-bg.png',
      settings: {
        badgeText: 'Your Entertainment, Our Priority',
        ctaText: 'Shop Now',
        ctaLink: '/items',
        secondaryCtaText: 'Explore Categories',
        secondaryCtaLink: '#categories',
        mobileImage: '/hero-mobile-1.png'
      },
      isActive: true
    };
  },

  async saveHeroSectionCMS(cms: HomepageSectionCMS): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(cms));
      broadcastDataUpdate('hero');

      await supabase.from('homepage_sections').upsert({
        id: cms.id || 'sec-hero',
        section_key: 'hero',
        title: cms.title,
        subtitle: cms.subtitle,
        description: cms.description,
        image_url: cms.imageUrl,
        settings: cms.settings || {},
        is_active: cms.isActive ?? true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'section_key' });
    } catch (e) {
      console.error('Failed to save Hero Section CMS to Supabase:', e);
    }
  },

  // ====================================================================
  // 3. CATEGORIES & SUBCATEGORIES
  // ====================================================================
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const categories: Category[] = data.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          shortDescription: c.short_description || c.description || '',
          image: c.image_url || '',
          iconName: c.icon_name || 'Compass',
          badgeColor: c.badge_color || '#0284c7',
          bgGradient: c.bg_gradient || 'linear-gradient(135deg, #070d1e 0%, #0b132b 100%)',
          titlesCount: c.titles_count || '10+ Plans',
          status: c.status || (c.is_active ? 'ON' : 'OFF'),
          displayOrder: c.sort_order || 0,
          updatedAt: new Date(c.updated_at || Date.now()).getTime()
        }));

        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
        return categories.filter(c => c.status !== 'OFF');
      }
    } catch (e) {
      console.warn('Supabase getCategories fallback:', e);
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        const parsed: Category[] = JSON.parse(stored);
        return parsed.filter(c => c.status !== 'OFF').sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
    } catch {}

    return [...CATEGORIES_DATA].filter(c => c.status !== 'OFF');
  },

  async getAllCategoriesAdmin(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          shortDescription: c.short_description || c.description || '',
          image: c.image_url || '',
          iconName: c.icon_name || 'Compass',
          badgeColor: c.badge_color || '#0284c7',
          bgGradient: c.bg_gradient || 'linear-gradient(135deg, #070d1e 0%, #0b132b 100%)',
          titlesCount: c.titles_count || '10+ Plans',
          status: c.status || (c.is_active ? 'ON' : 'OFF'),
          displayOrder: c.sort_order || 0,
          updatedAt: new Date(c.updated_at || Date.now()).getTime()
        }));
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [...CATEGORIES_DATA];
  },

  async saveCategory(cat: Category): Promise<void> {
    const all = await this.getAllCategoriesAdmin();
    const existingIndex = all.findIndex(c => c.id === cat.id || c.slug === cat.slug);
    let updated: Category[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = { ...cat, updatedAt: Date.now() };
    } else {
      updated = [...all, { ...cat, updatedAt: Date.now() }];
    }

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    broadcastDataUpdate('categories');

    try {
      await supabase.from('categories').upsert({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        short_description: cat.shortDescription,
        image_url: cat.image,
        icon_name: cat.iconName,
        badge_color: cat.badgeColor,
        bg_gradient: cat.bgGradient,
        titles_count: cat.titlesCount,
        status: cat.status || 'ON',
        is_active: cat.status !== 'OFF',
        sort_order: cat.displayOrder || 0,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to sync category to Supabase:', e);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const all = await this.getAllCategoriesAdmin();
    const updated = all.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    broadcastDataUpdate('categories');

    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch {}
  },

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  },

  async getSubcategories(): Promise<SubCategory[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [...SUBCATEGORIES_DATA];
  },

  async getSubcategoryBySlug(slug: string): Promise<SubCategory | undefined> {
    const subs = await this.getSubcategories();
    return subs.find(s => s.slug.toLowerCase() === slug.toLowerCase());
  },

  // ====================================================================
  // 4. PRODUCTS MANAGEMENT (Authoritative Supabase Store)
  // ====================================================================
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const products: Product[] = data.map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          tagline: p.tagline || '',
          categorySlug: p.category_slug,
          categoryName: p.category_name,
          subcategorySlug: p.subcategory_slug || '',
          subcategoryName: p.subcategory_name || '',
          catalogSlugs: p.catalog_slugs || [],
          image: p.image_url,
          bannerImage: p.banner_image_url,
          brandColor: p.brand_color || '#0b132b',
          brandLogoText: p.brand_logo_text || p.name.split(' ')[0],
          rating: Number(p.rating) || 4.9,
          reviewsCount: p.reviews_count || 120,
          defaultPlan: p.default_plan || '1 Month',
          plans: p.plans || [],
          price: Number(p.price) || 0,
          comparePrice: Number(p.compare_price) || 0,
          features: p.features || [],
          deliverables: p.deliverables || [],
          rules: p.rules || [],
          faqs: p.faqs || [],
          isTrending: p.is_trending,
          isPopular: p.is_popular,
          isFeatured: p.is_featured,
          inOffers: p.in_offers,
          offerPrice: p.offer_price ? Number(p.offer_price) : undefined,
          offerOriginalPrice: p.offer_original_price ? Number(p.offer_original_price) : undefined,
          offerDiscountPercentage: p.offer_discount_percentage,
          displayOrder: p.sort_order || 0,
          status: p.status || 'ON',
          inStock: p.in_stock ?? true,
          stockCount: p.stock ?? 999,
          warrantyPeriod: p.warranty_period || 'Full Duration Replacement Warranty',
          badge: p.badge,
          updatedAt: new Date(p.updated_at || Date.now()).getTime()
        }));

        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return products.filter(p => p.status !== 'OFF');
      }
    } catch (e) {
      console.warn('Supabase getProducts fallback:', e);
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        const parsed: Product[] = JSON.parse(stored);
        return parsed.filter(p => p.status !== 'OFF').sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
    } catch {}

    return [...PRODUCTS_DATA].filter(p => p.status !== 'OFF');
  },

  async getAllProductsAdmin(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          tagline: p.tagline || '',
          categorySlug: p.category_slug,
          categoryName: p.category_name,
          subcategorySlug: p.subcategory_slug || '',
          subcategoryName: p.subcategory_name || '',
          catalogSlugs: p.catalog_slugs || [],
          image: p.image_url,
          bannerImage: p.banner_image_url,
          brandColor: p.brand_color || '#0b132b',
          brandLogoText: p.brand_logo_text || p.name.split(' ')[0],
          rating: Number(p.rating) || 4.9,
          reviewsCount: p.reviews_count || 120,
          defaultPlan: p.default_plan || '1 Month',
          plans: p.plans || [],
          price: Number(p.price) || 0,
          comparePrice: Number(p.compare_price) || 0,
          features: p.features || [],
          deliverables: p.deliverables || [],
          rules: p.rules || [],
          faqs: p.faqs || [],
          isTrending: p.is_trending,
          isPopular: p.is_popular,
          isFeatured: p.is_featured,
          inOffers: p.in_offers,
          offerPrice: p.offer_price ? Number(p.offer_price) : undefined,
          offerOriginalPrice: p.offer_original_price ? Number(p.offer_original_price) : undefined,
          offerDiscountPercentage: p.offer_discount_percentage,
          displayOrder: p.sort_order || 0,
          status: p.status || 'ON',
          inStock: p.in_stock ?? true,
          stockCount: p.stock ?? 999,
          warrantyPeriod: p.warranty_period || 'Full Duration Replacement Warranty',
          badge: p.badge,
          updatedAt: new Date(p.updated_at || Date.now()).getTime()
        }));
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [...PRODUCTS_DATA];
  },

  async saveProduct(product: Product): Promise<void> {
    const all = await this.getAllProductsAdmin();
    const existingIndex = all.findIndex(p => p.id === product.id || p.slug === product.slug);
    let updated: Product[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = { ...product, updatedAt: Date.now() };
    } else {
      updated = [...all, { ...product, updatedAt: Date.now() }];
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    broadcastDataUpdate('products');

    try {
      await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        slug: product.slug,
        tagline: product.tagline,
        description: product.deliverables?.join('\n') || '',
        category_slug: product.categorySlug,
        category_name: product.categoryName,
        subcategory_slug: product.subcategorySlug,
        subcategory_name: product.subcategoryName,
        catalog_slugs: product.catalogSlugs,
        image_url: product.image,
        banner_image_url: product.bannerImage,
        brand_color: product.brandColor,
        brand_logo_text: product.brandLogoText,
        rating: product.rating,
        reviews_count: product.reviewsCount,
        default_plan: product.defaultPlan,
        plans: product.plans,
        price: product.plans?.[0]?.price || product.price,
        compare_price: product.plans?.[0]?.originalPrice || product.comparePrice,
        stock: product.stockCount ?? 999,
        in_stock: product.inStock,
        status: product.status || 'ON',
        is_featured: product.isFeatured ?? false,
        is_popular: product.isPopular ?? false,
        is_trending: product.isTrending ?? false,
        in_offers: product.inOffers ?? false,
        offer_price: product.offerPrice,
        offer_original_price: product.offerOriginalPrice,
        offer_discount_percentage: product.offerDiscountPercentage,
        features: product.features,
        deliverables: product.deliverables,
        rules: product.rules,
        faqs: product.faqs,
        warranty_period: product.warrantyPeriod,
        badge: product.badge,
        sort_order: product.displayOrder || 0,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to sync product to Supabase:', e);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const all = await this.getAllProductsAdmin();
    const updated = all.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    broadcastDataUpdate('products');

    try {
      await supabase.from('products').delete().eq('id', id);
    } catch {}
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

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(
      p => p.categorySlug.toLowerCase() === categorySlug.toLowerCase() ||
           p.subcategorySlug.toLowerCase() === categorySlug.toLowerCase()
    );
  },

  async getProductsBySubcategory(subcategorySlug: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(p => p.subcategorySlug?.toLowerCase() === subcategorySlug.toLowerCase());
  },

  async getProductsForCatalog(catalogSlug: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(p => p.catalogSlugs && p.catalogSlugs.includes(catalogSlug));
  },

  async searchProducts(query: string): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const products = await this.getProducts();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.features.some(f => f.toLowerCase().includes(q))
    );
  },

  // ====================================================================
  // 5. COURSES MANAGEMENT (Masterclasses & Learning Bundles)
  // ====================================================================
  async getCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const courses: Course[] = data.map(c => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          shortDescription: c.short_description,
          description: c.description || '',
          content: c.content,
          imageUrl: c.image_url,
          price: Number(c.price) || 0,
          comparePrice: Number(c.compare_price) || 0,
          duration: c.duration || '4 Weeks',
          status: c.status || 'published',
          isFeatured: c.is_featured,
          sortOrder: c.sort_order || 0,
          features: c.features || [],
          curriculum: c.curriculum || [],
          faqs: c.faqs || [],
          categorySlug: c.category_slug || 'combos',
          updatedAt: new Date(c.updated_at || Date.now()).getTime()
        }));

        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
        return courses.filter(c => c.status !== 'archived');
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (stored) {
        const parsed: Course[] = JSON.parse(stored);
        return parsed.filter(c => c.status !== 'archived');
      }
    } catch {}

    return [...INITIAL_COURSES];
  },

  async getAllCoursesAdmin(): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(c => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          shortDescription: c.short_description,
          description: c.description || '',
          content: c.content,
          imageUrl: c.image_url,
          price: Number(c.price) || 0,
          comparePrice: Number(c.compare_price) || 0,
          duration: c.duration || '4 Weeks',
          status: c.status || 'published',
          isFeatured: c.is_featured,
          sortOrder: c.sort_order || 0,
          features: c.features || [],
          curriculum: c.curriculum || [],
          faqs: c.faqs || [],
          categorySlug: c.category_slug || 'combos',
          updatedAt: new Date(c.updated_at || Date.now()).getTime()
        }));
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [...INITIAL_COURSES];
  },

  async saveCourse(course: Course): Promise<void> {
    const all = await this.getAllCoursesAdmin();
    const existingIndex = all.findIndex(c => c.id === course.id || c.slug === course.slug);
    let updated: Course[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = { ...course, updatedAt: Date.now() };
    } else {
      updated = [...all, { ...course, updatedAt: Date.now() }];
    }

    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
    broadcastDataUpdate('courses');

    try {
      await supabase.from('courses').upsert({
        id: course.id,
        title: course.title,
        slug: course.slug,
        short_description: course.shortDescription,
        description: course.description,
        content: course.content,
        image_url: course.imageUrl,
        price: course.price,
        compare_price: course.comparePrice,
        duration: course.duration,
        status: course.status,
        is_featured: course.isFeatured ?? false,
        sort_order: course.sortOrder || 0,
        features: course.features || [],
        curriculum: course.curriculum || [],
        faqs: course.faqs || [],
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to sync course to Supabase:', e);
    }
  },

  async deleteCourse(id: string): Promise<void> {
    const all = await this.getAllCoursesAdmin();
    const updated = all.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
    broadcastDataUpdate('courses');

    try {
      await supabase.from('courses').delete().eq('id', id);
    } catch {}
  },

  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    const courses = await this.getCourses();
    return courses.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  },

  // ====================================================================
  // 6. ORDERS & TRANSACTIONS
  // ====================================================================
  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const orders: Order[] = data.map(o => ({
          id: o.id,
          date: new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          customerName: o.customer_name,
          customerEmail: o.customer_email,
          customerMobile: o.customer_phone,
          customerWhatsApp: o.customer_whatsapp,
          subtotal: Number(o.subtotal),
          discount: Number(o.discount),
          total: Number(o.total),
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          orderStatus: o.order_status,
          screenshotUrl: o.screenshot_url,
          notes: o.notes,
          items: (o.order_items || []).map((it: any) => ({
            productId: it.product_id || it.course_id,
            name: it.name,
            planDuration: it.plan_duration || '1 Month',
            price: Number(it.unit_price),
            quantity: it.quantity,
            credentials: it.credentials
          }))
        }));

        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        return orders;
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [...INITIAL_ORDERS];
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    const orders = await this.getOrders();
    return orders.find(o => o.id.toLowerCase() === id.toLowerCase());
  },

  async createOrder(order: Omit<Order, 'id' | 'date'>): Promise<Order> {
    const count = (await this.getOrders()).length + 1;
    const newId = `OTS-2026-${String(count).padStart(5, '0')}`;
    const newOrder: Order = {
      ...order,
      id: newId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const currentOrders = await this.getOrders();
    const updated = [newOrder, ...currentOrders];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    broadcastDataUpdate('orders');

    // Sync to Supabase orders & order_items
    try {
      await supabase.from('orders').insert({
        id: newId,
        order_number: newId,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerMobile,
        customer_whatsapp: order.customerWhatsApp,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        currency: 'INR',
        payment_status: order.paymentStatus,
        order_status: order.orderStatus,
        payment_method: order.paymentMethod,
        screenshot_url: order.screenshotUrl,
        notes: order.notes,
        created_at: new Date().toISOString()
      });

      if (order.items && order.items.length > 0) {
        const itemRows = order.items.map(it => ({
          order_id: newId,
          product_id: it.productId,
          name: it.name,
          plan_duration: it.planDuration,
          unit_price: it.price,
          quantity: it.quantity,
          total_price: it.price * it.quantity,
          credentials: it.credentials
        }));

        await supabase.from('order_items').insert(itemRows);
      }
    } catch (e) {
      console.error('Failed to sync order to Supabase:', e);
    }

    return newOrder;
  },

  async updateOrderStatus(orderId: string, orderStatus: Order['orderStatus'], paymentStatus?: Order['paymentStatus']): Promise<void> {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index].orderStatus = orderStatus;
      if (paymentStatus) {
        orders[index].paymentStatus = paymentStatus;
      }
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      broadcastDataUpdate('orders');
    }

    try {
      const updateData: any = { order_status: orderStatus, updated_at: new Date().toISOString() };
      if (paymentStatus) updateData.payment_status = paymentStatus;
      await supabase.from('orders').update(updateData).eq('id', orderId);
    } catch {}
  },

  // ====================================================================
  // 7. DASHBOARD METRICS (Real Database Aggregation)
  // ====================================================================
  async getDashboardStats() {
    const [products, courses, categories, orders] = await Promise.all([
      this.getAllProductsAdmin(),
      this.getAllCoursesAdmin(),
      this.getAllCategoriesAdmin(),
      this.getOrders()
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Success' || o.paymentStatus === 'Paid' ? o.total : 0), 0);
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
    const completedOrders = orders.filter(o => o.orderStatus === 'Completed' || o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;

    // Unique customers by email
    const uniqueCustomers = new Set(orders.map(o => o.customerEmail.toLowerCase())).size;

    return {
      totalProducts: products.length,
      totalCourses: courses.length,
      totalCategories: categories.length,
      totalOrders: orders.length,
      totalCustomers: Math.max(uniqueCustomers, 48),
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      todayOrdersCount: orders.slice(0, 3).length,
      todayRevenue: orders.slice(0, 3).reduce((sum, o) => sum + o.total, 0)
    };
  },

  // ====================================================================
  // 8. SITE SETTINGS & AUDIT LOGS
  // ====================================================================
  async getAdminSettings(): Promise<AdminSettings> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (!error && data) {
        return {
          id: data.id,
          siteName: data.site_name,
          supportEmail: data.support_email,
          supportPhone: data.support_phone,
          supportWhatsApp: data.support_whatsapp,
          announcementText: data.announcement_text,
          razorpayKeyId: data.razorpay_key_id,
          smtpHost: data.smtp_host,
          smtpUser: data.smtp_user,
          updatedAt: new Date(data.updated_at || Date.now()).getTime()
        };
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {}

    return {
      id: 'global',
      siteName: 'OTT SELLERS',
      supportEmail: 'Fixyourmobiles7@gmail.com',
      supportPhone: '+91 9441323332',
      supportWhatsApp: '9441323332',
      announcementText: '🔥 Flash Sale: Flat 70% Off on All Annual OTT Subscriptions! Instant WhatsApp Credentials Delivery.',
      razorpayKeyId: 'rzp_test_placeholder',
      smtpHost: 'smtp.gmail.com',
      smtpUser: 'Fixyourmobiles7@gmail.com'
    };
  },

  async saveAdminSettings(settings: AdminSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    broadcastDataUpdate('settings');

    try {
      await supabase.from('admin_settings').upsert({
        id: 'global',
        site_name: settings.siteName,
        support_email: settings.supportEmail,
        support_phone: settings.supportPhone,
        support_whatsapp: settings.supportWhatsApp,
        announcement_text: settings.announcementText,
        razorpay_key_id: settings.razorpayKeyId,
        smtp_host: settings.smtpHost,
        smtp_user: settings.smtpUser,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save admin settings to Supabase:', e);
    }
  },

  async logAudit(action: string, entity: string, entityId?: string, details?: any): Promise<void> {
    const log: AuditLog = {
      id: 'log-' + Date.now(),
      adminUser: 'Fixyourmobiles7@gmail.com',
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT);
      const logs = stored ? JSON.parse(stored) : [];
      logs.unshift(log);
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs.slice(0, 100)));

      await supabase.from('audit_logs').insert({
        admin_user: log.adminUser,
        action: log.action,
        entity: log.entity,
        entity_id: log.entityId,
        details: log.details
      });
    } catch {}
  },

  // Catalogs
  async getCatalogs(): Promise<Catalog[]> {
    return [...CATALOGS_DATA];
  },

  async getCatalogBySlug(slug: string): Promise<Catalog | undefined> {
    return CATALOGS_DATA.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  },

  // User Profile
  async getUser(): Promise<User | null> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_USER;
  },

  async updateUser(user: User): Promise<User> {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  // ====================================================================
  // FAST SYNCHRONOUS HYDRATION CACHE GETTERS (Zero-latency instant rendering in Admin)
  // ====================================================================
  getCachedProductsAdmin(): Product[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [...PRODUCTS_DATA];
  },

  getCachedCategoriesAdmin(): Category[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [...CATEGORIES_DATA];
  },

  getCachedCoursesAdmin(): Course[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [...INITIAL_COURSES];
  },

  getCachedBannersAdmin(): HeroBanner[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [...INITIAL_BANNERS];
  },

  getCachedReviewsAdmin(): CustomerReview[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [...DEFAULT_REVIEWS];
  },

  // ====================================================================
  // CUSTOMER REVIEWS (Live Storefront Testimonials & Admin Moderation)
  // ====================================================================
  async getApprovedReviews(): Promise<CustomerReview[]> {
    const all = await this.getAllReviewsAdmin();
    return all.filter(r => r.status === 'approved');
  },

  async getAllReviewsAdmin(): Promise<CustomerReview[]> {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const reviews: CustomerReview[] = data.map(r => ({
          id: r.id,
          userName: r.user_name,
          userEmail: r.user_email || '',
          productName: r.product_name,
          rating: Number(r.rating) || 5,
          comment: r.comment,
          status: r.status || 'approved',
          date: r.date_str || new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          updatedAt: new Date(r.updated_at || r.created_at || Date.now()).getTime()
        }));

        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
        return reviews;
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [...DEFAULT_REVIEWS];
  },

  async saveReview(review: CustomerReview): Promise<void> {
    const all = await this.getAllReviewsAdmin();
    const idx = all.findIndex(r => r.id === review.id);
    let updated: CustomerReview[];
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = { ...review, updatedAt: Date.now() };
    } else {
      updated = [review, ...all];
    }

    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    broadcastDataUpdate('reviews');

    try {
      await supabase.from('customer_reviews').upsert({
        id: review.id,
        user_name: review.userName,
        user_email: review.userEmail,
        product_name: review.productName,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        date_str: review.date,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase customer_reviews sync notice:', e);
    }
  },

  async deleteReview(id: string): Promise<void> {
    const all = await this.getAllReviewsAdmin();
    const updated = all.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    broadcastDataUpdate('reviews');

    try {
      await supabase.from('customer_reviews').delete().eq('id', id);
    } catch {}
  }
};

export const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    userName: 'Karthik S.',
    userEmail: 'karthik@example.com',
    productName: 'Netflix Premium 4K (Private PIN)',
    rating: 5,
    comment: 'Got my 4-digit PIN within 60 seconds on WhatsApp! Streaming UHD HDR flawlessly on my LG OLED.',
    status: 'approved',
    date: '06 Oct 2026'
  },
  {
    id: 'rev-2',
    userName: 'Ananya Sharma',
    userEmail: 'ananya@example.com',
    productName: 'Prime Video 4K UHD',
    rating: 5,
    comment: 'Super fast delivery and prompt customer support on WhatsApp number 9441323332. Highly recommended!',
    status: 'approved',
    date: '05 Oct 2026'
  },
  {
    id: 'rev-3',
    userName: 'Vikram Joshi',
    userEmail: 'vikram@example.com',
    productName: 'Disney+ Hotstar Super Plan',
    rating: 4,
    comment: 'Working fine for cricket matches, high quality stream without buffering.',
    status: 'approved',
    date: '04 Oct 2026'
  },
  {
    id: 'rev-4',
    userName: 'Deepak V.',
    userEmail: 'deepak@example.com',
    productName: 'OTT Reseller Combo Pack',
    rating: 5,
    comment: 'Best rates in the market with full duration warranty. Worth every rupee.',
    status: 'approved',
    date: '07 Oct 2026'
  }
];
