export type PlanDuration = '1 Month' | '3 Months' | '6 Months' | '12 Months';

export interface ProductPlan {
  duration: PlanDuration;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  isPopular?: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug: string;
  subcategoryName: string;
  catalogSlugs: string[];
  image: string;
  bannerImage?: string;
  brandColor: string;
  brandLogoText?: string;
  rating: number;
  reviewsCount: number;
  defaultPlan: PlanDuration;
  plans: ProductPlan[];
  price?: number;
  comparePrice?: number;
  features: string[];
  deliverables: string[];
  rules: string[];
  faqs: { question: string; answer: string }[];
  isTrending?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  inOffers?: boolean;
  offerPrice?: number;
  offerOriginalPrice?: number;
  offerDiscountPercentage?: number;
  displayOrder?: number;
  status?: 'ON' | 'OFF';
  inStock: boolean;
  stockCount?: number;
  warrantyPeriod: string;
  badge?: string;
  updatedAt?: number;
}

export type BannerImageMode = 'solid-color' | 'image-blur' | 'image-only';
export type BannerTextPosition = 'left' | 'center' | 'right';
export type BannerDisplayStyle = 'auto-slide' | 'fixed' | 'manual-slide' | 'single';
export type BannerTargetPage = 'home' | 'courses' | 'items' | 'categories' | 'offers' | 'all';

export interface HeroBanner {
  id: string;
  name?: string;
  title: string;
  subtitle: string;
  description?: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  desktopImage: string;
  mobileImage: string;
  mode: BannerImageMode;
  solidColor?: string;
  textPosition: BannerTextPosition;
  displayOrder: number;
  page: BannerTargetPage;
  slot: string; // e.g. '01', '02', 'hero', 'top'
  style: BannerDisplayStyle;
  autoplay: boolean;
  interval: number; // in seconds (e.g. 5)
  status: 'ON' | 'OFF';
  badgeText?: string;
  showText?: boolean;
  titleColor?: string;
  subtitleColor?: string;
  badgeColor?: string;
  updatedAt?: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  iconName?: string;
  badgeColor?: string;
  bgGradient?: string;
  titlesCount?: string;
  image?: string;
  status?: 'ON' | 'OFF';
  displayOrder?: number;
  updatedAt?: number;
}

export interface SubCategory {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  logo: string;
  popularProductSlug: string;
  brandColor: string;
}

export interface Catalog {
  id: string;
  slug: string;
  name: string;
  badge: string;
  description: string;
  longDescription: string;
  image: string;
  productCount: number;
  productSlugs: string[];
  discountText: string;
}

export interface CartItem {
  productId: string;
  productSlug: string;
  name: string;
  image: string;
  categoryName: string;
  planDuration: PlanDuration;
  price: number;
  originalPrice: number;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  description?: string;
  isActive: boolean;
  expiresAt?: string;
}

export type OrderStatus = 'Pending' | 'Paid' | 'Processing' | 'Delivered' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Success' | 'Failed' | 'Paid';

export interface OrderItem {
  productId: string;
  name: string;
  planDuration: string;
  price: number;
  quantity: number;
  credentials?: {
    email?: string;
    profilePin?: string;
    instruction?: string;
  } | string;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerWhatsApp: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponDiscount?: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  screenshotUrl?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  whatsapp: string;
  role?: 'customer' | 'admin';
  joinedDate: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  content?: string;
  imageUrl: string;
  price: number;
  comparePrice?: number;
  duration?: string;
  status: 'published' | 'draft' | 'archived';
  isFeatured?: boolean;
  sortOrder?: number;
  features?: string[];
  curriculum?: string[];
  faqs?: { question: string; answer: string }[];
  categorySlug?: string;
  updatedAt?: number;
}

export interface HomepageSectionCMS {
  id: string;
  sectionKey: string;
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  settings?: Record<string, any>;
  isActive?: boolean;
  updatedAt?: number;
}

export interface FooterQuickLink {
  label: string;
  url: string;
}

export interface FooterSettings {
  description: string;
  quickLinks: FooterQuickLink[];
  customerSupportLinks: FooterQuickLink[];
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  copyrightText: string;
  tagline: string;
  socialInstagram?: string;
  socialYoutube?: string;
  socialTelegram?: string;
  updatedAt?: number;
}

export interface WhatsAppSettings {
  number: string;
  buttonText: string;
  isActive: boolean;
  position: 'bottom-right' | 'bottom-left';
  displayPages: 'all' | 'home' | 'items' | 'cart';
  tagMessage: string;
  orderMessageTemplate: string;
  updatedAt?: number;
}

export interface ReferralSettings {
  isEnabled: boolean;
  rewardAmount: number;
  rewardUnit: 'INR' | 'percent';
  rules: string[];
  shareMessage: string;
  referralCodePrefix: string;
  updatedAt?: number;
}

export interface AdminSettings {
  id: string;
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  supportWhatsApp: string;
  announcementText: string;
  razorpayKeyId?: string;
  smtpHost?: string;
  smtpUser?: string;
  randomNotificationsActive?: boolean;
  footer?: FooterSettings;
  whatsapp?: WhatsAppSettings;
  referral?: ReferralSettings;
  updatedAt?: number;
}

export interface AuditLog {
  id: string;
  adminUser: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  timestamp: string;
}

export interface CustomerReview {
  id: string;
  userName: string;
  userEmail: string;
  productName: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  pageType?: 'home' | 'courses' | 'items' | 'categories' | 'offers' | 'all';
  pageId?: string;
  displayOrder?: number;
  date: string;
  updatedAt?: number;
}

export interface SiteNotification {
  id: string;
  buyerName: string;
  location: string;
  productName: string;
  slug: string;
  plan: string;
  timeText: string;
  imageUrl: string;
  message?: string;
  isActive: boolean;
  displayOrder?: number;
  updatedAt?: number;
}

