export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Clothing' | 'Bags' | 'Footwear' | 'Accessories';
  subcategory: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  badge?: 'NEW' | 'SALE' | 'BESTSELLER';
  rating: number;
  reviewsCount: number;
  primaryImage: string;
  secondaryImage: string;
  description: string;
  material: string;
  care: string;
  fit: string;
  sizes: string[];
  colors: { name: string; hex: string; image?: string }[];
  stock: number;
  mood: 'CONFIDENT' | 'ROMANTIC' | 'MINIMAL' | 'BOLD';
  isDay: boolean;
  isNight: boolean;
  featured?: boolean;
}

export const PRODUCTS_DATA: Product[] = [
  {
    id: 'prod-001',
    sku: 'ATL-DRS-001',
    name: 'Noir Satin Evening Gown',
    category: 'Clothing',
    subcategory: 'Dresses',
    price: 7999,
    originalPrice: 9999,
    discountPercentage: 20,
    badge: 'BESTSELLER',
    rating: 4.9,
    reviewsCount: 128,
    primaryImage: '/images/shop_look_model.png',
    secondaryImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    description: 'Sculpted from liquid silk satin, the Noir Evening Gown features a asymmetrical cowl neck and a dramatic floor-skimming silhouette.',
    material: '100% Pure Silk Satin',
    care: 'Dry clean only. Gentle steam iron.',
    fit: 'True to size. Model is 5\'8" wearing size S.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Noir Black', hex: '#151515', image: '/images/shop_look_model.png' },
      { name: 'Champagne Gold', hex: '#C5A880', image: '/images/hero_model.png' },
      { name: 'Dusty Rose', hex: '#D4A59A', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' }
    ],
    stock: 14,
    mood: 'CONFIDENT',
    isDay: false,
    isNight: true,
    featured: true
  },
  {
    id: 'prod-002',
    sku: 'ATL-DRS-002',
    name: 'Champagne Ivory Linen Midi Dress',
    category: 'Clothing',
    subcategory: 'Dresses',
    price: 6499,
    originalPrice: 7999,
    discountPercentage: 18,
    badge: 'NEW',
    rating: 4.8,
    reviewsCount: 94,
    primaryImage: '/images/hero_model.png',
    secondaryImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    description: 'An airy midi dress tailored from organic linen, accented with subtle pleating and a delicate waist sash.',
    material: '100% Organic Linen',
    care: 'Hand wash cold. Lay flat to dry.',
    fit: 'Relaxed fit with adjustable belt.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Ivory White', hex: '#F8F5F0', image: '/images/hero_model.png' },
      { name: 'Soft Beige', hex: '#EAE3D9', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80' }
    ],
    stock: 22,
    mood: 'MINIMAL',
    isDay: true,
    isNight: false,
    featured: true
  },
  {
    id: 'prod-003',
    sku: 'ATL-BAG-001',
    name: 'Aura Structured Leather Tote',
    category: 'Bags',
    subcategory: 'Handbags',
    price: 4500,
    originalPrice: 5500,
    discountPercentage: 18,
    badge: 'BESTSELLER',
    rating: 5.0,
    reviewsCount: 156,
    primaryImage: '/images/designer_bag.png',
    secondaryImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    description: 'Handcrafted Italian full-grain leather tote featuring bespoke gold hardware and interior organizer slots.',
    material: 'Italian Calfskin Leather',
    care: 'Wipe clean with leather conditioner.',
    fit: 'Dimensions: 32cm x 24cm x 12cm.',
    sizes: ['One Size'],
    colors: [
      { name: 'Champagne Gold', hex: '#C5A880', image: '/images/designer_bag.png' },
      { name: 'Espresso', hex: '#2A2A2A', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80' }
    ],
    stock: 9,
    mood: 'CONFIDENT',
    isDay: true,
    isNight: true,
    featured: true
  },
  {
    id: 'prod-004',
    sku: 'ATL-SHS-001',
    name: 'Starlight Metallic Heel Sandals',
    category: 'Footwear',
    subcategory: 'Heels',
    price: 6200,
    originalPrice: 7500,
    discountPercentage: 17,
    badge: 'NEW',
    rating: 4.7,
    reviewsCount: 68,
    primaryImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?auto=format&fit=crop&w=800&q=80',
    description: 'Sophisticated 85mm stiletto heel sandals crafted with delicate ankle straps and memory foam cushioning.',
    material: 'Metallic Nappa Leather',
    care: 'Store in dust bag.',
    fit: 'Heel height 8.5cm.',
    sizes: ['36', '37', '38', '39', '40'],
    colors: [
      { name: 'Gold', hex: '#D4AF37', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80' },
      { name: 'Black', hex: '#151515', image: 'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?auto=format&fit=crop&w=800&q=80' }
    ],
    stock: 12,
    mood: 'BOLD',
    isDay: false,
    isNight: true,
    featured: true
  },
  {
    id: 'prod-005',
    sku: 'ATL-ACC-001',
    name: 'Celeste 18K Gold Plated Choker',
    category: 'Accessories',
    subcategory: 'Jewelry',
    price: 3200,
    originalPrice: 4000,
    discountPercentage: 20,
    badge: 'SALE',
    rating: 4.9,
    reviewsCount: 82,
    primaryImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1611591475199-52e464c06283?auto=format&fit=crop&w=800&q=80',
    description: 'Statement handcrafted herringbone chain necklace dipped in 18k yellow gold with anti-tarnish coating.',
    material: '18K Gold Plated Brass',
    care: 'Keep away from direct perfume and moisture.',
    fit: 'Length 40cm + 5cm extension.',
    sizes: ['One Size'],
    colors: [
      { name: 'Yellow Gold', hex: '#D4AF37', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80' }
    ],
    stock: 25,
    mood: 'ROMANTIC',
    isDay: true,
    isNight: true,
    featured: false
  },
  {
    id: 'prod-006',
    sku: 'ATL-DRS-003',
    name: 'Elysian Rose Silk Slip Wrap',
    category: 'Clothing',
    subcategory: 'Dresses',
    price: 8999,
    originalPrice: 10999,
    discountPercentage: 18,
    badge: 'NEW',
    rating: 4.9,
    reviewsCount: 52,
    primaryImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    description: 'A romantic romantic wrap dress rendered in dusty rose silk blend with cascading flutter sleeves.',
    material: 'Silk Georgette',
    care: 'Professional dry clean.',
    fit: 'Wrap adjustable silhouette.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Dusty Rose', hex: '#D4A59A', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' },
      { name: 'Cream', hex: '#FAF9F6', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80' }
    ],
    stock: 8,
    mood: 'ROMANTIC',
    isDay: true,
    isNight: true,
    featured: true
  },
  {
    id: 'prod-007',
    sku: 'ATL-TOP-001',
    name: 'Atelier Tailored Linen Blazer',
    category: 'Clothing',
    subcategory: 'Tops',
    price: 7499,
    originalPrice: 8999,
    discountPercentage: 16,
    badge: 'BESTSELLER',
    rating: 4.8,
    reviewsCount: 110,
    primaryImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1548624149-f1b96a400792?auto=format&fit=crop&w=800&q=80',
    description: 'Sharp double-breasted power blazer with padded shoulders and custom horn buttons.',
    material: 'Linen Viscose Blend',
    care: 'Dry clean only.',
    fit: 'Structured tailored fit.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Espresso', hex: '#2A2A2A', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Nude', hex: '#EAE3D9', image: 'https://images.unsplash.com/photo-1548624149-f1b96a400792?auto=format&fit=crop&w=800&q=80' }
    ],
    stock: 18,
    mood: 'CONFIDENT',
    isDay: true,
    isNight: false,
    featured: true
  },
  {
    id: 'prod-008',
    sku: 'ATL-BAG-002',
    name: 'Seraphina Woven Clutch',
    category: 'Bags',
    subcategory: 'Handbags',
    price: 3900,
    originalPrice: 4800,
    discountPercentage: 18,
    badge: 'SALE',
    rating: 4.6,
    reviewsCount: 45,
    primaryImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    description: 'Intricately hand-woven leather evening clutch with detachable gold chain strap.',
    material: 'Supple Nappa Leather',
    care: 'Store stuffed with tissue paper.',
    fit: 'Compact evening fit.',
    sizes: ['One Size'],
    colors: [
      { name: 'Black', hex: '#151515', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Ivory', hex: '#F8F5F0', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80' }
    ],
    stock: 15,
    mood: 'BOLD',
    isDay: false,
    isNight: true,
    featured: false
  }
];
