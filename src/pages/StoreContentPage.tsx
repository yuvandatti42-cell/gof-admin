import React, { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import type { HeroSlide } from '../types';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Link as LinkIcon,
} from 'lucide-react';

// Sample banner images for quick 1-click testing
const QUICK_SAMPLE_IMAGES = [
  {
    name: 'Millet Power Banner',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cold-Pressed Oils Banner',
    url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Vedic A2 Ghee Banner',
    url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Heritage Rice Banner',
    url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Organic Spices Banner',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80',
  },
];

export const StoreContentPage: React.FC = () => {
  const {
    storeContent,
    addHeroSlide,
    deleteHeroSlide,
    reorderHeroSlides,
    setLiveStorefrontOpen,
  } = useAdmin();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Current slides
  const slides = storeContent.heroSlides || [];

  // Form input for adding a new image
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Active slide in preview carousel
  const [previewIndex, setPreviewIndex] = useState(0);

  // Delete confirmation
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Image size should be less than 3MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrlInput(result);
        setImagePreview(result);
        showToast('Image loaded! Tap "Add Slide Image" to save.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Add slide image
  const handleAddSlide = (e: React.FormEvent) => {
    e.preventDefault();
    const url = imageUrlInput.trim();
    if (!url) {
      showToast('Please enter an image URL or choose a file from your device.', 'error');
      return;
    }

    addHeroSlide({
      imageUrl: url,
      link: linkInput.trim() || '/collections/all-products',
      title: `Slide ${slides.length + 1}`,
      active: true,
    });

    setImageUrlInput('');
    setLinkInput('');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    showToast('Slide image added to Hero Section!', 'success');
  };

  // Quick preset sample click
  const handlePickSample = (url: string) => {
    setImageUrlInput(url);
    setImagePreview(url);
    showToast('Sample image selected. Tap "Add Slide Image" to add it.', 'info');
  };

  // Move slide up or down in order
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= slides.length) return;

    const updated = [...slides];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(target, 0, movedItem);

    reorderHeroSlides(updated);
    showToast('Slide order updated.', 'info');
  };

  // Confirm delete slide
  const handleConfirmDelete = () => {
    if (!slideToDelete) return;
    deleteHeroSlide(slideToDelete.id);
    showToast('Slide image removed.', 'info');
    setSlideToDelete(null);
    if (previewIndex >= slides.length - 1) {
      setPreviewIndex(Math.max(0, slides.length - 2));
    }
  };

  const currentPreviewSlide = slides[previewIndex] || slides[0] || null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] font-heading">
            Hero Section Images
          </h2>
          <p className="text-xs sm:text-sm text-[#737B72] mt-0.5">
            Add or remove slide images for your homepage hero slider.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setLiveStorefrontOpen(true)}
          icon={<Eye className="w-4 h-4 text-[#245C3A]" />}
        >
          View on Customer Store
        </Button>
      </div>

      {/* 1. SECTION: ADD HERO SLIDE IMAGE */}
      <Card>
        <div className="pb-3 border-b border-[#E5E8DF] mb-4">
          <h3 className="text-base font-bold text-[#173D2A] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#245C3A]" />
            Add New Hero Slide Image
          </h3>
          <p className="text-xs text-[#737B72] mt-0.5">
            Upload an image banner from your device or paste an image URL.
          </p>
        </div>

        <form onSubmit={handleAddSlide} className="space-y-4">
          {/* Upload Button or URL Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option A: Choose File */}
            <div className="p-4 rounded-xl border-2 border-dashed border-[#DDD6C5] bg-[#FAF9F4] flex flex-col items-center justify-center text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="hero-file-upload"
              />
              <label
                htmlFor="hero-file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#E5E8DF] flex items-center justify-center text-[#245C3A]">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#173D2A]">
                  Choose Image from Device
                </span>
                <span className="text-[11px] text-[#737B72]">
                  PNG, JPG, WEBP up to 3MB
                </span>
              </label>
            </div>

            {/* Option B: Paste Image URL */}
            <div className="space-y-3 flex flex-col justify-center">
              <div>
                <label className="block text-xs font-bold text-[#173D2A] mb-1">
                  Or Paste Image URL:
                </label>
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/banner-image.jpg"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white font-mono focus:ring-1 focus:ring-[#245C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173D2A] mb-1">
                  Click Redirect Link (Optional):
                </label>
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="/collections/organic-millets"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Instant Image Preview */}
          {imagePreview && (
            <div className="p-3 bg-[#FAF9F4] rounded-xl border border-[#E5E8DF]">
              <span className="text-xs font-bold text-[#173D2A] block mb-1.5">
                Image Preview:
              </span>
              <div className="relative rounded-lg overflow-hidden border border-[#DDD6C5] h-36 bg-neutral-900 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Slide preview"
                  className="w-full h-full object-cover"
                  onError={() => showToast('Image URL failed to load preview.', 'error')}
                />
              </div>
            </div>
          )}

          {/* Quick Sample Presets */}
          <div>
            <span className="text-[11px] font-bold text-[#737B72] block mb-1.5">
              Or pick a quick sample image:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handlePickSample(sample.url)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-[#E5E8DF] bg-white hover:bg-[#E8F0EB] text-[#245C3A] font-medium transition-colors cursor-pointer"
                >
                  🌾 {sample.name}
                </button>
              ))}
            </div>
          </div>

          {/* Add Slide Submit Button */}
          <div className="pt-2 flex justify-end">
            <Button
              variant="primary"
              type="submit"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Slide Image
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. SECTION: LIVE SLIDER PREVIEW */}
      {slides.length > 0 && currentPreviewSlide && (
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E8DF] mb-4">
            <div>
              <h3 className="text-base font-bold text-[#173D2A] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F7D4A] animate-pulse" />
                Live Slider Preview (Slide {previewIndex + 1} of {slides.length})
              </h3>
              <p className="text-xs text-[#737B72]">
                This is how the images slide on your customer storefront.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#DDD6C5] bg-[#FAF9F4] aspect-[16/9] max-h-[340px] flex items-center justify-center">
            {/* Banner Image */}
            <img
              src={currentPreviewSlide.imageUrl}
              alt="Current Slide"
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Left / Right Navigation */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all cursor-pointer z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all cursor-pointer z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Pagination Dots (Matching User's Screenshot) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewIndex(idx)}
                  className={`rounded-full transition-all cursor-pointer ${
                    previewIndex === idx
                      ? 'w-3 h-3 bg-white shadow-xs'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 3. SECTION: CURRENT SLIDE IMAGES (REMOVE / REORDER) */}
      <Card>
        <div className="pb-3 border-b border-[#E5E8DF] mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#173D2A]">
              Current Slide Images ({slides.length})
            </h3>
            <p className="text-xs text-[#737B72]">
              Tap "Remove" to delete an image, or use arrows to change the order.
            </p>
          </div>
        </div>

        {slides.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF9F4] rounded-xl border border-dashed border-[#DDD6C5]">
            <ImageIcon className="w-8 h-8 text-[#737B72] mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold text-[#173D2A]">No images in hero slider</p>
            <p className="text-[11px] text-[#737B72] mt-0.5">
              Add your first image above to show banners on the website.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="p-3 rounded-xl border border-[#E5E8DF] bg-white hover:border-[#6F9F62] transition-all flex flex-col justify-between shadow-2xs"
              >
                {/* Image Thumbnail */}
                <div className="relative rounded-lg overflow-hidden border border-[#DDD6C5] aspect-[16/9] bg-neutral-900 mb-3">
                  <img
                    src={slide.imageUrl}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-bold">
                    Slide #{index + 1}
                  </span>
                </div>

                {/* Link Info */}
                {slide.link && (
                  <p className="text-[11px] text-[#737B72] truncate mb-3 flex items-center gap-1 font-mono">
                    <LinkIcon className="w-3 h-3 text-[#245C3A] shrink-0" />
                    {slide.link}
                  </p>
                )}

                {/* Controls: Reorder & Remove */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E5E8DF]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg border border-[#E5E8DF] hover:bg-[#FAF9F4] text-[#173D2A] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(index, 'down')}
                      disabled={index === slides.length - 1}
                      className="p-1.5 rounded-lg border border-[#E5E8DF] hover:bg-[#FAF9F4] text-[#173D2A] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setSlideToDelete(slide)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!slideToDelete}
        onClose={() => setSlideToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Slide Image?"
        message="Are you sure you want to remove this image from the hero slider? It will no longer show on the customer storefront."
        confirmText="Remove Image"
        variant="danger"
      />
    </div>
  );
};
