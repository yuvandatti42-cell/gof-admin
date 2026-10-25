// Formatter utilities for Godavari Organic Foods Admin Panel

export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatDate(dateStr: string, includeTime: boolean = false): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
  };
  return new Intl.DateTimeFormat('en-IN', options).format(date);
}

export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateStr);
}

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'forest' | 'kiwi' | 'sunshine' | 'carrot';

export function getStatusBadgeVariant(status: string): BadgeVariant {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'delivered':
    case 'paid':
    case 'vip':
    case 'visible':
      return 'success';
    case 'processing':
    case 'pending':
    case 'draft':
    case 'low stock':
      return 'warning';
    case 'cancelled':
    case 'failed':
    case 'out of stock':
    case 'expired':
    case 'archived':
      return 'danger';
    case 'shipped':
    case 'refunded':
    case 'hidden':
      return 'info';
    case 'inactive':
    default:
      return 'neutral';
  }
}
