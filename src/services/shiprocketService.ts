/**
 * Shiprocket API Integration Service
 * Production credentials & logistics workflow for Godavari Organic Foods (armafarms.com)
 */

import type { Order } from '../types';
import { updateOrderInFirestore } from './firebaseService';

export const SHIPROCKET_CONFIG = {
  BASE_URL: 'https://apiv2.shiprocket.in/v1/external',
  DEFAULT_EMAIL: 'nasnaidu01@gmail.com',
  DEFAULT_PASSWORD: 'vGQJtM%5*sam1YT31o94iB9*qXJd9mf9',
  DEFAULT_PICKUP_LOCATION: 'Primary',
  TOKEN_STORAGE_KEY: 'gof_shiprocket_token',
  TOKEN_EXPIRY_KEY: 'gof_shiprocket_token_expiry',
};

export interface ShiprocketCredentials {
  email?: string;
  password?: string;
  pickupLocation?: string;
}

export interface ShiprocketAuthResponse {
  id: number;
  company_id: number;
  first_name: string;
  last_name: string;
  email: string;
  token: string;
  created_at: string;
}

export interface ShiprocketPickupLocation {
  id: number;
  pickup_location: string;
  address: string;
  address_2?: string;
  city: string;
  state: string;
  pin_code: string;
  email?: string;
  phone?: string;
  company_name?: string;
  is_primary_location?: number;
}

export interface CreateShiprocketOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now?: number;
  awb_code?: string;
  courier_company_id?: string;
  courier_name?: string;
}

export interface AssignAWBResponse {
  awb_assign_status: number;
  response: {
    data: {
      awb_code: string;
      courier_company_id: number;
      courier_name: string;
      shipment_id: number;
      order_id: number;
      assigned_date_time?: string;
    };
  };
}

export interface GenerateLabelResponse {
  label_created: number;
  label_url: string;
  response?: string;
  not_created?: number[];
}

/**
 * Format date string to Shiprocket accepted format: 'YYYY-MM-DD HH:mm'
 */
export function formatShiprocketDate(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

let lastAuthFailureTime = 0;
let lastAuthFailureError = '';

export function clearShiprocketTokenCache(): void {
  lastAuthFailureTime = 0;
  lastAuthFailureError = '';
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SHIPROCKET_CONFIG.TOKEN_STORAGE_KEY);
    localStorage.removeItem(SHIPROCKET_CONFIG.TOKEN_EXPIRY_KEY);
  }
}

/**
 * Retrieve active JWT token from memory/localStorage, or authenticate with Shiprocket
 */
export async function getShiprocketToken(creds?: ShiprocketCredentials, forceRefresh = false): Promise<string> {
  const email = creds?.email || SHIPROCKET_CONFIG.DEFAULT_EMAIL;
  const password = creds?.password || SHIPROCKET_CONFIG.DEFAULT_PASSWORD;

  if (!forceRefresh) {
    // If recently failed with 403 or lockout, cooldown for 2 minutes to prevent repeated hammering that causes Shiprocket blocks
    if (Date.now() - lastAuthFailureTime < 2 * 60 * 1000) {
      throw new Error(`Shiprocket API authentication cooling down: ${lastAuthFailureError}`);
    }

    const cachedToken = localStorage.getItem(SHIPROCKET_CONFIG.TOKEN_STORAGE_KEY);
    const cachedExpiry = localStorage.getItem(SHIPROCKET_CONFIG.TOKEN_EXPIRY_KEY);
    const now = Date.now();

    if (cachedToken && cachedExpiry && now < Number(cachedExpiry)) {
      return cachedToken;
    }
  } else {
    lastAuthFailureTime = 0;
    lastAuthFailureError = '';
  }

  // Request new token from Shiprocket
  const res = await fetch(`${SHIPROCKET_CONFIG.BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message = errData.message || `Shiprocket login failed with HTTP ${res.status}`;
    lastAuthFailureTime = Date.now();
    lastAuthFailureError = message;
    throw new Error(message);
  }

  lastAuthFailureTime = 0;
  lastAuthFailureError = '';

  const data: ShiprocketAuthResponse = await res.json();
  if (!data.token) {
    throw new Error('No token returned in Shiprocket authentication response');
  }

  // Tokens are valid for 10 days; cache for 7 days safely
  const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
  localStorage.setItem(SHIPROCKET_CONFIG.TOKEN_STORAGE_KEY, data.token);
  localStorage.setItem(SHIPROCKET_CONFIG.TOKEN_EXPIRY_KEY, String(expiryTime));

  return data.token;
}

/**
 * Test authentication & fetch company pickup locations
 */
export async function testShiprocketConnection(creds?: ShiprocketCredentials): Promise<{
  success: boolean;
  companyName: string;
  email: string;
  pickupLocations: ShiprocketPickupLocation[];
}> {
  const token = await getShiprocketToken(creds, true);

  const res = await fetch(`${SHIPROCKET_CONFIG.BASE_URL}/settings/company/pickup`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load pickup locations: HTTP ${res.status}`);
  }

  const data = await res.json();
  const list: ShiprocketPickupLocation[] = data?.data?.shipping_address || [];
  const companyName = data?.data?.company_name || 'Godavari Organic Foods';

  return {
    success: true,
    companyName,
    email: creds?.email || SHIPROCKET_CONFIG.DEFAULT_EMAIL,
    pickupLocations: list,
  };
}

/**
 * Create custom adhoc order in Shiprocket
 */
export async function createShiprocketOrder(
  order: Order,
  options?: {
    pickupLocation?: string;
    weightKg?: number;
    lengthCm?: number;
    breadthCm?: number;
    heightCm?: number;
    creds?: ShiprocketCredentials;
  }
): Promise<CreateShiprocketOrderResponse> {
  const token = await getShiprocketToken(options?.creds);
  const pickupLocation =
    options?.pickupLocation ||
    options?.creds?.pickupLocation ||
    SHIPROCKET_CONFIG.DEFAULT_PICKUP_LOCATION;

  // Split customer full name into first and last
  const nameParts = (order.customerName || 'Valued Customer').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Order items payload
  const orderItems = (order.items && order.items.length > 0)
    ? order.items.map((item, idx) => ({
        name: item.productName || `Item #${idx + 1}`,
        sku: item.productId || `SKU-${idx + 1}`,
        units: item.quantity || 1,
        selling_price: String(item.unitPrice || 0),
        discount: '0',
        tax: '0',
      }))
    : [
        {
          name: 'Organic Grocery Order',
          sku: 'GOF-BUNDLE',
          units: 1,
          selling_price: String(order.total || 0),
          discount: '0',
          tax: '0',
        },
      ];

  // Determine payment method
  const isCOD = (order.paymentMethod || '').toLowerCase().includes('cash');
  const paymentMethod = isCOD ? 'COD' : 'Prepaid';

  // Calculate default dimensions / weights
  const weight = options?.weightKg || Math.max(0.5, (order.items?.length || 1) * 0.4);
  const length = options?.lengthCm || 15;
  const breadth = options?.breadthCm || 15;
  const height = options?.heightCm || 10;

  // Build clean phone number (10 digits)
  const cleanPhone = (order.customerPhone || '9010088063').replace(/\D/g, '').slice(-10);

  const payload = {
    order_id: `${order.id}-${Date.now().toString().slice(-4)}`, // append stamp to avoid Shiprocket duplicate order_id errors
    order_date: formatShiprocketDate(order.date),
    pickup_location: pickupLocation,
    channel_id: '',
    comment: order.internalNote || 'Godavari Organics Verified Package',
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: order.shippingAddress.street || 'Riverbank Road',
    billing_address_2: '',
    billing_city: order.shippingAddress.city || 'Rajahmundry',
    billing_pincode: order.shippingAddress.pincode || '533105',
    billing_state: order.shippingAddress.state || 'Andhra Pradesh',
    billing_country: 'India',
    billing_email: order.customerEmail || 'care@godavariorganic.in',
    billing_phone: cleanPhone || '9010088063',
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: paymentMethod,
    sub_total: Number(order.total || 0),
    length,
    breadth,
    height,
    weight,
  };

  const res = await fetch(`${SHIPROCKET_CONFIG.BASE_URL}/orders/create/adhoc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || data.status_code >= 400) {
    const errorMsg =
      data.message ||
      (data.errors ? JSON.stringify(data.errors) : `HTTP ${res.status} Order creation failed`);
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Assign courier and generate AWB tracking code for a created shipment
 */
export async function assignShiprocketAWB(
  shipmentId: number,
  courierId?: number,
  creds?: ShiprocketCredentials
): Promise<{
  awbCode: string;
  courierName: string;
  courierCompanyId: number;
}> {
  const token = await getShiprocketToken(creds);

  const body: any = { shipment_id: shipmentId };
  if (courierId) {
    body.courier_id = courierId;
  }

  const res = await fetch(`${SHIPROCKET_CONFIG.BASE_URL}/courier/assign/awb`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data: AssignAWBResponse = await res.json();
  if (!res.ok || !data?.response?.data?.awb_code) {
    const errMsg =
      (data as any)?.message ||
      (data as any)?.errors ||
      'AWB assignment is processing or courier service was not assigned';
    throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
  }

  return {
    awbCode: data.response.data.awb_code,
    courierName: data.response.data.courier_name,
    courierCompanyId: data.response.data.courier_company_id,
  };
}

/**
 * Generate official Shiprocket shipping / packing slip PDF label URL
 */
export async function generateShiprocketLabel(
  shipmentId: number,
  creds?: ShiprocketCredentials
): Promise<string> {
  const token = await getShiprocketToken(creds);

  const res = await fetch(`${SHIPROCKET_CONFIG.BASE_URL}/generate/label`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [shipmentId] }),
  });

  const data: GenerateLabelResponse = await res.json();
  if (!res.ok || !data.label_url) {
    throw new Error('Could not generate shipping label URL');
  }

  return data.label_url;
}

/**
 * Return direct tracking URL for the customer and admin
 */
export function getShiprocketTrackingUrl(awbCode: string): string {
  return `https://shiprocket.co//tracking/${awbCode}`;
}

/**
 * 100% Automated direct dispatch of an order to Shiprocket
 * Automatically creates custom order, assigns courier AWB, updates order status,
 * and saves tracking codes into Firestore without requiring manual admin clicking.
 */
export async function syncOrderDirectlyToShiprocket(
  order: Order,
  creds?: ShiprocketCredentials
): Promise<{ success: boolean; data?: CreateShiprocketOrderResponse; error?: string }> {
  try {
    const created = await createShiprocketOrder(order, { creds });
    let awbCode = '';
    let courierName = '';

    // Automatically attempt to assign express courier AWB
    if (created.shipment_id) {
      try {
        const awbRes = await assignShiprocketAWB(created.shipment_id, undefined, creds);
        awbCode = awbRes.awbCode || '';
        courierName = awbRes.courierName || '';
      } catch (awbErr) {
        console.warn('[Shiprocket Auto-Dispatch] AWB auto-assignment notice:', awbErr);
      }
    }

    const updates: Partial<Order> = {
      shiprocketOrderId: created.order_id,
      shiprocketShipmentId: created.shipment_id,
      shiprocketStatus: created.status || 'NEW',
      ...(awbCode ? { shiprocketAwb: awbCode } : {}),
      ...(courierName ? { shiprocketCourierName: courierName } : {}),
      orderStatus: order.orderStatus === 'Pending' ? 'Processing' : order.orderStatus,
      timeline: [
        ...(order.timeline || []),
        {
          status: 'Synced to Shiprocket',
          timestamp: new Date().toISOString(),
          note: `Automatically dispatched to Shiprocket (Order #${created.order_id}, Shipment #${created.shipment_id}${awbCode ? `, AWB: ${awbCode}` : ''})`
        }
      ]
    };

    await updateOrderInFirestore(order.id, updates);
    return { success: true, data: created };
  } catch (err: any) {
    const errorMsg = err.message || 'Failed to dispatch order to Shiprocket';
    console.warn('[Shiprocket Auto-Dispatch Warning]', errorMsg);
    return { success: false, error: errorMsg };
  }
}

