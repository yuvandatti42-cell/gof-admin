import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import type { HeroSlide, BrandAssets, Category } from '../types';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
  Tag,
  Sprout,
  MessageSquare,
  Eye,
  Monitor,
} from 'lucide-react';

// Preset sample banner images for instant 1-click testing
const PRESET_BANNERS = [
  { name: 'Millet Power Banner', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cold-Pressed Oils Banner', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Vedic A2 Ghee Banner', url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Heritage Rice Banner', url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Organic Spices Banner', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80' },
];

const PRESET_CATEGORY_IMAGES = [
  { name: 'Pure Wood Oils', url: '/categories/oil.png' },
  { name: 'Organic Rice', url: '/categories/rice.png' },
  { name: 'Native Millets', url: '/categories/millet.png' },
  { name: 'Stone-Ground Spices', url: '/categories/spices.png' },
  { name: 'Natural Honey & Jaggery', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' },
  { name: 'A2 Vedic Ghee', url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80' },
];

export const StoreContentPage: React.FC = () => {
  const {
    storeContent,
    updateStoreContent,
    addHeroSlide,
    deleteHeroSlide,
    reorderHeroSlides,
    toggleHeroSlideStatus,
    categories,
    updateCategory,
    setLiveStorefrontOpen,
  } = useAdmin();

  const { showToast } = useToast();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<
    'hero' | 'categories' | 'badges' | 'offers' | 'stories' | 'testimonials' | 'branding'
  >('hero');

  // Hero Slide Form / Modal state
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideFormData, setSlideFormData] = useState<Omit<HeroSlide, 'id'>>({
    imageUrl: PRESET_BANNERS[0].url,
    mobileImageUrl: '',
    title: '',
    subtitle: '',
    badgeText: '',
    ctaText: 'Shop Now',
    ctaLink: '/collections/all-products',
    active: true,
  });

  // Category Image Edit Modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryImageUrl, setCategoryImageUrl] = useState('');

  // Universal Single Item Image Edit Modal (for Badges, Stories, Offers, Testimonials)
  const [imageModalConfig, setImageModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    currentUrl: string;
    onSave: (newUrl: string) => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    currentUrl: '',
    onSave: () => {},
  });
  const [tempImageUrl, setTempImageUrl] = useState('');

  // Delete Confirm Dialog state
  const [deleteSlideId, setDeleteSlideId] = useState<string | null>(null);

  // File Upload Helper

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
  // CATEGORY IMAGE HANDLERS
  // -------------------------------------------------------------
  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryImageUrl(cat.imageUrl || '');
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      updateCategory(editingCategory.id, { imageUrl: categoryImageUrl });
      showToast(`Updated image for category "${editingCategory.name}".`, 'success');
      setEditingCategory(null);
    }
  };

  // -------------------------------------------------------------
  // TRUST BADGES HANDLERS
  // -------------------------------------------------------------
  const handleUpdateBadgeImage = (badgeId: string, newUrl: string) => {
    const currentBadges = storeContent.trustBadges || [];
    const updated = currentBadges.map((b) => (b.id === badgeId ? { ...b, imageUrl: newUrl } : b));
    updateStoreContent({ trustBadges: updated });
    showToast('Quality certification badge image updated!', 'success');
  };

  // -------------------------------------------------------------
  // STORY IMAGES HANDLERS
  // -------------------------------------------------------------
  const handleUpdateStoryImage = (storyId: string, newUrl: string) => {
    const currentStories = storeContent.storyImages || [];
    const updated = currentStories.map((s) => (s.id === storyId ? { ...s, imageUrl: newUrl } : s));
    updateStoreContent({ storyImages: updated });
    showToast('Farm story process image updated!', 'success');
  };

  // -------------------------------------------------------------
  // OFFER BANNERS HANDLERS
  // -------------------------------------------------------------
  const handleUpdateOfferImage = (offerId: string, newUrl: string) => {
    const currentOffers = storeContent.offerBanners || [];
    const updated = currentOffers.map((o) => (o.id === offerId ? { ...o, imageUrl: newUrl } : o));
    updateStoreContent({ offerBanners: updated });
    showToast('Promotional deal banner image updated!', 'success');
  };

  // -------------------------------------------------------------
  // TESTIMONIAL AVATARS HANDLERS
  // -------------------------------------------------------------
  const handleUpdateTestimonialAvatar = (testId: string, newUrl: string) => {
    const currentTests = storeContent.testimonials || [];
    const updated = currentTests.map((t) => (t.id === testId ? { ...t, avatarUrl: newUrl } : t));
    updateStoreContent({ testimonials: updated });
    showToast('Customer review avatar updated!', 'success');
  };

  // -------------------------------------------------------------
  // BRAND ASSETS HANDLERS
  // -------------------------------------------------------------
  const handleUpdateBrandAsset = (key: keyof BrandAssets, newUrl: string) => {
    const current = storeContent.brandAssets || {
      primaryLogoUrl: '/logo.png',
      headerLogoUrl: '/logo.png',
      footerLogoUrl: '/logo.png',
      faviconUrl: '/logo.png',
    };
    updateStoreContent({ brandAssets: { ...current, [key]: newUrl } });
    showToast(`Brand asset (${key}) updated successfully!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-[#E5E8DF]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#173D2A] flex items-center gap-2.5 font-heading">
            <ImageIcon className="w-6 h-6 text-[#245C3A]" />
            Store Visuals & Image Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#737B72] mt-0.5">
            Full visual command center: edit, replace, or upload every single banner, category photo, certification seal, and logo on the customer website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => setLiveStorefrontOpen(true)}
            icon={<Eye className="w-4 h-4" />}
          >
            Preview Live Store
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-[#E5E8DF]">
        {[
          { id: 'hero', label: 'Hero Banners', icon: Monitor, count: (storeContent.heroSlides || []).length },
          { id: 'categories', label: 'Category Images', icon: Layers, count: categories.length },
          { id: 'badges', label: 'Trust & Certifications', icon: Award, count: (storeContent.trustBadges || []).length },
          { id: 'offers', label: 'Offer Banners', icon: Tag, count: (storeContent.offerBanners || []).length },
          { id: 'stories', label: 'Farm Story Visuals', icon: Sprout, count: (storeContent.storyImages || []).length },
          { id: 'testimonials', label: 'Review Photos', icon: MessageSquare, count: (storeContent.testimonials || []).length },
          { id: 'branding', label: 'Brand Logos', icon: Sparkles, count: 4 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#245C3A] text-white shadow-xs'
                  : 'text-[#555E53] hover:text-[#173D2A] hover:bg-[#F0F2EB]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#EAECE4] text-[#737B72]'
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F4] p-4 rounded-2xl border border-[#E5E8DF]">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#173D2A] flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#245C3A]" />
                Top Hero Slider Banners
              </h2>
              <p className="text-xs text-[#737B72] mt-0.5">
                Controls the large promotional carousel on the customer homepage. Supports both desktop and mobile image aspect ratios.
              </p>
            </div>
            <Button variant="primary" onClick={handleOpenAddSlide} icon={<Plus className="w-4 h-4" />}>
              Add Hero Slide
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(storeContent.heroSlides || []).map((slide, index) => (
              <Card key={slide.id} padding="none" className="overflow-hidden flex flex-col group border border-[#E5E8DF]">
                {/* Image Frame with gradient overlay */}
                <div className="relative aspect-[16/9] bg-[#EAECE4] overflow-hidden">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title || 'Hero Slide'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold">
                      Slide #{index + 1}
                    </span>
                    <button
                      onClick={() => toggleHeroSlideStatus(slide.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-xs cursor-pointer ${
                        slide.active
                          ? 'bg-[#2F7D4A] text-white hover:bg-[#25633b]'
                          : 'bg-[#B64238] text-white hover:bg-[#96342c]'
                      }`}
                    >
                      {slide.active ? '● Active' : '○ Inactive'}
                    </button>
                  </div>

                  {/* Bottom Text Over Slide */}
                  <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                    {slide.badgeText && (
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#ffc926] mb-1">
                        {slide.badgeText}
                      </span>
                    )}
                    <h3 className="text-base font-bold leading-tight drop-shadow-xs line-clamp-1">
                      {slide.title || 'Untitled Banner'}
                    </h3>
                    {slide.subtitle && (
                      <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{slide.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Controls Footer */}
                <div className="p-3 bg-white flex items-center justify-between gap-2 border-t border-[#E5E8DF]">
                  <div className="flex items-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveSlide(index, 'up')}
                      className="p-1.5 rounded-lg border border-[#E5E8DF] text-[#737B72] hover:text-[#173D2A] hover:bg-[#FAF9F4] disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move slide left/up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={index === (storeContent.heroSlides || []).length - 1}
                      onClick={() => handleMoveSlide(index, 'down')}
                      className="p-1.5 rounded-lg border border-[#E5E8DF] text-[#737B72] hover:text-[#173D2A] hover:bg-[#FAF9F4] disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move slide right/down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-[#737B72] ml-2 truncate max-w-[140px]">
                      CTA: {slide.ctaText || 'Shop Now'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditSlide(slide)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#FAF9F4] hover:bg-[#E8F0EB] text-[#245C3A] text-xs font-bold border border-[#E5E8DF] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Banner
                    </button>
                    <button
                      onClick={() => setDeleteSlideId(slide.id)}
                      className="p-1.5 rounded-lg text-[#B64238] hover:bg-[#FDEEED] transition-colors"
                      title="Delete Slide"
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
      {/* TAB 2: CATEGORY CARD IMAGES */}
      {/* ============================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-[#FAF9F4] p-4 rounded-2xl border border-[#E5E8DF]">
            <h2 className="text-sm sm:text-base font-bold text-[#173D2A] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#245C3A]" />
              Storefront Category Cards
            </h2>
            <p className="text-xs text-[#737B72] mt-0.5">
              These images appear in the "Our Harvest Categories" grid on the homepage and in the top category navigation bar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Card key={cat.id} padding="none" className="overflow-hidden flex flex-col border border-[#E5E8DF] group hover:shadow-md transition-all">
                <div className="relative aspect-square bg-[#FAF5EA] flex items-center justify-center p-4 overflow-hidden border-b border-[#E5E8DF]">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-106 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant={cat.visibility === 'Visible' ? 'success' : 'neutral'} size="sm">
                      {cat.visibility}
                    </Badge>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3 bg-white">
                  <div>
                    <h3 className="font-bold text-[#173D2A] text-sm leading-tight">{cat.name}</h3>
                    <p className="text-[11px] font-mono text-[#737B72] mt-0.5">/{cat.slug}</p>
                    <p className="text-xs text-[#737B72] line-clamp-2 mt-1">{cat.description}</p>
                  </div>

                  <button
                    onClick={() => handleOpenEditCategory(cat)}
                    className="w-full py-2 rounded-xl bg-[#FAF9F4] hover:bg-[#E8F0EB] text-[#245C3A] text-xs font-bold border border-[#E5E8DF] flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Replace Image
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: TRUST & QUALITY BADGES */}
      {/* ============================================================= */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="bg-[#FAF9F4] p-4 rounded-2xl border border-[#E5E8DF]">
            <h2 className="text-sm sm:text-base font-bold text-[#173D2A] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#245C3A]" />
              Certified Quality Standards & Trust Badges
            </h2>
            <p className="text-xs text-[#737B72] mt-0.5">
              Displayed in the verified quality banner strip below the hero slider (FSSAI, USDA Organic, SGS Bio-Verified, APEDA Pure).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(storeContent.trustBadges || []).map((badge) => (
              <Card key={badge.id} padding="none" className="overflow-hidden flex flex-col border border-[#E5E8DF] bg-white hover:shadow-md transition-all">
                <div className="h-28 bg-[#FAF9F4] flex items-center justify-center p-3 border-b border-[#E5E8DF] relative">
                  <img
                    src={badge.imageUrl}
                    alt={badge.name}
                    className="max-h-16 max-w-full object-contain filter drop-shadow-sm"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="w-2 h-2 rounded-full bg-[#2F7D4A]" />
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#173D2A] text-sm">{badge.name}</h3>
                    <p className="text-xs text-[#737B72] mt-0.5">{badge.subtitle}</p>
                  </div>

                  <button
                    onClick={() => {
                      setImageModalConfig({
                        isOpen: true,
                        title: `Replace ${badge.name} Seal Image`,
                        description: 'Upload a clean transparent PNG/GIF/WEBP badge seal or enter an image URL.',
                        currentUrl: badge.imageUrl,
                        onSave: (url) => handleUpdateBadgeImage(badge.id, url),
                      });
                      setTempImageUrl(badge.imageUrl);
                    }}
                    className="w-full py-1.5 rounded-xl bg-[#FAF9F4] hover:bg-[#E8F0EB] text-[#245C3A] text-xs font-bold border border-[#E5E8DF] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Replace Seal Image
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: PROMOTIONAL & OFFER BANNERS */}
      {/* ============================================================= */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          <div className="bg-[#FAF9F4] p-4 rounded-2xl border border-[#E5E8DF]">
            <h2 className="text-sm sm:text-base font-bold text-[#173D2A] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#245C3A]" />
              Promotional Deal Banners & Strip Cards
            </h2>
            <p className="text-xs text-[#737B72] mt-0.5">
              Mid-page marketing callouts, festive season discounts, and combo offer banners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(storeContent.offerBanners || []).map((offer) => (
              <Card key={offer.id} padding="none" className="overflow-hidden flex flex-col border border-[#E5E8DF] bg-white group">
                <div className="relative aspect-[16/8] bg-[#EAECE4] overflow-hidden">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3">
                    {offer.badge && (
                      <span className="px-2.5 py-1 rounded-full bg-[#ffc926] text-[#18542a] text-[10px] font-extrabold uppercase shadow-xs">
                        {offer.badge}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base sm:text-lg leading-tight drop-shadow-xs">{offer.title}</h3>
                    <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{offer.subtitle}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-white flex items-center justify-between gap-3 border-t border-[#E5E8DF]">
                  <span className="text-xs text-[#737B72] font-semibold">
                    Target: <code className="text-[#245C3A] font-mono">{offer.ctaLink}</code>
                  </span>

                  <button
                    onClick={() => {
                      setImageModalConfig({
                        isOpen: true,
                        title: `Edit Offer Banner: ${offer.title}`,
                        description: 'Upload a promotional horizontal banner image (recommended 1200x500px).',
                        currentUrl: offer.imageUrl,
                        onSave: (url) => handleUpdateOfferImage(offer.id, url),
                      });
                      setTempImageUrl(offer.imageUrl);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF9F4] hover:bg-[#E8F0EB] text-[#245C3A] text-xs font-bold border border-[#E5E8DF] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Replace Banner
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 5: FARM & STORY VISUALS */}
      {/* ============================================================= */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          <div className="bg-[#FAF9F4] p-4 rounded-2xl border border-[#E5E8DF]">
            <h2 className="text-sm sm:text-base font-bold text-[#173D2A] flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#245C3A]" />
              Farm Story & Heritage Processing Photos
            </h2>
            <p className="text-xs text-[#737B72] mt-0.5">
              Displayed in the "Why Choose Arma" and "Our Godavari Heritage" storytelling sections to communicate authentic organic processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(storeContent.storyImages || []).map((story) => (
              <Card key={story.id} padding="none" className="overflow-hidden flex flex-col border border-[#E5E8DF] bg-white group">
                <div className="relative aspect-[4/3] bg-[#EAECE4] overflow-hidden">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                      {story.tag}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#173D2A] text-sm leading-snug">{story.title}</h3>
                    <p className="text-xs text-[#737B72] mt-1 line-clamp-2">{story.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      setImageModalConfig({
                        isOpen: true,
                        title: `Update Story Photo: ${story.title}`,
                        description: 'Upload authentic high-resolution processing or farm field photograph.',
                        currentUrl: story.imageUrl,
                        onSave: (url) => handleUpdateStoryImage(story.id, url),
                      });
                      setTempImageUrl(story.imageUrl);
                    }}
                    className="w-full py-1.5 rounded-xl bg-[#FAF9F4] hover:bg-[#E8F0EB] text-[#245C3A] text-xs font-bold border border-[#E5E8DF] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Replace Photo
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 6: CUSTOMER REVIEW PHOTOS */}
      {/* ============================================================= */}
      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="bg-[#FAF9F4] p-4 rounded-2xl border border-[#E5E8DF]">
            <h2 className="text-sm sm:text-base font-bold text-[#173D2A] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#245C3A]" />
              Customer Testimonial Avatars & Reviews
            </h2>
            <p className="text-xs text-[#737B72] mt-0.5">
              Customer review cards with authentic user avatars shown in the homepage social proof section.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(storeContent.testimonials || []).map((t) => (
              <Card key={t.id} className="border border-[#E5E8DF] flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatarUrl}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#245C3A]/30 shrink-0 shadow-xs"
                    />
                    <div>
                      <h4 className="font-bold text-[#173D2A] text-sm flex items-center gap-1">
                        {t.name}
                        {t.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D4A]" />}
                      </h4>
                      <p className="text-[11px] text-[#737B72]">{t.location}</p>
                      <div className="flex text-[#ffc926] text-xs mt-0.5">{'★'.repeat(t.rating)}</div>
                    </div>
                  </div>

                  <p className="text-xs text-[#555E53] italic bg-[#FAF9F4] p-2.5 rounded-xl border border-[#E5E8DF]/60">
                    "{t.comment}"
                  </p>
                </div>

                <button
                  onClick={() => {
                    setImageModalConfig({
                      isOpen: true,
                      title: `Replace Avatar for ${t.name}`,
                      description: 'Upload a circular customer portrait or avatar image.',
                      currentUrl: t.avatarUrl,
                      onSave: (url) => handleUpdateTestimonialAvatar(t.id, url),
                    });
                    setTempImageUrl(t.avatarUrl);
                  }}
                  className="w-full py-1.5 rounded-xl bg-[#FAF9F4] hover:bg-[#E8F0EB] text-[#245C3A] text-xs font-bold border border-[#E5E8DF] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Replace Avatar Photo
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 7: BRAND ASSETS & LOGOS */}
      {/* ============================================================= */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="bg-[#FAF9F4] p-4 rounded-2xl border border-[#E5E8DF]">
            <h2 className="text-sm sm:text-base font-bold text-[#173D2A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#245C3A]" />
              Brand Identity & Logo Assets
            </h2>
            <p className="text-xs text-[#737B72] mt-0.5">
              Manage the official store logo across desktop header, mobile sticky bar, footer, and browser favicon.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              {
                key: 'primaryLogoUrl' as const,
                title: 'Primary Logo (Transparent)',
                desc: 'Main brand seal used in sidebar & invoices',
                url: storeContent.brandAssets?.primaryLogoUrl || '/logo.png',
                darkBg: false,
              },
              {
                key: 'headerLogoUrl' as const,
                title: 'Header Navigation Logo',
                desc: 'Shown on the top organic navbar',
                url: storeContent.brandAssets?.headerLogoUrl || '/logo.png',
                darkBg: false,
              },
              {
                key: 'footerLogoUrl' as const,
                title: 'Footer Inverted Logo',
                desc: 'Displayed on the dark green footer',
                url: storeContent.brandAssets?.footerLogoUrl || '/logo.png',
                darkBg: true,
              },
              {
                key: 'faviconUrl' as const,
                title: 'Website Favicon / App Icon',
                desc: 'Square/round 64x64px browser tab icon',
                url: storeContent.brandAssets?.faviconUrl || '/logo.png',
                darkBg: false,
              },
            ].map((asset) => (
              <Card key={asset.key} padding="none" className="overflow-hidden flex flex-col border border-[#E5E8DF] bg-white">
                <div
                  className={`h-36 flex items-center justify-center p-4 border-b border-[#E5E8DF] ${
                    asset.darkBg ? 'bg-[#18542a]' : 'bg-[#FAF5EA]'
                  }`}
                >
                  <img
                    src={asset.url}
                    alt={asset.title}
                    className="max-h-20 max-w-[80%] object-contain filter drop-shadow-sm"
                  />
                </div>

                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#173D2A] text-sm">{asset.title}</h3>
                    <p className="text-xs text-[#737B72] mt-0.5">{asset.desc}</p>
                  </div>

                  <button
                    onClick={() => {
                      setImageModalConfig({
                        isOpen: true,
                        title: `Update ${asset.title}`,
                        description: 'Upload PNG with transparent background or SVG logo file.',
                        currentUrl: asset.url,
                        onSave: (url) => handleUpdateBrandAsset(asset.key, url),
                      });
                      setTempImageUrl(asset.url);
                    }}
                    className="w-full py-1.5 rounded-xl bg-[#FAF9F4] hover:bg-[#E8F0EB] text-[#245C3A] text-xs font-bold border border-[#E5E8DF] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Replace Logo File
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
          {/* Banner Preview */}
          <div>
            <label className="block text-xs font-semibold text-[#173D2A] mb-1.5">
              Banner Preview (Desktop 16:9 / 16:10)
            </label>
            <div className="relative aspect-[16/9] rounded-2xl bg-[#EAECE4] overflow-hidden border border-[#E5E8DF] shadow-xs">
              <img
                src={slideFormData.imageUrl}
                alt="Banner Preview"
                className="w-full h-full object-cover"
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

          {/* Image Upload & URL input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#173D2A]">
              Banner Image Source
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slideFormData.imageUrl}
                onChange={(e) => setSlideFormData({ ...slideFormData, imageUrl: e.target.value })}
                placeholder="https://... or upload local file"
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white focus:ring-1 focus:ring-[#245C3A]"
              />
              <label className="px-3 py-2 rounded-xl bg-[#245C3A] text-white text-xs font-bold hover:bg-[#1a442a] cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                <UploadCloud className="w-4 h-4" />
                <span>Upload Local</span>
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

            {/* Quick Preset Selector */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-[#737B72] block mb-1">
                Or select 1-click organic product preset:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_BANNERS.map((preset) => (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => setSlideFormData({ ...slideFormData, imageUrl: preset.url })}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                      slideFormData.imageUrl === preset.url
                        ? 'bg-[#245C3A] text-white border-[#245C3A]'
                        : 'bg-[#FAF9F4] text-[#555E53] border-[#E5E8DF] hover:border-[#245C3A]'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#173D2A] mb-1">
                Badge Tag
              </label>
              <input
                type="text"
                value={slideFormData.badgeText}
                onChange={(e) => setSlideFormData({ ...slideFormData, badgeText: e.target.value })}
                placeholder="e.g. 100% WOOD COLD PRESSED"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#173D2A] mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={slideFormData.title}
                onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                placeholder="e.g. Wholesome Millet Power"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-[#173D2A] mb-1">
              Subtitle / Description
            </label>
            <input
              type="text"
              value={slideFormData.subtitle}
              onChange={(e) => setSlideFormData({ ...slideFormData, subtitle: e.target.value })}
              placeholder="e.g. Traditional Wood Pressed (Kachi Ghani) Extraction"
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
            />
          </div>

          {/* CTA Button Text & Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#173D2A] mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={slideFormData.ctaText}
                onChange={(e) => setSlideFormData({ ...slideFormData, ctaText: e.target.value })}
                placeholder="SHOP NOW"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#173D2A] mb-1">
                CTA Destination URL
              </label>
              <input
                type="text"
                value={slideFormData.ctaLink}
                onChange={(e) => setSlideFormData({ ...slideFormData, ctaLink: e.target.value })}
                placeholder="/collections/oils"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================= */}
      {/* MODAL 2: REPLACE CATEGORY IMAGE */}
      {/* ============================================================= */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title={`Replace Image for "${editingCategory?.name}"`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCategory}>
              Save Category Image
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center p-4 rounded-2xl bg-[#FAF5EA] border border-[#E5E8DF]">
            <img
              src={categoryImageUrl}
              alt="Category Preview"
              className="w-32 h-32 object-contain filter drop-shadow-md"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#173D2A] mb-1">
              Category Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={categoryImageUrl}
                onChange={(e) => setCategoryImageUrl(e.target.value)}
                placeholder="/categories/oil.png or https://..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
              <label className="px-3 py-2 rounded-xl bg-[#245C3A] text-white text-xs font-bold hover:bg-[#1a442a] cursor-pointer flex items-center gap-1.5 shrink-0">
                <UploadCloud className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, (url) => setCategoryImageUrl(url))}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#737B72] block mb-1">
              Or pick an organic category asset preset:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CATEGORY_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setCategoryImageUrl(preset.url)}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                    categoryImageUrl === preset.url
                      ? 'bg-[#245C3A] text-white border-[#245C3A]'
                      : 'bg-[#FAF9F4] text-[#555E53] border-[#E5E8DF] hover:border-[#245C3A]'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* ============================================================= */}
      {/* MODAL 3: UNIVERSAL IMAGE REPLACER (Seals, Stories, Offers, Testimonials, Logos) */}
      {/* ============================================================= */}
      <Modal
        isOpen={imageModalConfig.isOpen}
        onClose={() => setImageModalConfig({ ...imageModalConfig, isOpen: false })}
        title={imageModalConfig.title}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setImageModalConfig({ ...imageModalConfig, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                imageModalConfig.onSave(tempImageUrl);
                setImageModalConfig({ ...imageModalConfig, isOpen: false });
              }}
            >
              Apply Image
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[#737B72]">{imageModalConfig.description}</p>

          {/* Live Preview Frame */}
          <div className="h-44 rounded-2xl bg-[#FAF9F4] border border-[#E5E8DF] flex items-center justify-center p-3 overflow-hidden">
            <img
              src={tempImageUrl}
              alt="Preview"
              className="max-h-full max-w-full object-contain filter drop-shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#173D2A] mb-1">
              Image Source URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempImageUrl}
                onChange={(e) => setTempImageUrl(e.target.value)}
                placeholder="https://... or upload local file"
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white focus:ring-1 focus:ring-[#245C3A]"
              />
              <label className="px-3 py-2 rounded-xl bg-[#245C3A] text-white text-xs font-bold hover:bg-[#1a442a] cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                <UploadCloud className="w-4 h-4" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, (url) => setTempImageUrl(url))}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteSlideId}
        onClose={() => setDeleteSlideId(null)}
        onConfirm={() => {
          if (deleteSlideId) {
            deleteHeroSlide(deleteSlideId);
            showToast('Hero banner deleted.', 'info');
            setDeleteSlideId(null);
          }
        }}
        title="Delete Hero Banner Slide?"
        message="Are you sure you want to remove this hero slide from the homepage rotation?"
        confirmText="Delete Slide"
        variant="danger"
      />
    </div>
  );
};

export default StoreContentPage;
