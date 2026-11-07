export type ProductStatus = 'Active' | 'Draft' | 'Out of Stock' | 'Archived';

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  unit: string; // e.g. "1 kg", "500 ml", "250 g"
  status: ProductStatus;
  featured: boolean;
  imageUrl: string;
  secondaryImageUrl?: string; // Secondary back / nutrition / process label image
  galleryImages?: string[];   // Additional thumbnail / angle shots
  updatedAt: string;
  salesCount: number;
  harvestLocation?: string;
}

export type CategoryVisibility = 'Visible' | 'Hidden';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  visibility: CategoryVisibility;
  displayOrder: number;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';
export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  imageUrl?: string;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string; // e.g. "GOF-8942"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  timeline: OrderTimeline[];
  internalNote?: string;
}

export type CustomerStatus = 'Active' | 'VIP' | 'Inactive';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  lastLoginDate?: string;
  firstOrderDate?: string;
  lastOrderDate?: string;
  authProvider?: string;
  hasPurchased?: boolean;
  photoURL?: string;
  status: CustomerStatus;
  recentOrderIds: string[];
}

export type PromotionType = 'percentage' | 'fixed';
export type PromotionStatus = 'Active' | 'Inactive' | 'Expired';

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: PromotionType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageCount: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
}

export interface TrustHighlight {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  ctaText?: string;
  ctaLink?: string;
  active?: boolean;
}

export interface TrustBadge {
  id: string;
  name: string;
  imageUrl: string;
  subtitle: string;
  active?: boolean;
}

export interface StoryImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tag: string;
  active?: boolean;
}

export interface OfferBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  active: boolean;
}

export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  comment: string;
  rating: number;
  avatarUrl: string;
  verified?: boolean;
}

export interface BrandAssets {
  primaryLogoUrl: string;
  headerLogoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;
}

export interface StoreContent {
  heroHeadline: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroSlides: HeroSlide[];
  promoBanner: {
    enabled: boolean;
    text: string;
    ctaText: string;
    ctaLink: string;
    bgColor: string;
  };
  featuredProductIds: string[];
  trustHighlights: TrustHighlight[];
  trustBadges?: TrustBadge[];
  storyImages?: StoryImage[];
  offerBanners?: OfferBanner[];
  testimonials?: TestimonialItem[];
  brandAssets?: BrandAssets;
  shipping?: {
    freeShippingThreshold: number;
    standardDeliveryCharge: number;
    estimatedDays?: string;
  };
}

export interface StoreSettings {
  storeProfile: {
    storeName: string;
    supportEmail: string;
    supportPhone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNumber: string;
    fssaiLicense: string;
  };
  appearance: {
    primaryAccent: string;
    logoText: string;
    tagline: string;
    bannerNotice: string;
  };
  shipping: {
    freeShippingThreshold: number;
    standardDeliveryCharge: number;
    estimatedDays?: string;
  };
  notifications: {
    orderAlerts: boolean;
    lowStockAlerts: boolean;
    customerInquiries: boolean;
    dailyDigest: boolean;
    lowStockThreshold: number;
  };
  adminProfile: {
    name: string;
    email: string;
    role: string;
    phone: string;
  };
  preferences?: {
    currency?: string;
    dateFormat?: string;
    tableDensity?: 'compact' | 'comfortable';
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'stock' | 'customer' | 'system';
  read: boolean;
  link?: string;
}
