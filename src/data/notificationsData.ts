import { SiteNotification } from '../types';

export const INITIAL_NOTIFICATIONS: SiteNotification[] = [
  {
    id: 'notif-1',
    buyerName: 'Rahul V.',
    location: 'Mumbai',
    productName: 'Netflix Premium (4K UHD)',
    slug: 'netflix-premium',
    plan: '3 Months',
    timeText: '2 mins ago',
    imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&auto=format&fit=crop&q=80',
    message: 'Someone just purchased Netflix Premium 4K plan',
    isActive: true,
    displayOrder: 1,
    updatedAt: Date.now()
  },
  {
    id: 'notif-2',
    buyerName: 'Sneha K.',
    location: 'Bangalore',
    productName: 'Amazon Prime Video',
    slug: 'amazon-prime-video',
    plan: '12 Months',
    timeText: '4 mins ago',
    imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=100&auto=format&fit=crop&q=80',
    message: 'Limited offer activated: Amazon Prime Annual Pass',
    isActive: true,
    displayOrder: 2,
    updatedAt: Date.now()
  },
  {
    id: 'notif-3',
    buyerName: 'Arjun M.',
    location: 'Hyderabad',
    productName: 'Ultimate Binge Combo 4-in-1',
    slug: 'ultimate-binge-combo',
    plan: '6 Months',
    timeText: '1 min ago',
    imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=100&auto=format&fit=crop&q=80',
    message: 'New subscription added: 4-in-1 Mega Binge Combo',
    isActive: true,
    displayOrder: 3,
    updatedAt: Date.now()
  },
  {
    id: 'notif-4',
    buyerName: 'Kavita P.',
    location: 'Delhi NCR',
    productName: 'Disney+ Hotstar Premium',
    slug: 'disney-hotstar-premium',
    plan: '3 Months',
    timeText: 'Just now',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&auto=format&fit=crop&q=80',
    message: 'Instant PIN delivery dispatched for Disney+ Hotstar',
    isActive: true,
    displayOrder: 4,
    updatedAt: Date.now()
  },
  {
    id: 'notif-5',
    buyerName: 'Faizan A.',
    location: 'Pune',
    productName: 'YouTube Premium Ad-Free',
    slug: 'youtube-premium',
    plan: '12 Months',
    timeText: '3 mins ago',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&auto=format&fit=crop&q=80',
    message: 'Family plan upgrade activated for YouTube Premium',
    isActive: true,
    displayOrder: 5,
    updatedAt: Date.now()
  }
];
