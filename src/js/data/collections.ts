export interface LookHotspot {
  id: string;
  productId: string;
  name: string;
  price: number;
  topPercent: number;
  leftPercent: number;
}

export const SHOP_THE_LOOK_DATA = {
  title: 'THE NOIR ATELIER LOOK',
  subtitle: 'SPRING / SUMMER 2026 EDITORIAL',
  image: '/images/shop_look_model.png',
  hotspots: [
    {
      id: 'hs-1',
      productId: 'prod-001',
      name: 'Noir Satin Evening Gown',
      price: 7999,
      topPercent: 35,
      leftPercent: 48
    },
    {
      id: 'hs-2',
      productId: 'prod-003',
      name: 'Aura Structured Leather Tote',
      price: 4500,
      topPercent: 62,
      leftPercent: 68
    },
    {
      id: 'hs-3',
      productId: 'prod-004',
      name: 'Starlight Metallic Heel Sandals',
      price: 6200,
      topPercent: 88,
      leftPercent: 44
    }
  ]
};

export const STYLE_DNA_QUIZ = [
  {
    id: 1,
    question: 'How do you want to feel when entering a room?',
    options: [
      { text: 'Effortlessly chic and minimalist', type: 'MINIMAL' },
      { text: 'Powerfully confident and structured', type: 'CONFIDENT' },
      { text: 'Soft, graceful, and romantic', type: 'ROMANTIC' },
      { text: 'Daring, glamorous, and unforgettable', type: 'BOLD' }
    ]
  },
  {
    id: 2,
    question: 'Which color palette calls to your aesthetic?',
    options: [
      { text: 'Warm Ivory, Nude & Oat Beige', type: 'MINIMAL' },
      { text: 'Deep Charcoal, Espresso & Noir', type: 'CONFIDENT' },
      { text: 'Dusty Rose, Soft Blush & Gold', type: 'ROMANTIC' },
      { text: 'Rich Burgundy, Metallic Gold & Champagne', type: 'BOLD' }
    ]
  },
  {
    id: 3,
    question: 'Select your ideal weekend evening outfit:',
    options: [
      { text: 'Fluid silk midi dress with flat leather slides', type: 'MINIMAL' },
      { text: 'Double-breasted blazer with tailored trousers', type: 'CONFIDENT' },
      { text: 'Cascading floral georgette wrap gown', type: 'ROMANTIC' },
      { text: 'Asymmetrical satin gown with 85mm heels', type: 'BOLD' }
    ]
  },
  {
    id: 4,
    question: 'Your signature footwear choice:',
    options: [
      { text: 'Clean architectural leather mules', type: 'MINIMAL' },
      { text: 'Pointed toe leather stiletto pumps', type: 'CONFIDENT' },
      { text: 'Ankle-strap metallic sandals', type: 'ROMANTIC' },
      { text: 'Statement embellished heels', type: 'BOLD' }
    ]
  },
  {
    id: 5,
    question: 'Your favorite handbag silhouette:',
    options: [
      { text: 'Minimalist leather baguette bag', type: 'MINIMAL' },
      { text: 'Structured top-handle leather tote', type: 'CONFIDENT' },
      { text: 'Woven clutch with gold chain', type: 'ROMANTIC' },
      { text: 'High-shine metallic evening purse', type: 'BOLD' }
    ]
  }
];

export const JOURNAL_STORIES = [
  {
    id: 'story-01',
    title: 'THE ART OF SIMPLICITY',
    subtitle: 'Behind the Spring/Summer 2026 Collection',
    date: 'AUGUST 2026',
    author: 'EDITORIAL ATELIER',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    summary: 'Exploring fluid drapery, organic linen textures, and the enduring luxury of unpretentious silhouettes.',
    featuredProductId: 'prod-002'
  },
  {
    id: 'story-02',
    title: 'NOCTURNE FEMININITY',
    subtitle: 'Redefining Modern Evening Wear',
    date: 'JULY 2026',
    author: 'ATELIER STYLING TEAM',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    summary: 'How dark satin textures and metallic gold hardware sculpt modern evening glamour.',
    featuredProductId: 'prod-001'
  }
];
