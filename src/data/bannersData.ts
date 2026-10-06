import { HeroBanner } from '../types';

export const INITIAL_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    title: 'All Your Favourite OTT Subscriptions in One Place',
    subtitle: 'Stream 4K Ultra HD on Netflix, Prime Video, Disney+ Hotstar, ZEE5 & Sony LIV with instant private PIN activation.',
    ctaText: 'Shop Now',
    ctaLink: '/items',
    secondaryCtaText: 'Explore Categories',
    secondaryCtaLink: '#categories',
    desktopImage: '/hero-bg.png',
    mobileImage: '/hero-mobile-1.png',
    mode: 'image-only',
    textPosition: 'left',
    displayOrder: 1,
    status: 'ON',
    badgeText: 'Your Entertainment, Our Priority',
    showText: true,
    updatedAt: Date.now()
  },
  {
    id: 'banner-2',
    title: 'Live Sports Arena & 4K Blockbuster Movies',
    subtitle: 'Catch ICC World Cricket, Premier League, IPL matches and top Hollywood & Bollywood releases without buffering.',
    ctaText: 'Get Sports Pass',
    ctaLink: '/items?category=sports',
    secondaryCtaText: 'Browse Movies',
    secondaryCtaLink: '/category/movies-series',
    desktopImage: '/hero-desktop-2.jpg',
    mobileImage: '/hero-mobile-2.jpg',
    mode: 'image-only',
    textPosition: 'left',
    displayOrder: 2,
    status: 'ON',
    badgeText: 'Stadium Live Action • Zero Ads',
    showText: true,
    updatedAt: Date.now()
  },
  {
    id: 'banner-3',
    title: 'All-In-One Mega Entertainment Combo Packs',
    subtitle: 'Save up to 70% with bundled streaming passes. Instant WhatsApp credentials delivery and full duration warranty.',
    ctaText: 'Grab Mega Offer',
    ctaLink: '/product/ultimate-binge-combo',
    secondaryCtaText: 'View Special Offers',
    secondaryCtaLink: '#offers',
    desktopImage: '/hero-desktop-3.jpg',
    mobileImage: '/hero-mobile-3.jpg',
    mode: 'image-only',
    textPosition: 'left',
    displayOrder: 3,
    status: 'ON',
    badgeText: 'Special Discount • Up to 70% Off',
    showText: true,
    updatedAt: Date.now()
  }
];
