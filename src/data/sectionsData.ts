import { HomepageSectionCMS } from '../types';

export const INITIAL_HOMEPAGE_SECTIONS: HomepageSectionCMS[] = [
  {
    id: 'sec-hero',
    sectionKey: 'hero',
    name: 'Hero Promotional Banner',
    title: 'All Your Favourite OTT Subscriptions in One Place',
    subtitle: 'Stream 4K Ultra HD on Netflix, Prime Video, Disney+ Hotstar, ZEE5 & Sony LIV with instant private PIN activation.',
    description: 'Verified 4K streaming accounts with instant WhatsApp credentials delivery and full duration replacement warranty.',
    imageUrl: '/hero-bg.png',
    displayOrder: 1,
    isActive: true,
    settings: {
      badgeText: 'Your Entertainment, Our Priority',
      ctaText: 'Shop Now',
      ctaLink: '/items',
      secondaryCtaText: 'Explore Categories',
      secondaryCtaLink: '#categories',
      mobileImage: '/hero-mobile-1.png'
    },
    updatedAt: Date.now()
  },
  {
    id: 'sec-categories',
    sectionKey: 'categories',
    name: 'Categories Bar',
    title: 'Explore Categories',
    displayOrder: 2,
    isActive: true,
    settings: {},
    updatedAt: Date.now()
  },
  {
    id: 'sec-featured',
    sectionKey: 'featured',
    name: 'Featured & Trending OTT Subscriptions',
    title: 'Featured Subscriptions',
    displayOrder: 3,
    isActive: true,
    settings: {},
    updatedAt: Date.now()
  },
  {
    id: 'sec-courses',
    sectionKey: 'courses',
    name: 'Courses & Masterclass Bundles',
    title: 'Masterclasses & Learning Bundles',
    displayOrder: 4,
    isActive: true,
    settings: {},
    updatedAt: Date.now()
  },
  {
    id: 'sec-reviews',
    sectionKey: 'reviews',
    name: 'Customer Reviews & Ratings',
    title: 'Customer Reviews',
    displayOrder: 5,
    isActive: true,
    settings: {},
    updatedAt: Date.now()
  },
  {
    id: 'sec-why-us',
    sectionKey: 'why_choose_us',
    name: 'Why Choose Us / Trust Badges',
    title: 'Why Choose OTT SELLERS',
    displayOrder: 6,
    isActive: true,
    settings: {},
    updatedAt: Date.now()
  },
  {
    id: 'sec-notifications',
    sectionKey: 'notifications',
    name: 'Live Purchase Popup Notifications',
    title: 'Live Purchase Notification',
    displayOrder: 7,
    isActive: true,
    settings: {},
    updatedAt: Date.now()
  }
];
