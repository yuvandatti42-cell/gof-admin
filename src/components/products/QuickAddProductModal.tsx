import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { ProductStatus } from '../../types';
import { Plus, UploadCloud, Sparkles } from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Rice & Grains', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Cold-Pressed Oils', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Millets & Superfoods', url: 'https://images.unsplash.com/photo-1607672632458-9eb56696346b?auto=format&fit=crop&w=600&q=80' },
  { label: 'Organic Spices', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Desi Cow Ghee', url: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=600&q=80' },
  { label: 'Pure Forest Honey', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' },
];

export const QuickAddProductModal: React.FC = () => {
  const {
    categories,
    addProduct,
    addProductToStorefront,
    isQuickAddModalOpen,
    setQuickAddModalOpen,
  } = useAdmin();

  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [sku, setSku] = useState(() => `GOF-${Math.floor(100 + Math.random() * 900)}`);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('50');
  const [unit, setUnit] = useState('1 kg');
  const [status, setStatus] = useState<ProductStatus>('Active');
  const [publishToStorefront, setPublishToStorefront] = useState(true);
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size exceeds 2MB limit for local preview.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        showToast('Local image preview loaded.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName('');
    setSku(`GOF-${Math.floor(100 + Math.random() * 900)}`);
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice('');
    setCompareAtPrice('');
    setStock('50');
    setUnit('1 kg');
    setStatus('Active');
    setPublishToStorefront(true);
    setImageUrl(PRESET_IMAGES[0].url);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!sku.trim()) newErrors.sku = 'SKU is required';
    if (!price || Number(price) <= 0) newErrors.price = 'Valid price is required (> 0)';
    if (compareAtPrice && Number(compareAtPrice) < Number(price)) {
      newErrors.compareAtPrice = 'Compare-at price cannot be lower than selling price';
    }
    if (stock === '' || Number(stock) < 0) {
      newErrors.stock = 'Valid stock is required (>= 0)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const categoryObj = categories.find((c) => c.id === categoryId);
    const categoryName = categoryObj ? categoryObj.name : 'General Organics';

    const createdProduct = addProduct({
      name: name.trim(),
      sku: sku.trim(),
      categoryId,
      categoryName,
      description: description.trim() || 'Organically cultivated in the fertile Godavari river delta with chemical-free natural farming.',
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      stock: Number(stock),
      unit: unit.trim() || '1 kg',
      status: Number(stock) === 0 ? 'Out of Stock' : status,
      featured: publishToStorefront,
      imageUrl,
      harvestLocation: 'Godavari Basin Farms',
    });

    if (publishToStorefront) {
      addProductToStorefront(createdProduct.id);
    }

    showToast(
      `Product "${createdProduct.name}" created successfully${
        publishToStorefront ? ' and published to live storefront' : ''
      }!`,
      'success',
      'Product Created'
    );

    resetForm();
    setQuickAddModalOpen(false);
  };

  return (
    <Modal
      isOpen={isQuickAddModalOpen}
      onClose={() => {
        resetForm();
        setQuickAddModalOpen(false);
      }}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#245C3A] text-white flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#173D2A] font-heading">
              Add New Product to Store
            </h3>
            <p className="text-xs text-[#737B72] font-normal">
              Create product in catalog & choose whether to push to live storefront
            </p>
          </div>
        </div>
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#737B72]">
            Ready for future API/backend integration
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                resetForm();
                setQuickAddModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Product
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#202820] mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Organic Foxtail Millet (Navane)"
              className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white text-[#202820] focus:ring-1 focus:ring-[#245C3A] ${
                errors.name ? 'border-[#B64238]' : 'border-[#E5E8DF]'
              }`}
            />
            {errors.name && <p className="text-[11px] text-[#B64238] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202820] mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white text-[#202820] focus:ring-1 focus:ring-[#245C3A]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202820] mb-1">
              SKU Identifier *
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white text-[#202820] font-mono focus:ring-1 focus:ring-[#245C3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202820] mb-1">
              Price (₹) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
              }}
              placeholder="e.g. 299"
              min="0"
              className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white text-[#202820] tabular-nums focus:ring-1 focus:ring-[#245C3A] ${
                errors.price ? 'border-[#B64238]' : 'border-[#E5E8DF]'
              }`}
            />
            {errors.price && <p className="text-[11px] text-[#B64238] mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202820] mb-1">
              Compare-at Price (₹)
            </label>
            <input
              type="number"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="e.g. 350 (optional strikethrough)"
              min="0"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white text-[#202820] tabular-nums focus:ring-1 focus:ring-[#245C3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202820] mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white text-[#202820] tabular-nums focus:ring-1 focus:ring-[#245C3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202820] mb-1">
              Unit / Weight
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. 1 kg, 500 g, 1 Litre"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white text-[#202820] focus:ring-1 focus:ring-[#245C3A]"
            />
          </div>
        </div>

        {/* Storefront Connection Toggle */}
        <div className="p-3 rounded-xl bg-[#FAF9F4] border border-[#C0D6C8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F0EB] text-[#245C3A] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#173D2A]">
                Publish directly to Storefront (Featured Harvest)
              </p>
              <p className="text-[11px] text-[#737B72]">
                Immediately displays this product on the Godavari Organics homepage
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={publishToStorefront}
            onChange={(e) => setPublishToStorefront(e.target.checked)}
            className="w-4 h-4 rounded border-[#E5E8DF] text-[#245C3A] focus:ring-[#245C3A] cursor-pointer"
          />
        </div>

        {/* Image Presets & Upload */}
        <div>
          <label className="block text-xs font-semibold text-[#202820] mb-1.5">
            Product Thumbnail
          </label>
          <div className="flex items-center gap-3">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-16 h-16 rounded-xl object-cover border border-[#E5E8DF] shrink-0"
            />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                      imageUrl === preset.url
                        ? 'bg-[#E8F0EB] text-[#245C3A] border-[#245C3A] font-bold'
                        : 'bg-white text-[#737B72] border-[#E5E8DF] hover:bg-[#FAF9F4]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <label className="inline-flex items-center gap-1.5 text-xs text-[#245C3A] hover:underline cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload custom image preview</span>
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
      </form>
    </Modal>
  );
};
