import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-[#dfd5bf] rounded-2xl sm:rounded-3xl bg-[#faf5ea]/50 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#e8f0eb] text-[#18542a] flex items-center justify-center mb-4 shadow-2xs">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-[#103b1d] mb-1 font-heading">{title}</h3>
      <p className="text-sm text-[#5a6e54] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <Button variant="secondary" onClick={onSecondaryAction}>
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};
