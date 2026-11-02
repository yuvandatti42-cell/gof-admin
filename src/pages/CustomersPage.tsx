import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Drawer } from '../components/common/Drawer';
import { EmptyState } from '../components/common/EmptyState';
import { formatINR, formatDate } from '../utils/formatters';
import type { Customer, CustomerStatus } from '../types';
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  LogIn,
} from 'lucide-react';

type PurchaseSegment = 'all' | 'bought' | 'repeat' | 'never-ordered';

export const CustomersPage: React.FC = () => {
  const { customers, orders, updateCustomerStatus } = useAdmin();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerStatus>('all');
  const [purchaseSegment, setPurchaseSegment] = useState<PurchaseSegment>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // High-level customer purchase metrics
  const metrics = useMemo(() => {
    const totalUsers = customers.length;
    const buyers = customers.filter((c) => (c.totalOrders || 0) > 0 || c.hasPurchased);
    const repeatBuyers = customers.filter((c) => (c.totalOrders || 0) >= 2);
    const nonBuyers = customers.filter((c) => (c.totalOrders || 0) === 0 && !c.hasPurchased);
    const totalRevenue = buyers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

    return {
      totalUsers,
      buyersCount: buyers.length,
      repeatBuyersCount: repeatBuyers.length,
      nonBuyersCount: nonBuyers.length,
      totalRevenue,
      buyerConversionRate: totalUsers > 0 ? Math.round((buyers.length / totalUsers) * 100) : 0,
    };
  }, [customers]);

  // Filter pipeline
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.state && c.state.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' || c.status === statusFilter;

      let matchesSegment = true;
      if (purchaseSegment === 'bought') {
        matchesSegment = (c.totalOrders || 0) >= 1 || !!c.hasPurchased;
      } else if (purchaseSegment === 'repeat') {
        matchesSegment = (c.totalOrders || 0) >= 2;
      } else if (purchaseSegment === 'never-ordered') {
        matchesSegment = (c.totalOrders || 0) === 0 && !c.hasPurchased;
      }

      return matchesSearch && matchesStatus && matchesSegment;
    });
  }, [customers, searchTerm, statusFilter, purchaseSegment]);

  // Customer's orders
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) =>
        (selectedCustomer.email && o.customerEmail?.toLowerCase() === selectedCustomer.email.toLowerCase()) ||
        (selectedCustomer.phone && o.customerPhone && (o.customerPhone.includes(selectedCustomer.phone) || selectedCustomer.phone.includes(o.customerPhone))) ||
        (selectedCustomer.recentOrderIds && selectedCustomer.recentOrderIds.includes(o.id))
    );
  }, [orders, selectedCustomer]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#103b1d] font-heading">
            Customer Directory & Activity
          </h2>
          <p className="text-xs sm:text-sm text-[#5a6e54] mt-0.5">
            Track user login dates, customer order counts, lifetime spend, and purchase history.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#faf5ea] border border-[#dfd5bf] text-[#18542a]">
          <span className="w-2 h-2 rounded-full bg-[#18542a] animate-pulse" />
          <span>Real-time Live Sync</span>
        </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Registered / Logged In */}
        <div 
          onClick={() => setPurchaseSegment('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            purchaseSegment === 'all'
              ? 'bg-[#E8F0EB] border-[#245C3A] shadow-xs'
              : 'bg-white border-[#E5E8DF] hover:border-[#C0D6C8]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737B72]">Total Logged-in Users</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8F0EB] text-[#245C3A] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#173D2A] mt-2 tabular-nums">
            {metrics.totalUsers}
          </p>
          <span className="text-[11px] text-[#737B72] mt-1 block">
            All registered website accounts
          </span>
        </div>

        {/* Bought Even Once */}
        <div 
          onClick={() => setPurchaseSegment('bought')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            purchaseSegment === 'bought'
              ? 'bg-[#E8F0EB] border-[#245C3A] shadow-xs'
              : 'bg-white border-[#E5E8DF] hover:border-[#C0D6C8]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#245C3A]">Bought Even Once (≥ 1)</span>
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#166534] mt-2 tabular-nums">
            {metrics.buyersCount}
          </p>
          <span className="text-[11px] text-[#166534] font-medium mt-1 block">
            {metrics.buyerConversionRate}% conversion ({formatINR(metrics.totalRevenue)})
          </span>
        </div>

        {/* Repeat Buyers */}
        <div 
          onClick={() => setPurchaseSegment('repeat')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            purchaseSegment === 'repeat'
              ? 'bg-[#E8F0EB] border-[#245C3A] shadow-xs'
              : 'bg-white border-[#E5E8DF] hover:border-[#C0D6C8]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737B72]">Repeat Buyers (2+)</span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#173D2A] mt-2 tabular-nums">
            {metrics.repeatBuyersCount}
          </p>
          <span className="text-[11px] text-[#737B72] mt-1 block">
            High loyalty customer tier
          </span>
        </div>

        {/* Browsing / No Purchases */}
        <div 
          onClick={() => setPurchaseSegment('never-ordered')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            purchaseSegment === 'never-ordered'
              ? 'bg-[#E8F0EB] border-[#245C3A] shadow-xs'
              : 'bg-white border-[#E5E8DF] hover:border-[#C0D6C8]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737B72]">Logged In (0 Orders)</span>
            <div className="w-8 h-8 rounded-xl bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#173D2A] mt-2 tabular-nums">
            {metrics.nonBuyersCount}
          </p>
          <span className="text-[11px] text-[#737B72] mt-1 block">
            Registered prospects to convert
          </span>
        </div>
      </div>

      {/* Segment Switcher Tabs & Search Filter Bar */}
      <Card padding="sm" className="space-y-3">
        {/* Purchase Segment Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setPurchaseSegment('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              purchaseSegment === 'all'
                ? 'bg-[#173D2A] text-white shadow-xs'
                : 'bg-[#FAF9F4] text-[#737B72] hover:text-[#173D2A] border border-[#E5E8DF]'
            }`}
          >
            All Users ({metrics.totalUsers})
          </button>
          <button
            onClick={() => setPurchaseSegment('bought')}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              purchaseSegment === 'bought'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'bg-[#FAF9F4] text-[#166534] hover:bg-[#DCFCE7]/50 border border-[#A7F3D0]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Customers Who Bought (≥ 1 Order) ({metrics.buyersCount})</span>
          </button>
          <button
            onClick={() => setPurchaseSegment('repeat')}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              purchaseSegment === 'repeat'
                ? 'bg-[#92400E] text-white shadow-xs'
                : 'bg-[#FAF9F4] text-[#92400E] hover:bg-[#FEF3C7]/50 border border-[#FDE68A]'
            }`}
          >
            Repeat Buyers (2+) ({metrics.repeatBuyersCount})
          </button>
          <button
            onClick={() => setPurchaseSegment('never-ordered')}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              purchaseSegment === 'never-ordered'
                ? 'bg-[#4B5563] text-white shadow-xs'
                : 'bg-[#FAF9F4] text-[#737B72] hover:text-[#202820] border border-[#E5E8DF]'
            }`}
          >
            Logged In (0 Orders) ({metrics.nonBuyersCount})
          </button>
        </div>

        {/* Search Bar & Tier Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#dfd5bf]/60">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5a6e54] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, email, phone, city..."
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
            <span className="text-xs text-[#5a6e54] shrink-0 hidden sm:inline">Tier:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d]"
            >
              <option value="all">All Tiers</option>
              <option value="VIP">VIP Patrons</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter !== 'all' || purchaseSegment !== 'all') && (
          <div className="pt-2 border-t border-[#dfd5bf]/60 flex items-center justify-between text-xs text-[#5a6e54]">
            <span>
              Showing {filteredCustomers.length} of {customers.length} users
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPurchaseSegment('all');
              }}
              className="text-[#18542a] font-semibold hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </Card>

      {/* Customer Directory Table */}
      <Card padding="none" className="overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-7 h-7 text-[#18542a]" />}
            title="No Users Found"
            description="No customer profiles match your selected segment and query criteria."
            actionText="Reset Filters"
            onAction={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPurchaseSegment('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#faf5ea] text-xs font-semibold text-[#5a6e54] border-b border-[#dfd5bf]">
                <tr>
                  <th className="py-3 px-4">User / Customer</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Last Logged In</th>
                  <th className="py-3 px-4">Purchase History</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfd5bf]/60">
                {filteredCustomers.map((c) => {
                  const hasPurchased = (c.totalOrders || 0) > 0 || c.hasPurchased;
                  const ordersCount = c.totalOrders || 0;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="hover:bg-[#faf5ea]/70 transition-colors cursor-pointer group"
                    >
                      {/* Name & Avatar & Auth Method */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {c.photoURL ? (
                            <img
                              src={c.photoURL}
                              alt={c.name}
                              className="w-9 h-9 rounded-xl object-cover border border-[#C0D6C8] shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-[#E8F0EB] text-[#18542a] font-bold text-xs flex items-center justify-center shrink-0 border border-[#C0D6C8]">
                              {c.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-[#103b1d] group-hover:text-[#18542a] transition-colors">
                                {c.name}
                              </p>
                              {c.authProvider && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                  c.authProvider === 'Google'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : c.authProvider === 'Email/Password'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {c.authProvider}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#5a6e54]">ID: #{c.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 text-xs">
                        <p className="text-[#103b1d] font-medium">{c.email || 'No email provided'}</p>
                        <p className="text-[#5a6e54]">{c.phone || 'No phone'}</p>
                      </td>

                      {/* Last Logged In Date */}
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#18542a] shrink-0" />
                          <span className="font-medium text-[#103b1d]">
                            {c.lastLoginDate ? formatDate(c.lastLoginDate) : 'Active Recently'}
                          </span>
                        </div>
                      </td>

                      {/* Purchase History Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ordersCount >= 2 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Repeat Buyer ({ordersCount} orders)</span>
                          </span>
                        ) : ordersCount === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] text-[11px] font-bold">
                            <ShoppingBag className="w-3 h-3" />
                            <span>1st Time Buyer (1 order)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[11px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>Logged In • 0 Orders</span>
                          </span>
                        )}
                      </td>

                      {/* Total Orders */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          hasPurchased
                            ? 'bg-[#faf5ea] border-[#dfd5bf] text-[#103b1d]'
                            : 'bg-neutral-100 border-neutral-200 text-neutral-500'
                        }`}>
                          {ordersCount} {ordersCount === 1 ? 'order' : 'orders'}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 font-bold text-[#103b1d] tabular-nums whitespace-nowrap">
                        {formatINR(c.totalSpent || 0)}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-xs text-[#5a6e54] whitespace-nowrap">
                        {formatDate(c.joinedDate)}
                      </td>

                      {/* Status / Tier */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge status={c.status} size="sm">
                          {c.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(c);
                          }}
                          className="p-1.5 rounded-lg text-[#5a6e54] hover:text-[#18542a] hover:bg-[#E8F0EB] transition-colors cursor-pointer"
                          title="View customer profile & order history"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <Drawer
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={selectedCustomer.name}
          subtitle={`Member since ${formatDate(selectedCustomer.joinedDate)}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#5a6e54]">
                Tier: <strong className="text-[#18542a]">{selectedCustomer.status}</strong>
              </span>
              <Button variant="secondary" size="sm" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Quick Profile Summary Card */}
            <div className="p-4 rounded-xl bg-[#faf5ea] border border-[#dfd5bf] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {selectedCustomer.photoURL ? (
                  <img
                    src={selectedCustomer.photoURL}
                    alt={selectedCustomer.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#dfd5bf]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#18542a] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {selectedCustomer.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#103b1d]">{selectedCustomer.name}</h4>
                    {selectedCustomer.authProvider && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {selectedCustomer.authProvider}
                      </span>
                    )}
                  </div>
                  <Badge status={selectedCustomer.status} size="sm" className="mt-1">
                    {selectedCustomer.status}
                  </Badge>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="text-right">
                <label className="text-[11px] text-[#5a6e54] block mb-1">Customer Tier:</label>
                <select
                  value={selectedCustomer.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as CustomerStatus;
                    updateCustomerStatus(selectedCustomer.id, newStatus);
                    setSelectedCustomer((prev) => (prev ? { ...prev, status: newStatus } : null));
                    showToast(`Updated customer tier to ${newStatus}.`, 'success');
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[#dfd5bf] bg-white font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="VIP">VIP</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Login & Order Timestamps Card */}
            <div className="p-4 rounded-xl border border-[#dfd5bf] bg-white space-y-2.5 text-xs">
              <h5 className="font-bold text-[#103b1d] uppercase tracking-wider text-[11px]">
                Activity & Login Timestamps
              </h5>
              <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-[#dfd5bf]">
                <div>
                  <span className="text-[10px] text-[#5a6e54] block">Last Logged In:</span>
                  <span className="font-semibold text-[#103b1d]">
                    {selectedCustomer.lastLoginDate ? formatDate(selectedCustomer.lastLoginDate) : 'Active Recently'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5a6e54] block">Account Created:</span>
                  <span className="font-semibold text-[#103b1d]">
                    {formatDate(selectedCustomer.joinedDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5a6e54] block">First Order Date:</span>
                  <span className="font-semibold text-[#103b1d]">
                    {selectedCustomer.firstOrderDate ? formatDate(selectedCustomer.firstOrderDate) : (selectedCustomer.totalOrders > 0 ? 'Recorded in farm dispatch' : 'No orders placed yet')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5a6e54] block">Latest Order Date:</span>
                  <span className="font-semibold text-[#103b1d]">
                    {selectedCustomer.lastOrderDate ? formatDate(selectedCustomer.lastOrderDate) : (selectedCustomer.totalOrders > 0 ? 'Recent' : 'N/A')}
                  </span>
                </div>
              </div>
            </div>

            {/* Spend & Order Volume Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[#dfd5bf] bg-white">
                <span className="text-[#5a6e54] block">Total Lifetime Spent</span>
                <span className="text-base font-bold text-[#103b1d] mt-0.5 block tabular-nums">
                  {formatINR(selectedCustomer.totalSpent || 0)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#dfd5bf] bg-white">
                <span className="text-[#5a6e54] block">Completed Orders</span>
                <span className="text-base font-bold text-[#103b1d] mt-0.5 block tabular-nums">
                  {selectedCustomer.totalOrders || 0} {selectedCustomer.totalOrders === 1 ? 'order' : 'orders'}
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-4 rounded-xl border border-[#dfd5bf] bg-white space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#103b1d]">
                <Mail className="w-4 h-4 text-[#5a6e54]" />
                <span>{selectedCustomer.email || 'No email on file'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#103b1d]">
                <Phone className="w-4 h-4 text-[#5a6e54]" />
                <span>{selectedCustomer.phone || 'No phone on file'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#103b1d]">
                <MapPin className="w-4 h-4 text-[#5a6e54]" />
                <span>{selectedCustomer.city || 'Rajahmundry'}, {selectedCustomer.state || 'Andhra Pradesh'}</span>
              </div>
            </div>

            {/* Order History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#5a6e54] uppercase tracking-wider">
                  Order History ({customerOrders.length})
                </h4>
                {selectedCustomer.totalOrders > 0 && customerOrders.length === 0 && (
                  <span className="text-[10px] text-[#5a6e54]">
                    Total {selectedCustomer.totalOrders} orders on cloud records
                  </span>
                )}
              </div>

              {customerOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#5a6e54] border border-dashed border-[#dfd5bf] rounded-xl bg-[#faf5ea]">
                  {selectedCustomer.totalOrders === 0 ? (
                    <p>This user has logged in but has not completed any orders yet.</p>
                  ) : (
                    <p>Orders recorded under ID #{selectedCustomer.recentOrderIds?.join(', #') || selectedCustomer.id}.</p>
                  )}
                </div>
              ) : (
                <div className="border border-[#dfd5bf] rounded-xl divide-y divide-[#dfd5bf] overflow-hidden bg-white">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#faf5ea] transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#18542a]">#{ord.id}</span>
                          <Badge status={ord.paymentStatus} size="sm">
                            {ord.paymentStatus}
                          </Badge>
                        </div>
                        <p className="text-[#5a6e54] mt-0.5">{formatDate(ord.date)} • {ord.items.length} items</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#103b1d] block tabular-nums">
                          {formatINR(ord.total)}
                        </span>
                        <Badge status={ord.orderStatus} size="sm" className="mt-0.5">
                          {ord.orderStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
