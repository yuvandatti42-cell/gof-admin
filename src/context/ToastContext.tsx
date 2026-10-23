import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: Toast = { id, type, title, message };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast floating container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              toast.type === 'success'
                ? 'bg-white border-[#2F7D4A]/30 text-[#202820]'
                : toast.type === 'error'
                ? 'bg-white border-[#B64238]/30 text-[#202820]'
                : toast.type === 'warning'
                ? 'bg-white border-[#B7791F]/30 text-[#202820]'
                : 'bg-white border-[#356AA0]/30 text-[#202820]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#2F7D4A]" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#B64238]" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#B7791F]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#356AA0]" />}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-sm font-semibold text-[#202820] mb-0.5 leading-snug">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs text-[#737B72] leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-md text-[#737B72] hover:text-[#202820] hover:bg-neutral-100 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
