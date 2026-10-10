-- ====================================================================
-- OTT SELLERS — LATEST COMPLETE SUPABASE DATABASE SCHEMA & SEED SCRIPT
-- Execute this entire script in Supabase Dashboard -> SQL Editor
-- (Project URL: https://akupmiajdyojhfhdtwft.supabase.co)
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. PROFILES & AUTH
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  auth_user_id UUID,
  name TEXT DEFAULT 'Customer',
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ====================================================================
-- 2. CATEGORIES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  icon_name TEXT DEFAULT 'Compass',
  badge_color TEXT DEFAULT '#0284c7',
  bg_gradient TEXT DEFAULT 'linear-gradient(135deg, #070d1e 0%, #0b132b 100%)',
  titles_count TEXT DEFAULT '10+ Plans',
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'ON',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'Compass';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT '#0284c7';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS bg_gradient TEXT DEFAULT 'linear-gradient(135deg, #070d1e 0%, #0b132b 100%)';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS titles_count TEXT DEFAULT '10+ Plans';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ON';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS placements TEXT[] DEFAULT ARRAY['home', 'items']::TEXT[];

-- ====================================================================
-- 3. SUB-CATEGORIES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.sub_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id TEXT,
  category_slug TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  logo TEXT,
  popular_product_slug TEXT,
  brand_color TEXT DEFAULT '#0284c7',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sub_categories ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE public.sub_categories ADD COLUMN IF NOT EXISTS category_slug TEXT;
ALTER TABLE public.sub_categories ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE public.sub_categories ADD COLUMN IF NOT EXISTS popular_product_slug TEXT;
ALTER TABLE public.sub_categories ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#0284c7';
ALTER TABLE public.sub_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.sub_categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- ====================================================================
-- 4. PRODUCTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id TEXT,
  category_slug TEXT NOT NULL,
  category_name TEXT NOT NULL,
  subcategory_id TEXT,
  subcategory_slug TEXT,
  subcategory_name TEXT,
  catalog_slugs JSONB DEFAULT '[]'::jsonb,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  banner_image_url TEXT,
  brand_color TEXT DEFAULT '#0b132b',
  brand_logo_text TEXT,
  rating NUMERIC(2,1) DEFAULT 4.9,
  reviews_count INT DEFAULT 128,
  default_plan TEXT DEFAULT '1 Month',
  plans JSONB NOT NULL DEFAULT '[]'::jsonb,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_price NUMERIC(10,2) DEFAULT 0,
  stock INT DEFAULT 999,
  in_stock BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'ON',
  is_featured BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  in_offers BOOLEAN DEFAULT false,
  offer_price NUMERIC(10,2),
  offer_original_price NUMERIC(10,2),
  offer_discount_percentage INT,
  features JSONB DEFAULT '[]'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  rules JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  warranty_period TEXT DEFAULT 'Full Duration Replacement Warranty',
  badge TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#0b132b';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand_logo_text TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS default_plan TEXT DEFAULT '1 Month';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS plans JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compare_price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ON';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_offers BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer_price NUMERIC(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer_original_price NUMERIC(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer_discount_percentage INT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rules JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warranty_period TEXT DEFAULT 'Full Duration Replacement Warranty';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- ====================================================================
-- 5. BANNERS & SLOTS CMS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  button_text TEXT DEFAULT 'Shop Now',
  button_url TEXT DEFAULT '/items',
  secondary_button_text TEXT DEFAULT 'Explore Categories',
  secondary_button_url TEXT DEFAULT '#categories',
  badge_text TEXT DEFAULT 'SPECIAL OFFER',
  badge_color TEXT DEFAULT '#38bdf8',
  title_color TEXT DEFAULT '#ffffff',
  subtitle_color TEXT DEFAULT '#cbd5e1',
  page TEXT DEFAULT 'home',
  slot TEXT DEFAULT '01',
  style TEXT DEFAULT 'auto-slide',
  autoplay BOOLEAN DEFAULT true,
  interval INT DEFAULT 5,
  mode TEXT DEFAULT 'image-only',
  text_position TEXT DEFAULT 'left',
  content_placement TEXT DEFAULT 'center',
  button_placement TEXT DEFAULT 'left',
  btn_bg_color TEXT DEFAULT '#0284c7',
  btn_text_color TEXT DEFAULT '#ffffff',
  overlay_color TEXT DEFAULT '#000000',
  overlay_opacity NUMERIC DEFAULT 0.4,
  solid_color TEXT DEFAULT '#070d1e',
  show_text BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'ON',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS desktop_image_url TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS mobile_image_url TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Shop Now';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS button_url TEXT DEFAULT '/items';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS secondary_button_text TEXT DEFAULT 'Explore Categories';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS secondary_button_url TEXT DEFAULT '#categories';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS badge_text TEXT DEFAULT 'SPECIAL OFFER';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT '#38bdf8';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS title_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS subtitle_color TEXT DEFAULT '#cbd5e1';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS page TEXT DEFAULT 'home';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS slot TEXT DEFAULT '01';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'auto-slide';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS autoplay BOOLEAN DEFAULT true;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS interval INT DEFAULT 5;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'image-only';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS text_position TEXT DEFAULT 'left';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS content_placement TEXT DEFAULT 'center';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS button_placement TEXT DEFAULT 'left';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS btn_bg_color TEXT DEFAULT '#0284c7';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS btn_text_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS overlay_color TEXT DEFAULT '#000000';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS overlay_opacity NUMERIC DEFAULT 0.4;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS solid_color TEXT DEFAULT '#070d1e';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS show_text BOOLEAN DEFAULT true;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ON';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ====================================================================
-- 6. HOMEPAGE SECTIONS CMS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  section_key TEXT UNIQUE NOT NULL,
  name TEXT,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ====================================================================
-- 7. COUPONS MANAGEMENT TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2),
  max_discount NUMERIC(10,2),
  description TEXT,
  start_date TEXT,
  start_time TEXT,
  expires_at TIMESTAMPTZ,
  expiry_time TEXT,
  expired_message TEXT,
  invalid_message TEXT,
  not_started_message TEXT,
  success_message TEXT,
  applicability TEXT DEFAULT 'all',
  applicable_category_slugs TEXT[],
  applicable_product_ids TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC(10,2);
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS max_discount NUMERIC(10,2);
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS start_date TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS expiry_time TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS expired_message TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS invalid_message TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS not_started_message TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS success_message TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applicability TEXT DEFAULT 'all';
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applicable_category_slugs TEXT[];
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applicable_product_ids TEXT[];
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ====================================================================
-- 8. CUSTOMER REVIEWS TABLE (Live CMS Moderation)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.customer_reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_name TEXT NOT NULL,
  user_email TEXT,
  product_name TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  status TEXT DEFAULT 'approved',
  page_type TEXT DEFAULT 'home',
  page_id TEXT,
  display_order INT DEFAULT 1,
  date_str TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS rating INT DEFAULT 5;
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'home';
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS page_id TEXT;
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 1;
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS date_str TEXT;
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  product_id TEXT,
  author TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  title TEXT,
  comment TEXT NOT NULL,
  status TEXT DEFAULT 'approved',
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 9. RANDOM PURCHASE NOTIFICATIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.site_notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  buyer_name TEXT NOT NULL,
  location TEXT NOT NULL,
  product_name TEXT NOT NULL,
  slug TEXT,
  plan TEXT DEFAULT '1 Month',
  time_text TEXT DEFAULT '2 mins ago',
  image_url TEXT,
  message TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS buyer_name TEXT;
ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT '1 Month';
ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS time_text TEXT DEFAULT '2 mins ago';
ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 1;
ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.site_notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ====================================================================
-- 10. ORDERS & ORDER ITEMS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE,
  user_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  coupon_discount NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  payment_status TEXT DEFAULT 'Pending',
  order_status TEXT DEFAULT 'Processing',
  payment_method TEXT DEFAULT 'UPI',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  screenshot_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_whatsapp TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'UPI';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT,
  product_id TEXT,
  course_id TEXT,
  name TEXT NOT NULL,
  image_url TEXT,
  plan_duration TEXT DEFAULT '1 Month',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  credentials JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 11. AUDIT LOGS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_user TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 12. ADMIN SETTINGS & FULL CMS (Footer, WhatsApp, Referral)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  site_name TEXT DEFAULT 'OTT SELLERS',
  support_email TEXT DEFAULT 'OttSellers1@gmail.com',
  support_phone TEXT DEFAULT '+91 9441323332',
  support_whatsapp TEXT DEFAULT '9441323332',
  announcement_text TEXT DEFAULT '🔥 Flash Sale: Flat 70% Off on All Annual OTT Subscriptions! Instant WhatsApp Credentials Delivery.',
  admin_password_hash TEXT,
  razorpay_key_id TEXT DEFAULT 'rzp_test_placeholder',
  razorpay_key_secret TEXT,
  smtp_host TEXT DEFAULT 'smtp.gmail.com',
  smtp_port INT DEFAULT 465,
  smtp_user TEXT DEFAULT 'OttSellers1@gmail.com',
  random_notifications_active BOOLEAN DEFAULT true,
  footer_settings JSONB DEFAULT '{
    "description": "India''s most trusted digital subscription platform. Enjoy verified premium OTT accounts, instant automated credentials delivery, full replacement guarantee and 24/7 dedicated WhatsApp support.",
    "tagline": "STREAM MORE. PAY LESS.",
    "copyrightText": "© 2026 OTT Sellers. All rights reserved.",
    "contactEmail": "OttSellers1@gmail.com",
    "contactPhone": "+91 9441323332",
    "whatsappNumber": "9441323332",
    "quickLinks": [
      {"label": "Home", "url": "/"},
      {"label": "All Subscriptions", "url": "/items"},
      {"label": "Special Offers", "url": "/offers"},
      {"label": "Categories", "url": "/items"},
      {"label": "My Orders", "url": "/account/orders"}
    ],
    "customerSupportLinks": [
      {"label": "Track Order Status", "url": "/account/orders"},
      {"label": "WhatsApp 24/7 Helpline", "url": "https://wa.me/919441323332"},
      {"label": "FAQs & Help Center", "url": "/search?q=faq"},
      {"label": "Replacement Policy", "url": "#refund"},
      {"label": "Terms & Conditions", "url": "#terms"}
    ],
    "socialInstagram": "https://instagram.com",
    "socialYoutube": "https://youtube.com",
    "socialTelegram": "https://t.me"
  }'::jsonb,
  whatsapp_settings JSONB DEFAULT '{
    "number": "9441323332",
    "buttonText": "Chat with Us",
    "isActive": true,
    "position": "bottom-right",
    "displayPages": "all",
    "tagMessage": "Need instant help or quick subscription activation? Chat with us live on WhatsApp!",
    "orderMessageTemplate": "Hello OTT Sellers, I would like to place an order:\nOrder ID: {{order_id}}\nCustomer: {{customer_name}} ({{customer_phone}})\nItems:\n{{items}}\nSubtotal: ₹{{subtotal}}\nCoupon Applied: {{coupon_code}} (Discount: ₹{{discount}})\nFinal Total: ₹{{final_amount}}\nPayment Status: {{payment_status}}\nPlease verify and send credentials."
  }'::jsonb,
  referral_settings JSONB DEFAULT '{
    "isEnabled": true,
    "rewardAmount": 50,
    "rewardUnit": "INR",
    "referralCodePrefix": "REF",
    "shareMessage": "Hey! I save up to 80% on OTT subscriptions using OTT Sellers. Use my link to get instant cashback on your first purchase!",
    "rules": [
      "Share your unique referral link or code with friends.",
      "When your friend makes their first purchase, they get an extra 10% off.",
      "You earn ₹50 instant wallet credit once their order is verified.",
      "Credits can be redeemed on any future subscription purchase."
    ]
  }'::jsonb,
  items_page_cms JSONB DEFAULT '{
    "mainHeading": "All Subscriptions & Premium Accounts",
    "mainSubtitle": "100% verified private profiles, instant WhatsApp delivery & replacement guarantee.",
    "quickSearchHeading": "Quick Search",
    "categoriesHeading": "Explore Categories",
    "itemsListingHeading": "All Available Plans"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '/logo.png';
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS footer_settings JSONB;
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS whatsapp_settings JSONB;
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS referral_settings JSONB;
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS items_page_cms JSONB;
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS admin_password_hash TEXT;
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS random_notifications_active BOOLEAN DEFAULT true;

-- Update products with provider columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS provider_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS provider_slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS provider_name TEXT;

-- Update categories with provider columns
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS provider_id TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS provider_slug TEXT;

-- Update coupons with customer message fields
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS message_heading TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS customer_message TEXT;

-- Update customer_reviews with display locations and associations
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS display_locations TEXT[] DEFAULT ARRAY['home']::TEXT[];
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE public.customer_reviews ADD COLUMN IF NOT EXISTS category_slug TEXT;


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Grant public read access
DROP POLICY IF EXISTS "Public categories read" ON public.categories;
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public subcategories read" ON public.sub_categories;
CREATE POLICY "Public subcategories read" ON public.sub_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public products read" ON public.products;
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public banners read" ON public.banners;
CREATE POLICY "Public banners read" ON public.banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public homepage_sections read" ON public.homepage_sections;
CREATE POLICY "Public homepage_sections read" ON public.homepage_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public coupons read" ON public.coupons;
CREATE POLICY "Public coupons read" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public customer_reviews read" ON public.customer_reviews;
CREATE POLICY "Public customer_reviews read" ON public.customer_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public site_notifications read" ON public.site_notifications;
CREATE POLICY "Public site_notifications read" ON public.site_notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public admin_settings read" ON public.admin_settings;
CREATE POLICY "Public admin_settings read" ON public.admin_settings FOR SELECT USING (true);

-- Customer orders insertion
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read orders" ON public.orders;
CREATE POLICY "Anyone can read orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert order_items" ON public.order_items;
CREATE POLICY "Anyone can insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read order_items" ON public.order_items;
CREATE POLICY "Anyone can read order_items" ON public.order_items FOR SELECT USING (true);

-- Full management policies for store administration
DROP POLICY IF EXISTS "Full access categories" ON public.categories;
CREATE POLICY "Full access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access sub_categories" ON public.sub_categories;
CREATE POLICY "Full access sub_categories" ON public.sub_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access products" ON public.products;
CREATE POLICY "Full access products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access banners" ON public.banners;
CREATE POLICY "Full access banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access homepage_sections" ON public.homepage_sections;
CREATE POLICY "Full access homepage_sections" ON public.homepage_sections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access coupons" ON public.coupons;
CREATE POLICY "Full access coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access customer_reviews" ON public.customer_reviews;
CREATE POLICY "Full access customer_reviews" ON public.customer_reviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access site_notifications" ON public.site_notifications;
CREATE POLICY "Full access site_notifications" ON public.site_notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access orders" ON public.orders;
CREATE POLICY "Full access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access order_items" ON public.order_items;
CREATE POLICY "Full access order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access audit_logs" ON public.audit_logs;
CREATE POLICY "Full access audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access admin_settings" ON public.admin_settings;
CREATE POLICY "Full access admin_settings" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access profiles" ON public.profiles;
CREATE POLICY "Full access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- SEED INITIAL STOREFRONT DATA
-- ====================================================================

-- 1. Admin Profile
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    INSERT INTO public.profiles (name, email, phone, role)
    VALUES ('OTT Sellers Admin', 'OttSellers1@gmail.com', '+91 9441323332', 'admin');
  ELSE
    INSERT INTO public.profiles (id, name, email, phone, role)
    VALUES ('admin-1', 'OTT Sellers Admin', 'OttSellers1@gmail.com', '+91 9441323332', 'admin')
    ON CONFLICT (id) DO UPDATE SET 
      name = EXCLUDED.name,
      email = EXCLUDED.email, 
      role = EXCLUDED.role;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 2. Admin Settings Global Row
INSERT INTO public.admin_settings (
  id, site_name, support_email, support_phone, support_whatsapp, announcement_text
)
VALUES (
  'global', 
  'OTT SELLERS', 
  'OttSellers1@gmail.com', 
  '+91 9441323332', 
  '9441323332', 
  '🔥 Flash Sale: Flat 70% Off on All Annual OTT Subscriptions! Instant WhatsApp Credentials Delivery.'
)
ON CONFLICT (id) DO UPDATE SET 
  site_name = EXCLUDED.site_name,
  support_email = EXCLUDED.support_email,
  support_phone = EXCLUDED.support_phone,
  support_whatsapp = EXCLUDED.support_whatsapp;

-- 3. Categories
INSERT INTO public.categories (id, name, slug, description, short_description, icon_name, badge_color, bg_gradient, titles_count, is_active, status, sort_order)
VALUES
  ('cat-1', 'Movies & Series', 'movies-series', 'Watch the latest Bollywood, Hollywood and web series in 4K UHD.', '4K Movies & Web Series', 'Film', '#e50914', 'linear-gradient(135deg, #1f0406 0%, #0b132b 100%)', '15+ Platforms', true, 'ON', 1),
  ('cat-2', 'Live Sports', 'live-sports', 'Stream Live IPL, Premier League, Formula 1, NBA and Tennis in HDR.', 'Live Cricket & Football', 'Trophy', '#10b981', 'linear-gradient(135deg, #022013 0%, #0b132b 100%)', '8+ Platforms', true, 'ON', 2),
  ('cat-3', 'Music & Audio', 'music-audio', 'High Fidelity Lossless music streaming without annoying advertisements.', 'Ad-Free High Fidelity Music', 'Smile', '#1db954', 'linear-gradient(135deg, #03200e 0%, #0b132b 100%)', '6+ Platforms', true, 'ON', 3),
  ('cat-4', 'Anime & Cartoons', 'anime', 'Simulcast direct from Japan with English subtitles and dubbing.', 'Simulcast Anime & Animation', 'Crown', '#f59e0b', 'linear-gradient(135deg, #241401 0%, #0b132b 100%)', '5+ Platforms', true, 'ON', 4),
  ('cat-5', 'Productivity & AI', 'productivity-tools', 'Premium AI tools, cloud storage, Canva Pro and creative software licenses.', 'AI & Design Tools', 'Compass', '#6366f1', 'linear-gradient(135deg, #100f2e 0%, #0b132b 100%)', '12+ Tools', true, 'ON', 5)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  icon_name = EXCLUDED.icon_name,
  badge_color = EXCLUDED.badge_color,
  bg_gradient = EXCLUDED.bg_gradient,
  titles_count = EXCLUDED.titles_count,
  status = EXCLUDED.status;

-- 4. Hero Banners
INSERT INTO public.banners (id, name, title, subtitle, description, image_url, desktop_image_url, mobile_image_url, button_text, button_url, badge_text, badge_color, title_color, subtitle_color, page, slot, style, autoplay, interval, sort_order, display_order, is_active, status)
VALUES
  (
    'banner-1',
    'Mega OTT Binge Fest',
    'ALL YOUR FAVOURITE OTT PLATFORMS',
    'Stream 4K Ultra HD on Netflix, Prime Video, Disney+ Hotstar & Sony LIV with instant WhatsApp PIN delivery.',
    'Verified private screen profiles with 100% full replacement guarantee.',
    '/hero-bg.png',
    '/hero-bg.png',
    '/hero-mobile-1.png',
    'Shop Now',
    '/items',
    '70% OFF FLASH SALE',
    '#38bdf8',
    '#ffffff',
    '#cbd5e1',
    'home',
    '01',
    'auto-slide',
    true,
    5,
    1,
    1,
    true,
    'ON'
  ),
  (
    'banner-2',
    'Live Cricket & Sports Pass',
    'LIVE CRICKET & FOOTBALL IN 4K HDR',
    'Catch every match with Hotstar, SonyLIV & FanCode premium pass.',
    'Zero buffer streams on TV, mobile and laptop.',
    '/hero-bg.png',
    '/hero-bg.png',
    '/hero-mobile-1.png',
    'Get Sports Pass',
    '/items?category=live-sports',
    'CRICKET SPECIAL',
    '#22c55e',
    '#ffffff',
    '#cbd5e1',
    'home',
    '01',
    'auto-slide',
    true,
    5,
    2,
    2,
    true,
    'ON'
  )
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  status = EXCLUDED.status;

-- 5. Products (Sample OTT Subscriptions)
INSERT INTO public.products (
  id, name, slug, tagline, category_slug, category_name, image_url, brand_color, brand_logo_text,
  rating, reviews_count, default_plan, price, compare_price, stock, in_stock, status, is_featured, is_popular, is_trending,
  features, plans, sort_order
)
VALUES
  (
    'prod-1',
    'Netflix Premium 4K UHD',
    'netflix-premium-4k',
    'Private Profile with 4-Digit Security PIN',
    'movies-series',
    'Movies & Series',
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80',
    '#e50914',
    'NETFLIX',
    4.9,
    1450,
    '1 Month',
    199,
    649,
    999,
    true,
    'ON',
    true,
    true,
    true,
    '["Private Screen with personal 4-Digit PIN", "4K Ultra HD + HDR Audio", "Works on Smart TV, Laptop, Mobile & Firestick", "Full Duration Instant Replacement Guarantee"]'::jsonb,
    '[
      {"duration": "1 Month", "price": 199, "originalPrice": 649, "discountPercentage": 69, "isPopular": true},
      {"duration": "3 Months", "price": 549, "originalPrice": 1947, "discountPercentage": 72},
      {"duration": "6 Months", "price": 999, "originalPrice": 3894, "discountPercentage": 74},
      {"duration": "12 Months", "price": 1899, "originalPrice": 7788, "discountPercentage": 76}
    ]'::jsonb,
    1
  ),
  (
    'prod-2',
    'Amazon Prime Video 4K',
    'amazon-prime-video-4k',
    'Ad-Free 4K Streaming with X-Ray & Subtitles',
    'movies-series',
    'Movies & Series',
    'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=500&auto=format&fit=crop&q=80',
    '#00a8e1',
    'PRIME',
    4.8,
    920,
    '1 Month',
    129,
    299,
    999,
    true,
    'ON',
    true,
    true,
    false,
    '["Ultra HD 4K Streaming", "Ad-Free uninterrupted access", "Supports TV, Mobile & PC", "Instant delivery on WhatsApp"]'::jsonb,
    '[
      {"duration": "1 Month", "price": 129, "originalPrice": 299, "discountPercentage": 57, "isPopular": true},
      {"duration": "3 Months", "price": 349, "originalPrice": 897, "discountPercentage": 61},
      {"duration": "6 Months", "price": 599, "originalPrice": 1794, "discountPercentage": 67},
      {"duration": "12 Months", "price": 999, "originalPrice": 1499, "discountPercentage": 33}
    ]'::jsonb,
    2
  ),
  (
    'prod-3',
    'Disney+ Hotstar Super',
    'disney-hotstar-super',
    'Live Cricket & Blockbuster Disney Originals',
    'live-sports',
    'Live Sports',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
    '#113ccf',
    'HOTSTAR',
    4.9,
    1100,
    '1 Month',
    149,
    499,
    999,
    true,
    'ON',
    true,
    false,
    true,
    '["Live Cricket Tournaments & IPL", "Full HD 1080p + Dolby 5.1", "Disney, Marvel, Pixar & HBO originals", "Instant credentials via WhatsApp"]'::jsonb,
    '[
      {"duration": "1 Month", "price": 149, "originalPrice": 499, "discountPercentage": 70, "isPopular": true},
      {"duration": "3 Months", "price": 399, "originalPrice": 899, "discountPercentage": 56},
      {"duration": "12 Months", "price": 699, "originalPrice": 1499, "discountPercentage": 53}
    ]'::jsonb,
    3
  ),
  (
    'prod-4',
    'Spotify Premium Individual',
    'spotify-premium',
    'Lossless Audio with Unlimited Skips & Offline Downloads',
    'music-audio',
    'Music & Audio',
    'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=500&auto=format&fit=crop&q=80',
    '#1db954',
    'SPOTIFY',
    4.9,
    880,
    '1 Month',
    79,
    119,
    999,
    true,
    'ON',
    false,
    true,
    false,
    '["Zero ads interruption", "Offline downloads on mobile", "High Quality 320kbps audio", "On your own account or pre-activated"]'::jsonb,
    '[
      {"duration": "1 Month", "price": 79, "originalPrice": 119, "discountPercentage": 34, "isPopular": true},
      {"duration": "3 Months", "price": 199, "originalPrice": 357, "discountPercentage": 44},
      {"duration": "6 Months", "price": 349, "originalPrice": 714, "discountPercentage": 51},
      {"duration": "12 Months", "price": 599, "originalPrice": 1188, "discountPercentage": 50}
    ]'::jsonb,
    4
  )
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  tagline = EXCLUDED.tagline,
  price = EXCLUDED.price,
  compare_price = EXCLUDED.compare_price,
  plans = EXCLUDED.plans,
  features = EXCLUDED.features,
  status = EXCLUDED.status;

-- 6. Coupons
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_order_amount, max_discount, description, is_active)
VALUES
  ('coup-1', 'OTT10', 'percentage', 10, 199, 100, 'Flat 10% discount on all subscriptions', true),
  ('coup-2', 'SAVE50', 'fixed', 50, 299, 50, 'Flat ₹50 instant deduction on orders above ₹299', true),
  ('coup-3', 'FESTIVE20', 'percentage', 20, 499, 200, 'Festive promotional 20% discount', true)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  min_order_amount = EXCLUDED.min_order_amount,
  max_discount = EXCLUDED.max_discount,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 7. Customer Testimonials
INSERT INTO public.customer_reviews (id, user_name, user_email, product_name, rating, comment, status, page_type, display_order, date_str)
VALUES
  ('rev-1', 'Karthik S.', 'karthik@gmail.com', 'Netflix Premium 4K (Private PIN)', 5, 'Got my 4-digit PIN within 60 seconds on WhatsApp! Streaming UHD HDR flawlessly on my LG OLED.', 'approved', 'home', 1, '06 Oct 2026'),
  ('rev-2', 'Ananya Sharma', 'ananya@gmail.com', 'Prime Video 4K UHD', 5, 'Super fast delivery and prompt customer support on WhatsApp. Highly recommended!', 'approved', 'home', 2, '05 Oct 2026'),
  ('rev-3', 'Vikram Joshi', 'vikram@gmail.com', 'Disney+ Hotstar Super Plan', 5, 'Working fine for cricket matches, high quality stream without buffering.', 'approved', 'home', 3, '04 Oct 2026'),
  ('rev-4', 'Deepak V.', 'deepak@gmail.com', 'OTT Reseller Combo Pack', 5, 'Best rates in the market with full duration warranty. Worth every rupee.', 'approved', 'home', 4, '07 Oct 2026')
ON CONFLICT (id) DO NOTHING;

-- 8. Live Site Notifications (Purchase Toasts)
INSERT INTO public.site_notifications (id, buyer_name, location, product_name, slug, plan, time_text, image_url, message, is_active, display_order)
VALUES
  ('notif-1', 'Rohan K.', 'Mumbai', 'Netflix Premium 4K', 'netflix-premium-4k', '1 Month', '2 mins ago', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&auto=format&fit=crop&q=80', 'purchased Netflix Premium 4K', true, 1),
  ('notif-2', 'Pooja M.', 'Bengaluru', 'Prime Video 4K', 'amazon-prime-video-4k', '3 Months', '5 mins ago', 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=100&auto=format&fit=crop&q=80', 'purchased Amazon Prime Video', true, 2),
  ('notif-3', 'Amit S.', 'Delhi NCR', 'Disney+ Hotstar Super', 'disney-hotstar-super', '12 Months', '8 mins ago', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=100&auto=format&fit=crop&q=80', 'activated Disney+ Hotstar Annual Plan', true, 3)
ON CONFLICT (id) DO NOTHING;

-- 9. Homepage Sections CMS Seed
INSERT INTO public.homepage_sections (id, section_key, name, title, subtitle, description, image_url, sort_order, display_order, is_active)
VALUES
  ('sec-hero', 'hero', 'Hero Promotional Banner', 'All Your Favourite OTT Subscriptions in One Place', 'Stream 4K Ultra HD on Netflix, Prime Video, Disney+ Hotstar', 'Verified 4K streaming accounts with instant WhatsApp credentials delivery.', '/hero-bg.png', 1, 1, true),
  ('sec-categories', 'categories', 'Categories Bar', 'Explore Categories', 'Browse curated streaming passes by genre.', 'Select from movies, sports, music, and productivity passes.', NULL, 2, 2, true),
  ('sec-featured', 'featured', 'Featured & Trending Subscriptions', 'Featured Subscriptions', 'Top Handpicked Deals', 'Best value OTT streaming passes with instant delivery.', NULL, 3, 3, true),
  ('sec-courses', 'courses', 'Courses & Masterclass Bundles', 'Masterclasses & Learning Bundles', 'Upgrade Your Digital Skills', 'Get access to premium masterclasses and creative tools.', NULL, 4, 4, true),
  ('sec-reviews', 'reviews', 'Customer Reviews & Ratings', 'Customer Reviews', 'Verified Testimonials', 'Read what our happy subscribers have to say.', NULL, 5, 5, true),
  ('sec-why-us', 'why_choose_us', 'Why Choose Us / Trust Badges', 'Why Choose OTT SELLERS', 'Verified & Fast', 'Verified streaming, zero buffer, instant WhatsApp dispatch.', NULL, 6, 6, true),
  ('sec-notifications', 'notifications', 'Live Purchase Popup Notifications', 'Live Purchase Notification', 'Real-Time Sales Alerts', 'Real-time sales alerts popups.', NULL, 7, 7, true)
ON CONFLICT (section_key) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;


