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
      case '/products':
        return { title: 'Products', category: 'Catalog Management' };
      case '/categories':
        return { title: 'Categories', category: 'Catalog Management' };
      case '/orders':
        return { title: 'Orders', category: 'Sales & Fulfillment' };
      case '/customers':
        return { title: 'Customers', category: 'Customer Directory' };
      case '/promotions':
        return { title: 'Promotions & Coupons', category: 'Marketing' };
      case '/store-content':
        return { title: 'Store Content', category: 'Online Storefront' };
      case '/settings':
        return { title: 'Settings', category: 'Store Configuration' };
      default:
        return { title: 'Admin', category: 'Management' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="h-16 sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E5E8DF] px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Breadcrumb Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="md:hidden p-2 rounded-xl text-[#737B72] hover:bg-[#FAF9F4] hover:text-[#202820] transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <span className="hidden sm:inline-block text-[11px] font-medium text-[#737B72]">
            Godavari Organics / {pageInfo.category}
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-[#173D2A] leading-tight font-heading">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls: Search, Demo badge, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search affordance button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 sm:w-64 rounded-xl bg-[#FAF9F4] border border-[#E5E8DF] text-xs text-[#737B72] hover:border-[#6F9F62] hover:bg-white transition-all shadow-2xs group cursor-pointer"
        >
          <Search className="w-4 h-4 text-[#737B72] group-hover:text-[#245C3A] transition-colors shrink-0" />
          <span className="hidden sm:inline-block truncate">Search store records...</span>
          <span className="sm:hidden">Search</span>
          <kbd className="hidden sm:inline-flex ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#E5E8DF] text-[#737B72]">
            ⌘K
          </kbd>
        </button>

        {/* Live Storefront Preview Button */}
        <button
          onClick={() => setLiveStorefrontOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#E8F0EB] text-[#245C3A] hover:bg-[#d5e7db] border border-[#C0D6C8] text-xs font-bold transition-all shadow-2xs cursor-pointer"
          title="Open Godavari Organics live mobile store preview"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Live Store</span>
        </button>

        {/* Demo Indicator Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF9F4] border border-[#E5E8DF] text-[11px] font-medium text-[#737B72]">
          <Sparkles className="w-3.5 h-3.5 text-[#B7791F]" />
          <span>Demo Data</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-[#737B72] hover:bg-[#FAF9F4] hover:text-[#202820] transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B64238] ring-2 ring-white" />
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
            className="flex items-center gap-2 p-1.5 sm:px-2 rounded-xl hover:bg-[#FAF9F4] border border-transparent hover:border-[#E5E8DF] transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#245C3A] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              SA
            </div>
            <span className="hidden md:inline-block text-xs font-semibold text-[#173D2A]">
              Store Admin
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#737B72] hidden sm:block" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E5E8DF] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-[#E5E8DF] bg-[#FAF9F4]">
                <p className="text-xs font-bold text-[#173D2A]">Srinivas Rao Vaddi</p>
                <p className="text-[11px] text-[#737B72]">admin@godavariorganic.in</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8F0EB] text-[#245C3A]">
                  Store Operations
                </span>
              </div>
              <div className="p-1 text-xs text-[#202820]">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FAF9F4] transition-colors text-left"
                >
                  <Sliders className="w-4 h-4 text-[#737B72]" />
                  Store Settings
                </button>
                <button
                  onClick={() => {
                    navigate('/store-content');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FAF9F4] transition-colors text-left"
                >
                  <ExternalLink className="w-4 h-4 text-[#737B72]" />
                  Storefront Content
                </button>
                <button
                  onClick={() => {
                    setIsResetModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FEF7EA] text-[#B7791F] transition-colors text-left"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Demo Data
                </button>
              </div>
              <div className="p-1 border-t border-[#E5E8DF] text-xs">
                <button
                  onClick={() => {
                    setIsSignoutModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FDEEED] text-[#B64238] transition-colors text-left"
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
