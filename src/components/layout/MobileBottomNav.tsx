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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#faf5ea]/95 backdrop-blur-md border-t border-[#dfd5bf] shadow-[0_-8px_30px_rgba(16,59,29,0.08)] select-none pb-[max(env(safe-area-inset-bottom),8px)]"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 sm:h-20 px-2 max-w-lg mx-auto">
        {/* Products Tab */}
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all relative ${
              isActive
                ? 'text-[#18542a]'
                : 'text-[#5a6e54] hover:text-[#103b1d]'
            }`
          }
        >
          {({ isActive }) => (
            <div className={`flex flex-col items-center justify-center w-full px-2 py-1 rounded-2xl transition-all ${isActive ? 'bg-[#18542a]/10' : ''}`}>
              <div className="relative flex items-center justify-center">
                <Package className={`w-6 h-6 ${isActive ? 'stroke-[2.8] text-[#18542a]' : 'stroke-[2.2]'}`} />
                {lowStockCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#f96015] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    !
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-extrabold mt-1 tracking-tight ${isActive ? 'text-[#18542a]' : 'text-[#5a6e54]'}`}>
                Products
              </span>
            </div>
          )}
        </NavLink>

        {/* Orders Tab */}
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all relative ${
              isActive
                ? 'text-[#18542a]'
                : 'text-[#5a6e54] hover:text-[#103b1d]'
            }`
          }
        >
          {({ isActive }) => (
            <div className={`flex flex-col items-center justify-center w-full px-2 py-1 rounded-2xl transition-all ${isActive ? 'bg-[#18542a]/10' : ''}`}>
              <div className="relative flex items-center justify-center">
                <ShoppingBag className={`w-6 h-6 ${isActive ? 'stroke-[2.8] text-[#18542a]' : 'stroke-[2.2]'}`} />
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#18542a] text-[#ffc926] text-[9px] font-black flex items-center justify-center shadow-xs">
                    {pendingOrdersCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-extrabold mt-1 tracking-tight ${isActive ? 'text-[#18542a]' : 'text-[#5a6e54]'}`}>
                Orders
              </span>
            </div>
          )}
        </NavLink>

        {/* Center Prominent Quick Add Action Button */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-6 sm:-mt-7 z-10 shrink-0">
          <button
            onClick={() => setQuickAddModalOpen(true)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#18542a] text-[#ffc926] flex items-center justify-center shadow-[0_8px_20px_rgba(24,84,42,0.35)] hover:bg-[#103b1d] active:scale-95 transition-all cursor-pointer ring-4 ring-[#faf5ea]"
            aria-label="Add new product"
            title="Add Product"
          >
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
          </button>
          <span className="text-[10px] font-black text-[#18542a] uppercase tracking-wider mt-1 drop-shadow-2xs">
            + Product
          </span>
        </div>

        {/* Store Visuals (Hero & Images) Tab */}
        <NavLink
          to="/store-content"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all relative ${
              isActive
                ? 'text-[#18542a]'
                : 'text-[#5a6e54] hover:text-[#103b1d]'
            }`
          }
        >
          {({ isActive }) => (
            <div className={`flex flex-col items-center justify-center w-full px-2 py-1 rounded-2xl transition-all ${isActive ? 'bg-[#18542a]/10' : ''}`}>
              <div className="relative flex items-center justify-center">
                <LayoutTemplate className={`w-6 h-6 ${isActive ? 'stroke-[2.8] text-[#18542a]' : 'stroke-[2.2]'}`} />
              </div>
              <span className={`text-[11px] font-extrabold mt-1 tracking-tight ${isActive ? 'text-[#18542a]' : 'text-[#5a6e54]'}`}>
                Visuals
              </span>
            </div>
          )}
        </NavLink>

        {/* More Menu Drawer Trigger */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all cursor-pointer text-[#5a6e54] hover:text-[#103b1d]"
          aria-label="Open navigation menu"
        >
          <div className="flex flex-col items-center justify-center w-full px-2 py-1 rounded-2xl">
            <Menu className="w-6 h-6 stroke-[2.2]" />
            <span className="text-[11px] font-extrabold mt-1 tracking-tight">
              Menu
            </span>
          </div>
        </button>
      </div>
    </nav>
  );
};
