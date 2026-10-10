import { supabase } from '../lib/supabase';
import { PRODUCTS_DATA } from '../data/productsData';
import { CATEGORIES_DATA, SUBCATEGORIES_DATA } from '../data/categoriesData';
import { INITIAL_PROVIDERS } from '../data/providersData';
import { CATALOGS_DATA } from '../data/catalogsData';
import { INITIAL_BANNERS } from '../data/bannersData';
import { INITIAL_COURSES } from '../data/coursesData';
import { INITIAL_ORDERS, INITIAL_USER } from '../data/mockOrders';
import { INITIAL_NOTIFICATIONS } from '../data/notificationsData';
import { INITIAL_HOMEPAGE_SECTIONS } from '../data/sectionsData';
import { INITIAL_COUPONS } from '../data/couponsData';
import { 
  Product, Category, SubCategory, Provider, Catalog, Order, User, 
  HeroBanner, BannerGroup, Course, HomepageSectionCMS, AdminSettings, AuditLog,
  CustomerReview, SiteNotification, Coupon, FooterSettings, WhatsAppSettings, ReferralSettings, ItemsPageCMS 
} from '../types';

export const ADMIN_CONFIG = {
  EMAIL: 'fixyourmobiles7@gmail.com',
  DEFAULT_PASS: 'Fixyourmobiles@2026'
};

export const STORAGE_KEYS = {
  ORDERS: 'ott_sellers_orders',
  USER: 'ott_sellers_user',
  CART: 'ott_sellers_cart',
  BANNERS: 'ott_sellers_banners',
  BANNER_GROUPS: 'ott_sellers_banner_groups',
  CATEGORIES: 'ott_sellers_categories',
  PROVIDERS: 'ott_sellers_providers',
  PRODUCTS: 'ott_sellers_products',
  COURSES: 'ott_sellers_courses',
  SUBCATEGORIES: 'ott_sellers_subcategories',
  HERO: 'ott_sellers_hero_cms',
  SECTIONS: 'ott_sellers_sections_cms',
  SETTINGS: 'ott_sellers_settings',
  AUDIT: 'ott_sellers_audit_logs',
  REVIEWS: 'ott_sellers_reviews',
  NOTIFICATIONS: 'ott_sellers_notifications',
  COUPONS: 'ott_sellers_coupons',
  FOOTER: 'ott_sellers_footer_cms',
  WHATSAPP: 'ott_sellers_whatsapp_cms',
  REFERRAL: 'ott_sellers_referral_cms',
  ITEMS_PAGE_CMS: 'ott_sellers_items_page_cms',
  ADMIN_AUTH: 'ott_sellers_admin_auth_state',
  ADMIN_OTP: 'ott_sellers_admin_otp'
};

export const DEFAULT_ITEMS_PAGE_CMS: ItemsPageCMS = {
  mainHeading: 'All Subscriptions & Premium Accounts',
  mainSubtitle: '100% verified private profiles, instant WhatsApp delivery & replacement guarantee.',
  quickSearchHeading: 'Quick Search',
  categoriesHeading: 'Explore Categories',
  itemsListingHeading: 'All Available Plans'
};

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  description: "India's most trusted digital subscription platform. Enjoy verified premium OTT accounts, instant automated credentials delivery, full replacement guarantee and 24/7 dedicated WhatsApp support.",
  tagline: "STREAM MORE. PAY LESS.",
  copyrightText: `© ${new Date().getFullYear()} OTT Sellers. All rights reserved.`,
  contactEmail: 'OttSellers1@gmail.com',
  contactPhone: '+91 9441323332',
  whatsappNumber: '9441323332',
  quickLinks: [
    { label: 'Home', url: '/' },
    { label: 'All Subscriptions', url: '/items' },
    { label: 'Special Offers', url: '/offers' },
    { label: 'Categories', url: '/items' },
    { label: 'My Orders', url: '/account/orders' }
  ],
  customerSupportLinks: [
    { label: 'Track Order Status', url: '/account/orders' },
    { label: 'WhatsApp 24/7 Helpline', url: 'https://wa.me/919441323332' },
    { label: 'FAQs & Help Center', url: '/search?q=faq' },
    { label: 'Replacement Policy', url: '#refund' },
    { label: 'Terms & Conditions', url: '#terms' }
  ],
  socialInstagram: 'https://instagram.com',
  socialYoutube: 'https://youtube.com',
  socialTelegram: 'https://t.me',
  updatedAt: Date.now()
};

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  number: '9441323332',
  buttonText: 'Chat with Us',
  isActive: true,
  position: 'bottom-right',
  displayPages: 'all',
  tagMessage: 'Need instant help or quick subscription activation? Chat with us live on WhatsApp!',
  generalMessageTemplate: 'Hi OTT Sellers, I would like more information about your subscription services.',
  customerEnquiryTemplate: 'Hi OTT Sellers, I have an enquiry regarding subscription plans and instant activation.',
  itemEnquiryTemplate: 'Hi OTT Sellers, I am interested in purchasing "{{item_name}}" ({{plan}}). Please guide me with activation details.',
  orderMessageTemplate: `Hello OTT Sellers, I would like to place an order:
Order ID: {{order_id}}
Customer: {{customer_name}} ({{customer_phone}})
Items:
{{items}}
Subtotal: ₹{{subtotal}}
Coupon Applied: {{coupon_code}} (Discount: ₹{{discount}})
Final Total: ₹{{final_amount}}
Payment Status: {{payment_status}}
Please verify and send credentials.`,
  contactMessageTemplate: 'Hi OTT Sellers support, I need assistance regarding my recent order.',
  updatedAt: Date.now()
};

export const DEFAULT_REFERRAL_SETTINGS: ReferralSettings = {
  isEnabled: true,
  rewardAmount: 50,
  rewardUnit: 'INR',
  referralCodePrefix: 'REF',
  shareMessage: "Hey! I save up to 80% on OTT subscriptions using OTT Sellers. Use my link to get instant cashback on your first purchase!",
  rules: [
    'Share your unique referral link or code with friends.',
    'When your friend makes their first purchase, they get an extra 10% off.',
    'You earn ₹50 instant wallet credit once their order is verified.',
    'Credits can be redeemed on any future subscription purchase.'
  ],
  updatedAt: Date.now()
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
  // 1. BANNERS & BANNER GROUPS (Admin CMS & Authoritative Supabase Store)
  // ====================================================================
  async getBanners(targetPage: string = 'home', slot?: string): Promise<HeroBanner[]> {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const banners: HeroBanner[] = data.map(b => ({
          id: b.id,
          name: b.name || b.title,
          groupName: b.group_name || (b.slot === '01' ? 'Hero Main Slideshow' : `Group ${b.slot || '01'}`),
          title: b.title || '',
          subtitle: b.subtitle || '',
          description: b.description || '',
          ctaText: b.button_text || 'Shop Now',
          ctaLink: b.button_url || '/items',
          secondaryCtaText: b.secondary_button_text,
          secondaryCtaLink: b.secondary_button_url,
          buttons: Array.isArray(b.buttons) ? b.buttons : undefined,
          desktopImage: b.desktop_image_url || b.image_url || '/hero-bg.png',
          mobileImage: b.mobile_image_url || b.desktop_image_url || b.image_url || '/hero-mobile-1.png',
          mode: b.mode || 'image-only',
          solidColor: b.solid_color,
          textPosition: b.text_position || 'left',
          contentPlacement: b.content_placement || 'center',
          buttonPlacement: b.button_placement || 'left',
          btnBgColor: b.btn_bg_color || '#0284c7',
          btnTextColor: b.btn_text_color || '#ffffff',
          btnBorderColor: b.btn_border_color || 'transparent',
          overlayColor: b.overlay_color || '#000000',
          overlayOpacity: Number(b.overlay_opacity) ?? 0.4,
          displayOrder: b.sort_order || b.display_order || 1,
          page: (b.page || 'home').toLowerCase() as any,
          slot: b.slot || '01',
          style: b.style || 'auto-slide',
          autoplay: b.autoplay ?? true,
          interval: Number(b.interval) || 5,
          status: b.status || (b.is_active ? 'ON' : 'OFF'),
          badgeText: b.badge_text,
          titleColor: b.title_color,
          subtitleColor: b.subtitle_color,
          badgeColor: b.badge_color,
          descriptionColor: b.description_color,
          showText: b.show_text ?? true,
          updatedAt: new Date(b.updated_at || Date.now()).getTime()
        }));

        localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
        return banners
          .filter(b => b.status !== 'OFF')
          .filter(b => !targetPage || b.page === 'all' || b.page === targetPage.toLowerCase())
          .filter(b => !slot || b.slot === slot);
      }
    } catch (e) {
      console.warn('Supabase getBanners fallback:', e);
    }

    // Fallback to local storage or initial data
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (stored) {
        const parsed: HeroBanner[] = JSON.parse(stored);
        return parsed
          .filter(b => b.status !== 'OFF')
          .filter(b => !targetPage || b.page === 'all' || b.page === targetPage.toLowerCase())
          .filter(b => !slot || b.slot === slot)
          .sort((a, b) => a.displayOrder - b.displayOrder);
      }
    } catch {}

    return INITIAL_BANNERS
      .filter(b => b.status !== 'OFF')
      .filter(b => !targetPage || b.page === 'all' || b.page === targetPage.toLowerCase());
  },

  async getAllBannersAdmin(): Promise<HeroBanner[]> {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const banners: HeroBanner[] = data.map(b => ({
          id: b.id,
          name: b.name || b.title,
          groupName: b.group_name || (b.slot === '01' ? 'Hero Main Slideshow' : `Group ${b.slot || '01'}`),
          title: b.title || '',
          subtitle: b.subtitle || '',
          description: b.description || '',
          ctaText: b.button_text || 'Shop Now',
          ctaLink: b.button_url || '/items',
          secondaryCtaText: b.secondary_button_text,
          secondaryCtaLink: b.secondary_button_url,
          buttons: Array.isArray(b.buttons) ? b.buttons : undefined,
          desktopImage: b.desktop_image_url || b.image_url || '/hero-bg.png',
          mobileImage: b.mobile_image_url || b.desktop_image_url || b.image_url || '/hero-mobile-1.png',
          mode: b.mode || 'image-only',
          solidColor: b.solid_color,
          textPosition: b.text_position || 'left',
          contentPlacement: b.content_placement || 'center',
          buttonPlacement: b.button_placement || 'left',
          btnBgColor: b.btn_bg_color || '#0284c7',
          btnTextColor: b.btn_text_color || '#ffffff',
          btnBorderColor: b.btn_border_color || 'transparent',
          overlayColor: b.overlay_color || '#000000',
          overlayOpacity: Number(b.overlay_opacity) ?? 0.4,
          displayOrder: b.sort_order || b.display_order || 1,
          page: (b.page || 'home').toLowerCase() as any,
          slot: b.slot || '01',
          style: b.style || 'auto-slide',
          autoplay: b.autoplay ?? true,
          interval: Number(b.interval) || 5,
          status: b.status || (b.is_active ? 'ON' : 'OFF'),
          badgeText: b.badge_text,
          titleColor: b.title_color,
          subtitleColor: b.subtitle_color,
          badgeColor: b.badge_color,
          descriptionColor: b.description_color,
          showText: b.show_text ?? true,
          updatedAt: new Date(b.updated_at || Date.now()).getTime()
        }));
        localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
        return banners;
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
          name: b.name || b.title,
          group_name: b.groupName,
          title: b.title,
          subtitle: b.subtitle,
          description: b.description,
          button_text: b.ctaText,
          button_url: b.ctaLink,
          secondary_button_text: b.secondaryCtaText,
          secondary_button_url: b.secondaryCtaLink,
          buttons: b.buttons || [],
          image_url: b.desktopImage,
          desktop_image_url: b.desktopImage,
          mobile_image_url: b.mobileImage,
          mode: b.mode,
          solid_color: b.solidColor,
          text_position: b.textPosition,
          content_placement: b.contentPlacement || 'center',
          button_placement: b.buttonPlacement || b.textPosition || 'left',
          btn_bg_color: b.btnBgColor || '#0284c7',
          btn_text_color: b.btnTextColor || '#ffffff',
          btn_border_color: b.btnBorderColor || 'transparent',
          overlay_color: b.overlayColor || '#000000',
          overlay_opacity: b.overlayOpacity ?? 0.4,
          sort_order: b.displayOrder,
          display_order: b.displayOrder,
          page: b.page || 'home',
          slot: b.slot || '01',
          style: b.style || 'auto-slide',
          autoplay: b.autoplay ?? true,
          interval: b.interval || 5,
          status: b.status || 'ON',
          is_active: b.status !== 'OFF',
          badge_text: b.badgeText,
          title_color: b.titleColor,
          subtitle_color: b.subtitleColor,
          badge_color: b.badgeColor,
          description_color: b.descriptionColor,
          show_text: b.showText ?? true,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('Failed to sync banners to Supabase:', e);
    }
  },

  async saveBanner(banner: HeroBanner): Promise<void> {
    const all = await this.getAllBannersAdmin();
    const idx = all.findIndex(b => b.id === banner.id);
    let updated: HeroBanner[];
    const bannerToSave = { ...banner, updatedAt: Date.now() };
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = bannerToSave;
    } else {
      updated = [...all, bannerToSave];
    }
    await this.saveBanners(updated);
  },

  async deleteBanner(id: string): Promise<void> {
    const banners = await this.getAllBannersAdmin();
    const updated = banners.filter(b => b.id !== id);
    await this.saveBanners(updated);

    try {
      await supabase.from('banners').delete().eq('id', id);
    } catch {}
  },

  async getBannerGroups(): Promise<BannerGroup[]> {
    const banners = await this.getAllBannersAdmin();
    const groupMap = new Map<string, BannerGroup>();

    // Initial default group
    groupMap.set('01', {
      id: '01',
      name: 'Hero Main Slideshow',
      slot: '01',
      page: 'home',
      style: 'auto-slide',
      autoplay: true,
      interval: 5,
      status: 'ON',
      description: 'Primary hero slider on top of Homepage',
      bannerCount: 0
    });

    banners.forEach(b => {
      const slot = b.slot || '01';
      const existing = groupMap.get(slot);
      if (existing) {
        existing.bannerCount = (existing.bannerCount || 0) + 1;
        if (b.groupName) existing.name = b.groupName;
      } else {
        groupMap.set(slot, {
          id: slot,
          name: b.groupName || `Banner Group (${slot})`,
          slot: slot,
          page: b.page || 'home',
          style: b.style || 'auto-slide',
          autoplay: b.autoplay ?? true,
          interval: b.interval || 5,
          status: 'ON',
          description: `Custom banner group for ${b.page || 'home'} page`,
          bannerCount: 1
        });
      }
    });

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BANNER_GROUPS);
      if (stored) {
        const customGroups: BannerGroup[] = JSON.parse(stored);
        customGroups.forEach(g => {
          if (!groupMap.has(g.slot)) {
            groupMap.set(g.slot, { ...g, bannerCount: banners.filter(b => b.slot === g.slot).length });
          }
        });
      }
    } catch {}

    return Array.from(groupMap.values());
  },

  async saveBannerGroup(group: BannerGroup): Promise<void> {
    const groups = await this.getBannerGroups();
    const idx = groups.findIndex(g => g.slot === group.slot);
    let updated: BannerGroup[];
    if (idx >= 0) {
      updated = [...groups];
      updated[idx] = group;
    } else {
      updated = [...groups, group];
    }
    localStorage.setItem(STORAGE_KEYS.BANNER_GROUPS, JSON.stringify(updated));
    broadcastDataUpdate('banners');
  },

  // ====================================================================
  // 2. HOMEPAGE SECTIONS CMS & VISIBILITY
  // ====================================================================
  async getHomepageSections(): Promise<HomepageSectionCMS[]> {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const sections: HomepageSectionCMS[] = data.map(s => ({
          id: s.id,
          sectionKey: s.section_key,
          name: s.name || s.section_key,
          title: s.title,
          subtitle: s.subtitle,
          description: s.description,
          imageUrl: s.image_url,
          displayOrder: s.display_order ?? 1,
          settings: s.settings || {},
          isActive: s.is_active ?? true,
          updatedAt: new Date(s.updated_at || Date.now()).getTime()
        }));

        localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
        return sections;
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SECTIONS);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [...INITIAL_HOMEPAGE_SECTIONS];
  },

  async saveHomepageSection(section: HomepageSectionCMS): Promise<void> {
    const all = await this.getHomepageSections();
    const idx = all.findIndex(s => s.sectionKey === section.sectionKey || s.id === section.id);
    let updated: HomepageSectionCMS[];
    const itemToSave = { ...section, updatedAt: Date.now() };
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = itemToSave;
    } else {
      updated = [...all, itemToSave];
    }

    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(updated));
    broadcastDataUpdate('homepage_sections');

    try {
      await supabase.from('homepage_sections').upsert({
        id: section.id || `sec-${section.sectionKey}`,
        section_key: section.sectionKey,
        name: section.name || section.sectionKey,
        title: section.title,
        subtitle: section.subtitle,
        description: section.description,
        image_url: section.imageUrl,
        display_order: section.displayOrder || 1,
        settings: section.settings || {},
        is_active: section.isActive ?? true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'section_key' });
    } catch (e) {
      console.warn('Supabase homepage_sections sync notice:', e);
    }
  },

  async saveHomepageSections(sections: HomepageSectionCMS[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
    broadcastDataUpdate('homepage_sections');

    for (const s of sections) {
      try {
        await supabase.from('homepage_sections').upsert({
          id: s.id || `sec-${s.sectionKey}`,
          section_key: s.sectionKey,
          name: s.name || s.sectionKey,
          title: s.title,
          subtitle: s.subtitle,
          description: s.description,
          image_url: s.imageUrl,
          display_order: s.displayOrder || 1,
          settings: s.settings || {},
          is_active: s.isActive ?? true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_key' });
      } catch {}
    }
  },

  async getHeroSectionCMS(): Promise<HomepageSectionCMS> {
    const sections = await this.getHomepageSections();
    return sections.find(s => s.sectionKey === 'hero') || INITIAL_HOMEPAGE_SECTIONS[0];
  },

  async saveHeroSectionCMS(cms: HomepageSectionCMS): Promise<void> {
    await this.saveHomepageSection({ ...cms, sectionKey: 'hero' });
  },

  // ====================================================================
  // 3. CATEGORIES MANAGEMENT (Visibility ON/OFF & Description Persistence)
  // ====================================================================
  async getCategories(placement?: string, providerSlug?: string): Promise<Category[]> {
    const all = await this.getAllCategoriesAdmin();
    return all.filter(c => {
      if (c.status === 'OFF') return false;
      if (placement && c.placements && c.placements.length > 0 && !c.placements.includes(placement) && !c.placements.includes('all')) {
        return false;
      }
      if (providerSlug && c.providerSlug && c.providerSlug !== providerSlug) {
        return false;
      }
      return true;
    });
  },

  async getAllCategoriesAdmin(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const dbCategories: Category[] = data.map(c => ({
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
          placements: Array.isArray(c.placements) ? c.placements : ['home', 'items'],
          providerId: c.provider_id,
          providerSlug: c.provider_slug,
          updatedAt: new Date(c.updated_at || Date.now()).getTime()
        }));

        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(dbCategories));
        return dbCategories;
      }
    } catch (e) {
      console.warn('Supabase getAllCategoriesAdmin error:', e);
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    const initial = [...CATEGORIES_DATA];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initial));
    return initial;
  },

  async saveCategory(cat: Category): Promise<void> {
    const all = this.getCachedCategoriesAdmin();
    const existingIndex = all.findIndex(c => c.id === cat.id || c.slug.toLowerCase() === cat.slug.toLowerCase());
    const categoryToSave: Category = {
      ...cat,
      description: cat.description || '',
      shortDescription: cat.shortDescription || cat.description || '',
      placements: cat.placements && cat.placements.length > 0 ? cat.placements : ['home', 'items'],
      bgGradient: cat.bgGradient || 'linear-gradient(135deg, #070d1e 0%, #0b132b 100%)',
      badgeColor: cat.badgeColor || '#0284c7',
      iconName: cat.iconName || 'Compass',
      titlesCount: cat.titlesCount || '10+ Plans',
      status: cat.status || 'ON',
      updatedAt: Date.now()
    };

    let updated: Category[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = categoryToSave;
    } else {
      updated = [...all, categoryToSave];
    }

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    broadcastDataUpdate('categories');

    try {
      const payload: any = {
        name: categoryToSave.name,
        slug: categoryToSave.slug,
        description: categoryToSave.description,
        short_description: categoryToSave.shortDescription,
        image_url: categoryToSave.image || '',
        icon_name: categoryToSave.iconName || 'Compass',
        badge_color: categoryToSave.badgeColor || '#0284c7',
        bg_gradient: categoryToSave.bgGradient || 'linear-gradient(135deg, #070d1e 0%, #0b132b 100%)',
        titles_count: categoryToSave.titlesCount || '10+ Plans',
        status: categoryToSave.status,
        is_active: categoryToSave.status !== 'OFF',
        sort_order: categoryToSave.displayOrder || 0,
        placements: categoryToSave.placements,
        provider_id: categoryToSave.providerId,
        provider_slug: categoryToSave.providerSlug,
        updated_at: new Date().toISOString()
      };
      if (categoryToSave.id) payload.id = categoryToSave.id;

      await supabase.from('categories').upsert(payload, { onConflict: 'slug' });
    } catch (e) {
      console.warn('Failed to sync category to Supabase:', e);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const all = this.getCachedCategoriesAdmin();
    const target = all.find(c => c.id === id || c.slug === id);
    const updated = all.filter(c => c.id !== id && c.slug !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    broadcastDataUpdate('categories');

    try {
      if (target?.slug) {
        await supabase.from('categories').delete().eq('slug', target.slug);
      }
      await supabase.from('categories').delete().eq('id', id);
    } catch (e) {
      console.warn('Failed to delete category in Supabase:', e);
    }
  },

  async duplicateCategory(id: string): Promise<Category> {
    const all = this.getCachedCategoriesAdmin();
    const source = all.find(c => c.id === id || c.slug === id);
    if (!source) throw new Error('Source category not found');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newName = `${source.name} Copy`;
    const newSlug = `${source.slug}-copy-${randomSuffix}`;
    const newCategory: Category = {
      ...source,
      id: `cat-${Date.now()}`,
      name: newName,
      slug: newSlug,
      displayOrder: (source.displayOrder || 0) + 1,
      updatedAt: Date.now()
    };
    await this.saveCategory(newCategory);
    return newCategory;
  },

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  },

  // ====================================================================
  // 4. PROVIDER MANAGEMENT & QUICK SELECT (Central Provider Store)
  // ====================================================================
  async getProviders(): Promise<Provider[]> {
    const all = await this.getAllProvidersAdmin();
    return all.filter(p => p.isActive).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async getAllProvidersAdmin(): Promise<Provider[]> {
    try {
      const { data, error } = await supabase
        .from('sub_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const providers: Provider[] = data.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          categorySlug: p.category_slug,
          logo: p.logo || p.image_url,
          brandColor: p.brand_color || '#0284c7',
          displayOrder: p.sort_order || 0,
          isActive: p.is_active ?? true,
          description: p.description,
          updatedAt: new Date(p.updated_at || Date.now()).getTime()
        }));

        localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
        return providers;
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    const initial = [...INITIAL_PROVIDERS];
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(initial));
    return initial;
  },

  async saveProvider(provider: Provider): Promise<void> {
    const all = this.getCachedProvidersAdmin();
    const idx = all.findIndex(p => p.id === provider.id || p.slug.toLowerCase() === provider.slug.toLowerCase());
    const providerToSave: Provider = {
      ...provider,
      updatedAt: Date.now()
    };

    let updated: Provider[];
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = providerToSave;
    } else {
      updated = [...all, providerToSave];
    }

    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(updated));
    broadcastDataUpdate('providers');

    try {
      await supabase.from('sub_categories').upsert({
        id: providerToSave.id,
        name: providerToSave.name,
        slug: providerToSave.slug,
        category_slug: providerToSave.categorySlug || 'movies-series',
        logo: providerToSave.logo,
        image_url: providerToSave.logo,
        brand_color: providerToSave.brandColor || '#0284c7',
        is_active: providerToSave.isActive,
        sort_order: providerToSave.displayOrder || 0,
        description: providerToSave.description,
        updated_at: new Date().toISOString()
      }, { onConflict: 'slug' });
    } catch (e) {
      console.warn('Failed to sync provider to Supabase:', e);
    }
  },

  async deleteProvider(id: string): Promise<void> {
    const all = this.getCachedProvidersAdmin();
    const target = all.find(p => p.id === id || p.slug === id);
    const updated = all.filter(p => p.id !== id && p.slug !== id);
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(updated));
    broadcastDataUpdate('providers');

    try {
      if (target?.slug) {
        await supabase.from('sub_categories').delete().eq('slug', target.slug);
      }
      await supabase.from('sub_categories').delete().eq('id', id);
    } catch {}
  },

  async getProviderBySlug(slug: string): Promise<Provider | undefined> {
    const providers = await this.getProviders();
    return providers.find(p => p.slug.toLowerCase() === slug.toLowerCase());
  },

  // Legacy subcategories alias
  async getSubcategories(): Promise<SubCategory[]> {
    const providers = await this.getProviders();
    return providers.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      categorySlug: p.categorySlug || 'movies-series',
      logo: p.logo || '',
      popularProductSlug: `${p.slug}-premium`,
      brandColor: p.brandColor || '#0284c7',
      isActive: p.isActive,
      displayOrder: p.displayOrder
    }));
  },

  async getSubcategoryBySlug(slug: string): Promise<SubCategory | undefined> {
    const prov = await this.getProviderBySlug(slug);
    if (!prov) return undefined;
    return {
      id: prov.id,
      slug: prov.slug,
      name: prov.name,
      categorySlug: prov.categorySlug || 'movies-series',
      logo: prov.logo || '',
      popularProductSlug: `${prov.slug}-premium`,
      brandColor: prov.brandColor || '#0284c7',
      isActive: prov.isActive,
      displayOrder: prov.displayOrder
    };
  },

  // ====================================================================
  // 5. PRODUCTS MANAGEMENT (In Stock / Out of Stock & Provider Mapping)
  // ====================================================================
  async getProducts(categorySlug?: string, providerSlug?: string): Promise<Product[]> {
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
          subcategorySlug: p.subcategory_slug || p.provider_slug || '',
          subcategoryName: p.subcategory_name || p.provider_name || '',
          providerId: p.provider_id,
          providerSlug: p.provider_slug || p.subcategory_slug,
          providerName: p.provider_name || p.subcategory_name,
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
        return products
          .filter(p => p.status !== 'OFF')
          .filter(p => !categorySlug || p.categorySlug.toLowerCase() === categorySlug.toLowerCase())
          .filter(p => !providerSlug || p.providerSlug?.toLowerCase() === providerSlug.toLowerCase() || p.subcategorySlug?.toLowerCase() === providerSlug.toLowerCase());
      }
    } catch (e) {
      console.warn('Supabase getProducts fallback:', e);
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        const parsed: Product[] = JSON.parse(stored);
        return parsed
          .filter(p => p.status !== 'OFF')
          .filter(p => !categorySlug || p.categorySlug.toLowerCase() === categorySlug.toLowerCase())
          .filter(p => !providerSlug || p.providerSlug?.toLowerCase() === providerSlug.toLowerCase() || p.subcategorySlug?.toLowerCase() === providerSlug.toLowerCase())
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
    } catch {}

    return [...PRODUCTS_DATA].filter(p => p.status !== 'OFF');
  },

  async getProductsBySubcategory(subcategorySlug: string): Promise<Product[]> {
    return this.getProducts(undefined, subcategorySlug);
  },

  async getAllProductsAdmin(): Promise<Product[]> {
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
          subcategorySlug: p.subcategory_slug || p.provider_slug || '',
          subcategoryName: p.subcategory_name || p.provider_name || '',
          providerId: p.provider_id,
          providerSlug: p.provider_slug || p.subcategory_slug,
          providerName: p.provider_name || p.subcategory_name,
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
        return products;
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
    const productToSave: Product = {
      ...product,
      updatedAt: Date.now()
    };

    let updated: Product[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = productToSave;
    } else {
      updated = [...all, productToSave];
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    broadcastDataUpdate('products');

    try {
      await supabase.from('products').upsert({
        id: productToSave.id,
        name: productToSave.name,
        slug: productToSave.slug,
        tagline: productToSave.tagline,
        description: productToSave.deliverables?.join('\n') || '',
        category_slug: productToSave.categorySlug,
        category_name: productToSave.categoryName,
        subcategory_slug: productToSave.subcategorySlug || productToSave.providerSlug || '',
        subcategory_name: productToSave.subcategoryName || productToSave.providerName || '',
        provider_id: productToSave.providerId,
        provider_slug: productToSave.providerSlug || productToSave.subcategorySlug,
        provider_name: productToSave.providerName || productToSave.subcategoryName,
        catalog_slugs: productToSave.catalogSlugs,
        image_url: productToSave.image,
        banner_image_url: productToSave.bannerImage,
        brand_color: productToSave.brandColor,
        brand_logo_text: productToSave.brandLogoText,
        rating: productToSave.rating,
        reviews_count: productToSave.reviewsCount,
        default_plan: productToSave.defaultPlan,
        plans: productToSave.plans,
        price: productToSave.plans?.[0]?.price || productToSave.price,
        compare_price: productToSave.plans?.[0]?.originalPrice || productToSave.comparePrice,
        stock: productToSave.stockCount ?? 999,
        in_stock: productToSave.inStock,
        status: productToSave.status || 'ON',
        is_featured: productToSave.isFeatured ?? false,
        is_popular: productToSave.isPopular ?? false,
        is_trending: productToSave.isTrending ?? false,
        in_offers: productToSave.inOffers ?? false,
        offer_price: productToSave.offerPrice,
        offer_original_price: productToSave.offerOriginalPrice,
        offer_discount_percentage: productToSave.offerDiscountPercentage,
        features: productToSave.features,
        deliverables: productToSave.deliverables,
        rules: productToSave.rules,
        faqs: productToSave.faqs,
        warranty_period: productToSave.warrantyPeriod,
        badge: productToSave.badge,
        sort_order: productToSave.displayOrder || 0,
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
    if (!slug) return undefined;
    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

    // 1. Direct match in active public products
    try {
      const products = await this.getProducts();
      const found = products.find(p => 
        p.slug?.toLowerCase() === cleanSlug || 
        p.id === slug || 
        p.id === cleanSlug ||
        p.slug?.toLowerCase() === slug.toLowerCase()
      );
      if (found) return found;
    } catch {}

    // 2. Check admin cached / all products (including newly added/draft)
    try {
      const allAdmin = await this.getAllProductsAdmin();
      const foundAdmin = allAdmin.find(p => 
        p.slug?.toLowerCase() === cleanSlug || 
        p.id === slug || 
        p.id === cleanSlug ||
        p.slug?.toLowerCase() === slug.toLowerCase()
      );
      if (foundAdmin) return foundAdmin;
    } catch {}

    // 3. Direct Supabase query by slug or ID
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`slug.eq.${cleanSlug},id.eq.${slug}`)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          slug: data.slug,
          name: data.name,
          tagline: data.tagline || '',
          categorySlug: data.category_slug,
          categoryName: data.category_name,
          subcategorySlug: data.subcategory_slug || data.provider_slug || '',
          subcategoryName: data.subcategory_name || data.provider_name || '',
          providerId: data.provider_id,
          providerSlug: data.provider_slug || data.subcategory_slug,
          providerName: data.provider_name || data.subcategory_name,
          catalogSlugs: data.catalog_slugs || [],
          image: data.image_url,
          bannerImage: data.banner_image_url,
          brandColor: data.brand_color || '#0b132b',
          brandLogoText: data.brand_logo_text || data.name.split(' ')[0],
          rating: Number(data.rating) || 4.9,
          reviewsCount: data.reviews_count || 120,
          defaultPlan: data.default_plan || '1 Month',
          plans: data.plans || [],
          price: Number(data.price) || 0,
          comparePrice: Number(data.compare_price) || 0,
          features: data.features || [],
          deliverables: data.deliverables || [],
          rules: data.rules || [],
          faqs: data.faqs || [],
          isTrending: data.is_trending,
          isPopular: data.is_popular,
          isFeatured: data.is_featured,
          inOffers: data.in_offers,
          offerPrice: data.offer_price ? Number(data.offer_price) : undefined,
          offerOriginalPrice: data.offer_original_price ? Number(data.offer_original_price) : undefined,
          offerDiscountPercentage: data.offer_discount_percentage,
          displayOrder: data.sort_order || 0,
          status: data.status || 'ON',
          inStock: data.in_stock ?? true,
          stockCount: data.stock ?? 999,
          warrantyPeriod: data.warranty_period || 'Full Duration Replacement Warranty',
          badge: data.badge,
          updatedAt: new Date(data.updated_at || Date.now()).getTime()
        };
      }
    } catch {}

    // 4. Initial static fallback list
    return PRODUCTS_DATA.find(p => 
      p.slug?.toLowerCase() === cleanSlug || 
      p.id === slug ||
      p.slug?.toLowerCase() === slug.toLowerCase()
    );
  },

  async getItemsPageCMS(): Promise<ItemsPageCMS> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('items_page_cms')
        .eq('id', 'global')
        .maybeSingle();

      if (!error && data?.items_page_cms) {
        localStorage.setItem(STORAGE_KEYS.ITEMS_PAGE_CMS, JSON.stringify(data.items_page_cms));
        return data.items_page_cms;
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS_PAGE_CMS);
      if (stored) return JSON.parse(stored);
    } catch {}

    return DEFAULT_ITEMS_PAGE_CMS;
  },

  async saveItemsPageCMS(cms: ItemsPageCMS): Promise<void> {
    const item = { ...cms, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEYS.ITEMS_PAGE_CMS, JSON.stringify(item));
    broadcastDataUpdate('items_page_cms');

    try {
      await supabase.from('admin_settings').upsert({
        id: 'global',
        items_page_cms: item,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase items page cms save error:', e);
    }
  },

  getCachedItemsPageCMS(): ItemsPageCMS {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS_PAGE_CMS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_ITEMS_PAGE_CMS;
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
           p.subcategorySlug?.toLowerCase() === categorySlug.toLowerCase()
    );
  },

  async getProductsByProvider(providerSlug: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(
      p => p.providerSlug?.toLowerCase() === providerSlug.toLowerCase() ||
           p.subcategorySlug?.toLowerCase() === providerSlug.toLowerCase()
    );
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
  // 6. COURSES MANAGEMENT
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
  // 7. ORDERS & TRANSACTIONS
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
          couponCode: o.coupon_code,
          couponDiscount: Number(o.coupon_discount || 0),
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
        coupon_code: order.couponCode,
        coupon_discount: order.couponDiscount || 0,
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
  // 8. DASHBOARD METRICS
  // ====================================================================
  async getDashboardStats() {
    const [products, courses, categories, orders, providers] = await Promise.all([
      this.getAllProductsAdmin(),
      this.getAllCoursesAdmin(),
      this.getAllCategoriesAdmin(),
      this.getOrders(),
      this.getAllProvidersAdmin()
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Success' || o.paymentStatus === 'Paid' ? o.total : 0), 0);
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
    const completedOrders = orders.filter(o => o.orderStatus === 'Completed' || o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;
    const uniqueCustomers = new Set(orders.map(o => (o.customerEmail || '').toLowerCase()).filter(Boolean)).size;

    return {
      totalProducts: products.length,
      totalCourses: courses.length,
      totalCategories: categories.length,
      totalProviders: providers.length,
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
  // 9. SITE SETTINGS & AUDIT LOGS
  // ====================================================================
  async getAdminSettings(): Promise<AdminSettings> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (!error && data) {
        const settings: AdminSettings = {
          id: data.id,
          siteName: data.site_name || 'OTT SELLERS',
          logoUrl: data.logo_url || '/logo.png',
          supportEmail: data.support_email || ADMIN_CONFIG.EMAIL,
          supportPhone: data.support_phone || '+91 9441323332',
          supportWhatsApp: data.support_whatsapp || '9441323332',
          announcementText: data.announcement_text || '🔥 Flash Sale: Flat 70% Off on All Annual OTT Subscriptions! Instant WhatsApp Credentials Delivery.',
          razorpayKeyId: data.razorpay_key_id,
          smtpHost: data.smtp_host || 'smtp.gmail.com',
          smtpUser: data.smtp_user || ADMIN_CONFIG.EMAIL,
          randomNotificationsActive: data.random_notifications_active ?? true,
          updatedAt: new Date(data.updated_at || Date.now()).getTime()
        };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return settings;
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {}

    return {
      id: 'global',
      siteName: 'OTT SELLERS',
      logoUrl: '/logo.png',
      supportEmail: ADMIN_CONFIG.EMAIL,
      supportPhone: '+91 9441323332',
      supportWhatsApp: '9441323332',
      announcementText: '🔥 Flash Sale: Flat 70% Off on All Annual OTT Subscriptions! Instant WhatsApp Credentials Delivery.',
      razorpayKeyId: 'rzp_test_placeholder',
      smtpHost: 'smtp.gmail.com',
      smtpUser: ADMIN_CONFIG.EMAIL,
      randomNotificationsActive: true
    };
  },

  async saveAdminSettings(settings: AdminSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    broadcastDataUpdate('settings');

    try {
      await supabase.from('admin_settings').upsert({
        id: 'global',
        site_name: settings.siteName,
        logo_url: settings.logoUrl || '/logo.png',
        support_email: settings.supportEmail || ADMIN_CONFIG.EMAIL,
        support_phone: settings.supportPhone,
        support_whatsapp: settings.supportWhatsApp,
        announcement_text: settings.announcementText,
        razorpay_key_id: settings.razorpayKeyId,
        smtp_host: settings.smtpHost,
        smtp_user: settings.smtpUser || settings.supportEmail || ADMIN_CONFIG.EMAIL,
        random_notifications_active: settings.randomNotificationsActive ?? true,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save admin settings to Supabase:', e);
    }
  },

  async logAudit(action: string, entity: string, entityId?: string, details?: any): Promise<void> {
    const log: AuditLog = {
      id: 'log-' + Date.now(),
      adminUser: ADMIN_CONFIG.EMAIL,
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

  // ====================================================================
  // 10. CUSTOMER REVIEWS (Multi-Display Locations & Live Store Mapping)
  // ====================================================================
  async getApprovedReviews(displayLocation: string = 'home', pageId?: string): Promise<CustomerReview[]> {
    const all = await this.getAllReviewsAdmin();
    return all
      .filter(r => r.status === 'approved')
      .filter(r => {
        if (!displayLocation || displayLocation === 'all') return true;
        if (r.displayLocations && r.displayLocations.length > 0) {
          return r.displayLocations.includes('all') || r.displayLocations.includes(displayLocation as any);
        }
        return !r.pageType || r.pageType === 'all' || r.pageType === displayLocation;
      })
      .filter(r => !pageId || !r.pageId || r.pageId === pageId || r.productId === pageId || r.categorySlug === pageId)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async getAllReviewsAdmin(): Promise<CustomerReview[]> {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const reviews: CustomerReview[] = data.map(r => ({
          id: r.id,
          userName: r.user_name,
          userEmail: r.user_email || '',
          productName: r.product_name,
          productId: r.product_id,
          categorySlug: r.category_slug,
          rating: Number(r.rating) || 5,
          comment: r.comment,
          status: r.status || 'approved',
          displayLocations: Array.isArray(r.display_locations) ? r.display_locations : [r.page_type || 'home'],
          pageType: (r.page_type || 'home').toLowerCase() as any,
          pageId: r.page_id,
          displayOrder: r.display_order || 1,
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
    const itemToSave: CustomerReview = { 
      ...review, 
      displayLocations: (review.displayLocations && review.displayLocations.length > 0 ? review.displayLocations : ['home']) as ('home' | 'courses' | 'items' | 'categories' | 'offers' | 'all')[],
      updatedAt: Date.now() 
    };
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = itemToSave;
    } else {
      updated = [itemToSave, ...all];
    }

    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    broadcastDataUpdate('reviews');

    try {
      await supabase.from('customer_reviews').upsert({
        id: review.id,
        user_name: review.userName,
        user_email: review.userEmail,
        product_name: review.productName,
        product_id: review.productId,
        category_slug: review.categorySlug,
        rating: review.rating,
        comment: review.comment,
        status: review.status || 'approved',
        page_type: review.pageType || review.displayLocations?.[0] || 'home',
        display_locations: itemToSave.displayLocations,
        page_id: review.pageId,
        display_order: review.displayOrder || 1,
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
  },

  // ====================================================================
  // 11. RANDOM SMALL MESSAGE NOTIFICATIONS CMS
  // ====================================================================
  async getNotifications(): Promise<SiteNotification[]> {
    try {
      const { data, error } = await supabase
        .from('site_notifications')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const notifs: SiteNotification[] = data.map(n => ({
          id: n.id,
          buyerName: n.buyer_name,
          location: n.location,
          productName: n.product_name,
          slug: n.slug,
          plan: n.plan,
          timeText: n.time_text,
          imageUrl: n.image_url,
          message: n.message,
          isActive: n.is_active ?? true,
          displayOrder: n.display_order ?? 1,
          startDate: n.start_date,
          startTime: n.start_time,
          expiresAt: n.expires_at,
          expiryTime: n.expiry_time,
          type: n.type || 'purchase',
          updatedAt: new Date(n.updated_at || Date.now()).getTime()
        }));

        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
        return notifs;
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [...INITIAL_NOTIFICATIONS];
  },

  async saveNotification(notif: SiteNotification): Promise<void> {
    const all = await this.getNotifications();
    const idx = all.findIndex(n => n.id === notif.id);
    let updated: SiteNotification[];
    const itemToSave = { ...notif, updatedAt: Date.now() };
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = itemToSave;
    } else {
      updated = [...all, itemToSave];
    }

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    broadcastDataUpdate('notifications');

    try {
      await supabase.from('site_notifications').upsert({
        id: notif.id,
        buyer_name: notif.buyerName,
        location: notif.location,
        product_name: notif.productName,
        slug: notif.slug,
        plan: notif.plan,
        time_text: notif.timeText,
        image_url: notif.imageUrl,
        message: notif.message,
        is_active: notif.isActive ?? true,
        display_order: notif.displayOrder || 1,
        start_date: notif.startDate,
        start_time: notif.startTime,
        expires_at: notif.expiresAt,
        expiry_time: notif.expiryTime,
        type: notif.type || 'purchase',
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase site_notifications sync notice:', e);
    }
  },

  async deleteNotification(id: string): Promise<void> {
    const all = await this.getNotifications();
    const updated = all.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    broadcastDataUpdate('notifications');

    try {
      await supabase.from('site_notifications').delete().eq('id', id);
    } catch {}
  },

  // ====================================================================
  // 12. COUPONS CMS & CART VALIDATION (Full Date/Time & Applicability Mapping)
  // ====================================================================
  async getCoupons(): Promise<Coupon[]> {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*');

      if (!error && data && data.length > 0) {
        const coupons: Coupon[] = data.map(c => ({
          id: c.id,
          code: c.code,
          discountType: c.discount_type,
          discountValue: Number(c.discount_value),
          minOrderAmount: c.min_order_amount ? Number(c.min_order_amount) : undefined,
          maxDiscount: c.max_discount ? Number(c.max_discount) : undefined,
          description: c.description,
          isActive: c.is_active ?? true,
          startDate: c.start_date,
          startTime: c.start_time,
          expiresAt: c.expires_at,
          expiryTime: c.expiry_time,
          messageHeading: c.message_heading,
          customerMessage: c.customer_message,
          expiredMessage: c.expired_message,
          invalidMessage: c.invalid_message,
          notStartedMessage: c.not_started_message,
          successMessage: c.success_message,
          applicability: c.applicability || 'all',
          applicableCategorySlugs: Array.isArray(c.applicable_category_slugs) ? c.applicable_category_slugs : [],
          applicableProductIds: Array.isArray(c.applicable_product_ids) ? c.applicable_product_ids : []
        }));
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
        return coupons;
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COUPONS);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [...INITIAL_COUPONS];
  },

  async validateCoupon(
    code: string, 
    currentTotal: number, 
    cartItems?: { productId: string; categoryName?: string; categorySlug?: string; price: number; quantity: number }[]
  ): Promise<{ valid: boolean; coupon?: Coupon; discountAmount: number; error?: string; message?: string }> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discountAmount: 0, error: 'Please enter a coupon code.' };
    }

    const coupons = await this.getCoupons();
    const match = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!match) {
      return { valid: false, discountAmount: 0, error: 'Invalid coupon code.' };
    }

    if (!match.isActive) {
      return { valid: false, discountAmount: 0, error: match.invalidMessage || 'This coupon is currently inactive.' };
    }

    // Check Start Date & Time
    if (match.startDate) {
      const startDateTimeStr = match.startTime ? `${match.startDate}T${match.startTime}` : `${match.startDate}T00:00:00`;
      const startTimeMs = new Date(startDateTimeStr).getTime();
      if (!isNaN(startTimeMs) && Date.now() < startTimeMs) {
        return { 
          valid: false, 
          discountAmount: 0, 
          error: match.notStartedMessage || `This coupon is not active yet. Valid starting from ${match.startDate} ${match.startTime || ''}.` 
        };
      }
    }

    // Check Expiry Date & Time
    if (match.expiresAt) {
      let expiryTimeMs: number;
      if (match.expiresAt.includes('T')) {
        expiryTimeMs = new Date(match.expiresAt).getTime();
      } else {
        const expiryStr = match.expiryTime ? `${match.expiresAt}T${match.expiryTime}` : `${match.expiresAt}T23:59:59`;
        expiryTimeMs = new Date(expiryStr).getTime();
      }

      if (!isNaN(expiryTimeMs) && Date.now() > expiryTimeMs) {
        return { 
          valid: false, 
          discountAmount: 0, 
          error: match.expiredMessage || 'This coupon has expired.' 
        };
      }
    }

    // Determine Eligible Subtotal based on Applicability
    let eligibleSubtotal = currentTotal;
    if (cartItems && cartItems.length > 0 && match.applicability && match.applicability !== 'all') {
      let eligibleItems = cartItems;
      if (match.applicability === 'category' && match.applicableCategorySlugs && match.applicableCategorySlugs.length > 0) {
        eligibleItems = cartItems.filter(item => 
          (item.categorySlug && match.applicableCategorySlugs?.includes(item.categorySlug)) ||
          (item.categoryName && match.applicableCategorySlugs?.some(slug => slug.toLowerCase() === item.categoryName?.toLowerCase()))
        );
      } else if ((match.applicability === 'single_item' || match.applicability === 'multiple_items') && match.applicableProductIds && match.applicableProductIds.length > 0) {
        eligibleItems = cartItems.filter(item => match.applicableProductIds?.includes(item.productId));
      }

      if (eligibleItems.length === 0) {
        return {
          valid: false,
          discountAmount: 0,
          error: `Coupon "${match.code}" is not applicable to the items in your cart.`
        };
      }

      eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }

    if (match.minOrderAmount && currentTotal < match.minOrderAmount) {
      return { 
        valid: false, 
        discountAmount: 0, 
        error: `Minimum order amount of ₹${match.minOrderAmount} required for coupon ${match.code}.` 
      };
    }

    let discount = 0;
    if (match.discountType === 'percentage') {
      discount = Math.round((eligibleSubtotal * match.discountValue) / 100);
      if (match.maxDiscount && discount > match.maxDiscount) {
        discount = match.maxDiscount;
      }
    } else {
      discount = match.discountValue;
    }

    discount = Math.min(discount, eligibleSubtotal);

    return {
      valid: true,
      coupon: match,
      discountAmount: discount,
      message: match.successMessage || `Coupon "${match.code}" applied successfully!`
    };
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    const all = await this.getCoupons();
    const idx = all.findIndex(c => c.id === coupon.id || c.code.toUpperCase() === coupon.code.toUpperCase());
    let updated: Coupon[];
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = coupon;
    } else {
      updated = [coupon, ...all];
    }
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(updated));
    broadcastDataUpdate('coupons');

    try {
      await supabase.from('coupons').upsert({
        id: coupon.id,
        code: coupon.code.toUpperCase(),
        discount_type: coupon.discountType,
        discount_value: coupon.discountValue,
        min_order_amount: coupon.minOrderAmount,
        max_discount: coupon.maxDiscount,
        description: coupon.description,
        is_active: coupon.isActive,
        start_date: coupon.startDate,
        start_time: coupon.startTime,
        expires_at: coupon.expiresAt,
        expiry_time: coupon.expiryTime,
        message_heading: coupon.messageHeading,
        customer_message: coupon.customerMessage,
        expired_message: coupon.expiredMessage,
        invalid_message: coupon.invalidMessage,
        not_started_message: coupon.notStartedMessage,
        success_message: coupon.successMessage,
        applicability: coupon.applicability || 'all',
        applicable_category_slugs: coupon.applicableCategorySlugs || [],
        applicable_product_ids: coupon.applicableProductIds || [],
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase coupons sync notice:', e);
    }
  },

  async deleteCoupon(id: string): Promise<void> {
    const all = await this.getCoupons();
    const updated = all.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(updated));
    broadcastDataUpdate('coupons');

    try {
      await supabase.from('coupons').delete().eq('id', id);
    } catch {}
  },

  generateCouponCode(prefix: string = 'OTT'): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix.toUpperCase()}${code}`;
  },

  // ====================================================================
  // 13. FOOTER CMS
  // ====================================================================
  async getFooterSettings(): Promise<FooterSettings> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('footer_settings')
        .eq('id', 'global')
        .single();

      if (!error && data?.footer_settings) {
        localStorage.setItem(STORAGE_KEYS.FOOTER, JSON.stringify(data.footer_settings));
        return data.footer_settings as FooterSettings;
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FOOTER);
      if (stored) return JSON.parse(stored);
    } catch {}

    return DEFAULT_FOOTER_SETTINGS;
  },

  async saveFooterSettings(footer: FooterSettings): Promise<void> {
    const item = { ...footer, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEYS.FOOTER, JSON.stringify(item));
    broadcastDataUpdate('footer');

    try {
      await supabase.from('admin_settings').upsert({
        id: 'global',
        footer_settings: item,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase footer save error:', e);
    }
  },

  // ====================================================================
  // 14. WHATSAPP CMS & DYNAMIC MESSAGE TEMPLATES
  // ====================================================================
  async getWhatsAppSettings(): Promise<WhatsAppSettings> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('whatsapp_settings, support_whatsapp')
        .eq('id', 'global')
        .single();

      if (!error && data?.whatsapp_settings) {
        const ws = data.whatsapp_settings as WhatsAppSettings;
        if (data.support_whatsapp) ws.number = data.support_whatsapp;
        localStorage.setItem(STORAGE_KEYS.WHATSAPP, JSON.stringify(ws));
        return ws;
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WHATSAPP);
      if (stored) return JSON.parse(stored);
    } catch {}

    return DEFAULT_WHATSAPP_SETTINGS;
  },

  async saveWhatsAppSettings(ws: WhatsAppSettings): Promise<void> {
    const item = { ...ws, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEYS.WHATSAPP, JSON.stringify(item));
    broadcastDataUpdate('whatsapp');

    try {
      await supabase.from('admin_settings').upsert({
        id: 'global',
        support_whatsapp: ws.number,
        whatsapp_settings: item,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase whatsapp save error:', e);
    }
  },

  formatWhatsAppOrderMessage(template: string, orderData: {
    order_id: string;
    customer_name: string;
    customer_phone: string;
    items: string;
    subtotal: number | string;
    coupon_code?: string;
    discount?: number | string;
    final_amount: number | string;
    payment_status?: string;
  }): string {
    let msg = template || DEFAULT_WHATSAPP_SETTINGS.orderMessageTemplate;
    msg = msg.replace(/{{order_id}}/g, String(orderData.order_id || ''));
    msg = msg.replace(/{{customer_name}}/g, String(orderData.customer_name || ''));
    msg = msg.replace(/{{customer_phone}}/g, String(orderData.customer_phone || ''));
    msg = msg.replace(/{{items}}/g, String(orderData.items || ''));
    msg = msg.replace(/{{subtotal}}/g, String(orderData.subtotal || '0'));
    msg = msg.replace(/{{coupon_code}}/g, String(orderData.coupon_code || 'None'));
    msg = msg.replace(/{{discount}}/g, String(orderData.discount || '0'));
    msg = msg.replace(/{{final_amount}}/g, String(orderData.final_amount || '0'));
    msg = msg.replace(/{{payment_status}}/g, String(orderData.payment_status || 'Pending Verification'));
    return msg;
  },

  formatWhatsAppEnquiryMessage(template: string, itemData: {
    item_name: string;
    plan?: string;
    price?: number | string;
    category?: string;
  }): string {
    let msg = template || DEFAULT_WHATSAPP_SETTINGS.itemEnquiryTemplate || 'Hi OTT Sellers, I am interested in "{{item_name}}" ({{plan}}).';
    msg = msg.replace(/{{item_name}}/g, itemData.item_name || 'OTT Subscription');
    msg = msg.replace(/{{plan}}/g, itemData.plan || '1 Month');
    msg = msg.replace(/{{price}}/g, String(itemData.price || ''));
    msg = msg.replace(/{{category}}/g, itemData.category || 'General');
    return msg;
  },

  // ====================================================================
  // 15. REFER & EARN CMS
  // ====================================================================
  async getReferralSettings(): Promise<ReferralSettings> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('referral_settings')
        .eq('id', 'global')
        .single();

      if (!error && data?.referral_settings) {
        localStorage.setItem(STORAGE_KEYS.REFERRAL, JSON.stringify(data.referral_settings));
        return data.referral_settings as ReferralSettings;
      }
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REFERRAL);
      if (stored) return JSON.parse(stored);
    } catch {}

    return DEFAULT_REFERRAL_SETTINGS;
  },

  async saveReferralSettings(ref: ReferralSettings): Promise<void> {
    const item = { ...ref, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEYS.REFERRAL, JSON.stringify(item));
    broadcastDataUpdate('referral');

    try {
      await supabase.from('admin_settings').upsert({
        id: 'global',
        referral_settings: item,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase referral save error:', e);
    }
  },

  // ====================================================================
  // 16. FAST SYNCHRONOUS HYDRATION CACHE GETTERS
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

  getCachedProvidersAdmin(): Provider[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [...INITIAL_PROVIDERS];
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

  getCachedSectionsAdmin(): HomepageSectionCMS[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SECTIONS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [...INITIAL_HOMEPAGE_SECTIONS];
  },

  getCachedCouponsAdmin(): Coupon[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COUPONS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [...INITIAL_COUPONS];
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
  }
};

export const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    userName: 'Karthik S.',
    userEmail: 'karthik@example.com',
    productName: 'Netflix Premium 4K (Private PIN)',
    productId: 'prod-1',
    rating: 5,
    comment: 'Got my 4-digit PIN within 60 seconds on WhatsApp! Streaming UHD HDR flawlessly on my LG OLED.',
    status: 'approved',
    displayLocations: ['home', 'items'],
    pageType: 'home',
    displayOrder: 1,
    date: '06 Oct 2026'
  },
  {
    id: 'rev-2',
    userName: 'Ananya Sharma',
    userEmail: 'ananya@example.com',
    productName: 'Prime Video 4K UHD',
    productId: 'prod-2',
    rating: 5,
    comment: 'Super fast delivery and prompt customer support on WhatsApp. Highly recommended!',
    status: 'approved',
    displayLocations: ['home', 'items'],
    pageType: 'home',
    displayOrder: 2,
    date: '05 Oct 2026'
  },
  {
    id: 'rev-3',
    userName: 'Vikram Joshi',
    userEmail: 'vikram@example.com',
    productName: 'Disney+ Hotstar Super Plan',
    productId: 'prod-3',
    rating: 4,
    comment: 'Working fine for cricket matches, high quality stream without buffering.',
    status: 'approved',
    displayLocations: ['home'],
    pageType: 'home',
    displayOrder: 3,
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
    displayLocations: ['home', 'items'],
    pageType: 'home',
    displayOrder: 4,
    date: '07 Oct 2026'
  }
];
