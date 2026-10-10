import { Provider } from '../types';

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'prov-amazon',
    name: 'Amazon Prime',
    slug: 'amazon-prime',
    categorySlug: 'movies-series',
    brandColor: '#00A8E1',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
    displayOrder: 1,
    isActive: true,
    description: 'Amazon Prime Video 4K UHD streaming passes'
  },
  {
    id: 'prov-netflix',
    name: 'Netflix',
    slug: 'netflix',
    categorySlug: 'movies-series',
    brandColor: '#E50914',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    displayOrder: 2,
    isActive: true,
    description: 'Netflix 4K Ultra HD private profiles with PIN'
  },
  {
    id: 'prov-disney',
    name: 'Disney+ Hotstar',
    slug: 'disney-hotstar',
    categorySlug: 'live-sports',
    brandColor: '#0c3b8a',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Disney%2B_Hotstar_logo.svg',
    displayOrder: 3,
    isActive: true,
    description: 'Disney+ Hotstar live cricket and premium passes'
  },
  {
    id: 'prov-spotify',
    name: 'Spotify',
    slug: 'spotify',
    categorySlug: 'music-audio',
    brandColor: '#1DB954',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
    displayOrder: 4,
    isActive: true,
    description: 'Ad-free high fidelity music streaming'
  },
  {
    id: 'prov-zee5',
    name: 'ZEE5',
    slug: 'zee5',
    categorySlug: 'movies-series',
    brandColor: '#8E24AA',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Zee5-official-logo.jpeg',
    displayOrder: 5,
    isActive: true,
    description: 'Regional Indian movies and exclusive web shows'
  },
  {
    id: 'prov-sonyliv',
    name: 'Sony LIV',
    slug: 'sonyliv',
    categorySlug: 'live-sports',
    brandColor: '#000000',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/SonyLIV_logo.svg',
    displayOrder: 6,
    isActive: true,
    description: 'Live UEFA, WWE, tennis and original series'
  }
];
