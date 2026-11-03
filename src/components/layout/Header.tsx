import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Sliders,
  LogOut,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { NotificationsPopover } from './NotificationsPopover';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setMobileNavOpen,
    notifications,
    resetToDemoData,
    setLiveStorefrontOpen,
    firebaseConnected,
    isFirebaseSyncing,
  } = useAdmin();
  const { showToast } = useToast();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return { title: 'Executive Overview', category: 'Analytics & Insights' };
      case '/products':
        return { title: 'Products Catalog', category: 'Catalog Management' };
      case '/categories':
        return { title: 'Categories', category: 'Catalog Management' };
      case '/orders':
        return { title: 'Orders', category: 'Sales & Fulfillment' };
      case '/customers':
        return { title: 'Customers', category: 'Customer Directory' };
      case '/promotions':
        return { title: 'Promotions & Coupons', category: 'Marketing' };
      case '/store-content':
        return { title: 'Store Visuals & Images', category: 'Media & Branding Manager' };
      case '/settings':
        return { title: 'Settings', category: 'Store Configuration' };
      default:
        return { title: 'Admin', category: 'Management' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="h-16 sticky top-0 z-20 bg-[#faf5ea]/95 backdrop-blur-md border-b border-[#dfd5bf] px-3 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger, Logo & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="md:hidden p-2 rounded-xl text-[#5a6e54] hover:bg-[#f3e8cc] hover:text-[#103b1d] transition-colors cursor-pointer shrink-0"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="md:hidden w-9 h-9 rounded-full bg-white border border-[#dfd5bf] shadow-2xs flex items-center justify-center shrink-0 p-0.5 overflow-hidden">
          <img
            src="/logo.webp"
            alt="Godavari Organics"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="hidden sm:inline-block text-[11px] font-semibold text-[#5a6e54] tracking-wide truncate">
            Godavari Organics / {pageInfo.category}
          </span>
          <h1 className="text-sm xs:text-base sm:text-xl font-extrabold text-[#103b1d] leading-tight font-heading truncate max-w-[125px] xs:max-w-[180px] sm:max-w-none">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls: Search, Live Store, Demo badge, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Search affordance button (icon-only on small mobile, search bar on sm+) */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 sm:w-56 md:w-64 rounded-xl bg-white border border-[#dfd5bf] text-xs text-[#5a6e54] hover:border-[#18542a]/40 hover:bg-[#faf5ea] transition-all shadow-2xs group cursor-pointer"
          aria-label="Search store records"
        >
          <Search className="w-4 h-4 text-[#5a6e54] group-hover:text-[#18542a] transition-colors shrink-0" />
          <span className="hidden sm:inline-block truncate">Search store...</span>
          <kbd className="hidden sm:inline-flex ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#faf5ea] border border-[#dfd5bf] text-[#5a6e54]">
            ⌘K
          </kbd>
        </button>

        {/* Live Storefront Preview Button */}
        <button
          onClick={() => setLiveStorefrontOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#ffc926] text-[#103b1d] hover:bg-[#f2be1d] border border-[#e5b31f] text-xs font-black transition-all shadow-xs cursor-pointer shrink-0"
          title="Open Godavari Organics live mobile store preview"
        >
          <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden xs:inline">Live Store</span>
        </button>

        {/* Firebase Live Cloud Connection Indicator */}
        {isFirebaseSyncing ? (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[11px] font-bold text-[#92400e]">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
            <span>Syncing Cloud...</span>
          </div>
        ) : firebaseConnected ? (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f5ec] border border-[#a3d9b1] text-[11px] font-bold text-[#18542a] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#18542a] animate-pulse" />
            <span>Live Cloud Connected</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f3e8cc] border border-[#dfd5bf] text-[11px] font-bold text-[#5a6e54]">
            <Sparkles className="w-3.5 h-3.5 text-[#f96015]" />
            <span>Local Cache</span>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-[#5a6e54] hover:bg-[#f3e8cc]/60 hover:text-[#103b1d] transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d52518] ring-2 ring-white" />
            )}
          </button>
          <NotificationsPopover
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* Store Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 sm:px-2 rounded-xl hover:bg-[#f3e8cc]/60 border border-transparent hover:border-[#dfd5bf] transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#18542a] text-[#ffc926] font-extrabold text-xs flex items-center justify-center shadow-2xs">
              SA
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-[#103b1d]">
              Store Admin
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5a6e54] hidden sm:block" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#dfd5bf] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-[#dfd5bf] bg-[#faf5ea]">
                <p className="text-xs font-extrabold text-[#103b1d]">Srinivas Rao Vaddi</p>
                <p className="text-[11px] text-[#5a6e54]">admin@godavariorganic.in</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8f0eb] text-[#18542a] border border-[#c0d6c8]">
                  Store Operations
                </span>
              </div>
              <div className="p-1 text-xs text-[#103b1d]">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#faf5ea] transition-colors text-left cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[#5a6e54]" />
                  Store Settings
                </button>
                <button
                  onClick={() => {
                    navigate('/store-content');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#faf5ea] transition-colors text-left cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#5a6e54]" />
                  Storefront Content
                </button>
                <button
                  onClick={() => {
                    setIsResetModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#fff8e1] text-[#946200] transition-colors text-left cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Demo Data
                </button>
              </div>
              <div className="p-1 border-t border-[#dfd5bf] text-xs">
                <button
                  onClick={() => {
                    setIsSignoutModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#fdeeed] text-[#d52518] transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out (Demo)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Demo Data Reset */}
      <ConfirmDialog
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => {
          resetToDemoData();
          showToast('Sample dataset restored to initial state.', 'info', 'Data Reset');
        }}
        title="Reset All Demo Data?"
        message="This will reset all modified products, categories, orders, promotions, and settings back to their original mock values. LocalStorage data will be refreshed."
        confirmText="Reset to Initial Data"
        variant="warning"
      />

      {/* Mock Sign Out Dialog */}
      <ConfirmDialog
        isOpen={isSignoutModalOpen}
        onClose={() => setIsSignoutModalOpen(false)}
        onConfirm={() => {
          showToast('Signed out of demo session. Demo session remains ready.', 'info', 'Demo Session');
        }}
        title="Sign Out (Frontend Demo)"
        message="In this frontend-only prototype, authentication is not connected to a server. You can continue testing all features without signing out."
        confirmText="Close Session"
        cancelText="Stay Logged In"
        variant="primary"
      />
    </header>
  );
};
