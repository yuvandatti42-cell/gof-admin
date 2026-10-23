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
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-[#E5E8DF] rounded-2xl bg-white/50 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#E8F0EB] text-[#245C3A] flex items-center justify-center mb-4 shadow-xs">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-semibold text-[#173D2A] mb-1">{title}</h3>
      <p className="text-sm text-[#737B72] max-w-md mb-6 leading-relaxed">
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
