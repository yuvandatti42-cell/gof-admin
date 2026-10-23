import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  Package,
  ShoppingBag,
  LayoutTemplate,
  Settings,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  onNavClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavClick }) => {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    products,
    orders,
    resetToDemoData,
  } = useAdmin();

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing'
  ).length;

  const lowStockCount = products.filter((p) => p.stock <= 15).length;

  const navItems = [
    {
      to: '/products',
      label: 'Products',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : `${products.length}`,
      badgeColor: lowStockCount > 0 ? 'bg-[#FEF7EA] text-[#B7791F]' : 'bg-[#FAF9F4] text-[#737B72]',
    },
    {
      to: '/orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null,
      badgeColor: 'bg-[#E8F0EB] text-[#245C3A]',
    },
    {
      to: '/store-content',
      label: 'Store Content',
      icon: LayoutTemplate,
      badge: null,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#FAF9F4] border-r border-[#E5E8DF] flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-[#E5E8DF] justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E5E8DF] shadow-xs flex items-center justify-center shrink-0 p-0.5 overflow-hidden">
              <img
                src="/logo.png"
                alt="Godavari Organics Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="block text-sm font-bold text-[#173D2A] tracking-tight truncate leading-tight">
                  Godavari Organics
                </span>
                <span className="inline-block text-[10px] font-semibold text-[#6F9F62] tracking-wider uppercase">
                  Admin Panel
                </span>
              </div>
            )}
          </div>
          {/* Collapse button on desktop */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-[#737B72] hover:text-[#202820] hover:bg-[#ECEFE8] transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Destination List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onNavClick}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#E8F0EB] text-[#245C3A] font-semibold shadow-xs'
                      : 'text-[#555E53] hover:text-[#173D2A] hover:bg-[#F0F2EB]'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active left indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#245C3A] rounded-r-full" />
                    )}
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? 'text-[#245C3A]' : 'text-[#737B72] group-hover:text-[#245C3A]'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!isSidebarCollapsed && item.badge && (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#E5E8DF] tabular-nums ${item.badgeColor}`}
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
      <div className="p-3 border-t border-[#E5E8DF] bg-[#FAF9F4] space-y-2">
        {/* Frontend Demo Notice Badge */}
        {!isSidebarCollapsed ? (
          <div className="px-3 py-2 rounded-xl bg-[#E8F0EB]/60 border border-[#C0D6C8] text-[11px] text-[#245C3A] flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D4A] animate-pulse" />
              Demo Data Mode
            </span>
            <button
              onClick={() => {
                if (window.confirm('Reset all sample data back to default initial state?')) {
                  resetToDemoData();
                }
              }}
              title="Reset sample data"
              className="text-[#245C3A] hover:text-[#173D2A] hover:bg-white/80 p-1 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <span
              title="Demo Data Mode"
              className="w-2.5 h-2.5 rounded-full bg-[#2F7D4A]"
            />
          </div>
        )}

        {/* Admin profile snippet */}
        <div
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-[#F0F2EB] transition-colors cursor-pointer ${
            isSidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-[#173D2A] text-[#FAF9F4] font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
            SA
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#173D2A] truncate">Store Admin</p>
              <p className="text-[11px] text-[#737B72] truncate">admin@godavariorganic.in</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
