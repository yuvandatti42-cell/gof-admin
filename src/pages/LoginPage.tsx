import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, login, resetPassword } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // If already authenticated, redirect to previous page or dashboard
  if (!isLoading && isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your Admin ID and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        showToast('Signed in successfully to Admin Portal.', 'success', 'Authenticated');
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showToast('Please enter your admin email.', 'warning');
      return;
    }

    setIsForgotSubmitting(true);
    setForgotSuccess(null);
    try {
      const res = await resetPassword(forgotEmail);
      if (res.success) {
        setForgotSuccess(res.message || 'Password reset link sent to your email.');
        showToast('Password reset link sent to your email.', 'success');
      } else {
        showToast(res.error || 'Failed to send reset link.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error sending reset email.', 'error');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf5ea] flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-[#103b1d]">
      {/* Decorative ambient background blur orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#9abc05]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#18542a]/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#18542a] flex items-center justify-center shadow-xl border-2 border-[#ffc926] relative overflow-hidden mb-4 group transition-transform hover:scale-105 duration-300">
            <img
              src="/logo.webp"
              alt="Godavari Organic Foods"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18542a]/10 text-[#18542a] text-xs font-bold font-mono tracking-wider uppercase mb-2 border border-[#18542a]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#18542a]" />
            Secure Admin Portal
          </span>

          <h1 className="font-urbanist font-black text-2xl sm:text-3xl text-[#103b1d] tracking-tight">
            Arma Farms & Godavari Organics
          </h1>
          <p className="text-xs sm:text-sm text-[#5a6e54] mt-1 font-medium max-w-sm">
            Please enter your administrator ID and secure password to access store operations.
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-white/95 backdrop-blur-md border border-[#dfd5bf] shadow-xl rounded-3xl p-6 sm:p-8">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-[#fdeeed] border border-[#d52518]/30 rounded-2xl flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#d52518] shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-[#a0180e] font-semibold leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Admin ID / Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-[#103b1d] uppercase tracking-wider mb-1.5"
              >
                Admin ID / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-[#5a6e54]" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  autoFocus
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@armafarms.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf5ea]/50 border border-[#dfd5bf] rounded-xl text-sm text-[#103b1d] placeholder-[#5a6e54]/50 focus:outline-none focus:border-[#18542a] focus:ring-2 focus:ring-[#18542a]/20 transition-all font-medium disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-[#103b1d] uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-xs font-bold text-[#18542a] hover:text-[#103b1d] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[#5a6e54]" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#faf5ea]/50 border border-[#dfd5bf] rounded-xl text-sm text-[#103b1d] placeholder-[#5a6e54]/50 focus:outline-none focus:border-[#18542a] focus:ring-2 focus:ring-[#18542a]/20 transition-all font-medium disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5a6e54] hover:text-[#103b1d] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Keep me signed in button / checkbox */}
            <div className="pt-1.5">
              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      rememberMe
                        ? 'bg-[#18542a] border-[#18542a] text-white shadow-xs'
                        : 'bg-white border-[#dfd5bf] group-hover:border-[#18542a]'
                    }`}
                  >
                    {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-[#103b1d] group-hover:text-[#18542a] transition-colors">
                    Keep me signed in
                  </span>
                  <p className="text-[11px] text-[#5a6e54] leading-tight mt-0.5">
                    Stay logged in on this device until you explicitly choose to sign out.
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#18542a] hover:bg-[#103b1d] active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#9abc05]" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Hardened Security Assurance Footer */}
          <div className="mt-6 pt-5 border-t border-[#dfd5bf]/60 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-[#5a6e54] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#18542a] shrink-0" />
              <span>TLS 1.3 End-to-End Encrypted Authentication</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#5a6e54] font-medium">
              <KeyRound className="w-3.5 h-3.5 text-[#18542a] shrink-0" />
              <span>Zero Public Passwords — Protected by Google Identity Cloud</span>
            </div>
          </div>
        </div>

        {/* Bottom Helper Note */}
        <p className="text-center text-[11px] text-[#5a6e54] mt-6 font-medium">
          Authorized personnel only. All administrative access requests are monitored and logged.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl border border-[#dfd5bf] shadow-2xl max-w-md w-full p-6 sm:p-7 relative animate-in zoom-in-95 duration-200">
            <h3 className="font-urbanist font-black text-lg sm:text-xl text-[#103b1d]">
              Reset Admin Password
            </h3>
            <p className="text-xs text-[#5a6e54] mt-1 leading-relaxed">
              Enter your registered administrator email address. A password reset link will be sent to your inbox.
            </p>

            {forgotSuccess ? (
              <div className="mt-4 p-4 bg-[#e8f0eb] border border-[#18542a]/30 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#18542a] shrink-0 mt-0.5" />
                <div className="text-xs text-[#18542a] font-semibold leading-relaxed">
                  {forgotSuccess}
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#103b1d] uppercase tracking-wider mb-1.5">
                    Registered Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@armafarms.com"
                    disabled={isForgotSubmitting}
                    className="w-full px-4 py-2.5 bg-[#faf5ea]/50 border border-[#dfd5bf] rounded-xl text-sm text-[#103b1d] focus:outline-none focus:border-[#18542a] focus:ring-2 focus:ring-[#18542a]/20 transition-all font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(false);
                      setForgotSuccess(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-[#dfd5bf] hover:bg-[#faf5ea] text-xs font-bold text-[#5a6e54] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#18542a] hover:bg-[#103b1d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isForgotSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9abc05]" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {forgotSuccess && (
              <div className="mt-5 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotSuccess(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#18542a] text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default LoginPage;
