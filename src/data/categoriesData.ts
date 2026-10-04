import { Category, SubCategory } from '../types';

export const CATEGORIES_DATA: Category[] = [
  {
    id: 'cat-1',
    slug: 'movies-series',
    name: 'Movies & Series',
    shortDescription: 'Explore premium movie and series streaming subscriptions.',
    iconName: 'Film',
    badgeColor: '#e50914',
    bgGradient: 'linear-gradient(135deg, rgba(229, 9, 20, 0.15) 0%, rgba(20, 20, 30, 0.95) 100%)',
    titlesCount: '5000+ Titles',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-2',
    slug: 'live-tv',
    name: 'Live TV',
    shortDescription: '1000+ national, international and news live channels.',
    iconName: 'Tv',
    badgeColor: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(20, 30, 25, 0.95) 100%)',
    titlesCount: '1000+ Channels',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-3',
    slug: 'sports',
    name: 'Sports',
    shortDescription: 'Live Cricket, Premier League, F1, Tennis & UFC streams.',
    iconName: 'Trophy',
    badgeColor: '#0284c7',
    bgGradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(15, 25, 40, 0.95) 100%)',
    titlesCount: 'Live Matches & More',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-4',
    slug: 'kids',
    name: 'Kids',
    shortDescription: 'Kid-safe cartoons, educational content and animated adventures.',
    iconName: 'Smile',
    badgeColor: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(35, 25, 15, 0.95) 100%)',
    titlesCount: 'Safe & Fun',
    image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-5',
    slug: 'premium-apps',
    name: 'Premium Apps',
    shortDescription: 'Unlock top creative, music and utility software subscriptions.',
    iconName: 'Crown',
    badgeColor: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(25, 20, 35, 0.95) 100%)',
    titlesCount: 'Productivity & More',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  }
];

export const SUBCATEGORIES_DATA: SubCategory[] = [
  {
    id: 'sub-netflix',
    slug: 'netflix',
    name: 'Netflix',
    categorySlug: 'movies-series',
    brandColor: '#E50914',
    popularProductSlug: 'netflix-premium',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg'
  },
  {
    id: 'sub-amazon-prime',
    slug: 'amazon-prime',
    name: 'Amazon Prime',
    categorySlug: 'movies-series',
    brandColor: '#00A8E1',
    popularProductSlug: 'amazon-prime-video',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png'
  },
  {
    id: 'sub-disney-hotstar',
    slug: 'disney-hotstar',
    name: 'Disney+ Hotstar',
    categorySlug: 'movies-series',
    brandColor: '#0c3b8a',
    popularProductSlug: 'disney-hotstar-premium',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Disney%2B_Hotstar_logo.svg'
  },
  {
    id: 'sub-zee5',
    slug: 'zee5',
    name: 'ZEE5',
    categorySlug: 'movies-series',
    brandColor: '#8E24AA',
    popularProductSlug: 'zee5-premium',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Zee5-official-logo.jpeg'
  },
  {
    id: 'sub-sonyliv',
    slug: 'sonyliv',
    name: 'SonyLIV',
    categorySlug: 'sports',
    brandColor: '#002B49',
    popularProductSlug: 'sonyliv-premium',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/SonyLIV_logo.svg'
  },
  {
    id: 'sub-youtube-premium',
    slug: 'youtube-premium',
    name: 'YouTube Premium',
    categorySlug: 'premium-apps',
    brandColor: '#FF0000',
    popularProductSlug: 'youtube-premium',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg'
  },
  {
    id: 'sub-jiocinema',
    slug: 'jiocinema',
    name: 'JioCinema',
    categorySlug: 'movies-series',
    brandColor: '#C2185B',
    popularProductSlug: 'jiocinema-premium',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/JioCinema_Logo.svg'
  },
  {
    id: 'sub-lionsgate-play',
    slug: 'lionsgate-play',
    name: 'Lionsgate Play',
    categorySlug: 'movies-series',
    brandColor: '#C49A45',
    popularProductSlug: 'lionsgate-play',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Lionsgate_Play_logo.png'
  },
  {
    id: 'sub-crunchyroll',
    slug: 'crunchyroll',
    name: 'Crunchyroll',
    categorySlug: 'movies-series',
    brandColor: '#F47521',
    popularProductSlug: 'crunchyroll-mega-fan',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Crunchyroll_Logo.svg'
  },
  {
    id: 'sub-spotify',
    slug: 'spotify',
    name: 'Spotify',
    categorySlug: 'premium-apps',
    brandColor: '#1DB954',
    popularProductSlug: 'spotify-premium',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg'
  },
  {
    id: 'sub-canva',
    slug: 'canva-pro',
    name: 'Canva Pro',
    categorySlug: 'premium-apps',
    brandColor: '#00C4CC',
    popularProductSlug: 'canva-pro-designer',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Canva_Logo.svg'
  }
];
