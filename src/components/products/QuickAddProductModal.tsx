import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { ProductStatus } from '../../types';
import { Plus, UploadCloud, Sparkles } from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Rice & Grains', url: '/products/rice/01_Organic_Red_Rice_Product.webp' },
  { label: 'Cold-Pressed Oils', url: '/products/oils/01_Cold_Pressed_Groundnut_Oil.webp' },
  { label: 'Millets & Superfoods', url: '/products/millets/01_Foxtail_Millet_Korralu_Product.webp' },
  { label: 'Organic Spices', url: '/categories/spices.webp' },
  { label: 'Desi Cow Ghee', url: '/categories/desi_cow_ghee.webp' },
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
          <div className="w-8 h-8 rounded-lg bg-[#18542a] text-[#ffc926] flex items-center justify-center shadow-xs">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#103b1d] font-heading">
              Add New Product to Store
            </h3>
            <p className="text-xs text-[#5a6e54] font-normal">
              Create product in catalog & choose whether to push to live storefront
            </p>
          </div>
        </div>
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#5a6e54]">
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
            <label className="block text-xs font-bold text-[#103b1d] mb-1">
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
              className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white text-[#103b1d] focus:ring-1 focus:ring-[#18542a] font-medium ${
                errors.name ? 'border-[#d52518]' : 'border-[#dfd5bf]'
              }`}
            />
            {errors.name && <p className="text-[11px] text-[#d52518] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#103b1d] mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] focus:ring-1 focus:ring-[#18542a] font-medium"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#103b1d] mb-1">
              SKU Identifier *
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] font-mono focus:ring-1 focus:ring-[#18542a]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#103b1d] mb-1">
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
              className={`w-full text-xs sm:text-sm px-3 py-2 rounded-xl border bg-white text-[#103b1d] tabular-nums focus:ring-1 focus:ring-[#18542a] font-bold ${
                errors.price ? 'border-[#d52518]' : 'border-[#dfd5bf]'
              }`}
            />
            {errors.price && <p className="text-[11px] text-[#d52518] mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#103b1d] mb-1">
              Compare-at Price (₹)
            </label>
            <input
              type="number"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="e.g. 350 (optional strikethrough)"
              min="0"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] tabular-nums focus:ring-1 focus:ring-[#18542a]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#103b1d] mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] tabular-nums focus:ring-1 focus:ring-[#18542a] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#103b1d] mb-1">
              Unit / Weight
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. 1 kg, 500 g, 1 Litre"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white text-[#103b1d] focus:ring-1 focus:ring-[#18542a]"
            />
          </div>
        </div>

        {/* Storefront Connection Toggle */}
        <div className="p-3.5 rounded-xl bg-[#faf5ea] border border-[#c0d6c8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f0eb] text-[#18542a] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#f96015]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#103b1d]">
                Publish directly to Storefront (Featured Harvest)
              </p>
              <p className="text-[11px] text-[#5a6e54]">
                Immediately displays this product on the Godavari Organics homepage
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={publishToStorefront}
            onChange={(e) => setPublishToStorefront(e.target.checked)}
            className="w-4.5 h-4.5 rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] cursor-pointer"
          />
        </div>

        {/* Image Presets & Upload */}
        <div>
          <label className="block text-xs font-bold text-[#103b1d] mb-1.5">
            Product Thumbnail
          </label>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-b from-[#faf6ee] to-[#f4ede0]/60 p-1 border border-[#dfd5bf] flex items-center justify-center shrink-0">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-[10px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      imageUrl === preset.url
                        ? 'bg-[#e8f0eb] text-[#18542a] border-[#18542a] font-bold'
                        : 'bg-white text-[#5a6e54] border-[#dfd5bf] hover:bg-[#faf5ea]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <label className="inline-flex items-center gap-1.5 text-xs text-[#18542a] font-bold hover:underline cursor-pointer">
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
