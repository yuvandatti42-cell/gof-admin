import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { formatINR, formatDate, formatNumber } from '../utils/formatters';
import type { Promotion, PromotionStatus, PromotionType } from '../types';
import {
  Tag,
  Plus,
  Search,
  Copy,
  Check,
  Edit2,
  Trash2,
  Percent,
  IndianRupee,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';


export const PromotionsPage: React.FC = () => {
  const {
    promotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
  } = useAdmin();

  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PromotionStatus>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Helper for initial form values
  const getInitialForm = () => ({
    code: '',
    description: '',
    discountType: 'percentage' as PromotionType,
    discountValue: '',
    minOrderValue: '999',
    maxDiscount: '300',
    usageLimit: '500',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active' as PromotionStatus,
  });

  const [formData, setFormData] = useState(getInitialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const activeCount = promotions.filter((p) => p.status === 'Active').length;
    const totalRedemptions = promotions.reduce((acc, curr) => acc + curr.usageCount, 0);
    const estimatedSavings = promotions.reduce((acc, curr) => {
      const perUse = curr.discountType === 'fixed' ? curr.discountValue : 150;
      return acc + curr.usageCount * perUse;
    }, 0);

    return { activeCount, totalRedemptions, estimatedSavings };
  }, [promotions]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingPromo(null);
    setFormData(getInitialForm());
    setErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue.toString(),
      minOrderValue: promo.minOrderValue.toString(),
      maxDiscount: promo.maxDiscount ? promo.maxDiscount.toString() : '',
      usageLimit: promo.usageLimit ? promo.usageLimit.toString() : '',
      startDate: promo.startDate,
      endDate: promo.endDate,
      status: promo.status,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Copy coupon code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code "${code}" copied to clipboard!`, 'info');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) newErrors.code = 'Coupon code is required';
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      newErrors.discountValue = 'Valid discount value is required (> 0)';
    }
    if (formData.discountType === 'percentage' && Number(formData.discountValue) > 90) {
      newErrors.discountValue = 'Percentage discount cannot exceed 90%';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const cleanCode = formData.code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (editingPromo) {
      updatePromotion(editingPromo.id, {
        code: cleanCode,
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
      });
      showToast(`Coupon "${cleanCode}" updated.`, 'success', 'Promotion Saved');
    } else {
      addPromotion({
        code: cleanCode,
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
      });
      showToast(`Coupon "${cleanCode}" created.`, 'success', 'Promotion Active');
    }

    setIsModalOpen(false);
  };

  // Delete handler
  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      const p = promotions.find((item) => item.id === deleteTargetId);
      deletePromotion(deleteTargetId);
      showToast(`Coupon "${p?.code}" removed.`, 'info');
      setDeleteTargetId(null);
    }
  };

  // Filter pipeline
  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [promotions, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] font-heading">
            Promotions & Coupons
          </h2>
          <p className="text-xs sm:text-sm text-[#737B72] mt-0.5">
            Configure harvest discount codes, fixed pantry concessions, and seasonal vouchers.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Create Promotion
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-semibold text-[#737B72] uppercase tracking-wider">
            Active Campaigns
          </p>
          <h3 className="text-2xl font-bold text-[#173D2A] mt-1 tabular-nums font-heading">
            {summaryMetrics.activeCount} <span className="text-sm font-normal text-[#737B72]">/ {promotions.length}</span>
          </h3>
          <p className="text-xs text-[#2F7D4A] mt-2 font-medium">Ready for checkout validation</p>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-[#737B72] uppercase tracking-wider">
            Total Redemptions
          </p>
          <h3 className="text-2xl font-bold text-[#173D2A] mt-1 tabular-nums font-heading">
            {formatNumber(summaryMetrics.totalRedemptions)}
          </h3>
          <p className="text-xs text-[#737B72] mt-2">Across all recorded customer checkouts</p>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-[#737B72] uppercase tracking-wider">
            Estimated Savings Given
          </p>
          <h3 className="text-2xl font-bold text-[#173D2A] mt-1 tabular-nums font-heading">
            {formatINR(summaryMetrics.estimatedSavings)}
          </h3>
          <p className="text-xs text-[#2F7D4A] mt-2 font-medium">Pantry incentives delivered</p>
        </Card>
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
              placeholder="Search coupon code or description..."
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
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Promotions Table */}
      <Card padding="none" className="overflow-hidden">
        {filteredPromotions.length === 0 ? (
          <EmptyState
            icon={<Tag className="w-7 h-7 text-[#245C3A]" />}
            title="No Promotions Found"
            description="No coupons match your filter. Create a new campaign code for store buyers."
            actionText="Clear Filter"
            onAction={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            secondaryActionText="Create Coupon"
            onSecondaryAction={handleOpenAdd}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9F4] text-xs font-semibold text-[#737B72] border-b border-[#E5E8DF]">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Usage Count</th>
                  <th className="py-3 px-4">Validity Range</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8DF]/60">
                {filteredPromotions.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF9F4]/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#245C3A] tracking-wider bg-[#E8F0EB] px-2.5 py-1 rounded-lg border border-[#C0D6C8]">
                          {p.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(p.code)}
                          className="p-1 rounded-md text-[#737B72] hover:text-[#245C3A] hover:bg-neutral-100 transition-colors"
                          title="Copy coupon code"
                        >
                          {copiedCode === p.code ? (
                            <Check className="w-3.5 h-3.5 text-[#2F7D4A]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-[#737B72] mt-1 max-w-xs">{p.description}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-[#173D2A]">
                        {p.discountType === 'percentage' ? (
                          <>
                            <Percent className="w-4 h-4 text-[#245C3A]" />
                            <span>{p.discountValue}% OFF</span>
                          </>
                        ) : (
                          <>
                            <IndianRupee className="w-4 h-4 text-[#245C3A]" />
                            <span>{formatINR(p.discountValue)} OFF</span>
                          </>
                        )}
                      </div>
                      {p.maxDiscount && (
                        <span className="text-[11px] text-[#737B72] block">
                          Up to {formatINR(p.maxDiscount)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-[#555E53] whitespace-nowrap">
                      Min order: <span className="font-semibold text-[#173D2A]">{formatINR(p.minOrderValue)}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold tabular-nums text-[#202820]">
                        {p.usageCount}
                      </span>
                      {p.usageLimit && (
                        <span className="text-xs text-[#737B72]"> / {p.usageLimit} max</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-[#737B72] whitespace-nowrap">
                      {formatDate(p.startDate)} – {formatDate(p.endDate)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Badge status={p.status} size="sm">
                          {p.status}
                        </Badge>
                        <button
                          onClick={() => {
                            togglePromotionStatus(p.id);
                            showToast(`Toggled coupon ${p.code} status.`, 'info');
                          }}
                          className="p-1 text-[#737B72] hover:text-[#245C3A]"
                          title="Toggle active status"
                        >
                          {p.status === 'Active' ? (
                            <ToggleRight className="w-5 h-5 text-[#2F7D4A]" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-[#737B72]" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-[#737B72] hover:text-[#245C3A] hover:bg-[#E8F0EB] transition-colors"
                          title="Edit promotion"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(p.id)}
                          className="p-1.5 rounded-lg text-[#737B72] hover:text-[#B64238] hover:bg-[#FDEEED] transition-colors"
                          title="Delete promotion"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Promotion Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPromo ? 'Edit Promotion' : 'Create Promotion'}
        description="Configure discount rules and usage conditions for customer checkouts."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingPromo ? 'Save Changes' : 'Publish Coupon'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#173D2A] mb-1">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. GODAVARI10"
              className={`w-full font-mono text-sm px-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#245C3A] ${
                errors.code ? 'border-[#B64238]' : 'border-[#E5E8DF]'
              }`}
            />
            {errors.code && <p className="text-[11px] text-[#B64238] mt-0.5">{errors.code}</p>}
          </div>

          <div>
            <label className="block font-semibold text-[#173D2A] mb-1">
              Description / Campaign Note
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. 10% discount on first organic grocery harvest"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white focus:ring-1 focus:ring-[#245C3A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">
                Discount Type
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as PromotionType })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === 'percentage' ? '10' : '200'}
                className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white focus:ring-1 focus:ring-[#245C3A] ${
                  errors.discountValue ? 'border-[#B64238]' : 'border-[#E5E8DF]'
                }`}
              />
              {errors.discountValue && (
                <p className="text-[11px] text-[#B64238] mt-0.5">{errors.discountValue}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">
                Min Order Value (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                placeholder="999"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>

            {formData.discountType === 'percentage' ? (
              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">
                  Max Cap (₹ optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  placeholder="300"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">
                  Total Redemption Limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="250"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white ${
                  errors.endDate ? 'border-[#B64238]' : 'border-[#E5E8DF]'
                }`}
              />
              {errors.endDate && (
                <p className="text-[11px] text-[#B64238] mt-0.5">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <label className="font-semibold text-[#173D2A]">Status:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PromotionStatus })}
              className="px-3 py-1.5 rounded-lg border border-[#E5E8DF] bg-white text-xs"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Coupon?"
        message="Are you sure you want to delete this promotion? This action is client-side only."
        confirmText="Delete Coupon"
        variant="danger"
      />
    </div>
  );
};
