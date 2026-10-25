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
  success: 'bg-[#e8f0eb] text-[#18542a] border-[#c0d6c8]',
  forest: 'bg-[#e8f0eb] text-[#18542a] border-[#c0d6c8]',
  warning: 'bg-[#fff8e1] text-[#946200] border-[#ffe082]',
  sunshine: 'bg-[#fff8e1] text-[#946200] border-[#ffe082]',
  danger: 'bg-[#fdeeed] text-[#d52518] border-[#f9c7c3]',
  info: 'bg-[#ebf4fa] text-[#1f4c73] border-[#bee1f5]',
  kiwi: 'bg-[#f4f8e6] text-[#637d03] border-[#d4e499]',
  carrot: 'bg-[#fff2e8] text-[#d34e0e] border-[#ffd5bf]',
  neutral: 'bg-[#faf5ea] text-[#526651] border-[#dfd5bf]',
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

  const dotColor = () => {
    switch (activeVariant) {
      case 'success':
      case 'forest':
        return 'bg-[#18542a]';
      case 'warning':
      case 'sunshine':
        return 'bg-[#ffc926]';
      case 'danger':
        return 'bg-[#d52518]';
      case 'info':
        return 'bg-[#23547a]';
      case 'kiwi':
        return 'bg-[#9abc05]';
      case 'carrot':
        return 'bg-[#f96015]';
      case 'neutral':
      default:
        return 'bg-[#7a8a77]';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border transition-colors ${sizeClasses} ${variantStyles[activeVariant] || variantStyles.neutral} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor()}`} />
      {children}
    </span>
  );
};
