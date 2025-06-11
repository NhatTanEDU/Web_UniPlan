import React, { useRef } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = 'danger',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleModalClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          icon: 'text-red-600 dark:text-red-400',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          border: 'border-red-200 dark:border-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          icon: 'text-yellow-600 dark:text-yellow-400',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          border: 'border-yellow-200 dark:border-yellow-800'
        };
      case 'info':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          icon: 'text-blue-600 dark:text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          border: 'border-blue-200 dark:border-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          button: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
          border: 'border-gray-200 dark:border-gray-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleModalClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full border ${styles.border}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.bg} flex items-center justify-center`}>
              {type === 'danger' ? (
                <TrashIcon className={`w-5 h-5 ${styles.icon}`} />
              ) : (
                <ExclamationTriangleIcon className={`w-5 h-5 ${styles.icon}`} />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {message}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white ${styles.button} border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
