import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { formatINR, formatNumber, formatDate } from '../utils/formatters';
import type { Order } from '../types';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  IndianRupee,
  Plus,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Eye,
  Sprout,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Drawer } from '../components/common/Drawer';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    orders,
    customers,
    storeContent,
    updateOrderStatus,
    updateOrderInternalNote,
    setQuickAddModalOpen,
    setStorefrontPickerOpen,
    setLiveStorefrontOpen,
    removeProductFromStorefront,
    toggleProductOnStorefront,
    syncToStorefront,
  } = useAdmin();
  const { showToast } = useToast();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Storefront active products
  const storefrontProducts = useMemo(() => {
    return products.filter((p) => storeContent.featuredProductIds.includes(p.id));
  }, [products, storeContent.featuredProductIds]);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncToStorefront();
    setIsSyncing(false);
    showToast(
      'Storefront synchronized with live website! Connection ready for API endpoints.',
      'success',
      'Sync Complete'
    );
  };

  // Open drawer and set initial note
  const handleOpenOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setTempNote(order.internalNote || '');
  };

  // Calculate dynamic KPIs based on orders and products state
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === 'Paid')
      .reduce((acc, curr) => acc + curr.total, 0);
  }, [orders]);

  const activeProductsCount = useMemo(() => {
    return products.filter((p) => p.status === 'Active').length;
  }, [products]);

  // Dynamic Sales Analytics Mock Series based on chosen date range
  const salesChartData = useMemo(() => {
    if (dateRange === '7d') {
      return [
        { label: '16 Oct', revenue: 4200, orders: 3 },
        { label: '17 Oct', revenue: 7800, orders: 5 },
        { label: '18 Oct', revenue: 5900, orders: 4 },
        { label: '19 Oct', revenue: 9400, orders: 7 },
        { label: '20 Oct', revenue: 11200, orders: 8 },
        { label: '21 Oct', revenue: 8600, orders: 6 },
        { label: '22 Oct', revenue: 14500, orders: 11 },
      ];
    } else if (dateRange === '30d') {
      return [
        { label: '25 Sep', revenue: 18400, orders: 14 },
        { label: '30 Sep', revenue: 26200, orders: 21 },
        { label: '05 Oct', revenue: 31000, orders: 24 },
        { label: '10 Oct', revenue: 29500, orders: 22 },
        { label: '15 Oct', revenue: 42800, orders: 33 },
        { label: '20 Oct', revenue: 48900, orders: 38 },
        { label: '22 Oct', revenue: 56400, orders: 44 },
      ];
    } else {
      return [
        { label: 'Aug W1', revenue: 64000, orders: 52 },
        { label: 'Aug W3', revenue: 82000, orders: 67 },
        { label: 'Sep W1', revenue: 94500, orders: 78 },
        { label: 'Sep W3', revenue: 112000, orders: 91 },
        { label: 'Oct W1', revenue: 135000, orders: 104 },
        { label: 'Oct W3', revenue: 168000, orders: 128 },
      ];
    }
  }, [dateRange]);

  // Dynamic order status breakdown
  const orderStatusData = useMemo(() => {
    const counts = {
      Delivered: orders.filter((o) => o.orderStatus === 'Delivered').length,
      Shipped: orders.filter((o) => o.orderStatus === 'Shipped').length,
      Processing: orders.filter((o) => o.orderStatus === 'Processing').length,
      Pending: orders.filter((o) => o.orderStatus === 'Pending').length,
      Cancelled: orders.filter((o) => o.orderStatus === 'Cancelled').length,
    };

    return [
      { name: 'Delivered', value: counts.Delivered, color: '#2F7D4A' },
      { name: 'Shipped', value: counts.Shipped, color: '#356AA0' },
      { name: 'Processing', value: counts.Processing, color: '#B7791F' },
      { name: 'Pending', value: counts.Pending, color: '#6F9F62' },
      { name: 'Cancelled', value: counts.Cancelled, color: '#B64238' },
    ].filter((item) => item.value > 0);
  }, [orders]);

  // Best selling products
  const bestSellingProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);
  }, [products]);

  // Recent orders
  const recentOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-[#E5E8DF] p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] font-heading">
              Good morning, Store Admin
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#E8F0EB] text-[#245C3A] border border-[#C0D6C8]">
              <Sparkles className="w-3 h-3 text-[#2F7D4A]" /> Demo data
            </span>
          </div>
          <p className="text-sm text-[#737B72]">
            Here's what's happening with your store today across the Godavari natural harvest network.
          </p>
        </div>

        {/* Controls & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="inline-flex rounded-xl bg-[#FAF9F4] p-1 border border-[#E5E8DF] text-xs font-medium">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === '7d'
                  ? 'bg-white text-[#173D2A] font-semibold shadow-xs'
                  : 'text-[#737B72] hover:text-[#202820]'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === '30d'
                  ? 'bg-white text-[#173D2A] font-semibold shadow-xs'
                  : 'text-[#737B72] hover:text-[#202820]'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('90d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === '90d'
                  ? 'bg-white text-[#173D2A] font-semibold shadow-xs'
                  : 'text-[#737B72] hover:text-[#202820]'
              }`}
            >
              90 Days
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLiveStorefrontOpen(true)}
            icon={<Eye className="w-4 h-4 text-[#245C3A]" />}
          >
            Live Store
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStorefrontPickerOpen(true)}
            icon={<Sprout className="w-4 h-4 text-[#245C3A]" />}
          >
            Manage Storefront
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/orders')}
            icon={<ShoppingBag className="w-4 h-4 text-[#245C3A]" />}
          >
            Orders
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setQuickAddModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <Card className="hover:border-[#6F9F62]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#737B72] uppercase tracking-wider">
                Total Revenue
              </p>
              <h3 className="text-2xl font-bold text-[#173D2A] mt-1 tabular-nums font-heading">
                {formatINR(totalRevenue)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#E8F0EB] text-[#245C3A]">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-0.5 font-semibold text-[#2F7D4A]">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2%
            </span>
            <span className="text-[#737B72]">vs. previous {dateRange}</span>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="hover:border-[#6F9F62]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#737B72] uppercase tracking-wider">
                Total Orders
              </p>
              <h3 className="text-2xl font-bold text-[#173D2A] mt-1 tabular-nums font-heading">
                {formatNumber(orders.length)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#E8F0EB] text-[#245C3A]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-0.5 font-semibold text-[#2F7D4A]">
              <TrendingUp className="w-3.5 h-3.5" /> +8.4%
            </span>
            <span className="text-[#737B72]">100% simulated orders</span>
          </div>
        </Card>

        {/* Active Products */}
        <Card className="hover:border-[#6F9F62]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#737B72] uppercase tracking-wider">
                Active Catalog
              </p>
              <h3 className="text-2xl font-bold text-[#173D2A] mt-1 tabular-nums font-heading">
                {activeProductsCount} <span className="text-sm font-normal text-[#737B72]">/ {products.length}</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#E8F0EB] text-[#245C3A]">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-[#245C3A] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D4A]" />
              {products.filter((p) => p.stock > 0).length} in stock
            </span>
            <span className="text-[#737B72]">• 8 categories</span>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="hover:border-[#6F9F62]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#737B72] uppercase tracking-wider">
                Customers
              </p>
              <h3 className="text-2xl font-bold text-[#173D2A] mt-1 tabular-nums font-heading">
                {formatNumber(customers.length)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#E8F0EB] text-[#245C3A]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-0.5 font-semibold text-[#2F7D4A]">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5%
            </span>
            <span className="text-[#737B72]">repeat buyer rate: 68%</span>
          </div>
        </Card>
      </div>

      {/* Storefront Merchandising Card (Directly controls what products appear on the webpage) */}
      <Card className="border-[#C0D6C8] bg-gradient-to-b from-[#FAF9F4] to-white shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#E5E8DF]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#245C3A] text-white flex items-center justify-center shadow-xs">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-[#173D2A] font-heading">
                    Storefront Products (Featured Harvest)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F0EB] text-[#245C3A] border border-[#C0D6C8]">
                    {storefrontProducts.length} Active on Webpage
                  </span>
                  <span className="text-[10px] text-[#737B72] hidden sm:inline">• Demo sync active</span>
                </div>
                <p className="text-xs text-[#737B72] mt-0.5">
                  These items are actively published on the customer-facing Godavari Organics store homepage.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStorefrontPickerOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              + Add to Storefront
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickAddModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5 text-[#245C3A]" />}
            >
              New Product
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLiveStorefrontOpen(true)}
              icon={<Eye className="w-3.5 h-3.5 text-[#245C3A]" />}
            >
              Live Store View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={isSyncing}
              onClick={handleSync}
              icon={
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#245C3A] ${
                    isSyncing ? 'animate-spin' : ''
                  }`}
                />
              }
            >
              {isSyncing ? 'Syncing...' : 'Sync to Webpage'}
            </Button>
          </div>
        </div>

        {/* Storefront Products Cards Grid */}
        {storefrontProducts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#C0D6C8] my-4">
            <p className="text-xs text-[#737B72] mb-3">
              No products are currently published to the customer storefront.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setStorefrontPickerOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Products to Storefront
            </Button>
          </div>
        ) : (
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {storefrontProducts.map((p) => (
              <div
                key={p.id}
                className="group relative rounded-xl border border-[#E5E8DF] bg-white p-3 hover:border-[#6F9F62] hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-28 w-full rounded-lg bg-[#FAF9F4] overflow-hidden mb-2">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#2F7D4A] text-white shadow-2xs">
                      Live on Store
                    </span>
                    <span className="absolute bottom-1.5 right-1.5 text-[9px] font-mono px-1 rounded bg-black/60 text-white">
                      {p.unit}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-[#737B72] uppercase tracking-wider block">
                    {p.categoryName}
                  </span>
                  <h4 className="text-xs font-bold text-[#173D2A] line-clamp-2 mt-0.5" title={p.name}>
                    {p.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="font-bold text-[#173D2A] tabular-nums">
                      {formatINR(p.price)}
                    </span>
                    <span className={`text-[10px] font-medium ${p.stock <= 15 ? 'text-[#B7791F]' : 'text-[#2F7D4A]'}`}>
                      {p.stock} in stock
                    </span>
                  </div>
                </div>

                {/* Remove from Storefront Button */}
                <div className="mt-3 pt-2 border-t border-[#E5E8DF]/60">
                  <button
                    onClick={() => {
                      removeProductFromStorefront(p.id);
                      showToast(
                        `Removed "${p.name}" from live customer storefront.`,
                        'info',
                        'Removed from Store'
                      );
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-[#FDEEED] hover:bg-[#fad8d6] text-[#B64238] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Remove product from customer storefront"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove from Storefront</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Over Time Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Sales & Revenue Analytics"
            subtitle={`Gross merchandise value over the past ${dateRange.toUpperCase()} (Demo)`}
            action={
              <div className="flex items-center gap-2 text-xs text-[#737B72]">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#245C3A]" />
                Revenue (₹)
              </div>
            }
          />
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#245C3A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#245C3A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8DF" />
                <XAxis
                  dataKey="label"
                  stroke="#737B72"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E8DF' }}
                />
                <YAxis
                  stroke="#737B72"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value) || 0), 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E8DF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#245C3A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Fulfillment Status Chart */}
        <Card>
          <CardHeader
            title="Order Fulfillment"
            subtitle="Current active orders by status"
          />
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} orders`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E8DF',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-[#E5E8DF]/60 text-xs">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#737B72] truncate">{item.name}</span>
                <span className="font-semibold text-[#173D2A] ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tables Grid: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <Card className="lg:col-span-2 overflow-hidden" padding="none">
          <div className="p-6 border-b border-[#E5E8DF] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#173D2A]">Recent Orders</h3>
              <p className="text-xs text-[#737B72]">Latest simulated purchases across AP & Telangana</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/orders')}
              iconRight={<ChevronRight className="w-4 h-4" />}
            >
              View all orders
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9F4] text-xs font-semibold text-[#737B72] border-b border-[#E5E8DF]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8DF]/60">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAF9F4]/70 transition-colors cursor-pointer group"
                    onClick={() => handleOpenOrderDetail(order)}
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#245C3A] whitespace-nowrap">
                      #{order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-[#202820] truncate max-w-[140px]">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] text-[#737B72] truncate max-w-[140px]">
                        {order.shippingAddress.city}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#737B72] whitespace-nowrap">
                      {formatDate(order.date)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#173D2A] tabular-nums whitespace-nowrap">
                      {formatINR(order.total)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={order.paymentStatus} size="sm">
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={order.orderStatus} size="sm">
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOrderDetail(order);
                        }}
                        className="p-1.5 rounded-lg text-[#737B72] hover:text-[#245C3A] hover:bg-[#E8F0EB] transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Best Selling Products (1 col) */}
        <Card padding="none" className="overflow-hidden">
          <div className="p-6 border-b border-[#E5E8DF] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#173D2A]">Top Sellers</h3>
              <p className="text-xs text-[#737B72]">Highest volume organic items</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs text-[#245C3A] hover:underline font-semibold"
            >
              Catalog
            </button>
          </div>

          <div className="divide-y divide-[#E5E8DF]/60 p-2">
            {bestSellingProducts.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => navigate('/products')}
                className="p-3 flex items-center gap-3 hover:bg-[#FAF9F4] rounded-xl transition-colors cursor-pointer group"
              >
                <span className="text-xs font-bold text-[#737B72] w-4 text-center">
                  #{idx + 1}
                </span>
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-11 h-11 rounded-xl object-cover border border-[#E5E8DF] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#202820] truncate group-hover:text-[#245C3A]">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#737B72]">
                    <span>{p.categoryName}</span>
                    <span>•</span>
                    <span className="text-[#2F7D4A] font-medium">{p.salesCount} sold</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#173D2A] tabular-nums block">
                      {formatINR(p.price)}
                    </span>
                    <span className={`text-[10px] font-medium ${p.stock <= 15 ? 'text-[#B7791F]' : 'text-[#737B72]'}`}>
                      {p.stock} in stock
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProductOnStorefront(p.id);
                      const isNowOnStore = !storeContent.featuredProductIds.includes(p.id);
                      showToast(
                        isNowOnStore
                          ? `"${p.name}" added to customer storefront!`
                          : `"${p.name}" removed from customer storefront.`,
                        isNowOnStore ? 'success' : 'info'
                      );
                    }}
                    className={`p-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      storeContent.featuredProductIds.includes(p.id)
                        ? 'bg-[#E8F0EB] text-[#245C3A] hover:bg-[#FDEEED] hover:text-[#B64238]'
                        : 'bg-[#FAF9F4] text-[#737B72] border border-[#E5E8DF] hover:bg-[#E8F0EB] hover:text-[#245C3A]'
                    }`}
                    title={
                      storeContent.featuredProductIds.includes(p.id)
                        ? 'Active on storefront - click to remove'
                        : 'Click to feature on customer storefront'
                    }
                  >
                    {storeContent.featuredProductIds.includes(p.id) ? (
                      <span className="flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D4A]" />
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Order Details Drawer */}
      {selectedOrder && (
        <Drawer
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id}`}
          subtitle={`Placed on ${formatDate(selectedOrder.date, true)}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#737B72]">
                Total: <strong className="text-base text-[#173D2A]">{formatINR(selectedOrder.total)}</strong>
              </span>
              <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                Close Drawer
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Status Update Strip */}
            <div className="p-4 rounded-xl bg-[#FAF9F4] border border-[#E5E8DF] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-[#737B72] block">Current Order Status</span>
                <Badge status={selectedOrder.orderStatus} className="mt-1">
                  {selectedOrder.orderStatus}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-[#737B72]">Update:</label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    updateOrderStatus(selectedOrder.id, newStatus);
                    setSelectedOrder((prev) => prev ? { ...prev, orderStatus: newStatus } : null);
                    showToast(`Order status updated to ${newStatus}`, 'success', 'Status Updated');
                  }}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[#E5E8DF] bg-white text-[#202820] focus:ring-1 focus:ring-[#245C3A]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#E5E8DF] bg-white">
                <h4 className="text-xs font-bold text-[#737B72] uppercase tracking-wider mb-2">
                  Customer Details
                </h4>
                <p className="text-sm font-semibold text-[#173D2A]">{selectedOrder.customerName}</p>
                <p className="text-xs text-[#737B72] mt-0.5">{selectedOrder.customerEmail}</p>
                <p className="text-xs text-[#737B72]">{selectedOrder.customerPhone}</p>
              </div>

              <div className="p-4 rounded-xl border border-[#E5E8DF] bg-white">
                <h4 className="text-xs font-bold text-[#737B72] uppercase tracking-wider mb-2">
                  Shipping Destination
                </h4>
                <p className="text-xs text-[#202820] leading-relaxed">
                  {selectedOrder.shippingAddress.street},<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                  <span className="font-semibold">{selectedOrder.shippingAddress.pincode}</span>
                </p>
                <p className="text-[11px] text-[#737B72] mt-1">Payment Method: {selectedOrder.paymentMethod}</p>
              </div>
            </div>

            {/* Ordered Items List */}
            <div>
              <h4 className="text-xs font-bold text-[#737B72] uppercase tracking-wider mb-3">
                Items ({selectedOrder.items.length})
              </h4>
              <div className="border border-[#E5E8DF] rounded-xl overflow-hidden divide-y divide-[#E5E8DF]">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover border border-[#E5E8DF]"
                        />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-[#173D2A]">{item.productName}</p>
                        <p className="text-[11px] text-[#737B72]">
                          Unit: {item.unit} • Qty: {item.quantity} × {formatINR(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#173D2A] tabular-nums">
                      {formatINR(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-xl bg-[#FAF9F4] border border-[#E5E8DF] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#737B72]">
                <span>Items Subtotal</span>
                <span>{formatINR(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#737B72]">
                <span>Delivery Charge</span>
                <span>{selectedOrder.deliveryCharge === 0 ? 'FREE' : formatINR(selectedOrder.deliveryCharge)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#2F7D4A]">
                  <span>Promo Discount</span>
                  <span>- {formatINR(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#173D2A] pt-2 border-t border-[#E5E8DF]">
                <span>Total Amount</span>
                <span>{formatINR(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-bold text-[#737B72] uppercase tracking-wider mb-3">
                Activity Timeline
              </h4>
              <div className="space-y-3 relative pl-4 border-l-2 border-[#E8F0EB]">
                {selectedOrder.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#245C3A] ring-4 ring-white" />
                    <p className="text-xs font-semibold text-[#173D2A]">{event.status}</p>
                    <p className="text-[11px] text-[#737B72]">{event.note}</p>
                    <span className="text-[10px] text-[#737B72]/80">{formatDate(event.timestamp, true)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Note */}
            <div>
              <h4 className="text-xs font-bold text-[#737B72] uppercase tracking-wider mb-2">
                Internal Demo Note
              </h4>
              <textarea
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                placeholder="Add special packaging remarks or farmer cluster batch notes..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-[#E5E8DF] bg-white focus:outline-none focus:ring-1 focus:ring-[#245C3A]"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    updateOrderInternalNote(selectedOrder.id, tempNote);
                    setSelectedOrder((prev) => prev ? { ...prev, internalNote: tempNote } : null);
                    showToast('Internal note saved locally.', 'success');
                  }}
                >
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
