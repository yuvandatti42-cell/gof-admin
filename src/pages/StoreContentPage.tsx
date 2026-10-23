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
  const [uploadTab, setUploadTab] = useState<'upload' | 'url'>('upload');
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
    setUploadTab('url');
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

      {/* 1. SECTION: ADD HERO SLIDE IMAGE (COMPACT & ALIGNED) */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E8DF] mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#173D2A] flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#245C3A]" />
              Add New Hero Slide Image
            </h3>
            <p className="text-[11px] sm:text-xs text-[#737B72]">
              Choose a device image or paste an image link.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex bg-[#FAF9F4] p-0.5 rounded-lg border border-[#E5E8DF] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setUploadTab('upload')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                uploadTab === 'upload'
                  ? 'bg-[#245C3A] text-white shadow-2xs'
                  : 'text-[#555E52] hover:text-[#173D2A]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadTab('url')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                uploadTab === 'url'
                  ? 'bg-[#245C3A] text-white shadow-2xs'
                  : 'text-[#555E52] hover:text-[#173D2A]'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Paste URL
            </button>
          </div>
        </div>

        <form onSubmit={handleAddSlide} className="space-y-3">
          {/* Main Input Row: Upload File OR Paste URL */}
          {uploadTab === 'upload' ? (
            <div>
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
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 border-dashed border-[#DDD6C5] hover:border-[#245C3A] bg-[#FAF9F4] hover:bg-[#F3F6F2] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-2xs border border-[#E5E8DF] flex items-center justify-center text-[#245C3A] group-hover:bg-[#245C3A] group-hover:text-white transition-colors shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#173D2A] truncate">
                      {imagePreview && imageUrlInput.startsWith('data:')
                        ? 'Image Selected (click to change)'
                        : 'Choose Image from Device'}
                    </p>
                    <p className="text-[10px] text-[#737B72]">PNG, JPG, WEBP up to 3MB</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#245C3A] bg-white px-2.5 py-1 rounded-lg border border-[#E5E8DF] shrink-0">
                  Browse File
                </span>
              </label>
            </div>
          ) : (
            <div>
              <div className="relative flex items-center">
                <LinkIcon className="absolute left-3 w-4 h-4 text-[#737B72] pointer-events-none" />
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/banner-image.jpg"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-[#E5E8DF] bg-white font-mono focus:ring-1 focus:ring-[#245C3A] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Compact Image Preview strip if image is ready */}
          {imagePreview && (
            <div className="flex items-center gap-3 px-3 py-2 bg-[#FAF9F4] rounded-xl border border-[#DDD6C5]">
              <img
                src={imagePreview}
                alt="Slide preview"
                className="w-16 h-9 object-cover rounded-md border border-[#DDD6C5] shrink-0 bg-neutral-900"
                onError={() => showToast('Image URL failed to load preview.', 'error')}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#173D2A] truncate">Preview Ready</p>
                <p className="text-[10px] text-[#737B72] truncate font-mono">
                  {imageUrlInput.startsWith('data:') ? 'Local file ready to add' : imageUrlInput}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImageUrlInput('');
                  setImagePreview('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 shrink-0 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* Redirect Link + Add Slide Button Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="Click Redirect Link (Optional e.g. /products)"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white font-mono focus:ring-1 focus:ring-[#245C3A] focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-1 flex justify-end">
              <Button
                variant="primary"
                type="submit"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                className="w-full sm:w-auto justify-center"
              >
                Add Slide Image
              </Button>
            </div>
          </div>

          {/* Quick Sample Presets (Compact horizontal scrollable chip row) */}
          <div className="pt-2 border-t border-[#F0F2EB] flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-[#737B72] shrink-0">
              Quick samples:
            </span>
            {QUICK_SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => handlePickSample(sample.url)}
                className="text-[11px] px-2 py-0.5 rounded-md border border-[#E5E8DF] bg-white hover:bg-[#E8F0EB] hover:border-[#245C3A] text-[#245C3A] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                🌾 {sample.name.replace(' Banner', '')}
              </button>
            ))}
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
