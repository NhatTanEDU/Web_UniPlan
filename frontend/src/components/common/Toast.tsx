import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 flex items-center p-4 mb-4 rounded-lg shadow-lg z-50 ${
        type === 'success' 
          ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100' 
          : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100'
      }`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
        )}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ml-3 -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
