import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'leaf' | 'sunshine' | 'kiwi';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconRight,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer tracking-wide';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#18542a] text-white hover:bg-[#103b1d] active:bg-[#0c2e16] focus:ring-[#18542a] shadow-xs border border-transparent',
    secondary:
      'bg-white text-[#103b1d] border border-[#dfd5bf] hover:bg-[#faf5ea] hover:border-[#18542a]/40 active:bg-[#f3e8cc] focus:ring-[#9abc05] shadow-2xs',
    outline:
      'bg-transparent text-[#103b1d] border border-[#dfd5bf] hover:bg-[#faf5ea] hover:border-[#18542a]/40 active:bg-[#f3e8cc] focus:ring-[#9abc05]',
    danger:
      'bg-[#d52518] text-white hover:bg-[#b81f14] active:bg-[#9c180e] focus:ring-[#d52518] shadow-xs border border-transparent',
    ghost:
      'bg-transparent text-[#103b1d] hover:bg-[#f3e8cc]/60 active:bg-[#f3e8cc] focus:ring-[#18542a]',
    leaf:
      'bg-[#9abc05] text-[#103b1d] font-bold hover:bg-[#8ca805] active:bg-[#7d9604] focus:ring-[#9abc05] shadow-xs border border-transparent',
    kiwi:
      'bg-[#9abc05] text-[#103b1d] font-bold hover:bg-[#8ca805] active:bg-[#7d9604] focus:ring-[#9abc05] shadow-xs border border-transparent',
    sunshine:
      'bg-[#ffc926] text-[#103b1d] font-extrabold hover:bg-[#f2be1d] active:bg-[#e0ad14] focus:ring-[#ffc926] shadow-xs border border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!isLoading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};
