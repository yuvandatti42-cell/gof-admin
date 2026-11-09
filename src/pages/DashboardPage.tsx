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
  CheckCircle2,
  Eye,
  Sprout,
  Trash2,
  RefreshCw,
  PhoneCall,
  Clock,
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
    removeProductFromStorefront,
    toggleProductOnStorefront,
    syncToStorefront,
    callbackRequests,
    updateCallbackStatus,
    deleteCallback,
  } = useAdmin();
  const { showToast } = useToast();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Storefront active products
  const storefrontProducts = useMemo(() => {
    return products.filter((p) => storeContent.featuredProductIds.includes(p.id) || p.featured);
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

  // Real Sales Analytics Series computed from actual customer orders
  const salesChartData = useMemo(() => {
    const now = new Date();
    const daysCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    
    const dateMap = new Map<string, { label: string; revenue: number; orders: number }>();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      dateMap.set(key, { label, revenue: 0, orders: 0 });
    }

    orders.forEach((o) => {
      if (!o.date) return;
      const orderDateKey = new Date(o.date).toISOString().split('T')[0];
      if (dateMap.has(orderDateKey)) {
        const bucket = dateMap.get(orderDateKey)!;
        bucket.orders += 1;
        if (o.paymentStatus === 'Paid') {
          bucket.revenue += o.total || 0;
        }
      }
    });

    const allBuckets = Array.from(dateMap.values());
    if (daysCount === 90) {
      const weeklyBuckets: { label: string; revenue: number; orders: number }[] = [];
      for (let i = 0; i < allBuckets.length; i += 7) {
        const slice = allBuckets.slice(i, i + 7);
        const revenue = slice.reduce((acc, c) => acc + c.revenue, 0);
        const ordersCount = slice.reduce((acc, c) => acc + c.orders, 0);
        weeklyBuckets.push({
          label: slice[0].label,
          revenue,
          orders: ordersCount,
        });
      }
      return weeklyBuckets;
    }

    return allBuckets;
  }, [orders, dateRange]);

  // Dynamic order status breakdown with authentic Godavari Organic palette
  const orderStatusData = useMemo(() => {
    const counts = {
      Delivered: orders.filter((o) => o.orderStatus === 'Delivered').length,
      Shipped: orders.filter((o) => o.orderStatus === 'Shipped').length,
      Processing: orders.filter((o) => o.orderStatus === 'Processing').length,
      Pending: orders.filter((o) => o.orderStatus === 'Pending').length,
      Cancelled: orders.filter((o) => o.orderStatus === 'Cancelled').length,
    };

    return [
      { name: 'Delivered', value: counts.Delivered, color: '#18542a' },
      { name: 'Shipped', value: counts.Shipped, color: '#9abc05' },
      { name: 'Processing', value: counts.Processing, color: '#ffc926' },
      { name: 'Pending', value: counts.Pending, color: '#f96015' },
      { name: 'Cancelled', value: counts.Cancelled, color: '#d52518' },
    ].filter((item) => item.value > 0);
  }, [orders]);

  // Real sales count derived from actual customer orders
  const productRealSalesMap = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      if (o.paymentStatus === 'Paid' || o.orderStatus !== 'Cancelled') {
        (o.items || []).forEach((item) => {
          const current = map.get(item.productId) || 0;
          map.set(item.productId, current + (item.quantity || 1));
        });
      }
    });
    return map;
  }, [orders]);

  // Best selling products based on actual orders
  const bestSellingProducts = useMemo(() => {
    return [...products]
      .map((p) => ({
        ...p,
        realSold: productRealSalesMap.get(p.id) || 0,
      }))
      .sort((a, b) => b.realSold - a.realSold)
      .slice(0, 5);
  }, [products, productRealSalesMap]);

  // Recent orders
  const recentOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl sm:rounded-3xl border border-[#dfd5bf] p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#103b1d] font-heading">
              Good morning, Store Admin
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e8f0eb] text-[#18542a] border border-[#c0d6c8]">
              <CheckCircle2 className="w-3 h-3 text-[#18542a]" /> Live Store Connected
            </span>
          </div>
          <p className="text-sm text-[#5a6e54]">
            Here's what's happening with your store today across the Godavari natural harvest network.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="inline-flex rounded-xl bg-[#faf5ea] p-1 border border-[#dfd5bf] text-xs font-semibold self-start md:self-center">
          <button
            onClick={() => setDateRange('7d')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              dateRange === '7d'
                ? 'bg-white text-[#103b1d] font-bold shadow-xs'
                : 'text-[#5a6e54] hover:text-[#103b1d]'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              dateRange === '30d'
                ? 'bg-white text-[#103b1d] font-bold shadow-xs'
                : 'text-[#5a6e54] hover:text-[#103b1d]'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDateRange('90d')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              dateRange === '90d'
                ? 'bg-white text-[#103b1d] font-bold shadow-xs'
                : 'text-[#5a6e54] hover:text-[#103b1d]'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <Card className="hover:border-[#18542a]/40 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#5a6e54] uppercase tracking-wider">
                Total Revenue
              </p>
              <h3 className="text-2xl font-black text-[#103b1d] mt-1 tabular-nums font-heading">
                {formatINR(totalRevenue)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#e8f0eb] text-[#18542a] shadow-2xs">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-0.5 font-bold text-[#18542a]">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2%
            </span>
            <span className="text-[#5a6e54]">vs. previous {dateRange}</span>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="hover:border-[#ffc926] transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#5a6e54] uppercase tracking-wider">
                Total Orders
              </p>
              <h3 className="text-2xl font-black text-[#103b1d] mt-1 tabular-nums font-heading">
                {formatNumber(orders.length)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#fffae6] text-[#8f6300] shadow-2xs">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-0.5 font-bold text-[#18542a]">
              <TrendingUp className="w-3.5 h-3.5" /> +8.4%
            </span>
            <span className="text-[#5a6e54]">100% organic farm orders</span>
          </div>
        </Card>

        {/* Active Products */}
        <Card className="hover:border-[#9abc05] transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#5a6e54] uppercase tracking-wider">
                Active Catalog
              </p>
              <h3 className="text-2xl font-black text-[#103b1d] mt-1 tabular-nums font-heading">
                {activeProductsCount} <span className="text-sm font-semibold text-[#5a6e54]">/ {products.length}</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f4f8e6] text-[#637d03] shadow-2xs">
              <Package className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-[#18542a] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#18542a]" />
              {products.filter((p) => p.stock > 0).length} in stock
            </span>
            <span className="text-[#5a6e54]">• 8 categories</span>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="hover:border-[#103b1d]/40 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#5a6e54] uppercase tracking-wider">
                Customers
              </p>
              <h3 className="text-2xl font-black text-[#103b1d] mt-1 tabular-nums font-heading">
                {formatNumber(customers.length)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#faf5ea] text-[#103b1d] border border-[#dfd5bf] shadow-2xs">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-0.5 font-bold text-[#18542a]">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5%
            </span>
            <span className="text-[#5a6e54]">repeat buyer rate: 68%</span>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Over Time Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Sales & Revenue Analytics"
            subtitle={`Gross merchandise value over the past ${dateRange.toUpperCase()}`}
            action={
              <div className="flex items-center gap-2 text-xs text-[#5a6e54] font-semibold">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#18542a]" />
                Revenue (₹)
              </div>
            }
          />
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18542a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#9abc05" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfd5bf" />
                <XAxis
                  dataKey="label"
                  stroke="#5a6e54"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#dfd5bf' }}
                />
                <YAxis
                  stroke="#5a6e54"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value) || 0), 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #dfd5bf',
                    boxShadow: '0 8px 24px rgba(16,59,29,0.08)',
                    fontSize: '12px',
                    fontFamily: 'Urbanist',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#18542a"
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
                    borderRadius: '16px',
                    border: '1px solid #dfd5bf',
                    fontSize: '12px',
                    fontFamily: 'Urbanist',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-[#dfd5bf]/60 text-xs">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#5a6e54] truncate font-medium">{item.name}</span>
                <span className="font-bold text-[#103b1d] ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tables Grid: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <Card className="lg:col-span-2 overflow-hidden" padding="none">
          <div className="p-6 border-b border-[#dfd5bf] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#103b1d] font-heading">Recent Orders</h3>
              <p className="text-xs text-[#5a6e54]">Latest simulated purchases across AP & Telangana</p>
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
              <thead className="bg-[#faf5ea] text-xs font-bold text-[#5a6e54] border-b border-[#dfd5bf]">
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
              <tbody className="divide-y divide-[#dfd5bf]/60">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#faf5ea]/70 transition-colors cursor-pointer group"
                    onClick={() => handleOpenOrderDetail(order)}
                  >
                    <td className="py-3.5 px-4 font-bold text-[#18542a] whitespace-nowrap">
                      #{order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#103b1d] truncate max-w-[140px]">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] text-[#5a6e54] truncate max-w-[140px]">
                        {order.shippingAddress.city}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#5a6e54] whitespace-nowrap">
                      {formatDate(order.date)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#103b1d] tabular-nums whitespace-nowrap">
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
                        className="p-1.5 rounded-lg text-[#5a6e54] hover:text-[#18542a] hover:bg-[#e8f0eb] transition-colors cursor-pointer"
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
          <div className="p-6 border-b border-[#dfd5bf] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#103b1d] font-heading">Top Sellers</h3>
              <p className="text-xs text-[#5a6e54]">Highest volume organic items</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs text-[#18542a] hover:underline font-bold cursor-pointer"
            >
              Catalog
            </button>
          </div>

          <div className="divide-y divide-[#dfd5bf]/60 p-2">
            {bestSellingProducts.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => navigate('/products')}
                className="p-3 flex items-center gap-3 hover:bg-[#faf5ea] rounded-xl transition-colors cursor-pointer group"
              >
                <span className="text-xs font-black text-[#5a6e54] w-4 text-center">
                  #{idx + 1}
                </span>
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-11 h-11 rounded-xl object-contain bg-[#faf5ea] p-1 border border-[#dfd5bf] shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/logo.webp';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#103b1d] truncate group-hover:text-[#18542a]">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#5a6e54]">
                    <span>{p.categoryName}</span>
                    <span>•</span>
                    <span className="text-[#18542a] font-bold">{p.realSold} sold</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#103b1d] tabular-nums block">
                      {formatINR(p.price)}
                    </span>
                    <span className={`text-[10px] font-bold ${p.stock <= 15 ? 'text-[#f96015]' : 'text-[#5a6e54]'}`}>
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
                        ? 'bg-[#e8f0eb] text-[#18542a] hover:bg-[#fdeeed] hover:text-[#d52518]'
                        : 'bg-[#faf5ea] text-[#5a6e54] border border-[#dfd5bf] hover:bg-[#e8f0eb] hover:text-[#18542a]'
                    }`}
                    title={
                      storeContent.featuredProductIds.includes(p.id)
                        ? 'Active on storefront - click to remove'
                        : 'Click to feature on customer storefront'
                    }
                  >
                    {storeContent.featuredProductIds.includes(p.id) ? (
                      <span className="flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#18542a]" />
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

      {/* Customer Callback Requests ("Have questions? We will call you right back") */}
      <Card className="border-[#dfd5bf] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dfd5bf]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#18542a]/10 text-[#18542a] flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[#103b1d] font-heading">
                  Callback Requests
                </h3>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#fef7da] text-[#7d5600] border border-[#f5df99]">
                  "Have questions? We will call you right back"
                </span>
                {callbackRequests.filter((c) => c.status === 'Pending').length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#fdeeed] text-[#d52518]">
                    {callbackRequests.filter((c) => c.status === 'Pending').length} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5a6e54] mt-0.5">
                Real-time customer inquiries submitted from the website storefront quick callback box.
              </p>
            </div>
          </div>
        </div>

        {callbackRequests.length === 0 ? (
          <div className="py-8 text-center text-[#5a6e54]">
            <PhoneCall className="w-8 h-8 text-[#5a6e54]/40 mx-auto mb-2" />
            <p className="text-sm font-semibold">No callback requests yet</p>
            <p className="text-xs text-[#5a6e54]/80 mt-1">
              Customer phone numbers submitted in the website callback box will appear here live.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#dfd5bf]/60 pt-1">
            {callbackRequests.map((req) => (
              <div
                key={req.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf5ea]/50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      req.status === 'Pending'
                        ? 'bg-[#fef7da] text-[#7d5600]'
                        : 'bg-[#e8f0eb] text-[#18542a]'
                    }`}
                  >
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${req.phone}`}
                        className="text-sm font-bold text-[#103b1d] hover:text-[#18542a] hover:underline flex items-center gap-1.5"
                        title="Click to call customer"
                      >
                        {req.phone}
                      </a>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'Pending'
                            ? 'bg-[#fef7da] text-[#7d5600] border border-[#f5df99]'
                            : 'bg-[#e8f0eb] text-[#18542a] border border-[#c0d6c8]'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#5a6e54]">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(req.timestamp, true)}</span>
                      <span>•</span>
                      <span>{req.source || 'Website Callback'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`tel:${req.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-[#18542a] text-white text-xs font-bold hover:bg-[#103b1d] transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                  <button
                    onClick={() => {
                      const next = req.status === 'Pending' ? 'Contacted' : 'Pending';
                      updateCallbackStatus(req.id, next);
                      showToast(`Callback marked as ${next}`, 'success');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                      req.status === 'Pending'
                        ? 'bg-white border-[#c0d6c8] text-[#18542a] hover:bg-[#e8f0eb]'
                        : 'bg-white border-[#dfd5bf] text-[#5a6e54] hover:bg-[#faf5ea]'
                    }`}
                  >
                    {req.status === 'Pending' ? 'Mark Contacted' : 'Mark Pending'}
                  </button>
                  <button
                    onClick={() => {
                      deleteCallback(req.id);
                      showToast('Callback request deleted', 'info');
                    }}
                    className="p-1.5 rounded-lg text-[#5a6e54] hover:text-[#d52518] hover:bg-[#fdeeed] transition-colors cursor-pointer"
                    title="Delete request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Admin Added Products & Storefront Merchandising Card (Displayed at bottom of dashboard) */}
      <Card className="border-[#c0d6c8] bg-gradient-to-b from-[#faf5ea] to-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#dfd5bf]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#18542a] text-[#ffc926] flex items-center justify-center shadow-xs">
                <Sprout className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#103b1d] font-heading">
                    Admin Added Products & Storefront
                  </h3>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#ffc926] text-[#103b1d] border border-[#e5b31f]">
                    {storefrontProducts.length} Active on Webpage
                  </span>
                  <span className="text-[10px] text-[#5a6e54] hidden sm:inline">• Live sync connected</span>
                </div>
                <p className="text-xs text-[#5a6e54] mt-0.5">
                  These items are actively published on the customer-facing Godavari Organics store homepage and user dashboard.
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
              icon={<Plus className="w-3.5 h-3.5 text-[#18542a]" />}
            >
              New Product
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={isSyncing}
              onClick={handleSync}
              icon={
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#18542a] ${
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
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#c0d6c8] my-4">
            <p className="text-xs text-[#5a6e54] mb-3">
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
                className="group relative rounded-2xl border border-[#dfd5bf] bg-white p-3 hover:border-[#18542a]/50 hover:shadow-md transition-all flex flex-col justify-between text-left"
              >
                <div>
                  <div className="relative h-28 w-full rounded-xl bg-gradient-to-b from-[#faf6ee] to-[#f4ede0]/60 p-2 overflow-hidden mb-2 border border-[#dfd5bf]/60 flex items-center justify-center">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = '/logo.webp';
                      }}
                    />
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-[#18542a] text-white shadow-2xs">
                      Live on Store
                    </span>
                    <span className="absolute bottom-1.5 right-1.5 text-[9px] font-mono px-1 rounded bg-black/60 text-white">
                      {p.unit}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-[#5a6e54] uppercase tracking-wider block">
                    {p.categoryName}
                  </span>
                  <h4 className="text-xs font-bold text-[#103b1d] line-clamp-2 mt-0.5" title={p.name}>
                    {p.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="font-extrabold text-[#103b1d] tabular-nums">
                      {formatINR(p.price)}
                    </span>
                    <span className={`text-[10px] font-bold ${p.stock <= 15 ? 'text-[#f96015]' : 'text-[#18542a]'}`}>
                      {p.stock} in stock
                    </span>
                  </div>
                </div>

                {/* Remove from Storefront Button */}
                <div className="mt-3 pt-2 border-t border-[#dfd5bf]/60">
                  <button
                    onClick={() => {
                      removeProductFromStorefront(p.id);
                      showToast(
                        `Removed "${p.name}" from live customer storefront.`,
                        'info',
                        'Removed from Store'
                      );
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-[#fdeeed] hover:bg-[#fad8d6] text-[#d52518] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

      {/* Order Details Drawer */}
      {selectedOrder && (
        <Drawer
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id}`}
          subtitle={`Placed on ${formatDate(selectedOrder.date, true)}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#5a6e54]">
                Total: <strong className="text-base text-[#103b1d]">{formatINR(selectedOrder.total)}</strong>
              </span>
              <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                Close Drawer
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Status Update Strip */}
            <div className="p-4 rounded-xl bg-[#faf5ea] border border-[#dfd5bf] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-[#5a6e54] font-semibold block">Current Order Status</span>
                <Badge status={selectedOrder.orderStatus} className="mt-1">
                  {selectedOrder.orderStatus}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#5a6e54]">Update:</label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    updateOrderStatus(selectedOrder.id, newStatus);
                    setSelectedOrder((prev) => prev ? { ...prev, orderStatus: newStatus } : null);
                    showToast(`Order status updated to ${newStatus}`, 'success', 'Status Updated');
                  }}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#dfd5bf] bg-white text-[#103b1d] focus:ring-1 focus:ring-[#18542a] cursor-pointer"
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
              <div className="p-4 rounded-xl border border-[#dfd5bf] bg-white">
                <h4 className="text-xs font-bold text-[#5a6e54] uppercase tracking-wider mb-2">
                  Customer Details
                </h4>
                <p className="text-sm font-bold text-[#103b1d]">{selectedOrder.customerName}</p>
                <p className="text-xs text-[#5a6e54] mt-0.5">{selectedOrder.customerEmail}</p>
                <p className="text-xs text-[#5a6e54]">{selectedOrder.customerPhone}</p>
              </div>

              <div className="p-4 rounded-xl border border-[#dfd5bf] bg-white">
                <h4 className="text-xs font-bold text-[#5a6e54] uppercase tracking-wider mb-2">
                  Shipping Destination
                </h4>
                <p className="text-xs text-[#103b1d] leading-relaxed">
                  {selectedOrder.shippingAddress.street},<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                  <span className="font-bold">{selectedOrder.shippingAddress.pincode}</span>
                </p>
                <p className="text-[11px] text-[#5a6e54] mt-1">Payment Method: {selectedOrder.paymentMethod}</p>
              </div>
            </div>

            {/* Ordered Items List */}
            <div>
              <h4 className="text-xs font-bold text-[#5a6e54] uppercase tracking-wider mb-3">
                Items ({selectedOrder.items.length})
              </h4>
              <div className="border border-[#dfd5bf] rounded-xl overflow-hidden divide-y divide-[#dfd5bf]">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-contain bg-[#faf5ea] p-1 border border-[#dfd5bf]"
                          onError={(e) => {
                            e.currentTarget.src = '/logo.webp';
                          }}
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold text-[#103b1d]">{item.productName}</p>
                        <p className="text-[11px] text-[#5a6e54]">
                          Unit: {item.unit} • Qty: {item.quantity} × {formatINR(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#103b1d] tabular-nums">
                      {formatINR(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-xl bg-[#faf5ea] border border-[#dfd5bf] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5a6e54]">
                <span>Items Subtotal</span>
                <span>{formatINR(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5a6e54]">
                <span>Delivery Charge</span>
                <span>{selectedOrder.deliveryCharge === 0 ? 'FREE' : formatINR(selectedOrder.deliveryCharge)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#18542a] font-bold">
                  <span>Promo Discount</span>
                  <span>- {formatINR(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#103b1d] pt-2 border-t border-[#dfd5bf]">
                <span>Total Amount</span>
                <span>{formatINR(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-bold text-[#5a6e54] uppercase tracking-wider mb-3">
                Activity Timeline
              </h4>
              <div className="space-y-3 relative pl-4 border-l-2 border-[#e8f0eb]">
                {selectedOrder.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#18542a] ring-4 ring-white" />
                    <p className="text-xs font-bold text-[#103b1d]">{event.status}</p>
                    <p className="text-[11px] text-[#5a6e54]">{event.note}</p>
                    <span className="text-[10px] text-[#5a6e54]/80">{formatDate(event.timestamp, true)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Note */}
            <div>
              <h4 className="text-xs font-bold text-[#5a6e54] uppercase tracking-wider mb-2">
                Internal Staff Note
              </h4>
              <textarea
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                placeholder="Add special packaging remarks or farmer cluster batch notes..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-[#dfd5bf] bg-white focus:outline-none focus:ring-1 focus:ring-[#18542a] font-medium"
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
