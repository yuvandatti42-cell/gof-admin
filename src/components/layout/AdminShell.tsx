import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { GlobalSearchModal } from './GlobalSearchModal';
import { LiveStorefrontModal } from '../storefront/LiveStorefrontModal';
import { AddProductToStorefrontModal } from '../products/AddProductToStorefrontModal';
import { QuickAddProductModal } from '../products/QuickAddProductModal';
import { useAdmin } from '../../context/AdminContext';
import { X } from 'lucide-react';

export const AdminShell: React.FC = () => {
  const { isMobileNavOpen, setMobileNavOpen } = useAdmin();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F6EF] flex text-[#202820]">
      {/* Desktop Sidebar (hidden on mobile, visible from md up) */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileNavOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-[#FAF9F4] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250">
            <div className="absolute top-4 right-3">
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 rounded-lg text-[#737B72] hover:bg-[#EAECE4] hover:text-[#202820]"
                aria-label="Close mobile navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onNavClick={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenSearch={() => setIsSearchModalOpen(true)} />

        {/* Scrollable Page Body (with bottom padding on mobile for MobileBottomNav) */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Modals & Dialogs */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
      <LiveStorefrontModal />
      <AddProductToStorefrontModal />
      <QuickAddProductModal />
    </div>
  );
};

