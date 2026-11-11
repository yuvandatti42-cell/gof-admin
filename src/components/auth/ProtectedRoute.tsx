import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf5ea] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-[#18542a] flex items-center justify-center shadow-lg mb-4 relative overflow-hidden">
          <img
            src="/logo.webp"
            alt="Godavari Organic"
            className="w-11 h-11 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 border border-[#9abc05]/40 rounded-2xl pointer-events-none" />
        </div>
        <div className="flex items-center gap-2.5 text-[#18542a] font-semibold text-sm mb-1">
          <Loader2 className="w-4 h-4 animate-spin text-[#9abc05]" />
          <span>Verifying secure admin authorization...</span>
        </div>
        <p className="text-xs text-[#5a6e54] flex items-center gap-1.5 mt-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#18542a]" />
          TLS 1.3 Encrypted Session
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

