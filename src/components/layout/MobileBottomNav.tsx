import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  Package,
  ShoppingBag,
  Plus,
  LayoutTemplate,
  Menu,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    products,
    orders,
    setMobileNavOpen,
    setQuickAddModalOpen,
  } = useAdmin();

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing'
  ).length;

  const lowStockCount = products.filter((p) => p.stock <= 15).length;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E8DF] px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none safe-area-pb"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14">
        {/* Products Tab */}
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors relative ${
              isActive
                ? 'text-[#245C3A] font-bold'
                : 'text-[#737B72] hover:text-[#202820]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Package className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {lowStockCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-1 rounded-full bg-[#B7791F] text-white text-[8px] font-bold flex items-center justify-center">
                    !
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#245C3A]" />
                )}
              </div>
              <span className="mt-1">Products</span>
            </>
          )}
        </NavLink>

        {/* Orders Tab */}
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors relative ${
              isActive
                ? 'text-[#245C3A] font-bold'
                : 'text-[#737B72] hover:text-[#202820]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <ShoppingBag className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-1 rounded-full bg-[#245C3A] text-white text-[8px] font-bold flex items-center justify-center">
                    {pendingOrdersCount}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#245C3A]" />
                )}
              </div>
              <span className="mt-1">Orders</span>
            </>
          )}
        </NavLink>

        {/* Center Quick Add Product Action Button */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-4">
          <button
            onClick={() => setQuickAddModalOpen(true)}
            className="w-12 h-12 rounded-full bg-[#245C3A] text-white flex items-center justify-center shadow-lg hover:bg-[#1a442a] active:scale-95 transition-all cursor-pointer ring-4 ring-white"
            aria-label="Add new product"
            title="Add Product"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-bold text-[#245C3A] mt-0.5">+ Product</span>
        </div>

        {/* Store Content (Hero Banners) Tab */}
        <NavLink
          to="/store-content"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors relative ${
              isActive
                ? 'text-[#245C3A] font-bold'
                : 'text-[#737B72] hover:text-[#202820]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <LayoutTemplate className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#245C3A]" />
                )}
              </div>
              <span className="mt-1">Banners</span>
            </>
          )}
        </NavLink>

        {/* More Menu Drawer Trigger */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium text-[#737B72] hover:text-[#202820] transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
          <span className="mt-1">Menu</span>
        </button>
      </div>
    </nav>
  );
};
