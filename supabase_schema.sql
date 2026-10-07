-- ====================================================================
-- OTT SELLERS — PRODUCTION SUPABASE DATABASE SCHEMA INITIALIZATION
-- Run this complete script in Supabase Dashboard -> SQL Editor
-- (Project URL: https://akupmiajdyojhfhdtwft.supabase.co)
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Linked with Auth Users & Customers / Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  auth_user_id UUID UNIQUE,
  name TEXT NOT NULL DEFAULT 'Customer',
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
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
  status TEXT DEFAULT 'ON' CHECK (status IN ('ON', 'OFF')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUB-CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.sub_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
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

-- 4. PRODUCTS TABLE (OTT Subscriptions & Digital Passes)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  category_slug TEXT NOT NULL,
  category_name TEXT NOT NULL,
  subcategory_id TEXT REFERENCES public.sub_categories(id) ON DELETE SET NULL,
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
  status TEXT DEFAULT 'ON' CHECK (status IN ('ON', 'OFF')),
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

-- 5. COURSES TABLE (Courses, Tutorials & Digital Learning Bundles)
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id TEXT REFERENCES public.sub_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  content TEXT,
  image_url TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_price NUMERIC(10,2) DEFAULT 0,
  duration TEXT DEFAULT '4 Weeks',
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  curriculum JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BANNERS TABLE (Promotional Hero Carousels)
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  button_text TEXT DEFAULT 'Shop Now',
  button_url TEXT DEFAULT '/items',
  secondary_button_text TEXT DEFAULT 'Explore Categories',
  secondary_button_url TEXT DEFAULT '#categories',
  badge_text TEXT,
  mode TEXT DEFAULT 'image-only' CHECK (mode IN ('image-only', 'image-blur', 'solid-color')),
  text_position TEXT DEFAULT 'left' CHECK (text_position IN ('left', 'center', 'right')),
  solid_color TEXT DEFAULT '#070d1e',
  show_text BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'ON' CHECK (status IN ('ON', 'OFF')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HOMEPAGE SECTIONS TABLE (CMS for Hero & Homepage Blocks)
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDERS TABLE
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
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Success', 'Paid', 'Failed')),
  order_status TEXT DEFAULT 'Processing' CHECK (order_status IN ('Pending', 'Processing', 'Paid', 'Delivered', 'Completed', 'Cancelled', 'Failed')),
  payment_method TEXT DEFAULT 'UPI',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  screenshot_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
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

-- 10. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'Success',
  method TEXT DEFAULT 'UPI',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_user TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ADMIN SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  site_name TEXT DEFAULT 'OTT SELLERS',
  support_email TEXT DEFAULT 'Fixyourmobiles7@gmail.com',
  support_phone TEXT DEFAULT '+91 9441323332',
  support_whatsapp TEXT DEFAULT '9441323332',
  announcement_text TEXT DEFAULT '🔥 Flash Sale: Flat 70% Off on All Annual OTT Subscriptions! Instant WhatsApp Credentials Delivery.',
  admin_password_hash TEXT,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMPTZ,
  razorpay_key_id TEXT DEFAULT 'rzp_test_placeholder',
  razorpay_key_secret TEXT,
  smtp_host TEXT DEFAULT 'smtp.gmail.com',
  smtp_port INT DEFAULT 465,
  smtp_user TEXT DEFAULT 'Fixyourmobiles7@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Public READ access for customer-facing store items
DROP POLICY IF EXISTS "Public categories read" ON public.categories;
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public subcategories read" ON public.sub_categories;
CREATE POLICY "Public subcategories read" ON public.sub_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public products read" ON public.products;
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public courses read" ON public.courses;
CREATE POLICY "Public courses read" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public banners read" ON public.banners;
CREATE POLICY "Public banners read" ON public.banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public homepage_sections read" ON public.homepage_sections;
CREATE POLICY "Public homepage_sections read" ON public.homepage_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public reviews read" ON public.reviews;
CREATE POLICY "Public reviews read" ON public.reviews FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Public admin_settings read" ON public.admin_settings;
CREATE POLICY "Public admin_settings read" ON public.admin_settings FOR SELECT USING (true);

-- Customers can create orders and read their own orders
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read orders" ON public.orders;
CREATE POLICY "Anyone can read orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert order_items" ON public.order_items;
CREATE POLICY "Anyone can insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read order_items" ON public.order_items;
CREATE POLICY "Anyone can read order_items" ON public.order_items FOR SELECT USING (true);

-- Public / Authenticated full management policies (enabled for Admin app / anon API with key)
DROP POLICY IF EXISTS "Full access categories" ON public.categories;
CREATE POLICY "Full access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access sub_categories" ON public.sub_categories;
CREATE POLICY "Full access sub_categories" ON public.sub_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access products" ON public.products;
CREATE POLICY "Full access products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access courses" ON public.courses;
CREATE POLICY "Full access courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access banners" ON public.banners;
CREATE POLICY "Full access banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access homepage_sections" ON public.homepage_sections;
CREATE POLICY "Full access homepage_sections" ON public.homepage_sections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access orders" ON public.orders;
CREATE POLICY "Full access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access order_items" ON public.order_items;
CREATE POLICY "Full access order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access payments" ON public.payments;
CREATE POLICY "Full access payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access reviews" ON public.reviews;
CREATE POLICY "Full access reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access audit_logs" ON public.audit_logs;
CREATE POLICY "Full access audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access admin_settings" ON public.admin_settings;
CREATE POLICY "Full access admin_settings" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access profiles" ON public.profiles;
CREATE POLICY "Full access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- SEED INITIAL DATA
-- ====================================================================

-- Default Admin Profile
INSERT INTO public.profiles (id, name, email, phone, role)
VALUES ('admin-1', 'Super Admin', 'Fixyourmobiles7@gmail.com', '+91 9441323332', 'admin')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Default Admin Settings
INSERT INTO public.admin_settings (id, site_name, support_email, support_phone, support_whatsapp, announcement_text)
VALUES (
  'global', 
  'OTT SELLERS', 
  'Fixyourmobiles7@gmail.com', 
  '+91 9441323332', 
  '9441323332', 
  '🔥 Flash Sale: Flat 70% Off on All Annual OTT Subscriptions! Code: OTT70'
)
ON CONFLICT (id) DO NOTHING;

-- Initial Hero Section in CMS
INSERT INTO public.homepage_sections (section_key, title, subtitle, description, image_url, settings, is_active, sort_order)
VALUES (
  'hero',
  'All Your Favourite OTT Subscriptions in One Place',
  'Stream 4K Ultra HD on Netflix, Prime Video, Disney+ Hotstar, ZEE5 & Sony LIV with instant private PIN activation.',
  'Verified 4K streaming accounts with instant WhatsApp credentials delivery and full duration replacement warranty.',
  '/hero-bg.png',
  '{"badgeText": "Your Entertainment, Our Priority", "ctaText": "Shop Now", "ctaLink": "/items", "secondaryCtaText": "Explore Categories", "secondaryCtaLink": "#categories", "mobileImage": "/hero-mobile-1.png"}'::jsonb,
  true,
  1
)
ON CONFLICT (section_key) DO NOTHING;

-- Initial Banners
INSERT INTO public.banners (id, title, subtitle, image_url, mobile_image_url, button_text, button_url, secondary_button_text, secondary_button_url, badge_text, sort_order, is_active, status)
VALUES 
(
  'banner-1',
  'All Your Favourite OTT Subscriptions in One Place',
  'Stream 4K Ultra HD on Netflix, Prime Video, Disney+ Hotstar, ZEE5 & Sony LIV with instant private PIN activation.',
  '/hero-bg.png',
  '/hero-mobile-1.png',
  'Shop Now',
  '/items',
  'Explore Categories',
  '#categories',
  'Your Entertainment, Our Priority',
  1,
  true,
  'ON'
),
(
  'banner-2',
  'Live Sports Arena & 4K Blockbuster Movies',
  'Catch ICC World Cricket, Premier League, IPL matches and top Hollywood & Bollywood releases without buffering.',
  '/hero-desktop-2.jpg',
  '/hero-mobile-2.jpg',
  'Get Sports Pass',
  '/items?category=sports',
  'Browse Movies',
  '/category/movies-series',
  'Stadium Live Action • Zero Ads',
  2,
  true,
  'ON'
),
(
  'banner-3',
  'All-In-One Mega Entertainment Combo Packs',
  'Save up to 70% with bundled streaming passes. Instant WhatsApp credentials delivery and full duration warranty.',
  '/hero-desktop-3.jpg',
  '/hero-mobile-3.jpg',
  'Grab Mega Offer',
  '/product/ultimate-binge-combo',
  'View Special Offers',
  '/offers',
  'Special Discount • Up to 70% Off',
  3,
  true,
  'ON'
)
ON CONFLICT (id) DO NOTHING;

-- Initial Categories
INSERT INTO public.categories (id, name, slug, description, short_description, icon_name, badge_color, bg_gradient, titles_count, image_url, sort_order, is_active, status)
VALUES
(
  'cat-1',
  'Movies & TV Series',
  'movies-series',
  'Ultra HD premium subscriptions for blockbuster cinemas, Hollywood, Bollywood & global TV series.',
  'Netflix, Prime Video, JioCinema, Sony LIV & more.',
  'Film',
  '#e50914',
  'linear-gradient(135deg, #1f070b 0%, #070d1e 100%)',
  '12+ Plans',
  'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=60',
  1,
  true,
  'ON'
),
(
  'cat-2',
  'Live Sports Passes',
  'sports',
  'Non-stop cricket, football, F1, tennis and live athletic tournaments in crisp 50 FPS.',
  'SonyLIV, FanCode, Willow TV & JioCinema Sports.',
  'Trophy',
  '#0284c7',
  'linear-gradient(135deg, #071927 0%, #070d1e 100%)',
  '6+ Plans',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
  2,
  true,
  'ON'
),
(
  'cat-3',
  'All-In-One Combos',
  'combos',
  'Maximum savings bundling multiple services into single billing cycles.',
  'Ultimate Binge Packs (3-in-1, 5-in-1 combinations).',
  'Boxes',
  '#f59e0b',
  'linear-gradient(135deg, #241804 0%, #070d1e 100%)',
  '5+ Bundles',
  'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop&q=60',
  3,
  true,
  'ON'
),
(
  'cat-4',
  'Regional Channels',
  'regional',
  'South Indian, Hindi, Bengali & Marathi premium regional entertainment networks.',
  'ZEE5, Sun NXT, Aha Video, Hoichoi.',
  'Tv',
  '#10b981',
  'linear-gradient(135deg, #072216 0%, #070d1e 100%)',
  '8+ Plans',
  'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=60',
  4,
  true,
  'ON'
),
(
  'cat-5',
  'Music & Audio Streaming',
  'music',
  'Lossless high-fidelity audio, podcast channels & ad-free offline playback.',
  'Spotify Premium, YouTube Music, Apple Music.',
  'Headphones',
  '#ec4899',
  'linear-gradient(135deg, #270719 0%, #070d1e 100%)',
  '4+ Plans',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
  5,
  true,
  'ON'
)
ON CONFLICT (id) DO NOTHING;

-- Initial Products (Netflix, Prime Video, Disney+ Hotstar, Sony LIV, ZEE5, Ultimate Binge Combo)
INSERT INTO public.products (
  id, name, slug, tagline, category_slug, category_name, subcategory_slug, subcategory_name,
  image_url, brand_color, brand_logo_text, rating, reviews_count, default_plan, plans,
  price, compare_price, in_stock, status, is_featured, is_popular, is_trending, in_offers,
  offer_price, offer_original_price, offer_discount_percentage, features, deliverables, rules, faqs
)
VALUES
(
  'prod-netflix-4k',
  'Netflix Premium 4K UHD Private Profile',
  'netflix-premium-4k-uhd',
  'Private 4K Ultra HD Profile with 4-Digit PIN Lock & Zero Buffering',
  'movies-series',
  'Movies & TV Series',
  'netflix',
  'Netflix',
  'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
  '#e50914',
  'NETFLIX',
  4.9,
  248,
  '1 Month',
  '[{"duration":"1 Month","price":199,"originalPrice":649,"discountPercentage":69,"isPopular":true},{"duration":"3 Months","price":549,"originalPrice":1947,"discountPercentage":72},{"duration":"6 Months","price":999,"originalPrice":3894,"discountPercentage":74},{"duration":"12 Months","price":1899,"originalPrice":7788,"discountPercentage":76}]'::jsonb,
  199,
  649,
  true,
  'ON',
  true,
  true,
  true,
  true,
  199,
  649,
  69,
  '["Private Screen with 4-Digit Security PIN","Dolby Vision & Dolby Atmos 4K Ultra HD Audio","Works on Smart TV, Firestick, Mobile, PC & iPad","100% Genuine Subscription with Complete Duration Warranty","Instant Credentials & Profile Assignment on WhatsApp"]'::jsonb,
  '["Official Netflix Login ID & Password","Your Assigned Profile Number & 4-Digit PIN","Quick Login Video Guide for Smart TVs"]'::jsonb,
  '["Do NOT change account password or email address","Use only your assigned private profile","Do not share credentials with non-subscribers"]'::jsonb,
  '[{"question":"Can I use it on my Smart TV?","answer":"Yes, it works smoothly on Samsung, LG, Android TV, Firestick, Apple TV, PC and Phones."},{"question":"Is it safe and legal?","answer":"Yes! These are genuine wholesale corporate passes with 100% replacement warranty."}]'::jsonb
),
(
  'prod-prime-video',
  'Amazon Prime Video UHD Official Pass',
  'amazon-prime-video-pass',
  'Ad-Free Full HD Streaming with X-Ray Bonus Features',
  'movies-series',
  'Movies & TV Series',
  'prime-video',
  'Prime Video',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
  '#0284c7',
  'PRIME VIDEO',
  4.8,
  186,
  '1 Month',
  '[{"duration":"1 Month","price":99,"originalPrice":299,"discountPercentage":67,"isPopular":true},{"duration":"3 Months","price":249,"originalPrice":897,"discountPercentage":72},{"duration":"6 Months","price":449,"originalPrice":1794,"discountPercentage":75},{"duration":"12 Months","price":799,"originalPrice":3588,"discountPercentage":78}]'::jsonb,
  99,
  299,
  true,
  'ON',
  true,
  true,
  false,
  true,
  99,
  299,
  67,
  '["Full HD & 4K UHD Stream Quality","Exclusive Prime Originals & Global Blockbusters","Download for Offline Viewing","Full Duration Replacement Warranty"]'::jsonb,
  '["Amazon Prime Video Credentials","Profile Selection Instructions"]'::jsonb,
  '["Do not modify account credentials","Single device login per pass"]'::jsonb,
  '[{"question":"How soon do I get access?","answer":"Credentials are automatically dispatched to your WhatsApp within 5 to 15 minutes of payment."}]'::jsonb
),
(
  'prod-disney-hotstar',
  'Disney+ Hotstar Premium All Access',
  'disney-hotstar-premium',
  'Live Cricket, Marvel Universe, Disney Classics & HBO Hits in 4K',
  'movies-series',
  'Movies & TV Series',
  'hotstar',
  'Disney+ Hotstar',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80',
  '#0c5adb',
  'HOTSTAR',
  4.9,
  214,
  '3 Months',
  '[{"duration":"3 Months","price":199,"originalPrice":499,"discountPercentage":60},{"duration":"6 Months","price":349,"originalPrice":899,"discountPercentage":61},{"duration":"12 Months","price":599,"originalPrice":1499,"discountPercentage":60,"isPopular":true}]'::jsonb,
  199,
  499,
  true,
  'ON',
  true,
  true,
  true,
  true,
  199,
  499,
  60,
  '["Live Cricket World Cup & IPL Matches","4K 2160p Ultra HD Video Quality","Dolby 5.1 Surround Sound","Ad-Free Movies & Series"]'::jsonb,
  '["Disney+ Hotstar OTP/Login Activation Token","Instant setup assistance via WhatsApp"]'::jsonb,
  '["Keep login on authorized device"]'::jsonb,
  '[{"question":"Does it cover ICC & IPL matches?","answer":"Yes, all live sports tournaments are included in 50 FPS."}]'::jsonb
),
(
  'prod-sony-liv',
  'Sony LIV Premium Sports & Originals',
  'sony-liv-premium',
  'Champions League, WWE Raw, KBC & Sony Entertainment Shows',
  'sports',
  'Live Sports Passes',
  'sony-liv',
  'Sony LIV',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
  '#10b981',
  'SONY LIV',
  4.7,
  112,
  '1 Month',
  '[{"duration":"1 Month","price":89,"originalPrice":299,"discountPercentage":70},{"duration":"3 Months","price":219,"originalPrice":699,"discountPercentage":69,"isPopular":true},{"duration":"12 Months","price":499,"originalPrice":1499,"discountPercentage":67}]'::jsonb,
  89,
  299,
  true,
  'ON',
  true,
  false,
  false,
  false,
  null,
  null,
  null,
  '["UEFA Champions League, European Football & UFC","Full HD Livestreams","Zero buffer on fast broadband","Immediate activation"]'::jsonb,
  '["Login ID & Password for Sony LIV"]'::jsonb,
  '["Do not share credentials"]'::jsonb,
  '[]'::jsonb
),
(
  'prod-combo-binge',
  'Ultimate Binge Combo (Netflix 4K + Prime + Hotstar)',
  'ultimate-binge-combo',
  'The Holy Trinity of Streaming at an Unbelievable 75% Discount',
  'combos',
  'All-In-One Combos',
  'mega-combo',
  'Combo Packs',
  'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80',
  '#f59e0b',
  'MEGA COMBO',
  5.0,
  340,
  '1 Month',
  '[{"duration":"1 Month","price":399,"originalPrice":1447,"discountPercentage":72,"isPopular":true},{"duration":"3 Months","price":999,"originalPrice":4341,"discountPercentage":77},{"duration":"6 Months","price":1799,"originalPrice":8682,"discountPercentage":79},{"duration":"12 Months","price":3299,"originalPrice":17364,"discountPercentage":81}]'::jsonb,
  399,
  1447,
  true,
  'ON',
  true,
  true,
  true,
  true,
  399,
  1447,
  72,
  '["Netflix 4K Ultra HD Private Profile PIN","Amazon Prime Video Official Pass","Disney+ Hotstar All-Access Pass","Single Bill & Combined WhatsApp Support","Save over ₹1,000 every single month"]'::jsonb,
  '["Credentials for all 3 streaming platforms dispatched in single message","Setup guide for Smart TV multi-app login"]'::jsonb,
  '["Follow individual platform profile rules"]'::jsonb,
  '[{"question":"Can I activate all 3 on the same TV?","answer":"Yes, install Netflix, Prime Video and Disney+ Hotstar apps on your Smart TV and enter your respective credentials."}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Initial Courses (Course Catalog & Masterclasses per Prompt)
INSERT INTO public.courses (
  id, title, slug, short_description, description, content, image_url,
  price, compare_price, duration, status, is_featured, features
)
VALUES
(
  'course-ott-reselling',
  'OTT Subscriptions Reselling Mastery Course',
  'ott-subscriptions-reselling-mastery',
  'Learn how to build a 6-figure monthly digital reselling business with verified bulk distributors.',
  'Complete step-by-step masterclass covering supplier sourcing, payment gateways, WhatsApp automation bots, Facebook/Instagram ads, customer management, and replacement warranty handling.',
  'Module 1: Introduction to Wholesale Digital Goods\nModule 2: Direct Tier-1 Supplier Sourcing\nModule 3: Setting Up Automated WhatsApp Billing Bots\nModule 4: Marketing on Social Media & Telegram Channels\nModule 5: Payment Gateway Setup & Risk Management',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
  499,
  1999,
  '3 Hours Video Masterclass',
  'published',
  true,
  '["Access to 10+ Verified Direct Wholesale Suppliers","Ready-to-use WhatsApp Order Message Templates","Excel Customer Tracker & Expiry Notification Sheet","Lifetime Discord / WhatsApp Community Access"]'::jsonb
),
(
  'course-digital-marketing-ecommerce',
  'High-Converting Meta Ads for Digital Products',
  'high-converting-meta-ads-digital-products',
  'Master Facebook & Instagram Ads to sell digital services and memberships with 5x+ ROAS.',
  'Comprehensive blueprint for ad creatives, audience targeting in India/GCC, tracking conversions without website bans, and automating customer onboarding.',
  'Module 1: Creative Ad Design using Canva\nModule 2: Campaign Structure & Budget Optimization\nModule 3: Retargeting Custom Audiences\nModule 4: Handling Customer Queries on WhatsApp',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
  399,
  1499,
  '2.5 Hours Masterclass',
  'published',
  true,
  '["Copy-paste Ad Headlines & Hooks","Targeting Cheatsheet for Digital Entertainment Buyers","Video Ad Templates & Mockups"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- SUCCESS MESSAGE
-- ====================================================================
-- All tables, foreign keys, RLS security policies, and seed data initialized!
