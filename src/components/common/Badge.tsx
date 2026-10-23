import React from 'react';
import { type BadgeVariant, getStatusBadgeVariant } from '../../utils/formatters';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  status?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#EAF5EE] text-[#1C5632] border-[#C3E4CD]',
  warning: 'bg-[#FEF7EA] text-[#8D5A0F] border-[#FCE2B6]',
  danger: 'bg-[#FDEEED] text-[#8D2B22] border-[#F9C7C3]',
  info: 'bg-[#EBF2F9] text-[#234970] border-[#C5DCF2]',
  neutral: 'bg-[#F1F3ED] text-[#555E53] border-[#DEE2D7]',
  forest: 'bg-[#E8F0EB] text-[#245C3A] border-[#C0D6C8]',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = 'md',
  className = '',
}) => {
  const activeVariant = variant || (status ? getStatusBadgeVariant(status) : 'neutral');
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors ${sizeClasses} ${variantStyles[activeVariant]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          activeVariant === 'success'
            ? 'bg-[#2F7D4A]'
            : activeVariant === 'warning'
            ? 'bg-[#B7791F]'
            : activeVariant === 'danger'
            ? 'bg-[#B64238]'
            : activeVariant === 'info'
            ? 'bg-[#356AA0]'
            : 'bg-[#737B72]'
        }`}
      />
      {children}
    </span>
  );
};
