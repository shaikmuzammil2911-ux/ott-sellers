# OTT SELLERS — Stream More. Pay Less.

Official modern customer-facing e-commerce web platform for **OTT SELLERS**.

Built with React 18, TypeScript, Vite, and custom CSS design system matching the OTT SELLERS brand visual identity.

---

## 🌟 Key Features & Complete Customer Flow

1. **Brand Identity & Aesthetics**:
   - Deep navy, brand red, blue, orange, green, and white color palette directly derived from the official OTT SELLERS logo.
   - Cinematic OTT marketplace hero with glowing ambient lights, streaming brand pills, and multi-device preview.
   - Fully responsive design engineered for large screens, desktops, laptops, tablets, and smartphones.

2. **Complete Navigation & Customer Pages**:
   - **Header & Mobile Drawer**: Sticky blur header with categories dropdown, live search bar, user profile pill, and cart counter badge.
   - **Mobile Bottom Navigation**: Fixed bottom navigation bar (`Home`, `Categories`, `Search`, `Cart`, `Account`) with safe-area spacing.
   - **Main Categories** (`/category/:slug`): Movies & Series, Live TV, Sports, Kids, Premium Apps with banner, subnav pills, price range filters, and sort options.
   - **Subcategories**: Direct routes for Netflix, Amazon Prime, Disney+ Hotstar, ZEE5, SonyLIV, YouTube Premium, JioCinema, Lionsgate Play, Crunchyroll, Spotify, Canva Pro.
   - **Product Detail Experience** (`/product/:slug`):
     - Interactive multi-duration Plan Selector (`1 Month`, `3 Months`, `6 Months`, `12 Months`) with real-time price & savings updates.
     - Direct `Add to Cart`, `Buy Now`, and contextual `WhatsApp Enquiry` buttons.
     - Tabbed specifications: Features & Specs, Delivery & Deliverables, Streaming Rules, and FAQ accordion.
   - **Curated Catalogs** (`/catalogs` & `/catalog/:slug`): Entertainment, Sports Arena, Family & Kids, Productivity & Creator Tools, Mega Combo Bundles.
   - **Instant Search** (`/search?q=...`): Live search with suggestions, popular tags, query counter, and empty states.
   - **Cart** (`/cart`): Persistent cart state via LocalStorage, plan duration badges, quantity controls, price calculation, and checkout trigger.
   - **Checkout Experience** (`/checkout`):
     - Customer contact details (Full Name, WhatsApp Number, Mobile, Email).
     - Multi-option payment UI (UPI QR Code & ID `ottsellers@upi`, Card, Net Banking).
     - Payment screenshot upload with live image preview.
   - **Order Lifecycle & History**:
     - Payment Success (`/checkout/success`) with Order ID (`OTS-2026-XXXXX`), receipt details, and WhatsApp verification.
     - Payment Failed (`/checkout/failed`) with troubleshooting and retry options.
     - Customer Account Dashboard (`/account`).
     - Order History (`/account/orders`) with status badges (`Pending`, `Paid`, `Processing`, `Delivered`, `Completed`, `Cancelled`).
     - Order Credentials View (`/account/orders/:id`) with one-click credential copy and profile PIN instructions.
   - **Floating WhatsApp Assistance**:
     - Intelligent contextual message generation according to the user's active page and item.

3. **Backend-Ready Architecture**:
   - Abstracted API service layer (`src/services/api.ts`) ready to connect with Supabase / PostgreSQL / REST APIs without rewriting frontend components.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
npm install
```

### Run Locally (Dev Server)
```bash
npm run dev
```
Visit `http://localhost:5173/` in your browser.

### Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
├── public/
│   ├── logo.png                # Official OTT SELLERS logo
│   └── desktop-reference.png   # Design reference
├── src/
│   ├── components/
│   │   ├── common/             # ProductCard, CategoryCard, Breadcrumb, SkeletonCard, EmptyState
│   │   ├── home/               # Hero, MainCategories, SubCategories, Trending, Popular, Offers, etc.
│   │   └── layout/             # Header, AnnouncementBar, MobileBottomNav, Footer, WhatsAppButton
│   ├── context/
│   │   ├── AuthContext.tsx     # Customer authentication & profile state
│   │   └── CartContext.tsx     # Shopping cart state with LocalStorage persistence
│   ├── data/
│   │   ├── categoriesData.ts   # Main & subcategories
│   │   ├── productsData.ts     # Products with multi-duration plans
│   │   ├── catalogsData.ts     # Curated collections
│   │   └── mockOrders.ts       # Realistic order history & credentials
│   ├── pages/                  # All customer-facing route pages
│   ├── services/
│   │   └── api.ts              # Abstracted data access service
│   ├── styles/
│   │   ├── variables.css       # Brand tokens & colors
│   │   └── index.css           # Global typography & responsive grid
│   ├── types/                  # TypeScript interfaces
│   ├── App.tsx                 # Route declarations & global providers
│   └── main.tsx                # React entry point
└── package.json
```

---

© 2026 OTT SELLERS. All rights reserved.
