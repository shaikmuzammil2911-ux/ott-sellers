import { Catalog } from '../types';

export const CATALOGS_DATA: Catalog[] = [
  {
    id: 'cat-entertainment',
    slug: 'entertainment',
    name: 'Entertainment Master Catalog',
    badge: 'Most Popular',
    description: 'Binge the best movies, web series, reality shows and originals from world-class creators.',
    longDescription: 'From gripping crime thrillers on Netflix to blockbuster cinema premieres on Prime Video, Disney+ Hotstar and ZEE5, explore our most popular entertainment passes at unmatched rates.',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80',
    productCount: 8,
    productSlugs: [
      'netflix-premium',
      'amazon-prime-video',
      'disney-hotstar-premium',
      'zee5-premium',
      'netflix-standard',
      'jiocinema-premium',
      'lionsgate-play',
      'ultimate-binge-combo'
    ],
    discountText: 'Up to 55% OFF'
  },
  {
    id: 'cat-sports',
    slug: 'sports',
    name: 'Live Sports Arena',
    badge: 'High Octane',
    description: 'Live Cricket, Premier League Football, F1 Racing, WWE & Tennis Grand Slams in 4K.',
    longDescription: 'Never miss a single boundary, goal or race lap. Stream high-definition sports coverage on SonyLIV, Hotstar, and JioCinema with crisp zero-lag feeds and multilingual commentary.',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    productCount: 4,
    productSlugs: [
      'disney-hotstar-premium',
      'sonyliv-premium',
      'jiocinema-premium',
      'ultimate-binge-combo'
    ],
    discountText: 'Save up to 38%'
  },
  {
    id: 'cat-family',
    slug: 'family',
    name: 'Family & Kids Collection',
    badge: 'Safe & Wholesome',
    description: 'Safe animated adventures, family serials, educational cartoons and regional cinema.',
    longDescription: 'Curated subscriptions suited for the entire household. Keep children entertained with Disney, Pixar and anime, while parents enjoy prime evening serials and blockbuster weekend movies.',
    image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&auto=format&fit=crop&q=80',
    productCount: 5,
    productSlugs: [
      'disney-hotstar-premium',
      'netflix-premium',
      'zee5-premium',
      'crunchyroll-mega-fan',
      'ultimate-binge-combo'
    ],
    discountText: 'Save up to 45%'
  },
  {
    id: 'cat-premium-apps',
    slug: 'premium-apps',
    name: 'Productivity & Pro Creator Tools',
    badge: 'Creator Special',
    description: 'Ad-free audio, graphic design, video editing & cloud creative licenses.',
    longDescription: 'Supercharge your daily creativity and digital lifestyle with YouTube Premium ad-free streaming, Spotify Extreme audio fidelity, and Canva Pro designer tools with 100M+ stock assets.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    productCount: 4,
    productSlugs: [
      'youtube-premium',
      'spotify-premium',
      'canva-pro-designer'
    ],
    discountText: 'Up to 66% OFF'
  },
  {
    id: 'cat-combo-offers',
    slug: 'combo-offers',
    name: 'Super Saver Mega Combos',
    badge: 'Biggest Savings',
    description: 'Combine multiple top streaming services into a single discounted package.',
    longDescription: 'Get the highest possible value for your money. Bundle Netflix, Prime Video, Hotstar, and SonyLIV under one easy recharge and enjoy unified 24/7 WhatsApp customer care.',
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=800&auto=format&fit=crop&q=80',
    productCount: 3,
    productSlugs: [
      'ultimate-binge-combo',
      'netflix-premium',
      'disney-hotstar-premium'
    ],
    discountText: 'Up to 55% OFF'
  }
];
