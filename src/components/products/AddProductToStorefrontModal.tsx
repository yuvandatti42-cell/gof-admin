import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatINR } from '../../utils/formatters';
import { Search, Plus, Eye, Trash2, Sprout } from 'lucide-react';

export const AddProductToStorefrontModal: React.FC = () => {
  const {
    products,
    categories,
    storeContent,
    isStorefrontPickerOpen,
    setStorefrontPickerOpen,
    addProductToStorefront,
    removeProductFromStorefront,
    addMultipleProductsToStorefront,
    setLiveStorefrontOpen,
  } = useAdmin();

  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewFilter, setViewFilter] = useState<'all' | 'not_on_store' | 'on_store'>('all');

  const activeStorefrontIds = storeContent.featuredProductIds;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || p.categoryId === categoryFilter;

      const isOnStore = activeStorefrontIds.includes(p.id);
      const matchesView =
        viewFilter === 'all' ||
        (viewFilter === 'on_store' && isOnStore) ||
        (viewFilter === 'not_on_store' && !isOnStore);

      return matchesSearch && matchesCategory && matchesView;
    });
  }, [products, searchTerm, categoryFilter, viewFilter, activeStorefrontIds]);

  const handleAddSingle = (productId: string, productName: string) => {
    addProductToStorefront(productId);
    showToast(`"${productName}" added to live storefront Featured Harvest.`, 'success', 'Added to Store');
  };

  const handleRemoveSingle = (productId: string, productName: string) => {
    removeProductFromStorefront(productId);
    showToast(`"${productName}" removed from live storefront.`, 'info', 'Removed from Store');
  };

  const handleBulkAdd = () => {
    if (selectedIds.length === 0) return;
    addMultipleProductsToStorefront(selectedIds);
    showToast(`Added ${selectedIds.length} products to live storefront.`, 'success', 'Bulk Added');
    setSelectedIds([]);
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      isOpen={isStorefrontPickerOpen}
      onClose={() => setStorefrontPickerOpen(false)}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#e8f0eb] text-[#18542a] flex items-center justify-center shadow-xs">
            <Sprout className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#103b1d] font-heading">
              Manage Storefront Products (Featured Harvest)
            </h3>
            <p className="text-xs text-[#5a6e54] font-normal">
              Select which products appear on the customer-facing Godavari Organics homepage
            </p>
          </div>
        </div>
      }
      size="2xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="text-xs text-[#5a6e54] text-center sm:text-left">
            <strong className="text-[#18542a] font-bold">{activeStorefrontIds.length}</strong> of{' '}
            {products.length} products published to storefront
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="sunshine"
              size="sm"
              onClick={() => {
                setStorefrontPickerOpen(false);
                setLiveStorefrontOpen(true);
              }}
              icon={<Eye className="w-4 h-4 stroke-[2.5]" />}
            >
              View Live Store
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStorefrontPickerOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5a6e54] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, SKU..."
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] placeholder-[#5a6e54] focus:outline-none focus:ring-1 focus:ring-[#18542a] font-medium"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] focus:ring-1 focus:ring-[#18542a] font-medium cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status View Tab Buttons */}
          <div className="inline-flex rounded-xl bg-[#faf5ea] p-1 border border-[#dfd5bf] text-[11px] font-semibold shrink-0">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewFilter === 'all'
                  ? 'bg-white text-[#103b1d] font-bold shadow-xs'
                  : 'text-[#5a6e54]'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setViewFilter('not_on_store')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewFilter === 'not_on_store'
                  ? 'bg-white text-[#103b1d] font-bold shadow-xs'
                  : 'text-[#5a6e54]'
              }`}
            >
              Available ({products.length - activeStorefrontIds.length})
            </button>
            <button
              onClick={() => setViewFilter('on_store')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewFilter === 'on_store'
                  ? 'bg-white text-[#103b1d] font-bold shadow-xs'
                  : 'text-[#5a6e54]'
              }`}
            >
              On Store ({activeStorefrontIds.length})
            </button>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="p-2.5 rounded-xl bg-[#e8f0eb] border border-[#c0d6c8] flex items-center justify-between text-xs">
            <span className="font-bold text-[#18542a]">
              {selectedIds.length} products selected
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={handleBulkAdd}>
                + Add Selected to Storefront
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Product List */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#5a6e54]">
              No products found matching your search.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isOnStore = activeStorefrontIds.includes(p.id);
              const isSelected = selectedIds.includes(p.id);

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isOnStore
                      ? 'bg-[#e8f0eb]/40 border-[#c0d6c8]'
                      : 'bg-white border-[#dfd5bf] hover:border-[#18542a]/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {!isOnStore && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(p.id)}
                        className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] cursor-pointer"
                      />
                    )}

                    <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-[#faf6ee] to-[#f4ede0]/60 p-1 border border-[#dfd5bf] flex items-center justify-center shrink-0">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-[#103b1d] truncate">
                          {p.name}
                        </h4>
                        {isOnStore && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#18542a] text-white">
                            Live on Store
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#5a6e54] mt-0.5">
                        <span className="font-mono">{p.sku}</span>
                        <span>•</span>
                        <span>{p.categoryName}</span>
                        <span>•</span>
                        <span className="font-bold text-[#103b1d] tabular-nums">
                          {formatINR(p.price)}
                        </span>
                        <span>•</span>
                        <span className={`font-semibold ${p.stock <= 15 ? 'text-[#f96015]' : 'text-[#18542a]'}`}>
                          {p.stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0">
                    {isOnStore ? (
                      <button
                        onClick={() => handleRemoveSingle(p.id, p.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#d52518] bg-[#fdeeed] hover:bg-[#fad8d6] transition-colors cursor-pointer"
                        title="Remove product from customer storefront"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddSingle(p.id, p.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#18542a] hover:bg-[#103b1d] shadow-xs transition-colors cursor-pointer"
                        title="Add product to customer storefront"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Store</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
