import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Category,
  Customer,
  CustomerStatus,
  HeroSlide,
  NotificationItem,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductStatus,
  Promotion,
  StoreContent,
  StoreSettings,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_PROMOTIONS,
  INITIAL_SETTINGS,
  INITIAL_STORE_CONTENT,
} from '../data/mockData';

interface AdminContextType {
  // Data
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  promotions: Promotion[];
  storeContent: StoreContent;
  settings: StoreSettings;
  notifications: NotificationItem[];
  
  // Shell state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // Storefront Simulator & Modals state
  isLiveStorefrontOpen: boolean;
  setLiveStorefrontOpen: (open: boolean) => void;
  isQuickAddModalOpen: boolean;
  setQuickAddModalOpen: (open: boolean) => void;
  isStorefrontPickerOpen: boolean;
  setStorefrontPickerOpen: (open: boolean) => void;

  // Storefront Product Helpers (Add / Remove from live customer website)
  isProductOnStorefront: (productId: string) => boolean;
  addProductToStorefront: (productId: string) => void;
  removeProductFromStorefront: (productId: string) => void;
  toggleProductOnStorefront: (productId: string) => void;
  addMultipleProductsToStorefront: (productIds: string[]) => void;
  removeMultipleProductsFromStorefront: (productIds: string[]) => void;
  syncToStorefront: () => Promise<void>;

  // Product actions
  addProduct: (data: Omit<Product, 'id' | 'updatedAt' | 'salesCount'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | null;
  bulkUpdateProductStatus: (ids: string[], status: ProductStatus) => void;
  bulkDeleteProducts: (ids: string[]) => void;

  // Category actions
  addCategory: (data: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Order actions
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  updateOrderInternalNote: (orderId: string, note: string) => void;

  // Customer actions
  updateCustomerStatus: (id: string, status: CustomerStatus) => void;

  // Promotion actions
  addPromotion: (promo: Omit<Promotion, 'id' | 'usageCount'>) => Promotion;
  updatePromotion: (id: string, updates: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;
  togglePromotionStatus: (id: string) => void;

  // Store content & Hero Slides
  updateStoreContent: (updates: Partial<StoreContent>) => void;
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updateHeroSlide: (id: string, updates: Partial<HeroSlide>) => void;
  deleteHeroSlide: (id: string) => void;
  reorderHeroSlides: (slides: HeroSlide[]) => void;
  toggleHeroSlideStatus: (id: string) => void;

  // Settings
  updateSettings: (updates: Partial<StoreSettings>) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // System
  resetToDemoData: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'gof_admin_products_v4',
  CATEGORIES: 'gof_admin_categories_v4',
  ORDERS: 'gof_admin_orders_v4',
  CUSTOMERS: 'gof_admin_customers_v4',
  PROMOTIONS: 'gof_admin_promotions_v4',
  STORE_CONTENT: 'gof_admin_store_content_v4',
  SETTINGS: 'gof_admin_settings_v4',
  NOTIFICATIONS: 'gof_admin_notifications_v4',
};

function safeGetStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Failed reading localStorage key: ${key}`, err);
    return fallback;
  }
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with localStorage fallback
  const [products, setProducts] = useState<Product[]>(() =>
    safeGetStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    safeGetStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    safeGetStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS)
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    safeGetStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS)
  );
  const [promotions, setPromotions] = useState<Promotion[]>(() =>
    safeGetStorage(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS)
  );
  const [storeContent, setStoreContent] = useState<StoreContent>(() => {
    const loaded = safeGetStorage(STORAGE_KEYS.STORE_CONTENT, INITIAL_STORE_CONTENT);
    return {
      ...INITIAL_STORE_CONTENT,
      ...loaded,
      heroSlides: (loaded.heroSlides && Array.isArray(loaded.heroSlides) && loaded.heroSlides.length > 0)
        ? loaded.heroSlides
        : INITIAL_STORE_CONTENT.heroSlides,
      trustBadges: (loaded.trustBadges && Array.isArray(loaded.trustBadges) && loaded.trustBadges.length > 0)
        ? loaded.trustBadges
        : INITIAL_STORE_CONTENT.trustBadges,
      storyImages: (loaded.storyImages && Array.isArray(loaded.storyImages) && loaded.storyImages.length > 0)
        ? loaded.storyImages
        : INITIAL_STORE_CONTENT.storyImages,
      offerBanners: (loaded.offerBanners && Array.isArray(loaded.offerBanners) && loaded.offerBanners.length > 0)
        ? loaded.offerBanners
        : INITIAL_STORE_CONTENT.offerBanners,
      testimonials: (loaded.testimonials && Array.isArray(loaded.testimonials) && loaded.testimonials.length > 0)
        ? loaded.testimonials
        : INITIAL_STORE_CONTENT.testimonials,
      brandAssets: loaded.brandAssets || INITIAL_STORE_CONTENT.brandAssets,
    };
  });
  const [settings, setSettings] = useState<StoreSettings>(() =>
    safeGetStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    safeGetStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  // Shell UI state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  // Storefront Simulator & Quick Modals
  const [isLiveStorefrontOpen, setLiveStorefrontOpen] = useState(false);
  const [isQuickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [isStorefrontPickerOpen, setStorefrontPickerOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORE_CONTENT, JSON.stringify(storeContent));
  }, [storeContent]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Sidebar collapse toggle
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  // Product Actions
  const addProduct = useCallback(
    (data: Omit<Product, 'id' | 'updatedAt' | 'salesCount'>): Product => {
      const newProduct: Product = {
        ...data,
        id: `prod-${Date.now()}`,
        updatedAt: new Date().toISOString(),
        salesCount: 0,
      };
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    },
    []
  );

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setStoreContent((prev) => ({
      ...prev,
      featuredProductIds: prev.featuredProductIds.filter((itemId) => itemId !== id),
    }));
  }, []);

  const duplicateProduct = useCallback(
    (id: string): Product | null => {
      const target = products.find((p) => p.id === id);
      if (!target) return null;

      const duplicate: Product = {
        ...target,
        id: `prod-${Date.now()}`,
        name: `${target.name} (Copy)`,
        sku: `${target.sku}-COPY`,
        salesCount: 0,
        updatedAt: new Date().toISOString(),
      };
      setProducts((prev) => [duplicate, ...prev]);
      return duplicate;
    },
    [products]
  );

  const bulkUpdateProductStatus = useCallback((ids: string[], status: ProductStatus) => {
    setProducts((prev) =>
      prev.map((p) =>
        ids.includes(p.id)
          ? { ...p, status, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const bulkDeleteProducts = useCallback((ids: string[]) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    setStoreContent((prev) => ({
      ...prev,
      featuredProductIds: prev.featuredProductIds.filter((itemId) => !ids.includes(itemId)),
    }));
  }, []);

  // Storefront Product Helpers
  const isProductOnStorefront = useCallback(
    (productId: string) => {
      return storeContent.featuredProductIds.includes(productId);
    },
    [storeContent.featuredProductIds]
  );

  const addProductToStorefront = useCallback((productId: string) => {
    setStoreContent((prev) => {
      if (prev.featuredProductIds.includes(productId)) return prev;
      return {
        ...prev,
        featuredProductIds: [productId, ...prev.featuredProductIds],
      };
    });
  }, []);

  const removeProductFromStorefront = useCallback((productId: string) => {
    setStoreContent((prev) => ({
      ...prev,
      featuredProductIds: prev.featuredProductIds.filter((id) => id !== productId),
    }));
  }, []);

  const toggleProductOnStorefront = useCallback((productId: string) => {
    setStoreContent((prev) => {
      const exists = prev.featuredProductIds.includes(productId);
      return {
        ...prev,
        featuredProductIds: exists
          ? prev.featuredProductIds.filter((id) => id !== productId)
          : [productId, ...prev.featuredProductIds],
      };
    });
  }, []);

  const addMultipleProductsToStorefront = useCallback((productIds: string[]) => {
    setStoreContent((prev) => {
      const newIds = productIds.filter((id) => !prev.featuredProductIds.includes(id));
      if (newIds.length === 0) return prev;
      return {
        ...prev,
        featuredProductIds: [...newIds, ...prev.featuredProductIds],
      };
    });
  }, []);

  const removeMultipleProductsFromStorefront = useCallback((productIds: string[]) => {
    setStoreContent((prev) => ({
      ...prev,
      featuredProductIds: prev.featuredProductIds.filter((id) => !productIds.includes(id)),
    }));
  }, []);

  const syncToStorefront = useCallback(async (): Promise<void> => {
    // Simulated connection delay for store sync
    await new Promise((resolve) => setTimeout(resolve, 600));
  }, []);

  // Category Actions
  const addCategory = useCallback(
    (data: Omit<Category, 'id'>): Category => {
      const newCategory: Category = {
        ...data,
        id: `cat-${Date.now()}`,
      };
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    },
    []
  );

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Order Actions
  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus, note?: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;

          const updatedTimeline = [
            ...order.timeline,
            {
              status: `Status changed to ${status}`,
              timestamp: new Date().toISOString(),
              note: note || `Admin updated order status to ${status}`,
            },
          ];

          return {
            ...order,
            orderStatus: status,
            timeline: updatedTimeline,
          };
        })
      );
    },
    []
  );

  const updatePaymentStatus = useCallback((orderId: string, status: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, paymentStatus: status } : order))
    );
  }, []);

  const updateOrderInternalNote = useCallback((orderId: string, note: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, internalNote: note } : order))
    );
  }, []);

  // Customer Actions
  const updateCustomerStatus = useCallback((id: string, status: CustomerStatus) => {
    setCustomers((prev) =>
      prev.map((cust) => (cust.id === id ? { ...cust, status } : cust))
    );
  }, []);

  // Promotion Actions
  const addPromotion = useCallback(
    (promo: Omit<Promotion, 'id' | 'usageCount'>): Promotion => {
      const newPromo: Promotion = {
        ...promo,
        id: `promo-${Date.now()}`,
        usageCount: 0,
      };
      setPromotions((prev) => [newPromo, ...prev]);
      return newPromo;
    },
    []
  );

  const updatePromotion = useCallback((id: string, updates: Partial<Promotion>) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deletePromotion = useCallback((id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const togglePromotionStatus = useCallback((id: string) => {
    setPromotions((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newStatus = p.status === 'Active' ? 'Inactive' : 'Active';
        return { ...p, status: newStatus };
      })
    );
  }, []);

  // Store Content Actions
  const updateStoreContent = useCallback((updates: Partial<StoreContent>) => {
    setStoreContent((prev) => ({ ...prev, ...updates }));
  }, []);

  const addHeroSlide = useCallback((data: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = {
      ...data,
      id: `slide-${Date.now()}`,
    };
    setStoreContent((prev) => ({
      ...prev,
      heroSlides: [...(prev.heroSlides || []), newSlide],
    }));
  }, []);

  const updateHeroSlide = useCallback((id: string, updates: Partial<HeroSlide>) => {
    setStoreContent((prev) => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteHeroSlide = useCallback((id: string) => {
    setStoreContent((prev) => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).filter((s) => s.id !== id),
    }));
  }, []);

  const reorderHeroSlides = useCallback((slides: HeroSlide[]) => {
    setStoreContent((prev) => ({
      ...prev,
      heroSlides: slides,
    }));
  }, []);

  const toggleHeroSlideStatus = useCallback((id: string) => {
    setStoreContent((prev) => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      ),
    }));
  }, []);

  // Settings Actions
  const updateSettings = useCallback((updates: Partial<StoreSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
      storeProfile: { ...prev.storeProfile, ...updates.storeProfile },
      appearance: { ...prev.appearance, ...updates.appearance },
      notifications: { ...prev.notifications, ...updates.notifications },
      adminProfile: { ...prev.adminProfile, ...updates.adminProfile },
      preferences: { ...prev.preferences, ...updates.preferences },
    }));
  }, []);

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Reset demo data
  const resetToDemoData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setPromotions(INITIAL_PROMOTIONS);
    setStoreContent(INITIAL_STORE_CONTENT);
    setSettings(INITIAL_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);

    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }, []);

  return (
    <AdminContext.Provider
      value={{
        products,
        categories,
        orders,
        customers,
        promotions,
        storeContent,
        settings,
        notifications,
        isSidebarCollapsed,
        toggleSidebar,
        isMobileNavOpen,
        setMobileNavOpen,
        isLiveStorefrontOpen,
        setLiveStorefrontOpen,
        isQuickAddModalOpen,
        setQuickAddModalOpen,
        isStorefrontPickerOpen,
        setStorefrontPickerOpen,
        isProductOnStorefront,
        addProductToStorefront,
        removeProductFromStorefront,
        toggleProductOnStorefront,
        addMultipleProductsToStorefront,
        removeMultipleProductsFromStorefront,
        syncToStorefront,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        bulkUpdateProductStatus,
        bulkDeleteProducts,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        updatePaymentStatus,
        updateOrderInternalNote,
        updateCustomerStatus,
        addPromotion,
        updatePromotion,
        deletePromotion,
        togglePromotionStatus,
        updateStoreContent,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        reorderHeroSlides,
        toggleHeroSlideStatus,
        updateSettings,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToDemoData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
