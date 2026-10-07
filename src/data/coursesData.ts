import { Course } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-ott-reselling',
    title: 'OTT Subscriptions Reselling Mastery Course',
    slug: 'ott-subscriptions-reselling-mastery',
    shortDescription: 'Learn how to build a 6-figure monthly digital reselling business with verified bulk wholesale distributors.',
    description: 'Complete step-by-step masterclass covering supplier sourcing, payment gateways, WhatsApp automation bots, Facebook/Instagram ads, customer management, and replacement warranty handling.',
    content: 'Module 1: Introduction to Wholesale Digital Goods\nModule 2: Direct Tier-1 Supplier Sourcing\nModule 3: Setting Up Automated WhatsApp Billing Bots\nModule 4: Marketing on Social Media & Telegram Channels\nModule 5: Payment Gateway Setup & Risk Management',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    price: 499,
    comparePrice: 1999,
    duration: '3 Hours Video Masterclass',
    status: 'published',
    isFeatured: true,
    features: [
      'Access to 10+ Verified Direct Wholesale Suppliers',
      'Ready-to-use WhatsApp Order Message Templates',
      'Excel Customer Tracker & Expiry Notification Sheet',
      'Lifetime Discord / WhatsApp Community Access'
    ],
    curriculum: [
      '1. Introduction to Digital OTT Reselling Model',
      '2. Connecting with Authentic Wholesale Suppliers',
      '3. Creating Your Brand & Pricing Strategy',
      '4. Setting Up WhatsApp Business & Auto-responders',
      '5. Scaling to 100+ Daily Orders with Paid Ads'
    ],
    faqs: [
      {
        question: 'Do I need prior technical experience?',
        answer: 'No, this course is designed for absolute beginners and provides actionable templates.'
      },
      {
        question: 'Will I get supplier contacts?',
        answer: 'Yes, full verified direct supplier list is included in the resources folder.'
      }
    ],
    categorySlug: 'combos',
    updatedAt: Date.now()
  },
  {
    id: 'course-digital-marketing-ecommerce',
    title: 'High-Converting Meta Ads for Digital Products',
    slug: 'high-converting-meta-ads-digital-products',
    shortDescription: 'Master Facebook & Instagram Ads to sell digital services and memberships with 5x+ ROAS.',
    description: 'Comprehensive blueprint for ad creatives, audience targeting in India/GCC, tracking conversions without website bans, and automating customer onboarding.',
    content: 'Module 1: Creative Ad Design using Canva\nModule 2: Campaign Structure & Budget Optimization\nModule 3: Retargeting Custom Audiences\nModule 4: Handling Customer Queries on WhatsApp',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    price: 399,
    comparePrice: 1499,
    duration: '2.5 Hours Masterclass',
    status: 'published',
    isFeatured: true,
    features: [
      'Copy-paste Ad Headlines & Hooks',
      'Targeting Cheatsheet for Digital Entertainment Buyers',
      'Video Ad Templates & Mockups'
    ],
    curriculum: [
      '1. Setting Up Business Manager & Ad Accounts',
      '2. Crafting High-CTR Visuals',
      '3. Budget Allocation & Testing Strategies',
      '4. WhatsApp Direct-to-Chat Ad Campaigns'
    ],
    faqs: [
      {
        question: 'What budget do I need to start ads?',
        answer: 'You can start with as little as ₹200 to ₹500 per day to test creatives.'
      }
    ],
    categorySlug: 'movies-series',
    updatedAt: Date.now()
  }
];
