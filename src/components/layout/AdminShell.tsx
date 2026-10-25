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

export const AdminShell: React.FC = () => {
  const { isMobileNavOpen, setMobileNavOpen } = useAdmin();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf5ea] flex text-[#103b1d]">
      {/* Desktop Sidebar (hidden on mobile, visible from md up) */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileNavOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-80 max-w-[85vw] bg-[#faf5ea] h-full shadow-2xl flex flex-col z-10 border-r border-[#dfd5bf] animate-in slide-in-from-left duration-250">
            <Sidebar
              isMobileDrawer={true}
              onNavClick={() => setMobileNavOpen(false)}
              onClose={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenSearch={() => setIsSearchModalOpen(true)} />

        {/* Scrollable Page Body (with bottom padding on mobile for MobileBottomNav) */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto pb-28 md:pb-8">
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

