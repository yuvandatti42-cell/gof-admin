import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { formatINR, formatDate } from '../utils/formatters';
import type { Order, OrderStatus, PaymentStatus } from '../types';
import {
  ShoppingBag,
  Search,
  Eye,
  Printer,
  Truck,
  ExternalLink,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  generateShiprocketLabel,
  getShiprocketTrackingUrl,
} from '../services/shiprocketService';


export const OrdersPage: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    updatePaymentStatus,
    updateOrderInternalNote,
    settings,
    dispatchOrderToShiprocket,
    syncAllPendingToShiprocket,
    isSyncingShiprocket,
  } = useAdmin();
  const { showToast } = useToast();

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');

  // Selected Order for drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [internalNoteDraft, setInternalNoteDraft] = useState('');
  const [cancelOrderTargetId, setCancelOrderTargetId] = useState<string | null>(null);

  // Shiprocket states
  const [isShippingWithShiprocket, setIsShippingWithShiprocket] = useState(false);
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(false);

  const pendingShiprocketCount = useMemo(
    () => orders.filter((o) => !o.shiprocketOrderId && o.orderStatus !== 'Cancelled').length,
    [orders]
  );

  // Ship order via Shiprocket
  const handleShipWithShiprocket = async (order: Order) => {
    setIsShippingWithShiprocket(true);
    try {
      const res = await dispatchOrderToShiprocket(order);
      if (res.success) {
        showToast(`Order #${order.id} dispatched directly to Shiprocket!`, 'success', 'Shipment Created');
      } else {
        showToast(res.error || 'Failed to dispatch order to Shiprocket.', 'error', 'Shipment Error');
      }
    } catch (err: any) {
      showToast(err.message || 'Shiprocket dispatch error', 'error');
    } finally {
      setIsShippingWithShiprocket(false);
    }
  };

  // Generate / Download Shiprocket Printable Label
  const handleDownloadLabel = async (shipmentId?: number) => {
    if (!shipmentId) {
      showToast('Shipment ID is missing from Shiprocket records.', 'error');
      return;
    }
    setIsGeneratingLabel(true);
    try {
      const shiprocketCreds = settings?.shiprocket?.email ? {
        email: settings.shiprocket.email,
        password: settings.shiprocket.password,
        pickupLocation: settings.shiprocket.pickupLocation || 'Primary',
      } : undefined;
      const labelUrl = await generateShiprocketLabel(shipmentId, shiprocketCreds);
      window.open(labelUrl, '_blank');
      showToast('Shiprocket shipping label opened in new tab.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not fetch label from Shiprocket.', 'error');
    } finally {
      setIsGeneratingLabel(false);
    }
  };

  // Copy AWB code to clipboard
  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(true);
    showToast(`AWB #${awb} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  // Status counts for summary strip
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      Pending: orders.filter((o) => o.orderStatus === 'Pending').length,
      Processing: orders.filter((o) => o.orderStatus === 'Processing').length,
      Shipped: orders.filter((o) => o.orderStatus === 'Shipped').length,
      Delivered: orders.filter((o) => o.orderStatus === 'Delivered').length,
      Cancelled: orders.filter((o) => o.orderStatus === 'Cancelled').length,
    };
  }, [orders]);

  // Open order drawer
  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setInternalNoteDraft(order.internalNote || '');
  };

  // Status update
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
    }
    showToast(`Order #${orderId} status set to ${newStatus}.`, 'success', 'Order Updated');
  };

  // Payment status update
  const handlePaymentChange = (orderId: string, newPaymentStatus: PaymentStatus) => {
    updatePaymentStatus(orderId, newPaymentStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: newPaymentStatus } : null));
    }
    showToast(`Order #${orderId} payment set to ${newPaymentStatus}.`, 'success');
  };

  // Save internal note
  const handleSaveInternalNote = () => {
    if (selectedOrder) {
      updateOrderInternalNote(selectedOrder.id, internalNoteDraft);
      setSelectedOrder((prev) => (prev ? { ...prev, internalNote: internalNoteDraft } : null));
      showToast('Internal store note saved.', 'success');
    }
  };

  // Cancel order confirmation
  const handleConfirmCancelOrder = () => {
    if (cancelOrderTargetId) {
      handleStatusChange(cancelOrderTargetId, 'Cancelled');
      setCancelOrderTargetId(null);
    }
  };

  // Filtered orders pipeline
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (order.id || '').toLowerCase().includes(q) ||
        (order.customerName || '').toLowerCase().includes(q) ||
        (order.customerEmail || '').toLowerCase().includes(q) ||
        String(order.customerPhone || '').includes(q) ||
        (order.shippingAddress?.city || '').toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || order.orderStatus === statusFilter;

      const matchesPayment =
        paymentFilter === 'all' || order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#103b1d] font-heading">
            Orders & Fulfillment
          </h2>
          <p className="text-xs sm:text-sm text-[#5a6e54] mt-0.5">
            Track organic food orders, manage delivery workflows, and inspect customer addresses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {pendingShiprocketCount > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                showToast(`Auto-syncing ${pendingShiprocketCount} pending orders to Shiprocket...`, 'info');
                const res = await syncAllPendingToShiprocket();
                if (res.synced > 0) {
                  showToast(`Dispatched ${res.synced} orders directly to Shiprocket!`, 'success');
                } else if (res.failed > 0) {
                  showToast(`Could not reach Shiprocket for ${res.failed} orders. Please verify API User credentials in Settings.`, 'error');
                }
              }}
              disabled={isSyncingShiprocket}
              icon={<Truck className="w-3.5 h-3.5 text-[#18542a]" />}
              className="text-xs font-bold"
            >
              {isSyncingShiprocket ? 'Dispatching...' : `Dispatch ${pendingShiprocketCount} to Shiprocket`}
            </Button>
          )}

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#e8f0eb] border border-[#c0d6c8] text-[#18542a]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live Storefront Connected</span>
          </div>
        </div>
      </div>

      {/* Status Summary Strip (Interactive buttons) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'all', label: 'All Orders', count: statusCounts.all, color: 'text-[#103b1d]' },
          { key: 'Pending', label: 'Pending', count: statusCounts.Pending, color: 'text-[#9abc05]' },
          { key: 'Processing', label: 'Processing', count: statusCounts.Processing, color: 'text-[#f96015]' },
          { key: 'Shipped', label: 'Shipped', count: statusCounts.Shipped, color: 'text-[#356AA0]' },
          { key: 'Delivered', label: 'Delivered', count: statusCounts.Delivered, color: 'text-[#18542a]' },
          { key: 'Cancelled', label: 'Cancelled', count: statusCounts.Cancelled, color: 'text-[#d52518]' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key as any)}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-white border-[#18542a] ring-2 ring-[#18542a]/20 shadow-xs'
                : 'bg-white/70 border-[#dfd5bf] hover:bg-white hover:border-[#9abc05]'
            }`}
          >
            <span className="text-[11px] font-medium text-[#5a6e54] block truncate">
              {tab.label}
            </span>
            <span className={`text-xl font-bold tabular-nums block mt-0.5 ${tab.color}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card padding="sm" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5a6e54] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID (e.g. 9421), customer name, or phone..."
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] placeholder-[#5a6e54] focus:ring-1 focus:ring-[#18542a]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5a6e54] hover:text-[#103b1d]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5a6e54] shrink-0 hidden md:inline">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d]"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all') && (
          <div className="pt-2 border-t border-[#dfd5bf]/60 flex items-center justify-between text-xs text-[#5a6e54]">
            <span>Showing {filteredOrders.length} of {orders.length} orders</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPaymentFilter('all');
              }}
              className="text-[#18542a] font-semibold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </Card>

      {/* Orders Table */}
      <Card padding="none" className="overflow-hidden">
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-7 h-7 text-[#18542a]" />}
            title="No Orders Match Your Filter"
            description="No customer orders were found for the chosen criteria. Try resetting the filters."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPaymentFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#faf5ea] text-xs font-semibold text-[#5a6e54] border-b border-[#dfd5bf]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfd5bf]/60">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleOpenDetail(order)}
                    className="hover:bg-[#faf5ea]/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#18542a] whitespace-nowrap">
                      #{order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-[#103b1d] group-hover:text-[#18542a] truncate max-w-[160px]">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] text-[#5a6e54] truncate max-w-[160px]">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#5a6e54] whitespace-nowrap">
                      {formatDate(order.date)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#5a6e54] whitespace-nowrap">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#103b1d] tabular-nums whitespace-nowrap">
                      {formatINR(order.total)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={order.paymentStatus} size="sm">
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge status={order.orderStatus} size="sm">
                          {order.orderStatus}
                        </Badge>
                        {order.shiprocketAwb && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#18542a] bg-[#e8f5ec] px-1.5 py-0.5 rounded border border-[#c2e4cc]">
                            <Truck className="w-2.5 h-2.5" />
                            {order.shiprocketAwb}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(order);
                          }}
                          className="p-1.5 rounded-lg text-[#5a6e54] hover:text-[#18542a] hover:bg-[#E8F0EB] transition-colors"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <Drawer
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id}`}
          subtitle={`Placed on ${formatDate(selectedOrder.date, true)}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  showToast(`Invoice for #${selectedOrder.id} generated successfully.`, 'success', 'Print Invoice');
                }}
                icon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Invoice
              </Button>
              <div className="flex items-center gap-2">
                {selectedOrder.orderStatus !== 'Cancelled' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setCancelOrderTargetId(selectedOrder.id)}
                  >
                    Cancel Order
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Status & Payment Controls */}
            <div className="p-4 rounded-xl bg-[#faf5ea] border border-[#dfd5bf] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                  Order Status
                </label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] focus:ring-1 focus:ring-[#18542a]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                  Payment Status
                </label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handlePaymentChange(selectedOrder.id, e.target.value as PaymentStatus)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] focus:ring-1 focus:ring-[#18542a]"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-[#dfd5bf] bg-white">
                <span className="font-semibold text-[#5a6e54] uppercase tracking-wider block mb-2">
                  Customer
                </span>
                <p className="text-sm font-bold text-[#103b1d]">{selectedOrder.customerName}</p>
                <p className="text-[#5a6e54] mt-0.5">{selectedOrder.customerEmail}</p>
                <p className="text-[#5a6e54]">{selectedOrder.customerPhone}</p>
              </div>

              <div className="p-4 rounded-xl border border-[#dfd5bf] bg-white">
                <span className="font-semibold text-[#5a6e54] uppercase tracking-wider block mb-2">
                  Shipping Address
                </span>
                <p className="text-[#103b1d] leading-relaxed">
                  {selectedOrder.shippingAddress.street},<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                  <span className="font-semibold">{selectedOrder.shippingAddress.pincode}</span>
                </p>
                <p className="text-[11px] text-[#5a6e54] mt-1">Payment: {selectedOrder.paymentMethod}</p>
                {selectedOrder.paymentId && (
                  <p className="text-[11px] font-mono font-semibold text-[#18542a] mt-0.5 bg-[#e8f5ec] px-2 py-0.5 rounded w-fit">
                    Txn ID: {selectedOrder.paymentId}
                  </p>
                )}
              </div>
            </div>

            {/* Shiprocket Automated Fulfillment */}
            <div className="p-4 rounded-xl border border-[#dfd5bf] bg-[#FAF5EA]/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#18542a] text-white">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#103b1d]">Shiprocket Logistics & Shipping</h4>
                    <p className="text-[11px] text-[#5a6e54]">Automated courier assignment, live AWB, & packing labels</p>
                  </div>
                </div>

                {selectedOrder.shiprocketAwb ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    AWB Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#dfd5bf]/60 text-[#5a6e54]">
                    Ready to Ship
                  </span>
                )}
              </div>

              {selectedOrder.shiprocketAwb ? (
                <div className="bg-white p-3.5 rounded-xl border border-[#dfd5bf] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5a6e54] block">AWB Tracking Number</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-sm font-extrabold text-[#18542a]">
                          {selectedOrder.shiprocketAwb}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAwb(selectedOrder.shiprocketAwb!)}
                          className="p-1 text-[#5a6e54] hover:text-[#18542a] transition-colors rounded"
                          title="Copy AWB"
                        >
                          {copiedAwb ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-[#5a6e54] block">Courier Partner</span>
                      <span className="font-semibold text-xs text-[#103b1d]">
                        {selectedOrder.shiprocketCourierName || 'Shiprocket Express'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#dfd5bf]/60 flex flex-wrap items-center gap-2">
                    <a
                      href={getShiprocketTrackingUrl(selectedOrder.shiprocketAwb)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18542a] text-white font-bold text-xs hover:bg-[#124220] transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Track on Shiprocket
                    </a>

                    {selectedOrder.shiprocketShipmentId && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownloadLabel(selectedOrder.shiprocketShipmentId)}
                        disabled={isGeneratingLabel}
                        icon={<FileText className="w-3.5 h-3.5 text-[#18542a]" />}
                        className="text-xs font-semibold py-1.5"
                      >
                        {isGeneratingLabel ? 'Generating Label...' : 'Download Shipping Label'}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#faf5ea] p-4 rounded-xl border border-[#dfd5bf] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-[#18542a] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#18542a]" />
                      Automated Direct Fulfillment Active
                    </p>
                    <p className="text-[11px] text-[#5a6e54] leading-relaxed">
                      Orders placed on your storefront are automatically pushed directly to Shiprocket without manual clicking.
                    </p>
                  </div>

                  {selectedOrder.orderStatus !== 'Cancelled' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleShipWithShiprocket(selectedOrder)}
                      disabled={isShippingWithShiprocket}
                      icon={
                        isShippingWithShiprocket ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )
                      }
                      className="whitespace-nowrap font-bold text-xs px-3.5 py-2 self-start sm:self-auto shadow-xs"
                    >
                      {isShippingWithShiprocket ? 'Dispatching...' : 'Force Re-sync to Shiprocket'}
                    </Button>
                  ) : (
                    <span className="text-[11px] text-red-600 font-semibold">
                      Order is cancelled
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Ordered Items Table */}
            <div>
              <span className="font-semibold text-xs text-[#5a6e54] uppercase tracking-wider block mb-2">
                Order Items ({selectedOrder.items.length})
              </span>
              <div className="border border-[#dfd5bf] rounded-xl overflow-hidden divide-y divide-[#dfd5bf] bg-white">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover border border-[#dfd5bf]"
                        />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-[#103b1d]">{item.productName}</p>
                        <p className="text-[11px] text-[#5a6e54]">
                          Unit: {item.unit} • Qty: {item.quantity} × {formatINR(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#103b1d] tabular-nums">
                      {formatINR(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-xl bg-[#faf5ea] border border-[#dfd5bf] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5a6e54]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatINR(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5a6e54]">
                <span>Delivery Charge</span>
                <span className="tabular-nums">
                  {selectedOrder.deliveryCharge === 0 ? 'FREE' : formatINR(selectedOrder.deliveryCharge)}
                </span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#18542a]">
                  <span>Promo Savings</span>
                  <span className="tabular-nums">- {formatINR(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#103b1d] pt-2 border-t border-[#dfd5bf]">
                <span>Total Paid</span>
                <span className="tabular-nums">{formatINR(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <span className="font-semibold text-xs text-[#5a6e54] uppercase tracking-wider block mb-3">
                Tracking & Timeline
              </span>
              <div className="space-y-3 relative pl-4 border-l-2 border-[#E8F0EB]">
                {selectedOrder.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#18542a] ring-4 ring-white" />
                    <p className="text-xs font-semibold text-[#103b1d]">{event.status}</p>
                    <p className="text-[11px] text-[#5a6e54]">{event.note}</p>
                    <span className="text-[10px] text-[#5a6e54]/80">{formatDate(event.timestamp, true)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Note */}
            <div>
              <span className="font-semibold text-xs text-[#5a6e54] uppercase tracking-wider block mb-2">
                Internal Pack Station Notes
              </span>
              <textarea
                value={internalNoteDraft}
                onChange={(e) => setInternalNoteDraft(e.target.value)}
                placeholder="Log package seal details, courier handover remarks..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-[#dfd5bf] bg-white focus:outline-none focus:ring-1 focus:ring-[#18542a]"
              />
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="secondary" onClick={handleSaveInternalNote}>
                  Save Internal Note
                </Button>
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* Cancel Order Confirmation */}
      <ConfirmDialog
        isOpen={!!cancelOrderTargetId}
        onClose={() => setCancelOrderTargetId(null)}
        onConfirm={handleConfirmCancelOrder}
        title="Cancel This Order?"
        message="Are you sure you want to mark this order as Cancelled? In this frontend prototype, this directly updates the order status and sales analytics."
        confirmText="Cancel Order"
        variant="danger"
      />
    </div>
  );
};
