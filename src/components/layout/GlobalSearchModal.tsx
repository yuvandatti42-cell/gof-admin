import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { products, orders } = useAdmin();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleClose = React.useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        products: products.slice(0, 3),
        orders: orders.slice(0, 3),
      };
    }

    return {
      products: products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q)
        )
        .slice(0, 4),
      orders: orders
        .filter(
          (o) =>
            o.id.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.customerEmail.toLowerCase().includes(q)
        )
        .slice(0, 4),
    };
  }, [query, products, orders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={handleClose}
      />

      <div className="flex min-h-full items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
        <div
          className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl border border-[#E5E8DF] animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8DF] bg-white">
            <Search className="w-5 h-5 text-[#245C3A] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, orders, customers, or SKUs..."
              className="w-full text-sm sm:text-base text-[#202820] placeholder-[#737B72] bg-transparent focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-[#737B72] hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-[#737B72] bg-[#FAF9F4] border border-[#E5E8DF] rounded-md">
              ESC
            </kbd>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
            {/* Products Section */}
            {filteredResults.products.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#737B72] px-2 mb-2 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#245C3A]" />
                    Products
                  </span>
                  <button
                    onClick={() => {
                      navigate('/products');
                      onClose();
                    }}
                    className="text-[#245C3A] hover:underline normal-case font-normal text-xs flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {filteredResults.products.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        navigate('/products');
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF9F4] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover border border-[#E5E8DF] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#202820] truncate group-hover:text-[#245C3A]">
                            {p.name}
                          </p>
                          <p className="text-xs text-[#737B72]">
                            {p.sku} • {p.categoryName} • Stock: {p.stock}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#173D2A] tabular-nums shrink-0 ml-3">
                        {formatINR(p.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Section */}
            {filteredResults.orders.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#737B72] px-2 mb-2 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#245C3A]" />
                    Orders
                  </span>
                  <button
                    onClick={() => {
                      navigate('/orders');
                      onClose();
                    }}
                    className="text-[#245C3A] hover:underline normal-case font-normal text-xs flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {filteredResults.orders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => {
                        navigate('/orders');
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF9F4] transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#202820] truncate group-hover:text-[#245C3A]">
                          #{o.id} — {o.customerName}
                        </p>
                        <p className="text-xs text-[#737B72]">
                          {o.items.length} items • {o.orderStatus} • {o.paymentMethod}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[#173D2A] tabular-nums shrink-0 ml-3">
                        {formatINR(o.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredResults.products.length === 0 &&
              filteredResults.orders.length === 0 && (
                <div className="py-12 text-center text-sm text-[#737B72]">
                  No matching records found for "{query}".
                </div>
              )}
          </div>

          {/* Quick Shortcuts Footer */}
          <div className="px-4 py-3 bg-[#FAF9F4] border-t border-[#E5E8DF] flex flex-wrap items-center justify-between text-[11px] text-[#737B72] gap-2">
            <div className="flex items-center gap-3">
              <span>Quick links:</span>
              <button
                onClick={() => {
                  navigate('/store-content');
                  onClose();
                }}
                className="hover:text-[#245C3A]"
              >
                Store Content (Hero Slider)
              </button>
            </div>
            <span>Use ↑↓ to navigate • ↵ to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};
