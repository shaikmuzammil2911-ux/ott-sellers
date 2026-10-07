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

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
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
  status: 'ON' | 'OFF';
  badgeText?: string;
  showText?: boolean;
  updatedAt?: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription: string;
  iconName?: string;
  badgeColor?: string;
  bgGradient?: string;
  titlesCount: string;
  image: string;
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
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  settings?: Record<string, any>;
  isActive?: boolean;
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
