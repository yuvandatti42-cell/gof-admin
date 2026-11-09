import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import type { HeroSlide, TestimonialItem } from '../types';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  CheckCircle2,
  MessageSquare,
  Monitor,
  Star,
} from 'lucide-react';

// Preset sample banner images for instant 1-click testing
const PRESET_BANNERS = [
  { name: 'Cold-Pressed Oils Banner', url: '/banners/banner_oil.webp' },
  { name: 'Vedic A2 Ghee Banner', url: '/banners/banner_ghee.webp' },
  { name: 'Millet Power Banner', url: '/banners/hero_millets_editorial.webp' },
  { name: 'Heritage Rice Banner', url: '/banners/banner_rice.webp' },
  { name: 'Organic Spices Banner', url: '/banners/banner_spices.webp' },
  { name: 'Spices & Millets Combo', url: '/banners/banner_spices_millets.webp' },
];

const PRESET_AVATARS = [
  { name: 'Ananya S.', url: '/customers/ananya.webp' },
  { name: 'Srinivas V.', url: '/customers/srinivas.webp' },
  { name: 'Vikram R.', url: '/customers/vikram.webp' },
  { name: 'Arma Seal', url: '/logo-circle.webp' },
];

export const StoreContentPage: React.FC = () => {
  const {
    storeContent,
    updateStoreContent,
    addHeroSlide,
    deleteHeroSlide,
    reorderHeroSlides,
    toggleHeroSlideStatus,
  } = useAdmin();

  const { showToast } = useToast();

  // Active Main Tab: ONLY hero & testimonials
  const [activeTab, setActiveTab] = useState<'hero' | 'testimonials'>('hero');

  // Hero Slide Form / Modal state
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideFormData, setSlideFormData] = useState<Omit<HeroSlide, 'id'>>({
    imageUrl: PRESET_BANNERS[0].url,
    mobileImageUrl: '',
    title: '',
    subtitle: '',
    badgeText: '100% Organic',
    ctaText: 'Shop Now',
    ctaLink: '/collections/all-products',
    active: true,
  });

  // Testimonial Form / Modal state
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [testimonialFormData, setTestimonialFormData] = useState<Omit<TestimonialItem, 'id'>>({
    name: '',
    location: '',
    comment: '',
    rating: 5,
    avatarUrl: PRESET_AVATARS[0].url,
    verified: true,
  });

  // Delete Confirm Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'hero' | 'badge' | 'testimonial';
    id: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'hero',
    id: '',
    title: '',
    message: '',
  });

  // Local File Upload Helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        showToast('Image size exceeds 4MB limit for local preview.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onSuccess(reader.result as string);
        showToast('Local image loaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // -------------------------------------------------------------
  // HERO SLIDE HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddSlide = () => {
    setEditingSlideId(null);
    setSlideFormData({
      imageUrl: PRESET_BANNERS[0].url,
      mobileImageUrl: '',
      title: '',
      subtitle: '',
      badgeText: '100% Organic',
      ctaText: 'Shop Now',
      ctaLink: '/collections/all-products',
      active: true,
    });
    setIsSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setSlideFormData({
      imageUrl: slide.imageUrl,
      mobileImageUrl: slide.mobileImageUrl || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      badgeText: slide.badgeText || '',
      ctaText: slide.ctaText || 'Shop Now',
      ctaLink: slide.ctaLink || '/collections/all-products',
      active: slide.active ?? true,
    });
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideFormData.imageUrl.trim()) {
      showToast('Please provide a banner image URL or upload an image.', 'error');
      return;
    }

    if (editingSlideId) {
      const updatedSlides = (storeContent.heroSlides || []).map((s) =>
        s.id === editingSlideId ? { ...s, ...slideFormData } : s
      );
      updateStoreContent({ heroSlides: updatedSlides });
      showToast('Hero banner updated successfully!', 'success');
    } else {
      addHeroSlide(slideFormData);
      showToast('New hero banner slide added!', 'success');
    }
    setIsSlideModalOpen(false);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const slides = [...(storeContent.heroSlides || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const [moved] = slides.splice(index, 1);
    slides.splice(targetIndex, 0, moved);
    reorderHeroSlides(slides);
    showToast(`Banner moved ${direction}.`, 'info');
  };

  // -------------------------------------------------------------
  // TESTIMONIAL HANDLERS (ADD / EDIT / DELETE)
  // -------------------------------------------------------------
  const handleOpenAddTestimonial = () => {
    setEditingTestimonialId(null);
    setTestimonialFormData({
      name: '',
      location: '',
      comment: '',
      rating: 5,
      avatarUrl: PRESET_AVATARS[0].url,
      verified: true,
    });
    setIsTestimonialModalOpen(true);
  };

  const handleOpenEditTestimonial = (item: TestimonialItem) => {
    setEditingTestimonialId(item.id);
    setTestimonialFormData({
      name: item.name,
      location: item.location || '',
      comment: item.comment || '',
      rating: item.rating || 5,
      avatarUrl: item.avatarUrl,
      verified: item.verified ?? true,
    });
    setIsTestimonialModalOpen(true);
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialFormData.name.trim()) {
      showToast('Please enter the customer name.', 'error');
      return;
    }
    if (!testimonialFormData.comment.trim()) {
      showToast('Please enter the review comment text.', 'error');
      return;
    }
    if (!testimonialFormData.avatarUrl.trim()) {
      showToast('Please provide an avatar photo URL or upload an image.', 'error');
      return;
    }

    const currentTests = [...(storeContent.testimonials || [])];

    if (editingTestimonialId) {
      const updated = currentTests.map((t) =>
        t.id === editingTestimonialId ? { ...t, ...testimonialFormData } : t
      );
      updateStoreContent({ testimonials: updated });
      showToast(`Updated review from ${testimonialFormData.name}`, 'success');
    } else {
      const newTest: TestimonialItem = {
        id: `test-${Date.now()}`,
        ...testimonialFormData,
      };
      updateStoreContent({ testimonials: [...currentTests, newTest] });
      showToast(`Added new review photo from ${testimonialFormData.name}`, 'success');
    }
    setIsTestimonialModalOpen(false);
  };

  // -------------------------------------------------------------
  // CONFIRM DELETE DISPATCHER
  // -------------------------------------------------------------
  const handleConfirmDelete = () => {
    const { type, id } = deleteDialog;
    if (type === 'hero') {
      deleteHeroSlide(id);
      showToast('Hero banner deleted.', 'info');
    } else if (type === 'badge') {
      const updated = (storeContent.trustBadges || []).filter((b) => b.id !== id);
      updateStoreContent({ trustBadges: updated });
      showToast('Certification badge removed.', 'info');
    } else if (type === 'testimonial') {
      const updated = (storeContent.testimonials || []).filter((t) => t.id !== id);
      updateStoreContent({ testimonials: updated });
      showToast('Customer review removed.', 'info');
    }
    setDeleteDialog({ isOpen: false, type: 'hero', id: '', title: '', message: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-[#dfd5bf]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#103b1d] flex items-center gap-2.5 font-heading">
            <ImageIcon className="w-6 h-6 text-[#18542a]" />
            Store Visuals & Image Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#5a6e54] mt-0.5">
            Manage top hero carousel banners and real customer review photos.
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Hero Banners and Review Photos) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[#dfd5bf]">
        {[
          { id: 'hero', label: 'Hero Banners', icon: Monitor, count: (storeContent.heroSlides || []).length },
          { id: 'testimonials', label: 'Review Photos', icon: MessageSquare, count: (storeContent.testimonials || []).length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#18542a] text-white shadow-xs'
                  : 'text-[#5a6e54] hover:text-[#103b1d] hover:bg-[#f3e8cc]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#f3e8cc] text-[#5a6e54]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================= */}
      {/* TAB 1: HERO SLIDER BANNERS */}
      {/* ============================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#faf5ea] p-4 rounded-2xl border border-[#dfd5bf]">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#103b1d] flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#18542a]" />
                Top Hero Slider Banners
              </h2>
              <p className="text-xs text-[#5a6e54] mt-0.5">
                Controls the large promotional carousel on the customer homepage. Supports reordering and toggling active visibility.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleOpenAddSlide}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Hero Banner
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {(storeContent.heroSlides || []).map((slide, index) => (
              <Card
                key={slide.id}
                padding="none"
                className={`overflow-hidden border transition-all ${
                  slide.active ? 'border-[#dfd5bf] bg-white' : 'border-dashed border-stone-300 bg-stone-50/70 opacity-75'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
                  {/* Banner Preview Thumbnail */}
                  <div className="relative w-full md:w-56 aspect-[16/9] rounded-xl overflow-hidden bg-[#f3e8cc] shrink-0 border border-[#dfd5bf]">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || 'Banner'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/banners/banner_oil.webp';
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                        Slide #{index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Banner Content Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {slide.badgeText && (
                        <span className="px-2 py-0.5 rounded-full bg-[#18542a]/10 text-[#18542a] text-[10px] font-bold uppercase">
                          {slide.badgeText}
                        </span>
                      )}
                      <Badge variant={slide.active ? 'success' : 'neutral'}>
                        {slide.active ? 'Active on Homepage' : 'Hidden'}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-[#103b1d] text-base truncate">
                      {slide.title || 'Untitled Banner Slide'}
                    </h3>

                    {slide.subtitle && (
                      <p className="text-xs text-[#5a6e54] line-clamp-1">
                        {slide.subtitle}
                      </p>
                    )}

                    <div className="pt-1 flex items-center gap-2 text-xs text-[#5a6e54]">
                      <span className="font-semibold text-[#18542a]">Button:</span>
                      <span className="bg-[#faf5ea] px-2 py-0.5 rounded border border-[#dfd5bf]">
                        {slide.ctaText || 'Shop Now'} → {slide.ctaLink || '/collections/all-products'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#dfd5bf]">
                    {/* Reorder Buttons */}
                    <div className="flex md:flex-col gap-1 mr-2">
                      <button
                        onClick={() => handleMoveSlide(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg border border-[#dfd5bf] text-[#5a6e54] hover:bg-[#faf5ea] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move slide up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSlide(index, 'down')}
                        disabled={index === (storeContent.heroSlides || []).length - 1}
                        className="p-1.5 rounded-lg border border-[#dfd5bf] text-[#5a6e54] hover:bg-[#faf5ea] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move slide down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => toggleHeroSlideStatus(slide.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        slide.active
                          ? 'bg-[#faf5ea] text-[#5a6e54] border-[#dfd5bf] hover:bg-stone-200'
                          : 'bg-[#18542a] text-white border-[#18542a]'
                      }`}
                    >
                      {slide.active ? 'Hide' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleOpenEditSlide(slide)}
                      className="p-2 rounded-xl bg-[#faf5ea] hover:bg-[#E8F0EB] text-[#18542a] border border-[#dfd5bf] transition-colors cursor-pointer"
                      title="Edit banner details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setDeleteDialog({
                          isOpen: true,
                          type: 'hero',
                          id: slide.id,
                          title: 'Delete Hero Banner Slide?',
                          message: `Are you sure you want to remove slide "${slide.title || 'Untitled'}" from rotation?`,
                        })
                      }
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                      title="Delete banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: CUSTOMER REVIEW PHOTOS (WITH ADD OPTION) */}
      {/* ============================================================= */}
      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#faf5ea] p-4 rounded-2xl border border-[#dfd5bf]">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#103b1d] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#18542a]" />
                Customer Testimonials & Review Photos
              </h2>
              <p className="text-xs text-[#5a6e54] mt-0.5">
                Authentic buyer review cards with portrait photos shown in the customer homepage social proof section.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleOpenAddTestimonial}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Review Photo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(storeContent.testimonials || []).map((t) => (
              <Card key={t.id} className="border border-[#dfd5bf] flex flex-col justify-between gap-4 bg-white hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatarUrl}
                        alt={t.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#18542a]/30 shrink-0 shadow-xs"
                        onError={(e) => {
                          e.currentTarget.src = '/customers/ananya.webp';
                        }}
                      />
                      <div>
                        <h4 className="font-bold text-[#103b1d] text-sm flex items-center gap-1">
                          {t.name}
                          {t.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#18542a]" />}
                        </h4>
                        <p className="text-[11px] text-[#5a6e54]">{t.location}</p>
                      </div>
                    </div>

                    <div className="flex text-[#ffc926] text-xs">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#ffc926] text-[#ffc926]" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#5a6e54] italic bg-[#faf5ea] p-3 rounded-xl border border-[#dfd5bf]/60 leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#dfd5bf]/60">
                  <button
                    onClick={() => handleOpenEditTestimonial(t)}
                    className="flex-1 py-1.5 rounded-xl bg-[#faf5ea] hover:bg-[#E8F0EB] text-[#18542a] text-xs font-bold border border-[#dfd5bf] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Review
                  </button>

                  <button
                    onClick={() =>
                      setDeleteDialog({
                        isOpen: true,
                        type: 'testimonial',
                        id: t.id,
                        title: 'Delete Customer Review?',
                        message: `Are you sure you want to remove the review from "${t.name}"?`,
                      })
                    }
                    className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 1: ADD / EDIT HERO SLIDE */}
      {/* ============================================================= */}
      <Modal
        isOpen={isSlideModalOpen}
        onClose={() => setIsSlideModalOpen(false)}
        title={editingSlideId ? 'Edit Hero Slider Banner' : 'Add New Hero Banner'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSlideModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveSlide}>
              {editingSlideId ? 'Update Banner' : 'Create Banner'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveSlide} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#103b1d] mb-1.5">
              Banner Preview (16:9 Aspect Ratio)
            </label>
            <div className="relative aspect-[16/9] rounded-2xl bg-[#f3e8cc] overflow-hidden border border-[#dfd5bf] shadow-xs">
              <img
                src={slideFormData.imageUrl}
                alt="Banner Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/banners/banner_oil.webp';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 text-white">
                <span className="text-[10px] font-bold uppercase text-[#ffc926]">
                  {slideFormData.badgeText || 'Badge'}
                </span>
                <p className="font-bold text-sm sm:text-base leading-tight">
                  {slideFormData.title || 'Banner Title'}
                </p>
                <p className="text-xs text-white/80">{slideFormData.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#103b1d]">
              Banner Image Source
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slideFormData.imageUrl}
                onChange={(e) => setSlideFormData({ ...slideFormData, imageUrl: e.target.value })}
                placeholder="https://... or upload local file"
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white focus:ring-1 focus:ring-[#18542a]"
              />
              <label className="px-3 py-2 rounded-xl bg-[#18542a] text-white text-xs font-bold hover:bg-[#103b1d] cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                <UploadCloud className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload(e, (dataUrl) => setSlideFormData({ ...slideFormData, imageUrl: dataUrl }))
                  }
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-semibold text-[#5a6e54] block mb-1">
                Or select 1-click organic banner preset:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_BANNERS.map((preset) => (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => setSlideFormData({ ...slideFormData, imageUrl: preset.url })}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                      slideFormData.imageUrl === preset.url
                        ? 'bg-[#18542a] text-white border-[#18542a]'
                        : 'bg-[#faf5ea] text-[#5a6e54] border-[#dfd5bf] hover:border-[#18542a]'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                Badge Tag
              </label>
              <input
                type="text"
                value={slideFormData.badgeText}
                onChange={(e) => setSlideFormData({ ...slideFormData, badgeText: e.target.value })}
                placeholder="e.g. 100% WOOD COLD PRESSED"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={slideFormData.title}
                onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                placeholder="e.g. Wholesome Millet Power"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#103b1d] mb-1">
              Subtitle / Description
            </label>
            <input
              type="text"
              value={slideFormData.subtitle}
              onChange={(e) => setSlideFormData({ ...slideFormData, subtitle: e.target.value })}
              placeholder="e.g. Traditional Wood Pressed (Kachi Ghani) Extraction"
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={slideFormData.ctaText}
                onChange={(e) => setSlideFormData({ ...slideFormData, ctaText: e.target.value })}
                placeholder="SHOP NOW"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                CTA Destination URL
              </label>
              <input
                type="text"
                value={slideFormData.ctaLink}
                onChange={(e) => setSlideFormData({ ...slideFormData, ctaLink: e.target.value })}
                placeholder="/collections/all-products"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================= */}
      {/* MODAL 2: ADD / EDIT TESTIMONIAL & REVIEW PHOTO */}
      {/* ============================================================= */}
      <Modal
        isOpen={isTestimonialModalOpen}
        onClose={() => setIsTestimonialModalOpen(false)}
        title={editingTestimonialId ? 'Edit Customer Review' : 'Add New Customer Review Photo'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsTestimonialModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveTestimonial}>
              {editingTestimonialId ? 'Update Review' : 'Add Review'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveTestimonial} className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex items-center gap-3 p-3 bg-[#faf5ea] rounded-xl border border-[#dfd5bf]">
            <img
              src={testimonialFormData.avatarUrl}
              alt="Avatar Preview"
              className="w-14 h-14 rounded-full object-cover border-2 border-[#18542a]/30 shrink-0 shadow-xs"
              onError={(e) => {
                e.currentTarget.src = '/customers/ananya.webp';
              }}
            />
            <div>
              <p className="font-bold text-sm text-[#103b1d]">
                {testimonialFormData.name || 'Customer Name'}
              </p>
              <p className="text-xs text-[#5a6e54]">
                {testimonialFormData.location || 'Location'}
              </p>
              <div className="flex text-[#ffc926] text-xs mt-0.5">
                {'★'.repeat(testimonialFormData.rating || 5)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={testimonialFormData.name}
                onChange={(e) => setTestimonialFormData({ ...testimonialFormData, name: e.target.value })}
                placeholder="e.g. Dr. Ramana Murthy"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                Customer Location / City
              </label>
              <input
                type="text"
                value={testimonialFormData.location}
                onChange={(e) => setTestimonialFormData({ ...testimonialFormData, location: e.target.value })}
                placeholder="e.g. Hyderabad, Telangana"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#103b1d] mb-1">
                Star Rating (1 - 5)
              </label>
              <select
                value={testimonialFormData.rating}
                onChange={(e) => setTestimonialFormData({ ...testimonialFormData, rating: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              >
                <option value={5}>★★★★★ (5 Stars - Excellent)</option>
                <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                <option value={3}>★★★☆☆ (3 Stars - Good)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="verifiedCheck"
                checked={testimonialFormData.verified}
                onChange={(e) => setTestimonialFormData({ ...testimonialFormData, verified: e.target.checked })}
                className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="verifiedCheck" className="text-xs font-semibold text-[#103b1d] cursor-pointer">
                Verified Customer Purchase
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#103b1d] mb-1">
              Customer Feedback / Review Comment
            </label>
            <textarea
              rows={3}
              value={testimonialFormData.comment}
              onChange={(e) => setTestimonialFormData({ ...testimonialFormData, comment: e.target.value })}
              placeholder="e.g. The cold-pressed sesame oil reminds me of my grandmother's traditional farm oil. Unbelievable aroma and purity!"
              className="w-full text-xs p-3 rounded-xl border border-[#dfd5bf] bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#103b1d]">
              Customer Portrait / Avatar Photo Source
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testimonialFormData.avatarUrl}
                onChange={(e) => setTestimonialFormData({ ...testimonialFormData, avatarUrl: e.target.value })}
                placeholder="https://... or upload local portrait"
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
              <label className="px-3 py-2 rounded-xl bg-[#18542a] text-white text-xs font-bold hover:bg-[#103b1d] cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                <UploadCloud className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload(e, (dataUrl) => setTestimonialFormData({ ...testimonialFormData, avatarUrl: dataUrl }))
                  }
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[#5a6e54] block mb-1">
                Or select an avatar photo preset:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => setTestimonialFormData({ ...testimonialFormData, avatarUrl: preset.url })}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                      testimonialFormData.avatarUrl === preset.url
                        ? 'bg-[#18542a] text-white border-[#18542a]'
                        : 'bg-[#faf5ea] text-[#5a6e54] border-[#dfd5bf] hover:border-[#18542a]'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, type: 'hero', id: '', title: '', message: '' })}
        onConfirm={handleConfirmDelete}
        title={deleteDialog.title}
        message={deleteDialog.message}
        confirmText="Yes, Delete"
        variant="danger"
      />
    </div>
  );
};

export default StoreContentPage;
