import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatINR } from '../../utils/formatters';
import {
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  RefreshCw,
  Smartphone,
  Monitor,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const LiveStorefrontModal: React.FC = () => {
  const {
    products,
    storeContent,
    isLiveStorefrontOpen,
    setLiveStorefrontOpen,
    removeProductFromStorefront,
    setStorefrontPickerOpen,
    syncToStorefront,
  } = useAdmin();

  const { showToast } = useToast();
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isSyncing, setIsSyncing] = useState(false);
  const [cartCount, setCartCount] = useState(2);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Active hero slides
  const activeSlides = (storeContent.heroSlides || []).filter((s) => s.active);
  const currentSlide =
    activeSlides.length > 0 ? activeSlides[currentSlideIndex % activeSlides.length] : null;

  // Active products on storefront
  const activeProducts = products.filter((p) =>
    storeContent.featuredProductIds.includes(p.id)
  );

  const handleRemoveFromStore = (productId: string, productName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeProductFromStorefront(productId);
    showToast(`"${productName}" removed from customer storefront.`, 'info', 'Removed from Store');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncToStorefront();
    setIsSyncing(false);
    showToast(
      'Synchronized with Godavari Organics live store frontend. Connection ready for API endpoints.',
      'success',
      'Storefront Synced'
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCartCount((c) => c + 1);
    showToast('Simulated: Item added to customer cart!', 'success');
  };

  return (
    <Modal
      isOpen={isLiveStorefrontOpen}
      onClose={() => setLiveStorefrontOpen(false)}
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pr-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F7D4A] animate-pulse" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#173D2A] font-heading">
                Godavari Organics • Live Storefront Simulator
              </h3>
              <p className="text-xs text-[#737B72]">
                Real-time preview of changes made from the admin dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl bg-[#FAF9F4] p-1 border border-[#E5E8DF] text-xs font-medium">
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  deviceMode === 'mobile'
                    ? 'bg-white text-[#173D2A] font-semibold shadow-xs'
                    : 'text-[#737B72]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (390px)</span>
              </button>
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  deviceMode === 'desktop'
                    ? 'bg-white text-[#173D2A] font-semibold shadow-xs'
                    : 'text-[#737B72]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            </div>

            {/* Sync Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              icon={
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#245C3A] ${
                    isSyncing ? 'animate-spin' : ''
                  }`}
                />
              }
            >
              {isSyncing ? 'Syncing...' : 'Sync to Store'}
            </Button>
          </div>
        </div>
      }
      size="4xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="text-xs text-[#737B72] text-center sm:text-left">
            <span className="font-semibold text-[#173D2A]">Admin Live Link:</span> Tap{' '}
            <strong className="text-[#B64238]">"✕ Remove"</strong> on any item below to take it off the storefront, or tap{' '}
            <strong className="text-[#245C3A]">"+ Add Products"</strong> to feature more items.
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStorefrontPickerOpen(true);
              }}
              icon={<Plus className="w-3.5 h-3.5 text-[#245C3A]" />}
            >
              + Add Products to Store
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setLiveStorefrontOpen(false)}
            >
              Close Simulator
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex justify-center bg-[#ECEBE4] p-2 sm:p-6 rounded-2xl overflow-hidden min-h-[500px]">
        {/* Device Frame */}
        <div
          className={`transition-all duration-300 bg-[#F7F6EF] shadow-2xl border border-[#D5D8CF] overflow-hidden ${
            deviceMode === 'mobile'
              ? 'w-full max-w-[390px] rounded-[36px] ring-8 ring-neutral-800'
              : 'w-full rounded-2xl'
          }`}
        >
          {/* Mobile Status Bar Simulation */}
          {deviceMode === 'mobile' && (
            <div className="h-6 bg-[#FAF9F4] px-6 flex items-center justify-between text-[10px] font-bold text-neutral-800 select-none">
              <span>9:41</span>
              <div className="w-20 h-4 bg-neutral-900 rounded-full mx-auto" />
              <div className="flex items-center gap-1">
                <span>5G</span>
                <div className="w-4 h-2 border border-neutral-800 rounded-xs bg-neutral-800" />
              </div>
            </div>
          )}

          {/* Godavari Organics Customer Storefront Top Bar (Exact Match from User's Screenshot) */}
          <div className="bg-[#FAF9F4] px-4 py-3 flex items-center justify-between border-b border-[#EAE8DE]">
            {/* Hamburger Menu */}
            <button
              onClick={() => showToast('Simulated: Customer mobile navigation drawer', 'info')}
              className="p-1 text-[#173D2A] hover:bg-[#EAECE4] rounded-lg transition-colors cursor-pointer"
              aria-label="Open storefront menu"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Logo: Circular emblem + Text Wordmark */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#245C3A] text-white flex items-center justify-center font-bold text-sm shadow-xs border-2 border-[#FAF9F4]">
                🌾
              </div>
              <span className="font-heading font-black text-sm tracking-tight text-[#173D2A] uppercase">
                Godavari Organics
              </span>
            </div>

            {/* Right Icons: Search & Cart with badge */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => showToast('Simulated: Search storefront catalog', 'info')}
                className="p-1 text-[#173D2A] hover:bg-[#EAECE4] rounded-lg transition-colors cursor-pointer"
                aria-label="Search storefront"
              >
                <Search className="w-5 h-5 stroke-[2.2]" />
              </button>

              <div
                onClick={handleAddToCart}
                className="relative flex items-center cursor-pointer p-1"
                title="Customer Cart"
              >
                <div className="w-8 h-8 rounded-full border border-[#D5D8CF] bg-white flex items-center justify-center text-[#173D2A] shadow-2xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#173D2A] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              </div>
            </div>
          </div>

          {/* Storefront Scrollable Body */}
          <div className="overflow-y-auto max-h-[620px] divide-y divide-[#E5E8DF]/60 bg-[#FAF9F4]">
            {/* Hero Carousel Banner (Driven by Admin Hero Slide Images) */}
            <div className="p-3">
              {currentSlide ? (
                <div className="relative rounded-2xl overflow-hidden shadow-xs border border-[#DDD6C5] bg-[#EAE6D8] aspect-[16/9] flex items-center justify-center">
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title || 'Hero Banner'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />

                  {/* Step arrows on hover */}
                  {activeSlides.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlideIndex((prev) =>
                            prev > 0 ? prev - 1 : activeSlides.length - 1
                          );
                        }}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center shadow-xs cursor-pointer z-10 transition-all"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlideIndex((prev) =>
                            prev < activeSlides.length - 1 ? prev + 1 : 0
                          );
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center shadow-xs cursor-pointer z-10 transition-all"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Carousel Pagination Dots (Matching User's Screenshot Exactly) */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    {activeSlides.map((_, idx) => {
                      const isActive = (currentSlideIndex % activeSlides.length) === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`rounded-full transition-all cursor-pointer ${
                            isActive
                              ? 'w-2.5 h-2.5 bg-white shadow-xs'
                              : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-white rounded-2xl border border-[#E5E8DF]">
                  <p className="text-xs text-[#737B72]">No active hero slides on storefront</p>
                </div>
              )}
            </div>

            {/* Our Harvest Categories Section (Exact 4 Circular Categories from Screenshot) */}
            <div className="py-4 px-3 bg-white">
              <h3 className="text-base font-extrabold text-[#173D2A] font-heading mb-3 px-1">
                Our Harvest Categories
              </h3>

              <div className="grid grid-cols-4 gap-2 text-center">
                {/* Oils */}
                <div
                  onClick={() => showToast('Simulated: Filtered by Oils category', 'info')}
                  className="cursor-pointer group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#F4EFE6] border border-[#E5DEC9] p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src="/categories/oil.png"
                      alt="Oils"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#173D2A] mt-1.5 block">
                    Oils
                  </span>
                </div>

                {/* Organic Rice */}
                <div
                  onClick={() => showToast('Simulated: Filtered by Organic Rice category', 'info')}
                  className="cursor-pointer group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#F4EFE6] border border-[#E5DEC9] p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src="/categories/rice.png"
                      alt="Organic Rice"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#173D2A] mt-1.5 block">
                    Organic Rice
                  </span>
                </div>

                {/* Organic Millets */}
                <div
                  onClick={() => showToast('Simulated: Filtered by Organic Millets category', 'info')}
                  className="cursor-pointer group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#F4EFE6] border border-[#E5DEC9] p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src="/categories/millet.png"
                      alt="Organic Millets"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#173D2A] mt-1.5 block">
                    Organic Millets
                  </span>
                </div>

                {/* Organic Spices */}
                <div
                  onClick={() => showToast('Simulated: Filtered by Organic Spices category', 'info')}
                  className="cursor-pointer group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#F4EFE6] border border-[#E5DEC9] p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src="/categories/spices.png"
                      alt="Organic Spices"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#173D2A] mt-1.5 block">
                    Organic Spices
                  </span>
                </div>
              </div>
            </div>

            {/* Certifications Row (Jaivik Bharat, FSSAI, USDA Organic, SGS) */}
            <div className="py-3 px-4 bg-[#FAF9F4] flex items-center justify-around border-y border-[#EAE8DE] text-xs">
              <div className="flex items-center gap-1 font-bold text-[#245C3A]">
                <span className="text-base">🇮🇳</span>
                <span className="text-[10px] tracking-tight">Jaivik Bharat</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-[#173D2A]">
                <span className="text-[10px] font-mono border border-neutral-400 px-1 rounded">fssai</span>
                <span className="text-[9px]">Verified</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-[#2F7D4A]">
                <span className="text-sm">🌱</span>
                <span className="text-[10px]">USDA Organic</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-neutral-600">
                <span className="text-xs">✓</span>
                <span className="text-[10px]">SGS Certified</span>
              </div>
            </div>

            {/* Green Ribbon Ticker */}
            <div className="bg-[#173D2A] text-[#F3E7C4] py-1.5 px-4 text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-3 overflow-hidden whitespace-nowrap">
              <span>🌾 100% PURE HARVEST</span>
              <span>•</span>
              <span>GREAT TASTE</span>
              <span>•</span>
              <span>FAST DELIVERY GUARANTEED</span>
              <span>•</span>
              <span>CHEMICAL FREE</span>
            </div>

            {/* Featured Harvest Section (Dynamic Products Connected to Dashboard) */}
            <div className="p-3 bg-white">
              {/* Header with Sparkle and View All */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-[#E8F0EB] text-[#245C3A] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#173D2A] font-heading">
                    Featured Harvest
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E8F0EB] text-[#245C3A]">
                    {activeProducts.length} Live
                  </span>
                </div>

                <button
                  onClick={() => setStorefrontPickerOpen(true)}
                  className="text-xs font-bold text-[#245C3A] hover:underline flex items-center gap-1"
                >
                  <span>View All ({activeProducts.length})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Storefront Products Grid */}
              {activeProducts.length === 0 ? (
                <div className="text-center py-8 p-4 rounded-xl border border-dashed border-[#C0D6C8] bg-[#FAF9F4]">
                  <p className="text-xs text-[#737B72] mb-3">
                    No products are currently published to the storefront!
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setStorefrontPickerOpen(true)}
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Products to Storefront
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {activeProducts.map((p) => (
                    <div
                      key={p.id}
                      className="relative rounded-2xl border border-[#E5E8DF] bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      {/* Admin Remove Button Overlay */}
                      <button
                        onClick={(e) => handleRemoveFromStore(p.id, p.name, e)}
                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-[#B64238] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                        title="Remove from storefront"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Product Thumbnail */}
                      <div className="relative h-28 bg-[#FAF9F4] overflow-hidden">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                          {p.unit}
                        </span>
                      </div>

                      {/* Product Details */}
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-semibold text-[#737B72] uppercase tracking-wider block">
                            {p.categoryName}
                          </span>
                          <h4 className="text-xs font-bold text-[#173D2A] line-clamp-2 mt-0.5 leading-snug">
                            {p.name}
                          </h4>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#E5E8DF]/60 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-extrabold text-[#173D2A] tabular-nums">
                              {formatINR(p.price)}
                            </span>
                            {p.compareAtPrice && (
                              <span className="text-[10px] text-[#737B72] line-through ml-1 tabular-nums block">
                                {formatINR(p.compareAtPrice)}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={handleAddToCart}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#245C3A] text-white hover:bg-[#1a442a] transition-colors shadow-2xs cursor-pointer"
                          >
                            + Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add More Products Button */}
              <div className="mt-4 pt-3 border-t border-[#E5E8DF] flex items-center justify-center">
                <button
                  onClick={() => setStorefrontPickerOpen(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-[#245C3A] bg-[#E8F0EB]/50 hover:bg-[#E8F0EB] text-[#245C3A] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add More Products to Featured Harvest</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
