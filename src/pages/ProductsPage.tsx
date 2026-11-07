import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { formatINR } from '../utils/formatters';
import type { Product, ProductStatus } from '../types';
import {
  Search,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Eye,
  UploadCloud,
  Sprout,
  CheckCircle2,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    products,
    categories,
    storeContent,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    bulkUpdateProductStatus,
    bulkDeleteProducts,
    addCategory,
    isProductOnStorefront,
    addProductToStorefront,
    removeProductFromStorefront,
    addMultipleProductsToStorefront,
    removeMultipleProductsFromStorefront,
    setStorefrontPickerOpen,
  } = useAdmin();

  const { showToast } = useToast();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  // Filter Harvest Modal States (Matching User's 2-Column Design)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'sort' | 'tags' | 'type' | 'brand' | 'price' | 'ratings'>('sort');

  // Draft filter selections
  const [draftSortBy, setDraftSortBy] = useState(sortBy);
  const [draftCategory, setDraftCategory] = useState(categoryFilter);
  const [draftStock, setDraftStock] = useState(stockFilter);
  const [draftPrice, setDraftPrice] = useState(priceFilter);
  const [draftBrand, setDraftBrand] = useState(brandFilter);
  const [draftRating, setDraftRating] = useState(ratingFilter);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return [
      categoryFilter !== 'all',
      stockFilter !== 'all',
      sortBy !== 'updated',
      priceFilter !== 'all',
      brandFilter !== 'all',
      ratingFilter !== 'all',
    ].filter(Boolean).length;
  }, [categoryFilter, stockFilter, sortBy, priceFilter, brandFilter, ratingFilter]);

  // Open Filter Modal
  const handleOpenFilterModal = () => {
    setDraftSortBy(sortBy);
    setDraftCategory(categoryFilter);
    setDraftStock(stockFilter);
    setDraftPrice(priceFilter);
    setDraftBrand(brandFilter);
    setDraftRating(ratingFilter);
    setIsFilterModalOpen(true);
  };

  // Apply filters from modal
  const handleApplyFilters = () => {
    setSortBy(draftSortBy);
    setCategoryFilter(draftCategory);
    setStockFilter(draftStock);
    setPriceFilter(draftPrice);
    setBrandFilter(draftBrand);
    setRatingFilter(draftRating);
    setIsFilterModalOpen(false);
    showToast('Harvest filters applied.', 'info');
  };

  // Clear all filters
  const handleClearFilters = () => {
    setDraftSortBy('updated');
    setDraftCategory('all');
    setDraftStock('all');
    setDraftPrice('all');
    setDraftBrand('all');
    setDraftRating('all');
    setSortBy('updated');
    setCategoryFilter('all');
    setStockFilter('all');
    setPriceFilter('all');
    setBrandFilter('all');
    setRatingFilter('all');
    setIsFilterModalOpen(false);
    showToast('All filters cleared.', 'info');
  };

  // Quick Add Category Modal state
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Quick slug helper
  const slugifyCategory = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[''""`]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Category counts map
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Create Category Handler
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      showToast('Please enter a category name.', 'error');
      return;
    }
    const slug = newCategorySlug.trim() || slugifyCategory(name);
    const created = addCategory({
      name,
      slug,
      description: newCategoryDesc.trim() || 'Organic Farm Category',
      visibility: 'Visible',
      displayOrder: categories.length + 1,
    });
    showToast(`Category "${created.name}" created!`, 'success');
    setCategoryFilter(created.id);
    setNewCategoryName('');
    setNewCategorySlug('');
    setNewCategoryDesc('');
    setIsAddCategoryOpen(false);
  };

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal / Drawer states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Form State
  const initialFormState = {
    name: '',
    sku: '',
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || '',
    description: '',
    price: '',
    compareAtPrice: '',
    stock: '',
    unit: '1 kg',
    status: 'Active' as ProductStatus,
    featured: false,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    secondaryImageUrl: '',
    harvestLocation: 'Godavari Basin Farms',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Open Add Product Modal
  const handleOpenAddModal = useCallback(() => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `GOF-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: categories[0]?.id || '',
      categoryName: categories[0]?.name || '',
      description: '',
      price: '',
      compareAtPrice: '',
      stock: '',
      unit: '1 kg',
      status: 'Active' as ProductStatus,
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      secondaryImageUrl: '',
      harvestLocation: 'Godavari Basin Farms',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  }, [categories]);

  // Check URL query action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenAddModal();
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('action');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, handleOpenAddModal, setSearchParams]);

  // Open Edit Product Modal
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      description: product.description,
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : '',
      stock: product.stock.toString(),
      unit: product.unit,
      status: product.status,
      featured: product.featured,
      imageUrl: product.imageUrl,
      secondaryImageUrl: product.secondaryImageUrl || '',
      harvestLocation: product.harvestLocation || 'Godavari Delta Farms',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Image Upload handler (Client-side FileReader preview)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size exceeds 2MB limit for preview.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
        showToast('Local image preview loaded.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSecondaryImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size exceeds 2MB limit for preview.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, secondaryImageUrl: reader.result as string }));
        showToast('Secondary nutrition label image preview loaded.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate and submit form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'SKU is required';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Valid price is required (> 0)';
    if (formData.compareAtPrice && Number(formData.compareAtPrice) < Number(formData.price)) {
      errors.compareAtPrice = 'Compare-at price cannot be lower than price';
    }
    if (formData.stock === '' || Number(formData.stock) < 0) {
      errors.stock = 'Valid stock quantity is required (>= 0)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const categoryObj = categories.find((c) => c.id === formData.categoryId);
    const categoryName = categoryObj ? categoryObj.name : 'General Organics';

    const stockNumber = Number(formData.stock);
    let autoStatus = formData.status;
    if (stockNumber === 0 && formData.status === 'Active') {
      autoStatus = 'Out of Stock';
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        categoryId: formData.categoryId,
        categoryName,
        description: formData.description.trim(),
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        stock: stockNumber,
        unit: formData.unit,
        status: autoStatus,
        featured: formData.featured,
        imageUrl: formData.imageUrl,
        secondaryImageUrl: formData.secondaryImageUrl,
        harvestLocation: formData.harvestLocation,
      });
      showToast(`"${formData.name}" was updated successfully.`, 'success', 'Product Updated');
    } else {
      const createdProd = addProduct({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        categoryId: formData.categoryId,
        categoryName,
        description: formData.description.trim(),
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        stock: stockNumber,
        unit: formData.unit,
        status: autoStatus,
        featured: formData.featured,
        imageUrl: formData.imageUrl,
        secondaryImageUrl: formData.secondaryImageUrl,
        harvestLocation: formData.harvestLocation,
      });
      if (formData.featured) {
        addProductToStorefront(createdProd.id);
        showToast(`"${formData.name}" added to catalog and published to storefront.`, 'success', 'Product Created');
      } else {
        showToast(`"${formData.name}" added to catalog. Click "Add to Store" to publish to customer website.`, 'success', 'Product Created');
      }
    }

    setIsFormModalOpen(false);
  };

  // Duplicate handler
  const handleDuplicate = (id: string) => {
    const duplicated = duplicateProduct(id);
    if (duplicated) {
      showToast(`Duplicated into "${duplicated.name}"`, 'success', 'Product Duplicated');
    }
  };

  // Delete product handler
  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      const target = products.find((p) => p.id === deleteTargetId);
      deleteProduct(deleteTargetId);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetId));
      showToast(`"${target?.name || 'Product'}" has been deleted.`, 'info', 'Product Removed');
      setDeleteTargetId(null);
    }
  };

  // Bulk delete handler
  const handleConfirmBulkDelete = () => {
    bulkDeleteProducts(selectedIds);
    showToast(`${selectedIds.length} products deleted.`, 'info', 'Bulk Action');
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  // Multi-select toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter and Sort Pipeline
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q);

        // Category filter
        const matchesCategory =
          categoryFilter === 'all' || p.categoryId === categoryFilter;

        // Stock filter
        const matchesStock =
          stockFilter === 'all' ||
          (stockFilter === 'in_stock' && p.stock > 15) ||
          (stockFilter === 'low_stock' && p.stock > 0 && p.stock <= 15) ||
          (stockFilter === 'out_of_stock' && p.stock === 0);

        // Price filter
        let matchesPrice = true;
        if (priceFilter === 'under_250') matchesPrice = p.price < 250;
        if (priceFilter === '250_500') matchesPrice = p.price >= 250 && p.price <= 500;
        if (priceFilter === '500_1000') matchesPrice = p.price >= 500 && p.price <= 1000;
        if (priceFilter === 'above_1000') matchesPrice = p.price > 1000;

        // Brand filter
        let matchesBrand = true;
        if (brandFilter === 'Arma') {
          matchesBrand = p.name.toLowerCase().includes('millet') || (p.harvestLocation || '').includes('Arma');
        }
        if (brandFilter === 'Godavari Organics') {
          matchesBrand = !p.name.toLowerCase().includes('millet');
        }

        // Ratings filter
        let matchesRating = true;
        if (ratingFilter === '4_5_above') matchesRating = (p.salesCount || 0) >= 100;
        if (ratingFilter === '4_above') matchesRating = (p.salesCount || 0) >= 50;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStock &&
          matchesPrice &&
          matchesBrand &&
          matchesRating
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'stock') return a.stock - b.stock;
        if (sortBy === 'discount') {
          const discountA = a.compareAtPrice ? (a.compareAtPrice - a.price) / a.compareAtPrice : 0;
          const discountB = b.compareAtPrice ? (b.compareAtPrice - b.price) / b.compareAtPrice : 0;
          return discountB - discountA;
        }
        if (sortBy === 'highest_rated') {
          return (b.salesCount || 0) - (a.salesCount || 0);
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy, priceFilter, brandFilter, ratingFilter]);

  return (
    <div className="space-y-3.5 sm:space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-bold text-[#103b1d] font-heading">
                Products Catalog
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E8F0EB] text-[#18542a] border border-[#C0D6C8]">
                {products.length}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#5a6e54] mt-0.5 hidden xs:block">
              Godavari single-origin grains, cold-pressed oils & spices.
            </p>
          </div>

          {/* Mobile-only Action Buttons */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenFilterModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#dfd5bf] bg-[#FAF6EE] text-[#103b1d] font-bold text-xs shrink-0 cursor-pointer"
              title="Open Filter Harvest"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#103b1d]" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#103b1d] text-white text-[9px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddModal}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="px-2.5 py-1.5 text-xs"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Mobile secondary actions (Storefront) */}
        <div className="flex sm:hidden items-center gap-2 text-xs">
          <button
            onClick={() => setStorefrontPickerOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-[#E8F0EB] border border-[#C0D6C8] text-[#18542a] font-semibold text-xs hover:bg-[#D5E6DA]"
          >
            <Sprout className="w-3.5 h-3.5 text-[#18542a]" />
            <span>Storefront ({storeContent.featuredProductIds.length})</span>
          </button>
        </div>

        {/* Desktop / Tablet Action Buttons */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStorefrontPickerOpen(true)}
            icon={<Sprout className="w-4 h-4 text-[#18542a]" />}
          >
            Storefront ({storeContent.featuredProductIds.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenFilterModal}
            icon={<SlidersHorizontal className="w-4 h-4 text-[#103b1d]" />}
          >
            <span>Filter Harvest</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#103b1d] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Categories Filter Tabs (Compact Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            categoryFilter === 'all'
              ? 'bg-[#18542a] text-white shadow-xs'
              : 'bg-white text-[#5a6e54] hover:bg-[#faf5ea] border border-[#dfd5bf]'
          }`}
        >
          All ({products.length})
        </button>

        {categories.map((c) => {
          const count = categoryCounts[c.id] || 0;
          const isSelected = categoryFilter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#18542a] text-white shadow-xs'
                  : 'bg-white text-[#5a6e54] hover:bg-[#faf5ea] border border-[#dfd5bf]'
              }`}
            >
              <span>{c.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#faf5ea] text-[#5a6e54]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setIsAddCategoryOpen(true)}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap text-[#18542a] bg-[#E8F0EB] hover:bg-[#D5E6DA] transition-colors cursor-pointer flex items-center gap-1 shrink-0 ml-0.5 border border-[#C0D6C8]"
          title="Create a new product category"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Category</span>
        </button>
      </div>

      {/* Filter & Search Bar (Compact Mobile-Optimized) */}
      <Card padding="sm" className="space-y-2.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Input & Quick Filter Harvest Trigger in One Row */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5a6e54] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] placeholder-[#5a6e54] focus:outline-none focus:ring-1 focus:ring-[#18542a]"
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

            <button
              type="button"
              onClick={handleOpenFilterModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#dfd5bf] bg-[#FAF6EE] hover:bg-[#faf5ea] text-[#103b1d] font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-2xs"
              title="Open Filter Harvest"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#103b1d]" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#103b1d] text-white text-[9px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop-only Quick Dropdowns (Hidden on mobile to save vertical space) */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#5a6e54] shrink-0 hidden lg:inline">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] focus:ring-1 focus:ring-[#18542a]"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#5a6e54] shrink-0 hidden lg:inline">Stock:</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] focus:ring-1 focus:ring-[#18542a]"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in_stock">In Stock (&gt;15)</option>
                <option value="low_stock">Low Stock (1-15)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#5a6e54] shrink-0 hidden lg:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] focus:ring-1 focus:ring-[#18542a]"
              >
                <option value="updated">Relevance (Recent)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Discount: High to Low</option>
                <option value="highest_rated">Highest Rated</option>
                <option value="name">Product Name (A-Z)</option>
                <option value="stock">Stock Quantity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="pt-2 border-t border-[#dfd5bf]/60 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#5a6e54] font-semibold text-[11px] mr-1">Active Filters:</span>
            {categoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0EB] text-[#18542a] font-semibold text-[11px] border border-[#C0D6C8]">
                Category: {categories.find((c) => c.id === categoryFilter)?.name || categoryFilter}
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className="hover:text-red-600 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {stockFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0EB] text-[#18542a] font-semibold text-[11px] border border-[#C0D6C8]">
                Stock: {stockFilter.replace('_', ' ')}
                <button
                  type="button"
                  onClick={() => setStockFilter('all')}
                  className="hover:text-red-600 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priceFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0EB] text-[#18542a] font-semibold text-[11px] border border-[#C0D6C8]">
                Price: {priceFilter.replace('_', ' ')}
                <button
                  type="button"
                  onClick={() => setPriceFilter('all')}
                  className="hover:text-red-600 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {brandFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0EB] text-[#18542a] font-semibold text-[11px] border border-[#C0D6C8]">
                Brand: {brandFilter}
                <button
                  type="button"
                  onClick={() => setBrandFilter('all')}
                  className="hover:text-red-600 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sortBy !== 'updated' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0EB] text-[#18542a] font-semibold text-[11px] border border-[#C0D6C8]">
                Sorted: {sortBy.replace('_', ' ')}
                <button
                  type="button"
                  onClick={() => setSortBy('updated')}
                  className="hover:text-red-600 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-[11px] text-[#d52518] font-bold hover:underline cursor-pointer ml-1"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Active Filters & Bulk Selection Indicator */}
        {(selectedIds.length > 0 || searchTerm || categoryFilter !== 'all' || stockFilter !== 'all') && (
          <div className="pt-2 border-t border-[#dfd5bf]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-[#E8F0EB] text-[#18542a] font-semibold">
                  {selectedIds.length} selected
                </span>
              )}
              {selectedIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      addMultipleProductsToStorefront(selectedIds);
                      showToast(`Added ${selectedIds.length} products to live customer storefront.`, 'success', 'Bulk Storefront Added');
                    }}
                  >
                    + Add to Store
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      removeMultipleProductsFromStorefront(selectedIds);
                      showToast(`Removed ${selectedIds.length} products from customer storefront.`, 'info', 'Bulk Storefront Removed');
                    }}
                  >
                    ✕ Remove from Store
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      bulkUpdateProductStatus(selectedIds, 'Active');
                      showToast(`Marked ${selectedIds.length} products Active.`, 'success');
                    }}
                  >
                    Set Active
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                  >
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[#5a6e54]">
              <span>Showing {filteredProducts.length} of {products.length} products</span>
              {(searchTerm || categoryFilter !== 'all' || stockFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setStockFilter('all');
                  }}
                  className="text-[#18542a] font-semibold hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Product Table */}
      <Card padding="none" className="overflow-hidden">
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="No Products Found"
            description="No items match your active search terms and filter criteria. You can clear filters or add a new organic product."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStockFilter('all');
            }}
            secondaryActionText="Add Product"
            onSecondaryAction={handleOpenAddModal}
          />
        ) : (
          <>
            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#faf5ea] text-xs font-semibold text-[#5a6e54] border-b border-[#dfd5bf]">
                  <tr>
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length > 0 &&
                          selectedIds.length === filteredProducts.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a]"
                        aria-label="Select all products"
                      />
                    </th>
                    <th className="py-3 px-4 w-14">Image</th>
                    <th className="py-3 px-4">Product & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Storefront</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfd5bf]/60">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedIds.includes(p.id);
                    const isOnStore = isProductOnStorefront(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-[#faf5ea]/70 transition-colors ${
                          isSelected ? 'bg-[#E8F0EB]/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(p.id)}
                            className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a]"
                            aria-label={`Select ${p.name}`}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#dfd5bf] shrink-0"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <p
                              onClick={() => setViewingProduct(p)}
                              className="font-medium text-[#103b1d] hover:text-[#18542a] cursor-pointer"
                            >
                              {p.name}
                            </p>
                            {isOnStore && (
                              <span
                                title="Active on Storefront"
                                className="text-[10px] px-1.5 py-0.2 rounded bg-[#E8F0EB] text-[#18542a] border border-[#C0D6C8] font-bold"
                              >
                                Live
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#5a6e54] font-mono mt-0.5">
                            {p.sku} • {p.unit}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#5a6e54] whitespace-nowrap">
                          {p.categoryName}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-[#103b1d] tabular-nums">
                            {formatINR(p.price)}
                          </span>
                          {p.compareAtPrice && (
                            <span className="text-[11px] text-[#5a6e54] line-through ml-1.5 tabular-nums">
                              {formatINR(p.compareAtPrice)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                p.stock === 0
                                  ? 'bg-[#d52518]'
                                  : p.stock <= 15
                                  ? 'bg-[#f96015]'
                                  : 'bg-[#18542a]'
                              }`}
                            />
                            <span className="text-xs font-medium tabular-nums text-[#103b1d]">
                              {p.stock} units
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge status={p.status} size="sm">
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {isOnStore ? (
                            <button
                              onClick={() => {
                                removeProductFromStorefront(p.id);
                                showToast(
                                  `Removed "${p.name}" from customer storefront.`,
                                  'info',
                                  'Removed from Store'
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F0EB] text-[#18542a] hover:bg-[#FDEEED] hover:text-[#d52518] border border-[#C0D6C8] transition-colors cursor-pointer group"
                              title="Active on storefront. Click to remove."
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#18542a] group-hover:hidden" />
                              <Trash2 className="w-3.5 h-3.5 text-[#d52518] hidden group-hover:inline" />
                              <span className="group-hover:hidden">On Store</span>
                              <span className="hidden group-hover:inline">Remove</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                addProductToStorefront(p.id);
                                showToast(
                                  `Added "${p.name}" to live customer storefront!`,
                                  'success',
                                  'Added to Store'
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#faf5ea] text-[#5a6e54] hover:bg-[#E8F0EB] hover:text-[#18542a] border border-[#dfd5bf] transition-colors cursor-pointer"
                              title="Click to publish to customer storefront"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Store</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingProduct(p)}
                              title="View product details"
                              className="p-1.5 rounded-lg text-[#5a6e54] hover:text-[#18542a] hover:bg-[#E8F0EB] transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              title="Edit product"
                              className="p-1.5 rounded-lg text-[#5a6e54] hover:text-[#18542a] hover:bg-[#E8F0EB] transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(p.id)}
                              title="Duplicate product"
                              className="p-1.5 rounded-lg text-[#5a6e54] hover:text-[#18542a] hover:bg-[#E8F0EB] transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(p.id)}
                              title="Delete product"
                              className="p-1.5 rounded-lg text-[#5a6e54] hover:text-[#d52518] hover:bg-[#FDEEED] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (renders on phones and narrow viewports) */}
            <div className="md:hidden divide-y divide-[#dfd5bf]/70">
              {filteredProducts.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                const isOnStore = isProductOnStorefront(p.id);
                return (
                  <div
                    key={p.id}
                    className={`p-4 space-y-3 transition-colors ${
                      isSelected ? 'bg-[#E8F0EB]/30' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(p.id)}
                        className="mt-1 rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a]"
                      />

                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        onClick={() => setViewingProduct(p)}
                        className="w-16 h-16 rounded-xl object-cover border border-[#dfd5bf] shrink-0 cursor-pointer"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            onClick={() => setViewingProduct(p)}
                            className="text-xs sm:text-sm font-bold text-[#103b1d] truncate cursor-pointer"
                          >
                            {p.name}
                          </h4>
                          {isOnStore && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#E8F0EB] text-[#18542a] border border-[#C0D6C8]">
                              Live on Store
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#5a6e54] font-mono mt-0.5">
                          {p.sku} • {p.unit}
                        </p>

                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs font-bold text-[#103b1d] tabular-nums">
                            {formatINR(p.price)}
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              p.stock <= 15 ? 'text-[#f96015]' : 'text-[#18542a]'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Action Buttons Bar */}
                    <div className="pt-2 border-t border-[#dfd5bf]/60 flex items-center justify-between gap-2">
                      {isOnStore ? (
                        <button
                          onClick={() => {
                            removeProductFromStorefront(p.id);
                            showToast(
                              `Removed "${p.name}" from customer storefront.`,
                              'info',
                              'Removed from Store'
                            );
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-[#FDEEED] text-[#d52518] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove from Store</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            addProductToStorefront(p.id);
                            showToast(
                              `Added "${p.name}" to customer storefront!`,
                              'success',
                              'Added to Store'
                            );
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-[#E8F0EB] text-[#18542a] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Store</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-[#5a6e54] hover:bg-[#faf5ea] hover:text-[#18542a] border border-[#dfd5bf]"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(p.id)}
                          className="p-1.5 rounded-lg text-[#5a6e54] hover:bg-[#FDEEED] hover:text-[#d52518] border border-[#dfd5bf]"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        description={
          editingProduct
            ? `Update fields for ${editingProduct.sku}`
            : 'Fill in product catalog information to display on store.'
        }
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFormSubmit}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Row 1: Name and SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Organic BPT Sona Masoori Raw Rice"
                className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#18542a] ${
                  formErrors.name ? 'border-[#d52518]' : 'border-[#dfd5bf]'
                }`}
              />
              {formErrors.name && (
                <p className="text-[11px] text-[#d52518] mt-0.5">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. GOF-RIC-001"
                className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[#18542a] ${
                  formErrors.sku ? 'border-[#d52518]' : 'border-[#dfd5bf]'
                }`}
              />
              {formErrors.sku && (
                <p className="text-[11px] text-[#d52518] mt-0.5">{formErrors.sku}</p>
              )}
            </div>
          </div>

          {/* Row 2: Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white focus:ring-1 focus:ring-[#18542a]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                Unit / Package Weight
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. 1 kg, 500 ml, 5 kg"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white focus:ring-1 focus:ring-[#18542a]"
              />
            </div>
          </div>

          {/* Row 3: Pricing and Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="360"
                className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#18542a] ${
                  formErrors.price ? 'border-[#d52518]' : 'border-[#dfd5bf]'
                }`}
              />
              {formErrors.price && (
                <p className="text-[11px] text-[#d52518] mt-0.5">{formErrors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                Compare-at Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.compareAtPrice}
                onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                placeholder="420"
                className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#18542a] ${
                  formErrors.compareAtPrice ? 'border-[#d52518]' : 'border-[#dfd5bf]'
                }`}
              />
              {formErrors.compareAtPrice && (
                <p className="text-[11px] text-[#d52518] mt-0.5">{formErrors.compareAtPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#18542a] ${
                  formErrors.stock ? 'border-[#d52518]' : 'border-[#dfd5bf]'
                }`}
              />
              {formErrors.stock && (
                <p className="text-[11px] text-[#d52518] mt-0.5">{formErrors.stock}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#103b1d] mb-1">
              Short Description / Traditional Notes
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe farming method, aroma, health benefits..."
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white focus:ring-1 focus:ring-[#18542a]"
            />
          </div>

          {/* Harvest Location */}
          <div>
            <label className="block text-xs font-semibold text-[#103b1d] mb-1">
              Harvest Location / Mandi
            </label>
            <input
              type="text"
              value={formData.harvestLocation}
              onChange={(e) => setFormData({ ...formData, harvestLocation: e.target.value })}
              placeholder="e.g. Tanuku, West Godavari"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white focus:ring-1 focus:ring-[#18542a]"
            />
          </div>

          {/* Multi-Image Management: Primary & Secondary Labels */}
          <div className="space-y-3 p-3 bg-[#faf5ea] rounded-xl border border-[#dfd5bf]">
            <div>
              <label className="block text-xs font-bold text-[#103b1d] mb-1">
                1. Primary Front Image (Pack / Bottle)
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={formData.imageUrl}
                  alt="Primary Preview"
                  className="w-14 h-14 rounded-xl object-contain bg-white border border-[#dfd5bf] shrink-0 p-1"
                />
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://... or upload local image"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#dfd5bf] bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-[#18542a] hover:underline cursor-pointer flex items-center gap-1">
                      <UploadCloud className="w-3.5 h-3.5" /> Upload Front Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#dfd5bf]/60">
              <label className="block text-xs font-bold text-[#103b1d] mb-1">
                2. Secondary Image (Back / Nutrition Label / Farm Process)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white border border-[#dfd5bf] shrink-0 p-1 flex items-center justify-center overflow-hidden">
                  {formData.secondaryImageUrl ? (
                    <img
                      src={formData.secondaryImageUrl}
                      alt="Secondary Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-[#5a6e54] text-center font-medium">No Image</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={formData.secondaryImageUrl}
                    onChange={(e) => setFormData({ ...formData, secondaryImageUrl: e.target.value })}
                    placeholder="Optional: Nutrition label or reverse angle URL"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#dfd5bf] bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-[#18542a] hover:underline cursor-pointer flex items-center gap-1">
                      <UploadCloud className="w-3.5 h-3.5" /> Upload Back / Label Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSecondaryImageFileChange}
                        className="hidden"
                      />
                    </label>
                    {formData.secondaryImageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, secondaryImageUrl: '' }))}
                        className="text-[11px] text-[#d52518] hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Featured Flag */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#dfd5bf]">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-[#103b1d]">Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                className="text-xs px-2.5 py-1 rounded-lg border border-[#dfd5bf] bg-white"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-[#103b1d] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a]"
              />
              <span>Feature on Storefront Homepage</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Product Detail Drawer */}
      {viewingProduct && (
        <Drawer
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          title={viewingProduct.name}
          subtitle={`SKU: ${viewingProduct.sku}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleOpenEditModal(viewingProduct);
                  setViewingProduct(null);
                }}
                icon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit Product
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingProduct(null)}
              >
                Close Drawer
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Main Preview Image */}
            <div className="rounded-2xl overflow-hidden border border-[#dfd5bf] bg-[#faf5ea]">
              <img
                src={viewingProduct.imageUrl}
                alt={viewingProduct.name}
                className="w-full h-56 object-cover"
              />
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#faf5ea] border border-[#dfd5bf]">
                <span className="text-[#5a6e54] block">Catalog Price</span>
                <span className="text-base font-bold text-[#103b1d] mt-0.5 block tabular-nums">
                  {formatINR(viewingProduct.price)}
                </span>
                {viewingProduct.compareAtPrice && (
                  <span className="text-[11px] text-[#5a6e54] line-through">
                    {formatINR(viewingProduct.compareAtPrice)}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#faf5ea] border border-[#dfd5bf]">
                <span className="text-[#5a6e54] block">Available Inventory</span>
                <span className="text-base font-bold text-[#103b1d] mt-0.5 block tabular-nums">
                  {viewingProduct.stock} units
                </span>
                <span className="text-[11px] text-[#18542a] font-medium">
                  {viewingProduct.salesCount} units ordered
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-[#5a6e54] uppercase tracking-wider block mb-1">
                  Category
                </span>
                <p className="text-sm font-medium text-[#103b1d]">{viewingProduct.categoryName}</p>
              </div>

              <div>
                <span className="font-semibold text-[#5a6e54] uppercase tracking-wider block mb-1">
                  Packaging Unit
                </span>
                <p className="text-sm text-[#103b1d]">{viewingProduct.unit}</p>
              </div>

              <div>
                <span className="font-semibold text-[#5a6e54] uppercase tracking-wider block mb-1">
                  Harvest Location
                </span>
                <p className="text-sm text-[#103b1d]">{viewingProduct.harvestLocation || 'Godavari Delta Organic Belt'}</p>
              </div>

              <div>
                <span className="font-semibold text-[#5a6e54] uppercase tracking-wider block mb-1">
                  Description
                </span>
                <p className="text-xs text-[#5a6e54] leading-relaxed bg-[#faf5ea] p-3 rounded-xl border border-[#dfd5bf]">
                  {viewingProduct.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product?"
        message="Are you sure you want to remove this product from the mock catalog? This client-side change will update your dashboard metrics."
        confirmText="Delete Product"
        variant="danger"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Selected Products?"
        message={`Are you sure you want to delete ${selectedIds.length} products? This action will remove them from the mock list.`}
        confirmText={`Delete ${selectedIds.length} Products`}
        variant="danger"
      />

      {/* CREATE CATEGORY MODAL */}
      <Modal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        title="Create New Category"
        description="Add a new category to organize and filter your farm products."
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="secondary" onClick={() => setIsAddCategoryOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateCategory}>
              Create Category
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#103b1d] mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => {
                const val = e.target.value;
                setNewCategoryName(val);
                setNewCategorySlug(slugifyCategory(val));
              }}
              placeholder="e.g. Natural Sweeteners, Wood-Pressed Oils"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-semibold focus:ring-1 focus:ring-[#18542a]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#103b1d]">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-bold text-[#18542a] bg-[#e8f0eb] px-2 py-0.5 rounded-full border border-[#c0d6c8]">
                Auto-generated
              </span>
            </div>
            <div className="flex items-center rounded-xl border border-[#dfd5bf] bg-white overflow-hidden">
              <span className="text-xs text-[#5a6e54] px-3 bg-[#faf5ea] border-r border-[#dfd5bf] py-2 shrink-0 font-mono">
                /collections/
              </span>
              <input
                type="text"
                value={newCategorySlug}
                onChange={(e) => setNewCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="auto-generated-slug"
                className="w-full text-xs sm:text-sm px-3 py-2 font-mono bg-white focus:outline-none text-[#103b1d]"
              />
            </div>
            <p className="text-[10px] text-[#5a6e54] mt-1">
              Store Link: <span className="text-[#18542a] font-mono">godavariorganic.in/collections/{newCategorySlug || 'category-slug'}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#103b1d] mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)}
              placeholder="e.g. Traditional natural palm jaggery, forest honey, and raw cane sugar"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white focus:ring-1 focus:ring-[#18542a]"
            />
          </div>
        </form>
      </Modal>

      {/* FILTER HARVEST 2-COLUMN MODAL (Matching User Screenshot) */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-[#faf5ea] rounded-3xl shadow-2xl border border-[#dfd5bf] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-harvest-title"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#dfd5bf] flex items-center justify-between bg-[#faf5ea]">
              <h3
                id="filter-harvest-title"
                className="text-lg sm:text-xl font-bold text-[#103b1d] font-heading tracking-tight"
              >
                Filter Harvest
              </h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#dfd5bf] hover:bg-[#dfd5bf] text-[#103b1d] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="flex-1 flex overflow-hidden min-h-[380px]">
              {/* Left Column: Navigation Tabs */}
              <div className="w-36 sm:w-40 bg-[#f3e8cc] border-r border-[#dfd5bf] py-2 flex flex-col shrink-0 select-none">
                {(
                  [
                    { id: 'sort', label: 'Sort' },
                    { id: 'tags', label: 'Tags' },
                    { id: 'type', label: 'Type' },
                    { id: 'brand', label: 'Brand' },
                    { id: 'price', label: 'Price' },
                    { id: 'ratings', label: 'Customer Ratings' },
                  ] as const
                ).map((tab) => {
                  const isActive = activeFilterTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFilterTab(tab.id)}
                      className={`w-full text-left px-5 py-3.5 text-xs sm:text-sm transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#faf5ea] text-[#103b1d] font-bold'
                          : 'text-[#5a6e54] hover:text-[#103b1d] hover:bg-[#dfd5bf]/60 font-medium'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Radio Options Panel */}
              <div className="flex-1 p-5 sm:p-6 bg-[#faf5ea] overflow-y-auto">
                {activeFilterTab === 'sort' && (
                  <div>
                    <h4 className="text-[11px] font-bold text-[#103b1d] tracking-wider uppercase mb-4">
                      SORT BY
                    </h4>
                    <div className="space-y-4">
                      {[
                        { id: 'updated', label: 'Relevance' },
                        { id: 'price_asc', label: 'Price (Low To High)' },
                        { id: 'price_desc', label: 'Price (High To Low)' },
                        { id: 'discount', label: 'Discount (High To Low)' },
                        { id: 'highest_rated', label: 'Highest Rated' },
                        { id: 'name', label: 'Product Name (A to Z)' },
                      ].map((opt) => {
                        const isSelected = draftSortBy === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setDraftSortBy(opt.id)}
                            className="flex items-center gap-3 w-full text-left py-1 cursor-pointer group"
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-2 border-[#103b1d]'
                                  : 'border-2 border-[#dfd5bf] group-hover:border-[#103b1d]'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#103b1d]" />
                              )}
                            </div>
                            <span
                              className={`text-xs sm:text-sm transition-colors ${
                                isSelected
                                  ? 'font-bold text-[#103b1d]'
                                  : 'font-medium text-[#18542a]'
                              }`}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeFilterTab === 'tags' && (
                  <div>
                    <h4 className="text-[11px] font-bold text-[#103b1d] tracking-wider uppercase mb-4">
                      HARVEST AVAILABILITY & TAGS
                    </h4>
                    <div className="space-y-4">
                      {[
                        { id: 'all', label: 'All Harvest Statuses' },
                        { id: 'in_stock', label: 'In Stock (>15 units)' },
                        { id: 'low_stock', label: 'Low Stock (1-15 units)' },
                        { id: 'out_of_stock', label: 'Out of Stock' },
                      ].map((opt) => {
                        const isSelected = draftStock === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setDraftStock(opt.id as any)}
                            className="flex items-center gap-3 w-full text-left py-1 cursor-pointer group"
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-2 border-[#103b1d]'
                                  : 'border-2 border-[#dfd5bf] group-hover:border-[#103b1d]'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#103b1d]" />
                              )}
                            </div>
                            <span
                              className={`text-xs sm:text-sm transition-colors ${
                                isSelected
                                  ? 'font-bold text-[#103b1d]'
                                  : 'font-medium text-[#18542a]'
                              }`}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeFilterTab === 'type' && (
                  <div>
                    <h4 className="text-[11px] font-bold text-[#103b1d] tracking-wider uppercase mb-4">
                      FARM CATEGORY & PRODUCT TYPE
                    </h4>
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => setDraftCategory('all')}
                        className="flex items-center gap-3 w-full text-left py-1 cursor-pointer group"
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            draftCategory === 'all'
                              ? 'border-2 border-[#103b1d]'
                              : 'border-2 border-[#dfd5bf] group-hover:border-[#103b1d]'
                          }`}
                        >
                          {draftCategory === 'all' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#103b1d]" />
                          )}
                        </div>
                        <span
                          className={`text-xs sm:text-sm transition-colors ${
                            draftCategory === 'all'
                              ? 'font-bold text-[#103b1d]'
                              : 'font-medium text-[#18542a]'
                          }`}
                        >
                          All Categories ({products.length})
                        </span>
                      </button>

                      {categories.map((c) => {
                        const isSelected = draftCategory === c.id;
                        const count = categoryCounts[c.id] || 0;
                        return (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => setDraftCategory(c.id)}
                            className="flex items-center gap-3 w-full text-left py-1 cursor-pointer group"
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-2 border-[#103b1d]'
                                  : 'border-2 border-[#dfd5bf] group-hover:border-[#103b1d]'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#103b1d]" />
                              )}
                            </div>
                            <span
                              className={`text-xs sm:text-sm transition-colors ${
                                isSelected
                                  ? 'font-bold text-[#103b1d]'
                                  : 'font-medium text-[#18542a]'
                              }`}
                            >
                              {c.name} ({count})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeFilterTab === 'brand' && (
                  <div>
                    <h4 className="text-[11px] font-bold text-[#103b1d] tracking-wider uppercase mb-4">
                      FARM LABEL & BRAND
                    </h4>
                    <div className="space-y-4">
                      {[
                        { id: 'all', label: 'All Labels' },
                        { id: 'Godavari Organics', label: 'Godavari Organics Direct' },
                        { id: 'Arma', label: 'Arma Organic Millets' },
                      ].map((opt) => {
                        const isSelected = draftBrand === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setDraftBrand(opt.id)}
                            className="flex items-center gap-3 w-full text-left py-1 cursor-pointer group"
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-2 border-[#103b1d]'
                                  : 'border-2 border-[#dfd5bf] group-hover:border-[#103b1d]'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#103b1d]" />
                              )}
                            </div>
                            <span
                              className={`text-xs sm:text-sm transition-colors ${
                                isSelected
                                  ? 'font-bold text-[#103b1d]'
                                  : 'font-medium text-[#18542a]'
                              }`}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeFilterTab === 'price' && (
                  <div>
                    <h4 className="text-[11px] font-bold text-[#103b1d] tracking-wider uppercase mb-4">
                      PRICE RANGE
                    </h4>
                    <div className="space-y-4">
                      {[
                        { id: 'all', label: 'All Prices' },
                        { id: 'under_250', label: 'Under ₹250' },
                        { id: '250_500', label: 'Price (₹250 To ₹500)' },
                        { id: '500_1000', label: 'Price (₹500 To ₹1,000)' },
                        { id: 'above_1000', label: 'Above ₹1,000' },
                      ].map((opt) => {
                        const isSelected = draftPrice === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setDraftPrice(opt.id)}
                            className="flex items-center gap-3 w-full text-left py-1 cursor-pointer group"
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-2 border-[#103b1d]'
                                  : 'border-2 border-[#dfd5bf] group-hover:border-[#103b1d]'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#103b1d]" />
                              )}
                            </div>
                            <span
                              className={`text-xs sm:text-sm transition-colors ${
                                isSelected
                                  ? 'font-bold text-[#103b1d]'
                                  : 'font-medium text-[#18542a]'
                              }`}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeFilterTab === 'ratings' && (
                  <div>
                    <h4 className="text-[11px] font-bold text-[#103b1d] tracking-wider uppercase mb-4">
                      CUSTOMER RATINGS & POPULARITY
                    </h4>
                    <div className="space-y-4">
                      {[
                        { id: 'all', label: 'All Customer Ratings' },
                        { id: '4_5_above', label: '4.5★ & Above (Top Rated)' },
                        { id: '4_above', label: '4.0★ & Above (Popular)' },
                      ].map((opt) => {
                        const isSelected = draftRating === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setDraftRating(opt.id)}
                            className="flex items-center gap-3 w-full text-left py-1 cursor-pointer group"
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-2 border-[#103b1d]'
                                  : 'border-2 border-[#dfd5bf] group-hover:border-[#103b1d]'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#103b1d]" />
                              )}
                            </div>
                            <span
                              className={`text-xs sm:text-sm transition-colors ${
                                isSelected
                                  ? 'font-bold text-[#103b1d]'
                                  : 'font-medium text-[#18542a]'
                              }`}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer (Clear Filters left, Apply button right) */}
            <div className="px-6 py-4 border-t border-[#dfd5bf] flex items-center justify-between bg-[#faf5ea]">
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs sm:text-sm font-bold text-[#103b1d] underline underline-offset-4 hover:opacity-75 transition-opacity cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-8 py-2.5 rounded-full bg-[#103b1d] text-white text-xs sm:text-sm font-bold hover:bg-[#103b1d] transition-colors shadow-sm cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
