import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  CallbackRequest,
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
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToOrders,
  subscribeToCustomers,
  subscribeToPromotions,
  subscribeToStoreContent,
  subscribeToSettings,
  subscribeToNotifications,
  subscribeToCallbacks,
  updateCallbackStatusInFirestore,
  deleteCallbackFromFirestore,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  bulkUpdateProductsInFirestore,
  bulkDeleteProductsFromFirestore,
  addCategoryToFirestore,
  updateCategoryInFirestore,
  deleteCategoryFromFirestore,
  updateOrderInFirestore,
  updateCustomerInFirestore,
  addPromotionToFirestore,
  updatePromotionInFirestore,
  deletePromotionFromFirestore,
  saveStoreContentToFirestore,
  saveSettingsToFirestore,
  markNotificationReadInFirestore,
  markAllNotificationsReadInFirestore,
  checkAndSeedFirestoreIfEmpty,
} from '../services/firebaseService';

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
  
  // Firebase State
  firebaseConnected: boolean;
  isFirebaseSyncing: boolean;
  syncWithFirebase: () => Promise<void>;

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
  updateOrder: (orderId: string, updates: Partial<Order>) => void;

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

  // Callback Requests ("Have questions? We will call you right back")
  callbackRequests: CallbackRequest[];
  updateCallbackStatus: (id: string, status: 'Pending' | 'Contacted') => void;
  deleteCallback: (id: string) => void;

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
  const [callbackRequests, setCallbackRequests] = useState<CallbackRequest[]>([]);

  // Firebase connection and sync states
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);
  const knownOrderIdsRef = useRef<Set<string>>(new Set(orders.map((o) => o.id)));

  // Shell UI state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  // Storefront Simulator & Quick Modals
  const [isLiveStorefrontOpen, setLiveStorefrontOpen] = useState(false);
  const [isQuickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [isStorefrontPickerOpen, setStorefrontPickerOpen] = useState(false);

  // Sync to localStorage as offline cache
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

  // -------------------------------------------------------------
  // FIREBASE INITIALIZATION & REALTIME SUBSCRIPTIONS
  // -------------------------------------------------------------
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const initFirebase = async () => {
      try {
        setIsFirebaseSyncing(true);

        // 1. Seed default products and content if Firestore is empty
        await checkAndSeedFirestoreIfEmpty({
          products: INITIAL_PRODUCTS,
          categories: INITIAL_CATEGORIES,
          orders: INITIAL_ORDERS,
          customers: INITIAL_CUSTOMERS,
          promotions: INITIAL_PROMOTIONS,
          storeContent: INITIAL_STORE_CONTENT,
          settings: INITIAL_SETTINGS,
          notifications: INITIAL_NOTIFICATIONS,
        });

        // 2. Set up real-time Firestore listeners
        const unsubProducts = subscribeToProducts((liveProducts) => {
          if (liveProducts.length > 0) {
            setProducts(liveProducts);
          }
          setFirebaseConnected(true);
        });

        const unsubCategories = subscribeToCategories((liveCategories) => {
          if (liveCategories.length > 0) {
            setCategories(liveCategories);
          }
        });

        const unsubOrders = subscribeToOrders((liveOrders) => {
          if (liveOrders.length > 0) {
            // Check for brand new orders placed from storefront
            liveOrders.forEach((order) => {
              if (!knownOrderIdsRef.current.has(order.id)) {
                knownOrderIdsRef.current.add(order.id);
                // Create an alert notification for the admin
                const newNotification: NotificationItem = {
                  id: `notif-${Date.now()}-${order.id}`,
                  title: `New Order: #${order.id}`,
                  message: `${order.customerName} placed an order for ₹${order.total.toLocaleString('en-IN')}`,
                  timestamp: new Date().toISOString(),
                  type: 'order',
                  read: false,
                  link: '/orders',
                };
                setNotifications((prev) => [newNotification, ...prev]);
              }
            });
            setOrders(liveOrders);
          }
        });

        const unsubCustomers = subscribeToCustomers((liveCustomers) => {
          if (liveCustomers.length > 0) {
            setCustomers(liveCustomers);
          }
        });

        const unsubPromotions = subscribeToPromotions((livePromos) => {
          if (livePromos.length > 0) {
            setPromotions(livePromos);
          }
        });

        const unsubStoreContent = subscribeToStoreContent((liveContent) => {
          if (liveContent) {
            setStoreContent((prev) => ({
              ...prev,
              ...liveContent,
              heroSlides: liveContent.heroSlides?.length ? liveContent.heroSlides : prev.heroSlides,
            }));
          }
        });

        const unsubSettings = subscribeToSettings((liveSettings) => {
          if (liveSettings) {
            setSettings(liveSettings);
          }
        });

        const unsubNotifications = subscribeToNotifications((liveNotifications) => {
          if (liveNotifications.length > 0) {
            setNotifications(liveNotifications);
          }
        });

        const unsubCallbacks = subscribeToCallbacks((liveCallbacks) => {
          setCallbackRequests(liveCallbacks);
        });

        unsubs = [
          unsubProducts,
          unsubCategories,
          unsubOrders,
          unsubCustomers,
          unsubPromotions,
          unsubStoreContent,
          unsubSettings,
          unsubNotifications,
          unsubCallbacks,
        ];
      } catch (err) {
        console.error('Firebase initialization error in AdminProvider:', err);
      } finally {
        setIsFirebaseSyncing(false);
      }
    };

    initFirebase();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Manual trigger to force re-sync
  const syncWithFirebase = useCallback(async () => {
    setIsFirebaseSyncing(true);
    try {
      await checkAndSeedFirestoreIfEmpty({
        products,
        categories,
        orders,
        customers,
        promotions,
        storeContent,
        settings,
        notifications,
      });
      setFirebaseConnected(true);
    } catch (err) {
      console.error('Sync with Firebase failed:', err);
    } finally {
      setIsFirebaseSyncing(false);
    }
  }, [products, categories, orders, customers, promotions, storeContent, settings, notifications]);

  // Sidebar collapse toggle
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  // Product Actions
  const addProduct = useCallback(
    (data: Omit<Product, 'id' | 'updatedAt' | 'salesCount'>): Product => {
      const isFeatured = Boolean(data.featured);
      const newProduct: Product = {
        ...data,
        id: `prod-${Date.now()}`,
        updatedAt: new Date().toISOString(),
        salesCount: 0,
        featured: isFeatured,
      };
      setProducts((prev) => [newProduct, ...prev]);
      addProductToFirestore(newProduct).catch((err) =>
        console.error('Failed to save product to Firestore:', err)
      );

      if (isFeatured) {
        setStoreContent((prev) => {
          const updated = {
            ...prev,
            featuredProductIds: [newProduct.id, ...prev.featuredProductIds.filter((id) => id !== newProduct.id)],
          };
          saveStoreContentToFirestore(updated).catch((err) =>
            console.error('Failed to save store content to Firestore:', err)
          );
          return updated;
        });
      }

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
    updateProductInFirestore(id, updates).catch((err) =>
      console.error('Failed to update product in Firestore:', err)
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setStoreContent((prev) => ({
      ...prev,
      featuredProductIds: prev.featuredProductIds.filter((itemId) => itemId !== id),
    }));
    deleteProductFromFirestore(id).catch((err) =>
      console.error('Failed to delete product from Firestore:', err)
    );
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
      addProductToFirestore(duplicate).catch((err) =>
        console.error('Failed to duplicate product to Firestore:', err)
      );
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
    bulkUpdateProductsInFirestore(ids, { status }).catch((err) =>
      console.error('Failed to bulk update products in Firestore:', err)
    );
  }, []);

  const bulkDeleteProducts = useCallback((ids: string[]) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    setStoreContent((prev) => ({
      ...prev,
      featuredProductIds: prev.featuredProductIds.filter((itemId) => !ids.includes(itemId)),
    }));
    bulkDeleteProductsFromFirestore(ids).catch((err) =>
      console.error('Failed to bulk delete products in Firestore:', err)
    );
  }, []);

  // Storefront Product Helpers
  const isProductOnStorefront = useCallback(
    (productId: string) => {
      if (storeContent.featuredProductIds.includes(productId)) return true;
      const target = products.find((p) => p.id === productId);
      return !!target?.featured;
    },
    [storeContent.featuredProductIds, products]
  );

  const addProductToStorefront = useCallback((productId: string) => {
    // 1. Update storefront list
    setStoreContent((prev) => {
      if (prev.featuredProductIds.includes(productId)) return prev;
      const updated = {
        ...prev,
        featuredProductIds: [productId, ...prev.featuredProductIds],
      };
      saveStoreContentToFirestore(updated).catch((err) =>
        console.error('Failed to save store content to Firestore:', err)
      );
      return updated;
    });

    // 2. Mark product as featured in catalog & Firestore
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, featured: true } : p))
    );
    updateProductInFirestore(productId, { featured: true }).catch((err) =>
      console.error('Failed to update product featured status in Firestore:', err)
    );
  }, []);

  const removeProductFromStorefront = useCallback((productId: string) => {
    // 1. Remove from storefront list
    setStoreContent((prev) => {
      const updated = {
        ...prev,
        featuredProductIds: prev.featuredProductIds.filter((id) => id !== productId),
      };
      saveStoreContentToFirestore(updated).catch((err) =>
        console.error('Failed to save store content to Firestore:', err)
      );
      return updated;
    });

    // 2. Unmark product featured in catalog & Firestore
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, featured: false } : p))
    );
    updateProductInFirestore(productId, { featured: false }).catch((err) =>
      console.error('Failed to update product featured status in Firestore:', err)
    );
  }, []);

  const toggleProductOnStorefront = useCallback((productId: string) => {
    let nextFeaturedState = false;

    setStoreContent((prev) => {
      const exists = prev.featuredProductIds.includes(productId);
      nextFeaturedState = !exists;
      const updated = {
        ...prev,
        featuredProductIds: exists
          ? prev.featuredProductIds.filter((id) => id !== productId)
          : [productId, ...prev.featuredProductIds],
      };
      saveStoreContentToFirestore(updated).catch((err) =>
        console.error('Failed to save store content to Firestore:', err)
      );
      return updated;
    });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, featured: nextFeaturedState } : p
      )
    );
    updateProductInFirestore(productId, { featured: nextFeaturedState }).catch((err) =>
      console.error('Failed to toggle product featured in Firestore:', err)
    );
  }, []);

  const addMultipleProductsToStorefront = useCallback((productIds: string[]) => {
    setStoreContent((prev) => {
      const newIds = productIds.filter((id) => !prev.featuredProductIds.includes(id));
      if (newIds.length === 0) return prev;
      const updated = {
        ...prev,
        featuredProductIds: [...newIds, ...prev.featuredProductIds],
      };
      saveStoreContentToFirestore(updated).catch((err) =>
        console.error('Failed to save store content to Firestore:', err)
      );
      return updated;
    });

    setProducts((prev) =>
      prev.map((p) => (productIds.includes(p.id) ? { ...p, featured: true } : p))
    );
    bulkUpdateProductsInFirestore(productIds, { featured: true }).catch((err) =>
      console.error('Failed to bulk update products in Firestore:', err)
    );
  }, []);

  const removeMultipleProductsFromStorefront = useCallback((productIds: string[]) => {
    setStoreContent((prev) => {
      const updated = {
        ...prev,
        featuredProductIds: prev.featuredProductIds.filter((id) => !productIds.includes(id)),
      };
      saveStoreContentToFirestore(updated).catch((err) =>
        console.error('Failed to save store content to Firestore:', err)
      );
      return updated;
    });

    setProducts((prev) =>
      prev.map((p) => (productIds.includes(p.id) ? { ...p, featured: false } : p))
    );
    bulkUpdateProductsInFirestore(productIds, { featured: false }).catch((err) =>
      console.error('Failed to bulk update products in Firestore:', err)
    );
  }, []);

  const syncToStorefront = useCallback(async (): Promise<void> => {
    await saveStoreContentToFirestore(storeContent);
  }, [storeContent]);

  // Category Actions
  const addCategory = useCallback(
    (data: Omit<Category, 'id'>): Category => {
      const newCategory: Category = {
        ...data,
        id: `cat-${Date.now()}`,
      };
      setCategories((prev) => [...prev, newCategory]);
      addCategoryToFirestore(newCategory).catch((err) =>
        console.error('Failed to save category to Firestore:', err)
      );
      return newCategory;
    },
    []
  );

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    updateCategoryInFirestore(id, updates).catch((err) =>
      console.error('Failed to update category in Firestore:', err)
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    deleteCategoryFromFirestore(id).catch((err) =>
      console.error('Failed to delete category from Firestore:', err)
    );
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

          const updatedOrder = {
            ...order,
            orderStatus: status,
            timeline: updatedTimeline,
          };

          updateOrderInFirestore(orderId, {
            orderStatus: status,
            timeline: updatedTimeline,
          }).catch((err) => console.error('Failed to update order status in Firestore:', err));

          return updatedOrder;
        })
      );
    },
    []
  );

  const updatePaymentStatus = useCallback((orderId: string, status: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          updateOrderInFirestore(orderId, { paymentStatus: status }).catch((err) =>
            console.error('Failed to update payment status in Firestore:', err)
          );
          return { ...order, paymentStatus: status };
        }
        return order;
      })
    );
  }, []);

  const updateOrderInternalNote = useCallback((orderId: string, note: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          updateOrderInFirestore(orderId, { internalNote: note }).catch((err) =>
            console.error('Failed to update internal note in Firestore:', err)
          );
          return { ...order, internalNote: note };
        }
        return order;
      })
    );
  }, []);

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated = { ...order, ...updates };
          updateOrderInFirestore(orderId, updates).catch((err) =>
            console.error('Failed to update order in Firestore:', err)
          );
          return updated;
        }
        return order;
      })
    );
  }, []);

  // Customer Actions
  const updateCustomerStatus = useCallback((id: string, status: CustomerStatus) => {
    setCustomers((prev) =>
      prev.map((cust) => {
        if (cust.id === id) {
          updateCustomerInFirestore(id, { status }).catch((err) =>
            console.error('Failed to update customer status in Firestore:', err)
          );
          return { ...cust, status };
        }
        return cust;
      })
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
      addPromotionToFirestore(newPromo).catch((err) =>
        console.error('Failed to save promotion to Firestore:', err)
      );
      return newPromo;
    },
    []
  );

  const updatePromotion = useCallback((id: string, updates: Partial<Promotion>) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    updatePromotionInFirestore(id, updates).catch((err) =>
      console.error('Failed to update promotion in Firestore:', err)
    );
  }, []);

  const deletePromotion = useCallback((id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    deletePromotionFromFirestore(id).catch((err) =>
      console.error('Failed to delete promotion from Firestore:', err)
    );
  }, []);

  const togglePromotionStatus = useCallback((id: string) => {
    setPromotions((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newStatus = p.status === 'Active' ? 'Inactive' : 'Active';
        updatePromotionInFirestore(id, { status: newStatus }).catch((err) =>
          console.error('Failed to toggle promotion status in Firestore:', err)
        );
        return { ...p, status: newStatus };
      })
    );
  }, []);

  // Store Content Actions
  const updateStoreContent = useCallback((updates: Partial<StoreContent>) => {
    setStoreContent((prev) => {
      const updated = { ...prev, ...updates };
      saveStoreContentToFirestore(updated).catch((err) =>
        console.error('Failed to save store content to Firestore:', err)
      );
      return updated;
    });
  }, []);

  const addHeroSlide = useCallback((data: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = {
      ...data,
      id: `slide-${Date.now()}`,
    };
    setStoreContent((prev) => {
      const updated = {
        ...prev,
        heroSlides: [...(prev.heroSlides || []), newSlide],
      };
      saveStoreContentToFirestore(updated).catch((err) =>
        console.error('Failed to save hero slide to Firestore:', err)
      );
      return updated;
    });
  }, []);

  const updateHeroSlide = useCallback((id: string, updates: Partial<HeroSlide>) => {
    setStoreContent((prev) => {
      const updated = {
        ...prev,
        heroSlides: (prev.heroSlides || []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
      };
      saveStoreContentToFirestore(updated).catch((err) =>
        console.error('Failed to update hero slide in Firestore:', err)
      );
      return updated;
    });
  }, []);

  const deleteHeroSlide = useCallback((id: string) => {
    setStoreContent((prev) => {
      const updated = {
        ...prev,
        heroSlides: (prev.heroSlides || []).filter((s) => s.id !== id),
      };
      saveStoreContentToFirestore(updated).catch((err) =>
        console.error('Failed to delete hero slide in Firestore:', err)
      );
      return updated;
    });
  }, []);

  const reorderHeroSlides = useCallback((slides: HeroSlide[]) => {
    setStoreContent((prev) => {
      const updated = {
        ...prev,
        heroSlides: slides,
      };
      saveStoreContentToFirestore(updated).catch((err) =>
        console.error('Failed to reorder hero slides in Firestore:', err)
      );
      return updated;
    });
  }, []);

  const toggleHeroSlideStatus = useCallback((id: string) => {
    setStoreContent((prev) => {
      const updated = {
        ...prev,
        heroSlides: (prev.heroSlides || []).map((s) =>
          s.id === id ? { ...s, active: !s.active } : s
        ),
      };
      saveStoreContentToFirestore(updated).catch((err) =>
        console.error('Failed to toggle hero slide in Firestore:', err)
      );
      return updated;
    });
  }, []);

  // Settings Actions
  const updateSettings = useCallback((updates: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const updated: StoreSettings = {
        ...prev,
        ...updates,
        storeProfile: { ...prev.storeProfile, ...updates.storeProfile },
        appearance: { ...prev.appearance, ...updates.appearance },
        shipping: {
          freeShippingThreshold: updates.shipping?.freeShippingThreshold ?? prev.shipping?.freeShippingThreshold ?? 1000,
        },
        notifications: { ...prev.notifications, ...updates.notifications },
        adminProfile: { ...prev.adminProfile, ...updates.adminProfile },
        preferences: { ...prev.preferences, ...updates.preferences },
        payment: {
          razorpayKeyId: updates.payment?.razorpayKeyId ?? prev.payment?.razorpayKeyId ?? '',
          razorpayMode: updates.payment?.razorpayMode ?? prev.payment?.razorpayMode ?? 'live',
          razorpayEnabled: updates.payment?.razorpayEnabled ?? prev.payment?.razorpayEnabled ?? true,
          merchantName: updates.payment?.merchantName ?? prev.payment?.merchantName ?? 'Godavari Organic Foods',
        },
      };
      saveSettingsToFirestore(updated).catch((err) =>
        console.error('Failed to save settings to Firestore:', err)
      );

      // Also mirror shipping settings to storeContent so both collections provide the dynamic free shipping threshold
      if (updated.shipping) {
        setStoreContent((prevContent) => {
          const contentWithShipping = {
            ...prevContent,
            shipping: updated.shipping,
          };
          saveStoreContentToFirestore(contentWithShipping).catch((err) =>
            console.error('Failed to mirror shipping to storeContent in Firestore:', err)
          );
          return contentWithShipping;
        });
      }

      return updated;
    });
  }, []);

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    markNotificationReadInFirestore(id).catch((err) =>
      console.error('Failed to mark notification read in Firestore:', err)
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const ids = prev.map((n) => n.id);
      markAllNotificationsReadInFirestore(ids).catch((err) =>
        console.error('Failed to mark all notifications read in Firestore:', err)
      );
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, []);

  const updateCallbackStatus = useCallback((id: string, status: 'Pending' | 'Contacted') => {
    setCallbackRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    updateCallbackStatusInFirestore(id, status).catch((err) =>
      console.error('Failed to update callback status in Firestore:', err)
    );
  }, []);

  const deleteCallback = useCallback((id: string) => {
    setCallbackRequests((prev) => prev.filter((c) => c.id !== id));
    deleteCallbackFromFirestore(id).catch((err) =>
      console.error('Failed to delete callback from Firestore:', err)
    );
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

    // Re-seed Firestore
    checkAndSeedFirestoreIfEmpty({
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS,
      customers: INITIAL_CUSTOMERS,
      promotions: INITIAL_PROMOTIONS,
      storeContent: INITIAL_STORE_CONTENT,
      settings: INITIAL_SETTINGS,
      notifications: INITIAL_NOTIFICATIONS,
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
        firebaseConnected,
        isFirebaseSyncing,
        syncWithFirebase,
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
        updateOrder,
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
        callbackRequests,
        updateCallbackStatus,
        deleteCallback,
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
