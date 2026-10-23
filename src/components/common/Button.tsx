import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'leaf';
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
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#245C3A] text-white hover:bg-[#1C4C2F] active:bg-[#173D2A] focus:ring-[#245C3A] shadow-sm',
    secondary:
      'bg-[#FAF9F4] text-[#202820] border border-[#E5E8DF] hover:bg-[#F2EFE7] hover:border-[#D5DACA] active:bg-[#ECE8DC] focus:ring-[#6F9F62]',
    outline:
      'bg-transparent text-[#202820] border border-[#E5E8DF] hover:bg-neutral-100 hover:border-[#C5CBB9] active:bg-neutral-200 focus:ring-[#6F9F62]',
    danger:
      'bg-[#B64238] text-white hover:bg-[#9B362E] active:bg-[#852C25] focus:ring-[#B64238] shadow-sm',
    ghost:
      'bg-transparent text-[#202820] hover:bg-black/5 active:bg-black/10 focus:ring-[#245C3A]',
    leaf:
      'bg-[#6F9F62] text-white hover:bg-[#5C8A50] active:bg-[#4E7643] focus:ring-[#6F9F62] shadow-sm',
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
