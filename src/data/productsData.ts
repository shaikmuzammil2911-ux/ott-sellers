import { Product } from '../types';

export const PRODUCTS_DATA: Product[] = [
  {
    id: 'prod-netflix-premium',
    slug: 'netflix-premium',
    name: 'Netflix Premium',
    tagline: '4K Ultra HD + HDR Streaming on All Devices',
    categorySlug: 'movies-series',
    categoryName: 'Movies & Series',
    subcategorySlug: 'netflix',
    subcategoryName: 'Netflix',
    catalogSlugs: ['entertainment', 'combo-offers', 'family'],
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
    brandColor: '#E50914',
    brandLogoText: 'NETFLIX',
    rating: 4.8,
    reviewsCount: 12450,
    defaultPlan: '1 Month',
    badge: '20% OFF',
    isTrending: true,
    isPopular: true,
    inStock: true,
    stockCount: 42,
    warrantyPeriod: 'Full Duration Warranty with Instant Replacement',
    plans: [
      { duration: '1 Month', price: 399, originalPrice: 499, discountPercentage: 20 },
      { duration: '3 Months', price: 1049, originalPrice: 1499, discountPercentage: 30, isPopular: true },
      { duration: '6 Months', price: 1899, originalPrice: 2999, discountPercentage: 37 },
      { duration: '12 Months', price: 3499, originalPrice: 5999, discountPercentage: 42 }
    ],
    features: [
      'Ultra HD (4K) & HDR streaming resolution',
      'Dedicated personal profile with custom 4-digit PIN lock',
      'Watch on Smart TV, Phone, Tablet, Laptop, Apple TV & Firestick',
      'Download movies & series to watch offline on your device',
      'Spatial Audio support on supported devices',
      'Complete duration warranty and rapid WhatsApp support'
    ],
    deliverables: [
      'Official Netflix login email & password',
      'Assigned personal profile name & PIN',
      'Simple 1-click login instructions'
    ],
    rules: [
      'Do not alter account billing details or master email password',
      'Please stream only inside your assigned profile slot',
      'Single screen usage per profile to preserve stability'
    ],
    faqs: [
      {
        question: 'How fast will I receive my Netflix credentials?',
        answer: 'You will receive your login details immediately via WhatsApp and Email within 5 to 15 minutes of payment verification.'
      },
      {
        question: 'Can I stream on my 4K Smart TV?',
        answer: 'Yes! Netflix Premium works on all Smart TVs (Samsung, LG, Android TV, Fire TV stick, Apple TV) in crisp 4K Ultra HD.'
      },
      {
        question: 'What happens if I face a login issue?',
        answer: 'We provide a 100% full replacement warranty throughout your subscribed period. Just ping our 24/7 WhatsApp helpdesk and we fix or swap immediately.'
      }
    ]
  },
  {
    id: 'prod-amazon-prime',
    slug: 'amazon-prime-video',
    name: 'Amazon Prime Video',
    tagline: 'Blockbuster Movies, Amazon Originals & 4K UHD Streaming',
    categorySlug: 'movies-series',
    categoryName: 'Movies & Series',
    subcategorySlug: 'amazon-prime',
    subcategoryName: 'Amazon Prime',
    catalogSlugs: ['entertainment', 'combo-offers'],
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&auto=format&fit=crop&q=80',
    brandColor: '#00A8E1',
    brandLogoText: 'prime video',
    rating: 4.7,
    reviewsCount: 8940,
    defaultPlan: '1 Month',
    badge: '15% OFF',
    isTrending: true,
    isPopular: true,
    inStock: true,
    stockCount: 35,
    warrantyPeriod: 'Guaranteed Validity & 24/7 Support',
    plans: [
      { duration: '1 Month', price: 299, originalPrice: 349, discountPercentage: 15 },
      { duration: '3 Months', price: 849, originalPrice: 1199, discountPercentage: 29, isPopular: true },
      { duration: '6 Months', price: 1449, originalPrice: 2099, discountPercentage: 31 },
      { duration: '12 Months', price: 2399, originalPrice: 3499, discountPercentage: 32 }
    ],
    features: [
      'Stream all Prime Video exclusives & theatrical blockbusters',
      '4K Ultra HD & Dolby Atmos audio supported',
      'Works on Mobile, Tablet, PC, Smart TVs & Fire TV Sticks',
      'Download shows for smooth offline playback',
      'X-Ray feature by IMDb for cast details and music trivia'
    ],
    deliverables: [
      'Verified Prime Video login email & password',
      'Secure login guide with OTP support'
    ],
    rules: [
      'Do not order paid pay-per-view rentals from the balance',
      'Do not modify the account email or recovery phone number'
    ],
    faqs: [
      {
        question: 'Does this account include Prime Video access on Smart TV?',
        answer: 'Yes! You can log into any device including Smart TVs, streaming dongles, laptops, and smartphones.'
      },
      {
        question: 'How do OTP logins work?',
        answer: 'Our automated team or WhatsApp support instantly provides you the 6-digit Amazon OTP code when logging in.'
      }
    ]
  },
  {
    id: 'prod-disney-hotstar',
    slug: 'disney-hotstar-premium',
    name: 'Disney+ Hotstar',
    tagline: 'Live Sports, Disney Classics, Marvel, Star Wars & HBO',
    categorySlug: 'movies-series',
    categoryName: 'Movies & Series',
    subcategorySlug: 'disney-hotstar',
    subcategoryName: 'Disney+ Hotstar',
    catalogSlugs: ['entertainment', 'sports', 'kids'],
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    brandColor: '#0c3b8a',
    brandLogoText: 'Disney+ hotstar',
    rating: 4.6,
    reviewsCount: 6820,
    defaultPlan: '1 Month',
    badge: '18% OFF',
    isTrending: true,
    isPopular: true,
    inStock: true,
    stockCount: 50,
    warrantyPeriod: 'Full Subscription Replacement Guarantee',
    plans: [
      { duration: '1 Month', price: 249, originalPrice: 299, discountPercentage: 18 },
      { duration: '3 Months', price: 699, originalPrice: 899, discountPercentage: 22, isPopular: true },
      { duration: '6 Months', price: 1199, originalPrice: 1799, discountPercentage: 33 },
      { duration: '12 Months', price: 1999, originalPrice: 2999, discountPercentage: 33 }
    ],
    features: [
      'Watch Live Cricket tournaments, Premier League & Pro Kabaddi',
      'All Disney, Pixar, Marvel Studios, Star Wars & National Geographic titles',
      '4K 2160p video quality with Dolby Vision & Dolby 5.1 surround',
      'Simultaneous streaming enabled on 2 to 4 screens'
    ],
    deliverables: [
      'Active mobile/email login credential for Disney+ Hotstar',
      'Step-by-step connection guide'
    ],
    rules: [
      'Do not request password resets or tamper with profile configurations'
    ],
    faqs: [
      {
        question: 'Can I watch live cricket and sports in Full HD/4K?',
        answer: 'Yes! Disney+ Hotstar includes all live ICC cricket matches, Premier League football and Formula 1.'
      }
    ]
  },
  {
    id: 'prod-youtube-premium',
    slug: 'youtube-premium',
    name: 'YouTube Premium',
    tagline: 'Ad-Free YouTube, Background Play & YouTube Music',
    categorySlug: 'premium-apps',
    categoryName: 'Premium Apps',
    subcategorySlug: 'youtube-premium',
    subcategoryName: 'YouTube Premium',
    catalogSlugs: ['premium-apps', 'entertainment'],
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
    brandColor: '#FF0000',
    brandLogoText: 'YouTube Premium',
    rating: 4.5,
    reviewsCount: 5210,
    defaultPlan: '1 Month',
    badge: '12% OFF',
    isTrending: true,
    isPopular: false,
    inStock: true,
    stockCount: 28,
    warrantyPeriod: '100% Replacement Warranty',
    plans: [
      { duration: '1 Month', price: 349, originalPrice: 399, discountPercentage: 12 },
      { duration: '3 Months', price: 899, originalPrice: 1199, discountPercentage: 25, isPopular: true },
      { duration: '6 Months', price: 1599, originalPrice: 2399, discountPercentage: 33 },
      { duration: '12 Months', price: 2799, originalPrice: 4788, discountPercentage: 41 }
    ],
    features: [
      'Zero advertisements on all YouTube videos across all screens',
      'Background play while using other apps or with screen turned off',
      'Full access to YouTube Music Premium app (over 100M songs)',
      'Smart offline video downloads on mobile & tablets'
    ],
    deliverables: [
      'Family invitation to your personal Gmail account or dedicated premium account credentials'
    ],
    rules: [
      'One active Google account per family slot'
    ],
    faqs: [
      {
        question: 'Can I use this on my existing personal Gmail account?',
        answer: 'Yes! We send an official Google Family invite directly to your personal Gmail ID so you keep your playlists and history.'
      }
    ]
  },
  {
    id: 'prod-zee5-premium',
    slug: 'zee5-premium',
    name: 'ZEE5 Premium',
    tagline: 'Mega Regional Blockbusters, ZEE Originals & 90+ Live Channels',
    categorySlug: 'movies-series',
    categoryName: 'Movies & Series',
    subcategorySlug: 'zee5',
    subcategoryName: 'ZEE5',
    catalogSlugs: ['entertainment', 'family'],
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80',
    brandColor: '#8E24AA',
    brandLogoText: 'ZEE5',
    rating: 4.4,
    reviewsCount: 4120,
    defaultPlan: '1 Month',
    badge: '16% OFF',
    isTrending: true,
    isPopular: false,
    inStock: true,
    stockCount: 30,
    warrantyPeriod: 'Full Duration Warranty',
    plans: [
      { duration: '1 Month', price: 249, originalPrice: 299, discountPercentage: 16 },
      { duration: '3 Months', price: 599, originalPrice: 899, discountPercentage: 33, isPopular: true },
      { duration: '6 Months', price: 999, originalPrice: 1499, discountPercentage: 33 },
      { duration: '12 Months', price: 1599, originalPrice: 2499, discountPercentage: 36 }
    ],
    features: [
      'Access to 2800+ movies & 150+ original web series in 12 languages',
      'Before TV telecast for popular Indian serials & shows',
      '1080p Full HD video playback and Dolby 5.1 surround sound',
      'Watch on Smart TV, Mobile, Laptop and Tablets simultaneously'
    ],
    deliverables: [
      'ZEE5 login ID & password',
      'Immediate WhatsApp activation support'
    ],
    rules: [
      'Personal non-commercial usage only'
    ],
    faqs: [
      {
        question: 'Does ZEE5 support South Indian & Regional languages?',
        answer: 'Yes! Extensive content catalogs in Hindi, Telugu, Tamil, Malayalam, Bengali, Kannada and Marathi.'
      }
    ]
  },
  {
    id: 'prod-netflix-standard',
    slug: 'netflix-standard',
    name: 'Netflix Standard',
    tagline: '1080p Full HD Streaming on Mobile & Laptops',
    categorySlug: 'movies-series',
    categoryName: 'Movies & Series',
    subcategorySlug: 'netflix',
    subcategoryName: 'Netflix',
    catalogSlugs: ['entertainment'],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    brandColor: '#E50914',
    brandLogoText: 'NETFLIX',
    rating: 4.7,
    reviewsCount: 10240,
    defaultPlan: '1 Month',
    badge: '15% OFF',
    isTrending: false,
    isPopular: true,
    inStock: true,
    stockCount: 65,
    warrantyPeriod: 'Instant Profile Replacement Guarantee',
    plans: [
      { duration: '1 Month', price: 299, originalPrice: 349, discountPercentage: 15 },
      { duration: '3 Months', price: 799, originalPrice: 1049, discountPercentage: 24, isPopular: true },
      { duration: '6 Months', price: 1499, originalPrice: 2099, discountPercentage: 28 },
      { duration: '12 Months', price: 2699, originalPrice: 4188, discountPercentage: 35 }
    ],
    features: [
      'Crystal clear 1080p Full HD picture quality',
      'Watch on phones, tablets, MacBooks, Windows PCs & TV',
      'Download favorite titles for offline viewing',
      'Pin protected private profile'
    ],
    deliverables: ['Netflix login ID, password and personal profile name'],
    rules: ['Stream on single device at a time under assigned profile'],
    faqs: [
      {
        question: 'Can I renew the same profile each month?',
        answer: 'Yes! Simply message us before expiry and your existing profile remains renewed without resetting your watch history.'
      }
    ]
  },
  {
    id: 'prod-sonyliv-premium',
    slug: 'sonyliv-premium',
    name: 'SonyLIV Premium',
    tagline: 'Live Champions League, UFC, WWE & Sony Originals',
    categorySlug: 'sports',
    categoryName: 'Sports',
    subcategorySlug: 'sonyliv',
    subcategoryName: 'SonyLIV',
    catalogSlugs: ['sports', 'entertainment'],
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    brandColor: '#002B49',
    brandLogoText: 'SONY LIV',
    rating: 4.5,
    reviewsCount: 6100,
    defaultPlan: '1 Month',
    badge: '10% OFF',
    isTrending: false,
    isPopular: true,
    inStock: true,
    stockCount: 22,
    warrantyPeriod: 'Full Term Warranty',
    plans: [
      { duration: '1 Month', price: 349, originalPrice: 389, discountPercentage: 10 },
      { duration: '3 Months', price: 899, originalPrice: 1199, discountPercentage: 25, isPopular: true },
      { duration: '6 Months', price: 1499, originalPrice: 2399, discountPercentage: 37 },
      { duration: '12 Months', price: 2499, originalPrice: 3999, discountPercentage: 38 }
    ],
    features: [
      'Live coverage of UEFA Champions League, Sony Sports channels & Tennis Grand Slams',
      'Critically acclaimed Indian original web shows (Scam 1992, Rocket Boys, Gullak)',
      '1080p Full HD video stream with multilingual audio commentaries'
    ],
    deliverables: ['SonyLIV mobile login & TV QR login assistance'],
    rules: ['Do not change login PIN or account details'],
    faqs: [
      {
        question: 'Can I watch live football games on Smart TV?',
        answer: 'Yes! SonyLIV Premium provides full TV app access for live sports streaming.'
      }
    ]
  },
  {
    id: 'prod-jiocinema-premium',
    slug: 'jiocinema-premium',
    name: 'JioCinema Premium',
    tagline: 'HBO Max, Peacock Originals, Asur & Live 4K Sports',
    categorySlug: 'movies-series',
    categoryName: 'Movies & Series',
    subcategorySlug: 'jiocinema',
    subcategoryName: 'JioCinema',
    catalogSlugs: ['entertainment', 'sports'],
    image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
    brandColor: '#C2185B',
    brandLogoText: 'JioCinema',
    rating: 4.6,
    reviewsCount: 7800,
    defaultPlan: '1 Month',
    badge: '25% OFF',
    isTrending: true,
    isPopular: true,
    inStock: true,
    stockCount: 40,
    warrantyPeriod: 'Guaranteed Validity',
    plans: [
      { duration: '1 Month', price: 149, originalPrice: 199, discountPercentage: 25 },
      { duration: '3 Months', price: 399, originalPrice: 599, discountPercentage: 33, isPopular: true },
      { duration: '6 Months', price: 699, originalPrice: 999, discountPercentage: 30 },
      { duration: '12 Months', price: 1199, originalPrice: 1999, discountPercentage: 40 }
    ],
    features: [
      'Exclusive HBO Max shows: Game of Thrones, House of the Dragon, Succession',
      'Peacock & Paramount Hollywood releases',
      'Watch on Smart TV and Smartphone in 4K'
    ],
    deliverables: ['JioCinema mobile login credentials with instant activation'],
    rules: ['Single user stream slot'],
    faqs: [
      {
        question: 'Does this include HBO series?',
        answer: 'Yes! Full HBO Max library is unlocked in high definition.'
      }
    ]
  },
  {
    id: 'prod-lionsgate-play',
    slug: 'lionsgate-play',
    name: 'Lionsgate Play',
    tagline: 'John Wick, Hunger Games & Hollywood Blockbusters',
    categorySlug: 'movies-series',
    categoryName: 'Movies & Series',
    subcategorySlug: 'lionsgate-play',
    subcategoryName: 'Lionsgate Play',
    catalogSlugs: ['entertainment'],
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    brandColor: '#C49A45',
    brandLogoText: 'LIONSGATE',
    rating: 4.4,
    reviewsCount: 2300,
    defaultPlan: '1 Month',
    badge: '33% OFF',
    isTrending: false,
    isPopular: false,
    inStock: true,
    stockCount: 25,
    warrantyPeriod: 'Full Term Warranty',
    plans: [
      { duration: '1 Month', price: 199, originalPrice: 299, discountPercentage: 33 },
      { duration: '3 Months', price: 499, originalPrice: 799, discountPercentage: 38, isPopular: true },
      { duration: '6 Months', price: 849, originalPrice: 1399, discountPercentage: 39 },
      { duration: '12 Months', price: 1399, originalPrice: 2388, discountPercentage: 41 }
    ],
    features: [
      'Huge collection of action and thriller Hollywood titles',
      'Multiple Indian dubbed languages available',
      'Ultra HD 4K streaming supported'
    ],
    deliverables: ['Official account credentials'],
    rules: ['Standard streaming guidelines apply'],
    faqs: [
      {
        question: 'Are subtitles included?',
        answer: 'Yes, English and Hindi subtitles are supported on all videos.'
      }
    ]
  },
  {
    id: 'prod-spotify-premium',
    slug: 'spotify-premium',
    name: 'Spotify Premium',
    tagline: 'Ad-Free Music, Very High Audio Quality & Offline Songs',
    categorySlug: 'premium-apps',
    categoryName: 'Premium Apps',
    subcategorySlug: 'spotify',
    subcategoryName: 'Spotify',
    catalogSlugs: ['premium-apps'],
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    brandColor: '#1DB954',
    brandLogoText: 'Spotify',
    rating: 4.9,
    reviewsCount: 15400,
    defaultPlan: '1 Month',
    badge: '30% OFF',
    isTrending: true,
    isPopular: true,
    inStock: true,
    stockCount: 80,
    warrantyPeriod: 'Full Warranty on your own account',
    plans: [
      { duration: '1 Month', price: 199, originalPrice: 299, discountPercentage: 33 },
      { duration: '3 Months', price: 499, originalPrice: 799, discountPercentage: 38, isPopular: true },
      { duration: '6 Months', price: 849, originalPrice: 1499, discountPercentage: 43 },
      { duration: '12 Months', price: 1499, originalPrice: 2999, discountPercentage: 50 }
    ],
    features: [
      'Ad-free uninterrupted music listening on all devices',
      'Download unlimited tracks for offline listening anywhere',
      '320kbps Extreme audio streaming quality',
      'Play any track with unlimited skips on mobile'
    ],
    deliverables: ['Upgrade invite to your own personal Spotify account'],
    rules: ['No VPN required after initial simple invite acceptance'],
    faqs: [
      {
        question: 'Will I lose my existing playlists or saved songs?',
        answer: 'Not at all! The upgrade is added to your existing personal Spotify account, so all your playlists, liked songs, and podcasts stay untouched.'
      }
    ]
  },
  {
    id: 'prod-crunchyroll-mega-fan',
    slug: 'crunchyroll-mega-fan',
    name: 'Crunchyroll Mega Fan',
    tagline: 'Stream Demon Slayer, Attack on Titan & 1000+ Anime Titles',
    categorySlug: 'movies-series',
    categoryName: 'Movies & Series',
    subcategorySlug: 'crunchyroll',
    subcategoryName: 'Crunchyroll',
    catalogSlugs: ['entertainment', 'kids'],
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    brandColor: '#F47521',
    brandLogoText: 'Crunchyroll',
    rating: 4.8,
    reviewsCount: 3900,
    defaultPlan: '1 Month',
    badge: '33% OFF',
    isTrending: false,
    isPopular: true,
    inStock: true,
    stockCount: 19,
    warrantyPeriod: 'Full Term Warranty',
    plans: [
      { duration: '1 Month', price: 199, originalPrice: 299, discountPercentage: 33 },
      { duration: '3 Months', price: 549, originalPrice: 899, discountPercentage: 39, isPopular: true },
      { duration: '6 Months', price: 999, originalPrice: 1799, discountPercentage: 44 },
      { duration: '12 Months', price: 1799, originalPrice: 3588, discountPercentage: 50 }
    ],
    features: [
      'Simulcast episodes 1 hour after Japan broadcast',
      'Ad-free anime in Full HD 1080p with English Subs & Dubs',
      'Offline viewing support on iOS & Android'
    ],
    deliverables: ['Crunchyroll login credentials'],
    rules: ['Personal streaming only'],
    faqs: [
      {
        question: 'Are English dubbed episodes available?',
        answer: 'Yes! Both English and Hindi dubbed anime episodes are available alongside Japanese audio with subtitles.'
      }
    ]
  },
  {
    id: 'prod-canva-pro',
    slug: 'canva-pro-designer',
    name: 'Canva Pro Designer',
    tagline: '100M+ Premium Stock Photos, Videos, Fonts & AI Tools',
    categorySlug: 'premium-apps',
    categoryName: 'Premium Apps',
    subcategorySlug: 'canva-pro',
    subcategoryName: 'Canva Pro',
    catalogSlugs: ['premium-apps'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    brandColor: '#00C4CC',
    brandLogoText: 'Canva Pro',
    rating: 4.9,
    reviewsCount: 11200,
    defaultPlan: '1 Month',
    badge: '50% OFF',
    isTrending: true,
    isPopular: true,
    inStock: true,
    stockCount: 90,
    warrantyPeriod: '1 Year Full Replacement Warranty',
    plans: [
      { duration: '1 Month', price: 249, originalPrice: 499, discountPercentage: 50 },
      { duration: '3 Months', price: 599, originalPrice: 1299, discountPercentage: 54, isPopular: true },
      { duration: '6 Months', price: 999, originalPrice: 2499, discountPercentage: 60 },
      { duration: '12 Months', price: 1699, originalPrice: 4999, discountPercentage: 66 }
    ],
    features: [
      'Access to 100+ million premium photos, vectors, graphics and audio',
      'One-click Magic Background Remover & AI Image Generator',
      'Brand Kit with custom fonts, colors and company logos',
      '1TB cloud storage for designs and assets'
    ],
    deliverables: ['Official team invite directly sent to your Canva email ID'],
    rules: ['Private workspace under Canva Pro'],
    faqs: [
      {
        question: 'Will other people in the team see my designs?',
        answer: 'No! Your designs remain 100% private to you unless you explicitly choose to share them.'
      }
    ]
  },
  {
    id: 'prod-binge-combo-4in1',
    slug: 'ultimate-binge-combo',
    name: 'Ultimate Binge Combo 4-in-1',
    tagline: 'Netflix + Prime Video + Disney+ Hotstar + SonyLIV',
    categorySlug: 'movies-series',
    categoryName: 'Movies & Series',
    subcategorySlug: 'netflix',
    subcategoryName: 'Combo Bundle',
    catalogSlugs: ['combo-offers', 'entertainment', 'family'],
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=600&auto=format&fit=crop&q=80',
    brandColor: '#F59E0B',
    brandLogoText: '4-IN-1 BUNDLE',
    rating: 4.9,
    reviewsCount: 8400,
    defaultPlan: '1 Month',
    badge: '40% OFF',
    isTrending: true,
    isPopular: true,
    inStock: true,
    stockCount: 15,
    warrantyPeriod: 'All-inclusive Full Duration Replacement Guarantee',
    plans: [
      { duration: '1 Month', price: 899, originalPrice: 1499, discountPercentage: 40 },
      { duration: '3 Months', price: 2399, originalPrice: 4497, discountPercentage: 47, isPopular: true },
      { duration: '6 Months', price: 4299, originalPrice: 8994, discountPercentage: 52 },
      { duration: '12 Months', price: 7999, originalPrice: 17988, discountPercentage: 55 }
    ],
    features: [
      'Complete 4 mega OTT subscriptions in one discounted package',
      'Netflix Premium 4K + Prime Video 4K + Disney+ Hotstar + SonyLIV Premium',
      'Save thousands of rupees compared to paying individual monthly subscriptions',
      'Consolidated WhatsApp support for all 4 services'
    ],
    deliverables: ['Separate verified credentials for each of the 4 streaming platforms'],
    rules: ['Follow individual screen guidelines for each platform'],
    faqs: [
      {
        question: 'Do all 4 subscriptions start at the same time?',
        answer: 'Yes! All 4 platforms are activated simultaneously upon purchase.'
      }
    ]
  }
];
