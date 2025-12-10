import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Reusable modal component
 * Reduces modal duplication across admin pages
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions,
  size = 'lg' 
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="modal modal-open">
      <div className={`modal-box ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        
        <h3 className="font-bold text-2xl mb-6">{title}</h3>
        
        <div className="space-y-6">
          {children}
        </div>

        {actions && (
          <div className="modal-action">
            {actions}
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
