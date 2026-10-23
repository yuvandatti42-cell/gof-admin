import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
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

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    '4xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div
          className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all border border-[#E5E8DF] animate-in zoom-in-95 duration-150`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#E5E8DF] px-6 py-4 bg-[#FAF9F4]/60">
            <div>
              <h3 className="text-lg font-semibold text-[#173D2A]">{title}</h3>
              {description && (
                <p className="mt-0.5 text-xs text-[#737B72]">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#737B72] hover:bg-[#EAECE4] hover:text-[#202820] transition-colors focus:outline-none"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[calc(85vh-130px)] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-[#E5E8DF] px-6 py-3.5 bg-[#FAF9F4]/80 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
