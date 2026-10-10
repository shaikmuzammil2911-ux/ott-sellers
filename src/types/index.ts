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

export interface Provider {
  id: string;
  name: string;
  slug: string;
  categorySlug?: string;
  logo?: string;
  brandColor?: string;
  displayOrder?: number;
  isActive: boolean;
  description?: string;
  updatedAt?: number;
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
  providerId?: string;
  providerSlug?: string;
  providerName?: string;
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
export type BannerVerticalPlacement = 'top' | 'center' | 'bottom';
export type BannerDisplayStyle = 'auto-slide' | 'fixed' | 'manual-slide' | 'single';
export type BannerTargetPage = 'home' | 'courses' | 'items' | 'categories' | 'offers' | 'all';

export interface BannerButton {
  id: string;
  label: string;
  link: string;
  style?: 'primary' | 'secondary' | 'outline' | 'ghost';
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  placement?: 'left' | 'center' | 'right';
  target?: '_self' | '_blank';
}

export interface HeroBanner {
  id: string;
  name?: string;
  groupName?: string;
  title: string;
  subtitle: string;
  description?: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  buttons?: BannerButton[];
  desktopImage: string;
  mobileImage: string;
  mode: BannerImageMode;
  solidColor?: string;
  textPosition: BannerTextPosition;
  contentPlacement?: BannerVerticalPlacement;
  buttonPlacement?: BannerTextPosition;
  btnBgColor?: string;
  btnTextColor?: string;
  btnBorderColor?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  displayOrder: number;
  page: BannerTargetPage;
  slot: string; // e.g. '01', '02', 'hero', 'top', or custom group ID
  style: BannerDisplayStyle;
  autoplay: boolean;
  interval: number; // in seconds (e.g. 5)
  status: 'ON' | 'OFF';
  badgeText?: string;
  showText?: boolean;
  titleColor?: string;
  subtitleColor?: string;
  badgeColor?: string;
  descriptionColor?: string;
  updatedAt?: number;
}

export interface BannerGroup {
  id: string;
  name: string;
  slot: string;
  page: BannerTargetPage;
  style: BannerDisplayStyle;
  autoplay: boolean;
  interval: number;
  status: 'ON' | 'OFF';
  description?: string;
  bannerCount?: number;
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
  placements?: ('home' | 'items' | 'offers' | string)[];
  providerId?: string;
  providerSlug?: string;
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
  isActive?: boolean;
  displayOrder?: number;
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

export type CouponApplicability = 'all' | 'category' | 'single_item' | 'multiple_items';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  description?: string;
  isActive: boolean;
  startDate?: string;
  startTime?: string;
  expiresAt?: string;
  expiryTime?: string;
  messageHeading?: string;
  customerMessage?: string;
  expiredMessage?: string;
  invalidMessage?: string;
  notStartedMessage?: string;
  successMessage?: string;
  applicability?: CouponApplicability;
  applicableCategorySlugs?: string[];
  applicableProductIds?: string[];
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
  id?: string;
  label: string;
  url: string;
  group?: string;
  displayOrder?: number;
  status?: 'ON' | 'OFF';
}

export interface FooterSettings {
  description: string;
  quickLinks: FooterQuickLink[];
  customerSupportLinks: FooterQuickLink[];
  additionalLinks?: FooterQuickLink[];
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
  generalMessage?: string;
  generalMessageTemplate?: string;
  customerEnquiryTemplate?: string;
  itemEnquiryTemplate?: string;
  orderMessageTemplate: string;
  contactMessageTemplate?: string;
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
  logoUrl?: string;
  faviconUrl?: string;
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
  userEmail?: string;
  productName: string;
  productId?: string;
  categorySlug?: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  displayLocations?: ('home' | 'courses' | 'items' | 'categories' | 'offers' | 'all')[];
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
  startDate?: string;
  startTime?: string;
  expiresAt?: string;
  expiryTime?: string;
  type?: 'purchase' | 'alert' | 'announcement';
  updatedAt?: number;
}

export interface ItemsPageCMS {
  mainHeading: string;
  mainSubtitle: string;
  quickSearchHeading: string;
  categoriesHeading: string;
  itemsListingHeading: string;
  updatedAt?: number;
}


