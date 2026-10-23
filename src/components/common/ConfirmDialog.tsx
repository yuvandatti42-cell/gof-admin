import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          {variant === 'danger' && <AlertCircle className="w-5 h-5 text-[#B64238]" />}
          {variant === 'warning' && <AlertTriangle className="w-5 h-5 text-[#B7791F]" />}
          {variant === 'primary' && <HelpCircle className="w-5 h-5 text-[#245C3A]" />}
          <span>{title}</span>
        </div>
      }
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[#737B72] leading-relaxed">{message}</p>
    </Modal>
  );
};
