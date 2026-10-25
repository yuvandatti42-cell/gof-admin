import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import type { Category, CategoryVisibility } from '../types';
import {
  Layers,
  Search,
  Plus,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Package,
  UploadCloud,
} from 'lucide-react';


export const CategoriesPage: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useAdmin();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'Visible' | 'Hidden'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const initialForm = {
    name: '',
    slug: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    visibility: 'Visible' as CategoryVisibility,
  };
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derive dynamic product count for each category
  const productCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1;
    });
    return map;
  }, [products]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData(initialForm);
    setErrors({});
    setIsModalOpen(true);
  };

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
        showToast('Local category image preview loaded.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl || '',
      visibility: cat.visibility,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Auto-slug generator
  const handleNameChange = (name: string) => {
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generatedSlug,
    }));
  };

  // Submit Category
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl,
        visibility: formData.visibility,
      });
      showToast(`Category "${formData.name}" updated.`, 'success', 'Category Updated');
    } else {
      addCategory({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl,
        visibility: formData.visibility,
        displayOrder: categories.length + 1,
      });
      showToast(`Category "${formData.name}" created.`, 'success', 'Category Created');
    }

    setIsModalOpen(false);
  };

  // Delete Category
  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      const cat = categories.find((c) => c.id === deleteTargetId);
      deleteCategory(deleteTargetId);
      showToast(`Category "${cat?.name || ''}" removed.`, 'info', 'Category Deleted');
      setDeleteTargetId(null);
    }
  };

  // Filter pipeline
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q);

      const matchesVisibility =
        visibilityFilter === 'all' || c.visibility === visibilityFilter;

      return matchesSearch && matchesVisibility;
    });
  }, [categories, searchTerm, visibilityFilter]);

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] font-heading">
            Store Categories
          </h2>
          <p className="text-xs sm:text-sm text-[#737B72] mt-0.5">
            Organize organic food collections, navigational taxonomies, and storefront groupings.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add Category
        </Button>
      </div>

      {/* Filter Strip */}
      <Card padding="sm" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#737B72] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category name, description, or slug..."
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-[#E5E8DF] bg-white text-[#202820] placeholder-[#737B72] focus:outline-none focus:ring-1 focus:ring-[#245C3A]"
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
            {/* Visibility Filter */}
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as any)}
              className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-[#E5E8DF] bg-white text-[#202820]"
            >
              <option value="all">All Visibility</option>
              <option value="Visible">Visible ({categories.filter((c) => c.visibility === 'Visible').length})</option>
              <option value="Hidden">Hidden ({categories.filter((c) => c.visibility === 'Hidden').length})</option>
            </select>

            {/* Grid vs List toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#FAF9F4] border border-[#E5E8DF]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#245C3A] shadow-xs'
                    : 'text-[#737B72] hover:text-[#202820]'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-[#245C3A] shadow-xs'
                    : 'text-[#737B72] hover:text-[#202820]'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Display: Grid or List */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-7 h-7 text-[#245C3A]" />}
          title="No Categories Found"
          description="No categories match your search filters. Add a new category or reset your search term."
          actionText="Clear Filter"
          onAction={() => setSearchTerm('')}
          secondaryActionText="Create Category"
          onSecondaryAction={handleOpenAdd}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCategories.map((cat) => {
            const count = productCountMap[cat.id] || 0;
            return (
              <Card
                key={cat.id}
                padding="none"
                className="overflow-hidden flex flex-col group hover:border-[#6F9F62] transition-colors"
              >
                {/* Image Header */}
                <div className="relative h-36 bg-[#FAF9F4] overflow-hidden">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant={cat.visibility === 'Visible' ? 'success' : 'neutral'} size="sm">
                      {cat.visibility}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[#173D2A] group-hover:text-[#245C3A] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-mono text-[#737B72] mt-0.5">
                      /{cat.slug}
                    </p>
                    <p className="text-xs text-[#737B72] mt-2 line-clamp-2 leading-relaxed">
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5E8DF]/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#245C3A] flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      {count} {count === 1 ? 'product' : 'products'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-lg text-[#737B72] hover:text-[#245C3A] hover:bg-[#E8F0EB] transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(cat.id)}
                        className="p-1.5 rounded-lg text-[#737B72] hover:text-[#B64238] hover:bg-[#FDEEED] transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9F4] text-xs font-semibold text-[#737B72] border-b border-[#E5E8DF]">
                <tr>
                  <th className="py-3 px-4 w-16">Image</th>
                  <th className="py-3 px-4">Category Name & Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8DF]/60">
                {filteredCategories.map((cat) => {
                  const count = productCountMap[cat.id] || 0;
                  return (
                    <tr key={cat.id} className="hover:bg-[#FAF9F4]/70 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#E5E8DF]"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#173D2A]">{cat.name}</p>
                        <p className="text-[11px] font-mono text-[#737B72]">/{cat.slug}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#737B72] max-w-xs truncate">
                        {cat.description}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#E8F0EB] text-[#245C3A]">
                          {count} items
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant={cat.visibility === 'Visible' ? 'success' : 'neutral'} size="sm">
                          {cat.visibility}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 rounded-lg text-[#737B72] hover:text-[#245C3A] hover:bg-[#E8F0EB] transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(cat.id)}
                            className="p-1.5 rounded-lg text-[#737B72] hover:text-[#B64238] hover:bg-[#FDEEED] transition-colors"
                            title="Delete"
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
        </Card>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        description="Organize your organic foods into clear storefront collections."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#173D2A] mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Cold-Pressed Wood Oils"
              className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#245C3A] ${
                errors.name ? 'border-[#B64238]' : 'border-[#E5E8DF]'
              }`}
            />
            {errors.name && <p className="text-[11px] text-[#B64238] mt-0.5">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#173D2A] mb-1">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-[#E5E8DF] bg-white overflow-hidden">
              <span className="text-xs text-[#737B72] px-3 bg-[#FAF9F4] border-r border-[#E5E8DF] py-2">
                /collections/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 font-mono bg-white focus:outline-none"
              />
            </div>
            {errors.slug && <p className="text-[11px] text-[#B64238] mt-0.5">{errors.slug}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#173D2A] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain harvest sources, natural processing, or culinary tips..."
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white focus:ring-1 focus:ring-[#245C3A]"
            />
          </div>

          <div className="space-y-2 p-3 bg-[#FAF9F4] rounded-xl border border-[#E5E8DF]">
            <label className="block text-xs font-bold text-[#173D2A]">
              Category Cover Image
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-white border border-[#E5E8DF] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Category Preview"
                    className="w-full h-full object-contain filter drop-shadow-xs"
                  />
                ) : (
                  <span className="text-[10px] text-[#737B72]">No Image</span>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/categories/oil.png or https://..."
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#E5E8DF] bg-white"
                />
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-[#245C3A] hover:underline cursor-pointer flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" /> Upload Local Image
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
            {/* Quick Category Image Presets */}
            <div className="pt-1 flex flex-wrap gap-1.5">
              {[
                { name: 'Oils', url: '/categories/oil.png' },
                { name: 'Rice', url: '/categories/rice.png' },
                { name: 'Millets', url: '/categories/millet.png' },
                { name: 'Spices', url: '/categories/spices.png' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => setFormData({ ...formData, imageUrl: p.url })}
                  className="text-[10px] px-2 py-0.5 rounded-md border border-[#E5E8DF] bg-white text-[#245C3A] font-semibold hover:border-[#245C3A]"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="text-xs font-semibold text-[#173D2A]">Visibility:</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as CategoryVisibility })}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E8DF] bg-white"
            >
              <option value="Visible">Visible on store</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category?"
        message="Are you sure you want to delete this category? Products in this category will not be deleted, but will become uncategorized."
        confirmText="Delete Category"
        variant="danger"
      />
    </div>
  );
};
