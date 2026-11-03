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
            <span className="w-2.5 h-2.5 rounded-full bg-[#18542a] animate-pulse" />
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#103b1d] font-heading">
                Godavari Organics • Live Storefront Simulator
              </h3>
              <p className="text-xs text-[#5a6e54]">
                Real-time preview matching the official Godavari Organic Foods customer store
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl bg-[#faf5ea] p-1 border border-[#dfd5bf] text-xs font-semibold">
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  deviceMode === 'mobile'
                    ? 'bg-white text-[#103b1d] font-bold shadow-xs'
                    : 'text-[#5a6e54]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (390px)</span>
              </button>
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  deviceMode === 'desktop'
                    ? 'bg-white text-[#103b1d] font-bold shadow-xs'
                    : 'text-[#5a6e54]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            </div>

            {/* Sync Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              icon={
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#18542a] ${
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
          <div className="text-xs text-[#5a6e54] text-center sm:text-left">
            <span className="font-bold text-[#103b1d]">Admin Live Link:</span> Tap{' '}
            <strong className="text-[#d52518]">"✕ Remove"</strong> on any item below to take it off the storefront, or tap{' '}
            <strong className="text-[#18542a]">"+ Add Products"</strong> to feature more items.
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStorefrontPickerOpen(true);
              }}
              icon={<Plus className="w-3.5 h-3.5 text-[#18542a]" />}
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
      <div className="flex justify-center bg-[#eae4d3] p-2 sm:p-6 rounded-2xl overflow-hidden min-h-[500px]">
        {/* Device Frame */}
        <div
          className={`transition-all duration-300 bg-[#faf5ea] shadow-2xl border border-[#dfd5bf] overflow-hidden ${
            deviceMode === 'mobile'
              ? 'w-full max-w-[390px] rounded-[36px] ring-8 ring-[#103b1d]'
              : 'w-full rounded-2xl'
          }`}
        >
          {/* Mobile Status Bar Simulation */}
          {deviceMode === 'mobile' && (
            <div className="h-6 bg-[#faf5ea] px-6 flex items-center justify-between text-[10px] font-bold text-[#103b1d] select-none">
              <span>9:41</span>
              <div className="w-20 h-4 bg-[#103b1d] rounded-full mx-auto" />
              <div className="flex items-center gap-1">
                <span>5G</span>
                <div className="w-4 h-2 border border-[#103b1d] rounded-xs bg-[#103b1d]" />
              </div>
            </div>
          )}

          {/* Top Organic Announcement Bar (Direct from Godavari Organic Foods Storefront) */}
          <div className="bg-[#18542a] text-white text-[11px] py-1.5 px-3 border-b border-[#9abc05]/30 flex justify-between items-center font-semibold">
            <span className="bg-[#ffc926] text-[#18542a] font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
              100% Organic
            </span>
            <span className="text-[#f3e8cc] text-[10px] truncate">
              Direct from Godavari River Delta Farmers
            </span>
          </div>

          {/* Customer Storefront Header Bar */}
          <div className="bg-[#faf5ea] px-4 py-3 flex items-center justify-between border-b border-[#dfd5bf]">
            {/* Hamburger Menu */}
            <button
              onClick={() => showToast('Simulated: Customer mobile navigation drawer', 'info')}
              className="p-1 text-[#103b1d] hover:bg-[#f3e8cc] rounded-lg transition-colors cursor-pointer"
              aria-label="Open storefront menu"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Logo: Circular emblem */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-[#dfd5bf] shadow-xs flex items-center justify-center p-0.5 shrink-0">
                <img
                  src="/logo.webp"
                  alt="Godavari Organics Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-heading font-black text-sm tracking-wide text-[#18542a] uppercase">
                Godavari Organics
              </span>
            </div>

            {/* Right Icons: Search & Cart with badge */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => showToast('Simulated: Search storefront catalog', 'info')}
                className="p-1 text-[#103b1d] hover:bg-[#f3e8cc] rounded-lg transition-colors cursor-pointer"
                aria-label="Search storefront"
              >
                <Search className="w-5 h-5 stroke-[2.2]" />
              </button>

              <div
                onClick={handleAddToCart}
                className="relative flex items-center cursor-pointer p-1"
                title="Customer Cart"
              >
                <div className="w-8 h-8 rounded-full border border-[#dfd5bf] bg-white flex items-center justify-center text-[#18542a] shadow-2xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#18542a] text-[#ffc926] text-[10px] font-black flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              </div>
            </div>
          </div>

          {/* Storefront Scrollable Body */}
          <div className="overflow-y-auto max-h-[620px] divide-y divide-[#dfd5bf]/60 bg-[#faf5ea]">
            {/* Hero Carousel Banner */}
            <div className="p-3">
              {currentSlide ? (
                <div className="relative rounded-2xl overflow-hidden shadow-xs border border-[#dfd5bf] bg-[#f3e8cc] aspect-[16/9] flex items-center justify-center">
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

                  {/* Carousel Pagination Dots */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    {activeSlides.map((_, idx) => {
                      const isActive = (currentSlideIndex % activeSlides.length) === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`rounded-full transition-all cursor-pointer ${
                            isActive
                              ? 'w-2.5 h-2.5 bg-[#ffc926] shadow-xs'
                              : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-white rounded-2xl border border-[#dfd5bf]">
                  <p className="text-xs text-[#5a6e54]">No active hero slides on storefront</p>
                </div>
              )}
            </div>

            {/* Our Harvest Categories Section */}
            <div className="py-4 px-3 bg-white">
              <h3 className="text-base font-extrabold text-[#103b1d] font-heading mb-3 px-1">
                Our Harvest Categories
              </h3>

              <div className="grid grid-cols-4 gap-2 text-center">
                {/* Oils */}
                <div
                  onClick={() => showToast('Simulated: Filtered by Oils category', 'info')}
                  className="cursor-pointer group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#f3e8cc]/60 border border-[#dfd5bf] p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src="/categories/oil.webp"
                      alt="Oils"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#103b1d] mt-1.5 block">
                    Oils
                  </span>
                </div>

                {/* Organic Rice */}
                <div
                  onClick={() => showToast('Simulated: Filtered by Organic Rice category', 'info')}
                  className="cursor-pointer group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#f3e8cc]/60 border border-[#dfd5bf] p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src="/categories/rice.webp"
                      alt="Organic Rice"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#103b1d] mt-1.5 block">
                    Organic Rice
                  </span>
                </div>

                {/* Organic Millets */}
                <div
                  onClick={() => showToast('Simulated: Filtered by Organic Millets category', 'info')}
                  className="cursor-pointer group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#f3e8cc]/60 border border-[#dfd5bf] p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src="/categories/millet.webp"
                      alt="Organic Millets"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#103b1d] mt-1.5 block">
                    Organic Millets
                  </span>
                </div>

                {/* Organic Spices */}
                <div
                  onClick={() => showToast('Simulated: Filtered by Organic Spices category', 'info')}
                  className="cursor-pointer group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#f3e8cc]/60 border border-[#dfd5bf] p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src="/categories/spices.webp"
                      alt="Organic Spices"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#103b1d] mt-1.5 block">
                    Organic Spices
                  </span>
                </div>
              </div>
            </div>

            {/* Certifications Row */}
            <div className="py-3 px-4 bg-[#faf5ea] flex items-center justify-around border-y border-[#dfd5bf] text-xs">
              <div className="flex items-center gap-1 font-bold text-[#18542a]">
                <span className="text-base">🇮🇳</span>
                <span className="text-[10px] tracking-tight">Jaivik Bharat</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-[#103b1d]">
                <span className="text-[10px] font-mono border border-neutral-400 px-1 rounded">fssai</span>
                <span className="text-[9px]">Verified</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-[#18542a]">
                <span className="text-sm">🌱</span>
                <span className="text-[10px]">USDA Organic</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-[#5a6e54]">
                <span className="text-xs">✓</span>
                <span className="text-[10px]">SGS Certified</span>
              </div>
            </div>

            {/* Green Ribbon Ticker */}
            <div className="bg-[#18542a] text-[#ffc926] py-1.5 px-4 text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-3 overflow-hidden whitespace-nowrap">
              <span>🌾 100% PURE HARVEST</span>
              <span>•</span>
              <span>TRADITIONAL GODAVARI FARMING</span>
              <span>•</span>
              <span>ZERO CHEMICALS</span>
              <span>•</span>
              <span>DIRECT SOURCING</span>
            </div>

            {/* Featured Harvest Section */}
            <div className="p-3 bg-white">
              {/* Header with Sparkle and View All */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-[#e8f0eb] text-[#18542a] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#103b1d] font-heading">
                    Featured Harvest
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8f0eb] text-[#18542a] border border-[#c0d6c8]">
                    {activeProducts.length} Live
                  </span>
                </div>

                <button
                  onClick={() => setStorefrontPickerOpen(true)}
                  className="text-xs font-bold text-[#18542a] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({activeProducts.length})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Storefront Products Grid */}
              {activeProducts.length === 0 ? (
                <div className="text-center py-8 p-4 rounded-xl border border-dashed border-[#c0d6c8] bg-[#faf5ea]">
                  <p className="text-xs text-[#5a6e54] mb-3">
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
                      className="relative rounded-2xl border border-[#dfd5bf] bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group p-2 text-left"
                    >
                      {/* Admin Remove Button Overlay */}
                      <button
                        onClick={(e) => handleRemoveFromStore(p.id, p.name, e)}
                        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#d52518] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                        title="Remove from storefront"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      {/* Product Thumbnail in Organic Frame */}
                      <div className="relative h-28 bg-gradient-to-b from-[#faf6ee] to-[#f4ede0]/60 rounded-xl overflow-hidden mb-2 p-2 flex items-center justify-center border border-[#dfd5bf]/60">
                        {/* Indian Veg mark */}
                        <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-[2px] border border-emerald-700 bg-white flex items-center justify-center shadow-2xs pointer-events-none">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                        </div>
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                        />
                        <span className="absolute bottom-1.5 right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                          {p.unit}
                        </span>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-[#5a6e54] uppercase tracking-wider block">
                            {p.categoryName}
                          </span>
                          <h4 className="text-xs font-bold text-[#103b1d] line-clamp-2 mt-0.5 leading-snug">
                            {p.name}
                          </h4>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#dfd5bf]/60 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-[#103b1d] tabular-nums">
                              {formatINR(p.price)}
                            </span>
                            {p.compareAtPrice && (
                              <span className="text-[10px] text-[#5a6e54] line-through ml-1 tabular-nums block">
                                {formatINR(p.compareAtPrice)}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={handleAddToCart}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#18542a] text-white hover:bg-[#103b1d] transition-colors shadow-2xs cursor-pointer"
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
              <div className="mt-4 pt-3 border-t border-[#dfd5bf] flex items-center justify-center">
                <button
                  onClick={() => setStorefrontPickerOpen(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-[#18542a] bg-[#e8f0eb]/60 hover:bg-[#e8f0eb] text-[#18542a] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
