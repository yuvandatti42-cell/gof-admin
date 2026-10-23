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
  Sparkles,
} from 'lucide-react';


export const CustomersPage: React.FC = () => {
  const { customers, orders, updateCustomerStatus } = useAdmin();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerStatus>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filter pipeline
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Customer's orders
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) =>
        o.customerEmail === selectedCustomer.email ||
        selectedCustomer.recentOrderIds.includes(o.id)
    );
  }, [orders, selectedCustomer]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] font-heading">
            Customer Directory
          </h2>
          <p className="text-xs sm:text-sm text-[#737B72] mt-0.5">
            Profiles, purchase loyalty history, and contact details (Fictional mock data).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FAF9F4] border border-[#E5E8DF] text-[#245C3A]">
          <Sparkles className="w-3.5 h-3.5 text-[#B7791F]" />
          <span>Fictional Sample Profiles</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="sm" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#737B72] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, city..."
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-[#E5E8DF] bg-white text-[#202820] placeholder-[#737B72] focus:ring-1 focus:ring-[#245C3A]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#737B72] hover:text-[#202820]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737B72] shrink-0 hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-[#E5E8DF] bg-white text-[#202820]"
            >
              <option value="all">All Customer Tiers</option>
              <option value="VIP">VIP Patrons</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter !== 'all') && (
          <div className="pt-2 border-t border-[#E5E8DF]/60 flex items-center justify-between text-xs text-[#737B72]">
            <span>Showing {filteredCustomers.length} of {customers.length} customers</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="text-[#245C3A] font-semibold hover:underline"
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
            icon={<Users className="w-7 h-7 text-[#245C3A]" />}
            title="No Customers Found"
            description="No customer profiles match your search criteria. Try modifying your search query."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9F4] text-xs font-semibold text-[#737B72] border-b border-[#E5E8DF]">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8DF]/60">
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-[#FAF9F4]/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#E8F0EB] text-[#245C3A] font-bold text-xs flex items-center justify-center shrink-0 border border-[#C0D6C8]">
                          {c.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#173D2A] group-hover:text-[#245C3A] transition-colors">
                            {c.name}
                          </p>
                          <span className="text-[11px] text-[#737B72]">ID: #{c.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <p className="text-[#202820] font-medium">{c.email}</p>
                      <p className="text-[#737B72]">{c.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#555E53] whitespace-nowrap">
                      {c.city}, {c.state}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF9F4] border border-[#E5E8DF] text-[#173D2A]">
                        {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#173D2A] tabular-nums whitespace-nowrap">
                      {formatINR(c.totalSpent)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#737B72] whitespace-nowrap">
                      {formatDate(c.joinedDate)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={c.status} size="sm">
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                        className="p-1.5 rounded-lg text-[#737B72] hover:text-[#245C3A] hover:bg-[#E8F0EB] transition-colors"
                        title="View profile & orders"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
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
              <span className="text-xs text-[#737B72]">
                Tier: <strong className="text-[#245C3A]">{selectedCustomer.status}</strong>
              </span>
              <Button variant="secondary" size="sm" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Quick Profile Summary Card */}
            <div className="p-4 rounded-xl bg-[#FAF9F4] border border-[#E5E8DF] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#245C3A] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {selectedCustomer.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#173D2A]">{selectedCustomer.name}</h4>
                  <Badge status={selectedCustomer.status} size="sm" className="mt-1">
                    {selectedCustomer.status}
                  </Badge>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="text-right">
                <label className="text-[11px] text-[#737B72] block mb-1">Customer Tier:</label>
                <select
                  value={selectedCustomer.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as CustomerStatus;
                    updateCustomerStatus(selectedCustomer.id, newStatus);
                    setSelectedCustomer((prev) => (prev ? { ...prev, status: newStatus } : null));
                    showToast(`Updated customer tier to ${newStatus}.`, 'success');
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E5E8DF] bg-white font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="VIP">VIP</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[#E5E8DF] bg-white">
                <span className="text-[#737B72] block">Total Lifetime Spent</span>
                <span className="text-base font-bold text-[#173D2A] mt-0.5 block tabular-nums">
                  {formatINR(selectedCustomer.totalSpent)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#E5E8DF] bg-white">
                <span className="text-[#737B72] block">Completed Orders</span>
                <span className="text-base font-bold text-[#173D2A] mt-0.5 block tabular-nums">
                  {selectedCustomer.totalOrders}
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="p-4 rounded-xl border border-[#E5E8DF] bg-white space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#202820]">
                <Mail className="w-4 h-4 text-[#737B72]" />
                <span>{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[#202820]">
                <Phone className="w-4 h-4 text-[#737B72]" />
                <span>{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#202820]">
                <MapPin className="w-4 h-4 text-[#737B72]" />
                <span>{selectedCustomer.city}, {selectedCustomer.state}</span>
              </div>
            </div>

            {/* Order History */}
            <div>
              <h4 className="text-xs font-bold text-[#737B72] uppercase tracking-wider mb-3">
                Order History ({customerOrders.length})
              </h4>
              {customerOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#737B72] border border-dashed border-[#E5E8DF] rounded-xl">
                  No mock orders recorded for this customer in current session.
                </div>
              ) : (
                <div className="border border-[#E5E8DF] rounded-xl divide-y divide-[#E5E8DF] overflow-hidden bg-white">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#245C3A]">#{ord.id}</span>
                        <p className="text-[#737B72] mt-0.5">{formatDate(ord.date)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#173D2A] block tabular-nums">
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
