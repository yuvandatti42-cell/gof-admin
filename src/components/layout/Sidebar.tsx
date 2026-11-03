import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Image as ImageIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from 'lucide-react';

interface SidebarProps {
  onNavClick?: () => void;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavClick, onClose, isMobileDrawer = false }) => {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    products,
    categories,
    orders,
    customers,
    promotions,
    resetToDemoData,
  } = useAdmin();

  const collapsed = isMobileDrawer ? false : isSidebarCollapsed;

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing'
  ).length;

  const lowStockCount = products.filter((p) => p.stock <= 15).length;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: '',
    },
    {
      to: '/products',
      label: 'Products',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : `${products.length}`,
      badgeColor: lowStockCount > 0 ? 'bg-[#fff8e1] text-[#946200] border-[#ffe082]' : 'bg-white/80 text-[#526651] border-[#dfd5bf]',
    },
    {
      to: '/categories',
      label: 'Categories',
      icon: Layers,
      badge: `${categories.length}`,
      badgeColor: 'bg-white/80 text-[#526651] border-[#dfd5bf]',
    },
    {
      to: '/orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null,
      badgeColor: 'bg-[#e8f0eb] text-[#18542a] border-[#c0d6c8]',
    },
    {
      to: '/customers',
      label: 'Customers',
      icon: Users,
      badge: `${customers.length}`,
      badgeColor: 'bg-white/80 text-[#526651] border-[#dfd5bf]',
    },
    {
      to: '/promotions',
      label: 'Promotions',
      icon: Tag,
      badge: `${promotions.filter((p) => p.status === 'Active').length} active`,
      badgeColor: 'bg-[#fffae6] text-[#8f6300] border-[#ffec99]',
    },
    {
      to: '/store-content',
      label: 'Store Visuals & Images',
      icon: ImageIcon,
      badge: 'Visuals',
      badgeColor: 'bg-[#f4f8e6] text-[#637d03] border-[#d4e499]',
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <aside
      className={`h-full md:h-screen md:sticky md:top-0 bg-[#faf5ea] border-r border-[#dfd5bf] flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-full md:w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-[#dfd5bf] justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-full bg-white border border-[#dfd5bf] shadow-2xs flex items-center justify-center shrink-0 p-0.5 overflow-hidden">
              <img
                src="/logo.webp"
                alt="Godavari Organics Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block text-sm font-extrabold text-[#103b1d] font-heading tracking-tight truncate leading-tight">
                  Godavari Organics
                </span>
                <span className="inline-block text-[10px] font-black text-[#18542a] tracking-widest uppercase">
                  Admin Panel
                </span>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl text-[#5a6e54] hover:text-[#103b1d] hover:bg-[#f3e8cc] transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {/* Collapse button on desktop */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-[#5a6e54] hover:text-[#103b1d] hover:bg-[#f3e8cc] transition-colors cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Destination List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onNavClick}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#18542a] text-white shadow-xs'
                      : 'text-[#455843] hover:text-[#103b1d] hover:bg-[#f3e8cc]/60'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active left indicator with sunshine yellow */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#ffc926] rounded-r-full" />
                    )}
                    <Icon
                      className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                        isActive ? 'text-[#ffc926]' : 'text-[#5a6e54] group-hover:text-[#18542a]'
                      }`}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums ${
                          isActive
                            ? 'bg-white/20 text-[#ffc926] border-white/25'
                            : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: User profile & demo notices */}
      <div className="p-3 border-t border-[#dfd5bf] bg-[#faf5ea] space-y-2">
        {/* Frontend Demo Notice Badge */}
        {!collapsed ? (
          <div className="px-3 py-2 rounded-xl bg-[#f3e8cc] border border-[#dfd5bf] text-[11px] text-[#18542a] flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#18542a] animate-pulse" />
              Demo Data Mode
            </span>
            <button
              onClick={() => {
                if (window.confirm('Reset all sample data back to default initial state?')) {
                  resetToDemoData();
                }
              }}
              title="Reset sample data"
              className="text-[#18542a] hover:text-[#103b1d] hover:bg-white/80 p-1 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <span
              title="Demo Data Mode"
              className="w-2.5 h-2.5 rounded-full bg-[#18542a]"
            />
          </div>
        )}

        {/* Admin profile snippet */}
        <div
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-[#f3e8cc]/60 transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-[#18542a] text-[#ffc926] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            SA
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#103b1d] truncate">Store Admin</p>
              <p className="text-[10px] text-[#5a6e54] truncate">admin@godavariorganic.in</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
