import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex pl-10 max-w-full">
        <div
          className={`w-screen ${widthClasses[width]} bg-white shadow-2xl flex flex-col border-l border-[#E5E8DF] animate-in slide-in-from-right duration-250`}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#E5E8DF] px-6 py-5 bg-[#FAF9F4]/70">
            <div>
              <h3 className="text-xl font-semibold text-[#173D2A]">{title}</h3>
              {subtitle && <p className="text-xs text-[#737B72] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#737B72] hover:bg-[#EAECE4] hover:text-[#202820] transition-colors focus:outline-none"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="border-t border-[#E5E8DF] px-6 py-4 bg-[#FAF9F4]/90 flex items-center justify-end gap-3 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
