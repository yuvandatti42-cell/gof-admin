import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Category,
  Customer,
  NotificationItem,
  Order,
  Product,
  Promotion,
  StoreContent,
  StoreSettings,
} from '../types';

export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  PROMOTIONS: 'promotions',
  STORE_CONTENT: 'storeContent',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
} as const;

// Helper to sanitize undefined values before saving to Firestore
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeForFirestore(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item !== null && typeof item === 'object' ? sanitizeForFirestore(item) : item
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

// -------------------------------------------------------------
// REALTIME SUBSCRIPTIONS
// -------------------------------------------------------------

export function subscribeToProducts(
  callback: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, COLLECTIONS.PRODUCTS));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Product;
        const catName = data.categoryName || (data as any).category || 'General';
        let catId = data.categoryId;
        if (!catId) {
          const lower = catName.toLowerCase();
          if (lower.includes('rice')) catId = 'cat-rice';
          else if (lower.includes('oil') || lower.includes('ghee')) catId = 'cat-oils';
          else if (lower.includes('millet')) catId = 'cat-millets';
          else if (lower.includes('spice')) catId = 'cat-spices';
          else catId = `cat-${lower.replace(/\s+/g, '-')}`;
        }
        // Normalize fields for storefront & admin mutual compatibility
        list.push({
          ...data,
          id: docSnap.id,
          categoryId: catId,
          categoryName: catName,
          imageUrl: data.imageUrl || (data as any).image || '/categories/oil.webp',
          compareAtPrice: data.compareAtPrice ?? (data as any).originalPrice ?? data.price,
        });
      });
      callback(list);
    },
    (err) => {
      console.error('Firestore products subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToCategories(
  callback: (categories: Category[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, COLLECTIONS.CATEGORIES));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Category[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Category), id: docSnap.id });
      });
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      callback(list);
    },
    (err) => {
      console.error('Firestore categories subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, COLLECTIONS.ORDERS));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Order), id: docSnap.id });
      });
      // Sort orders descending by date
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(list);
    },
    (err) => {
      console.error('Firestore orders subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToCustomers(
  callback: (customers: Customer[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, COLLECTIONS.CUSTOMERS));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Customer[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Customer), id: docSnap.id });
      });
      callback(list);
    },
    (err) => {
      console.error('Firestore customers subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToPromotions(
  callback: (promotions: Promotion[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, COLLECTIONS.PROMOTIONS));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Promotion[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Promotion), id: docSnap.id });
      });
      callback(list);
    },
    (err) => {
      console.error('Firestore promotions subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToStoreContent(
  callback: (content: StoreContent | null) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, COLLECTIONS.STORE_CONTENT, 'active');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as StoreContent);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error('Firestore storeContent subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToSettings(
  callback: (settings: StoreSettings | null) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'general');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as StoreSettings);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error('Firestore settings subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToNotifications(
  callback: (notifications: NotificationItem[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, COLLECTIONS.NOTIFICATIONS));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: NotificationItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as NotificationItem), id: docSnap.id });
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(list);
    },
    (err) => {
      console.error('Firestore notifications subscription error:', err);
      if (onError) onError(err);
    }
  );
}

// -------------------------------------------------------------
// CRUD ACTIONS (WRITES)
// -------------------------------------------------------------

// Products
export async function addProductToFirestore(product: Product): Promise<void> {
  const isFeatured = product.featured ?? false;
  const sanitized = sanitizeForFirestore({
    ...product,
    // Add dual fields so customer website and user dashboard also understand directly
    title: product.name,
    image: product.imageUrl,
    category: product.categoryName,
    categoryName: product.categoryName,
    categoryId: product.categoryId,
    weight: product.unit,
    originalPrice: product.compareAtPrice ?? product.price,
    inStock: product.stock > 0 && product.status === 'Active',
    featured: isFeatured,
    onStore: isFeatured,
    isLiveOnStore: isFeatured,
    rating: 4.8,
    reviewsCount: 15,
  });
  await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), sanitized);
}

export async function updateProductInFirestore(id: string, updates: Partial<Product>): Promise<void> {
  const docUpdates: any = { ...updates };
  if (updates.name) docUpdates.title = updates.name;
  if (updates.imageUrl) docUpdates.image = updates.imageUrl;
  if (updates.categoryName) {
    docUpdates.category = updates.categoryName;
    docUpdates.categoryName = updates.categoryName;
  }
  if (updates.categoryId) docUpdates.categoryId = updates.categoryId;
  if (updates.unit) docUpdates.weight = updates.unit;
  if (updates.compareAtPrice !== undefined) docUpdates.originalPrice = updates.compareAtPrice;
  if (updates.stock !== undefined || updates.status !== undefined) {
    if (updates.stock !== undefined) docUpdates.inStock = updates.stock > 0;
  }
  if (updates.featured !== undefined) {
    docUpdates.featured = updates.featured;
    docUpdates.onStore = updates.featured;
    docUpdates.isLiveOnStore = updates.featured;
  }
  const sanitized = sanitizeForFirestore(docUpdates);
  await updateDoc(doc(db, COLLECTIONS.PRODUCTS, id), sanitized);
}

export async function deleteProductFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
}

export async function bulkUpdateProductsInFirestore(
  ids: string[],
  updates: Partial<Product>
): Promise<void> {
  const batch = writeBatch(db);
  const docUpdates: any = { ...updates };
  if (updates.featured !== undefined) {
    docUpdates.onStore = updates.featured;
    docUpdates.isLiveOnStore = updates.featured;
  }
  const sanitized = sanitizeForFirestore(docUpdates);
  ids.forEach((id) => {
    batch.update(doc(db, COLLECTIONS.PRODUCTS, id), sanitized);
  });
  await batch.commit();
}

export async function bulkDeleteProductsFromFirestore(ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  ids.forEach((id) => {
    batch.delete(doc(db, COLLECTIONS.PRODUCTS, id));
  });
  await batch.commit();
}

// Categories
export async function addCategoryToFirestore(category: Category): Promise<void> {
  const sanitized = sanitizeForFirestore({
    ...category,
    image: category.imageUrl,
    imageUrl: category.imageUrl,
  });
  await setDoc(doc(db, COLLECTIONS.CATEGORIES, category.id), sanitized, { merge: true });
}

export async function updateCategoryInFirestore(
  id: string,
  updates: Partial<Category>
): Promise<void> {
  const docUpdates: any = { ...updates };
  if (updates.imageUrl) {
    docUpdates.image = updates.imageUrl;
    docUpdates.imageUrl = updates.imageUrl;
  }
  const sanitized = sanitizeForFirestore(docUpdates);
  await setDoc(doc(db, COLLECTIONS.CATEGORIES, id), sanitized, { merge: true });
}

export async function deleteCategoryFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id));
}

// Orders
export async function addOrderToFirestore(order: Order): Promise<void> {
  const sanitized = sanitizeForFirestore(order);
  await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), sanitized);
}

export async function updateOrderInFirestore(id: string, updates: Partial<Order>): Promise<void> {
  const sanitized = sanitizeForFirestore(updates);
  await updateDoc(doc(db, COLLECTIONS.ORDERS, id), sanitized);
}

// Customers
export async function addCustomerToFirestore(customer: Customer): Promise<void> {
  const sanitized = sanitizeForFirestore(customer);
  await setDoc(doc(db, COLLECTIONS.CUSTOMERS, customer.id), sanitized);
}

export async function updateCustomerInFirestore(
  id: string,
  updates: Partial<Customer>
): Promise<void> {
  const sanitized = sanitizeForFirestore(updates);
  await updateDoc(doc(db, COLLECTIONS.CUSTOMERS, id), sanitized);
}

// Promotions
export async function addPromotionToFirestore(promotion: Promotion): Promise<void> {
  const sanitized = sanitizeForFirestore(promotion);
  await setDoc(doc(db, COLLECTIONS.PROMOTIONS, promotion.id), sanitized);
}

export async function updatePromotionInFirestore(
  id: string,
  updates: Partial<Promotion>
): Promise<void> {
  const sanitized = sanitizeForFirestore(updates);
  await updateDoc(doc(db, COLLECTIONS.PROMOTIONS, id), sanitized);
}

export async function deletePromotionFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.PROMOTIONS, id));
}

// Store Content
export async function saveStoreContentToFirestore(content: StoreContent): Promise<void> {
  const sanitized = sanitizeForFirestore(content);
  await setDoc(doc(db, COLLECTIONS.STORE_CONTENT, 'active'), sanitized);
}

// Settings
export async function saveSettingsToFirestore(settings: StoreSettings): Promise<void> {
  const sanitized = sanitizeForFirestore(settings);
  await setDoc(doc(db, COLLECTIONS.SETTINGS, 'general'), sanitized);
}

// Notifications
export async function addNotificationToFirestore(notification: NotificationItem): Promise<void> {
  const sanitized = sanitizeForFirestore(notification);
  await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notification.id), sanitized);
}

export async function markNotificationReadInFirestore(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true });
}

export async function markAllNotificationsReadInFirestore(ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  ids.forEach((id) => {
    batch.update(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true });
  });
  await batch.commit();
}

// -------------------------------------------------------------
// ONE-TIME SEEDER (Populates Firestore if database is empty)
// -------------------------------------------------------------

export async function checkAndSeedFirestoreIfEmpty(defaults: {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  promotions: Promotion[];
  storeContent: StoreContent;
  settings: StoreSettings;
  notifications: NotificationItem[];
}): Promise<boolean> {
  try {
    const prodSnap = await getDocs(query(collection(db, COLLECTIONS.PRODUCTS), limit(1)));
    
    // Check if categories collection is empty and seed if so
    const catSnap = await getDocs(query(collection(db, COLLECTIONS.CATEGORIES), limit(1)));
    if (catSnap.empty) {
      console.log('Categories collection empty in Firestore. Seeding default categories...');
      const catBatch = writeBatch(db);
      defaults.categories.forEach((c) => {
        const docRef = doc(db, COLLECTIONS.CATEGORIES, c.id);
        catBatch.set(docRef, sanitizeForFirestore({
          ...c,
          image: c.imageUrl,
          imageUrl: c.imageUrl,
        }));
      });
      await catBatch.commit();
    }

    if (!prodSnap.empty) {
      console.log('Firebase Firestore already contains products. Skipping initial product seed.');
      return false;
    }

    console.log('Firestore is empty. Performing initial Godavari Organics data seed...');
    const batch = writeBatch(db);

    // Products
    defaults.products.forEach((p) => {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, p.id);
      const data = sanitizeForFirestore({
        ...p,
        image: p.imageUrl,
        category: p.categoryName,
        originalPrice: p.compareAtPrice ?? p.price,
        inStock: p.stock > 0 && p.status === 'Active',
      });
      batch.set(docRef, data);
    });

    // Categories
    defaults.categories.forEach((c) => {
      const docRef = doc(db, COLLECTIONS.CATEGORIES, c.id);
      batch.set(docRef, sanitizeForFirestore(c));
    });

    // Orders
    defaults.orders.forEach((o) => {
      const docRef = doc(db, COLLECTIONS.ORDERS, o.id);
      batch.set(docRef, sanitizeForFirestore(o));
    });

    // Customers
    defaults.customers.forEach((cust) => {
      const docRef = doc(db, COLLECTIONS.CUSTOMERS, cust.id);
      batch.set(docRef, sanitizeForFirestore(cust));
    });

    // Promotions
    defaults.promotions.forEach((pr) => {
      const docRef = doc(db, COLLECTIONS.PROMOTIONS, pr.id);
      batch.set(docRef, sanitizeForFirestore(pr));
    });

    // Store Content
    batch.set(
      doc(db, COLLECTIONS.STORE_CONTENT, 'active'),
      sanitizeForFirestore(defaults.storeContent)
    );

    // Settings
    batch.set(
      doc(db, COLLECTIONS.SETTINGS, 'general'),
      sanitizeForFirestore(defaults.settings)
    );

    // Notifications
    defaults.notifications.forEach((n) => {
      const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, n.id);
      batch.set(docRef, sanitizeForFirestore(n));
    });

    await batch.commit();
    console.log('Successfully seeded Firestore with Godavari Organics catalog & store content!');
    return true;
  } catch (err) {
    console.error('Failed to seed Firestore:', err);
    return false;
  }
}
