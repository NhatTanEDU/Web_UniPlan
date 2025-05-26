import React, { createContext, useContext, useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container fixed top-4 right-4 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 mb-4 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100'
                : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100'
            }`}
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
              )}
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <button
              type="button"
              className="ml-3 -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-600 dark:hover:text-gray-900 dark:hover:bg-gray-700"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
