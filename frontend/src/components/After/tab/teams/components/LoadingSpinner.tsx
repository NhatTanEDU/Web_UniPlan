import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'white' | 'green' | 'red' | 'yellow';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-6 w-6';
      case 'lg':
        return 'h-8 w-8';
      case 'xl':
        return 'h-12 w-12';
      default:
        return 'h-6 w-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'border-blue-500';
      case 'gray':
        return 'border-gray-500';
      case 'white':
        return 'border-white';
      case 'green':
        return 'border-green-500';
      case 'red':
        return 'border-red-500';
      case 'yellow':
        return 'border-yellow-500';
      default:
        return 'border-blue-500';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      case 'xl':
        return 'text-lg';
      default:
        return 'text-sm';
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <div 
          className={`animate-spin rounded-full border-2 border-solid border-t-transparent ${getSizeClasses()} ${getColorClasses()}`}
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        {text && (
          <p className={`text-gray-600 dark:text-gray-400 ${getTextSizeClasses()}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Export additional spinner variants for specific use cases
export const InlineSpinner = ({ size = 'sm', color = 'blue' }: Pick<LoadingSpinnerProps, 'size' | 'color'>) => (
  <div 
    className={`animate-spin rounded-full border-2 border-solid border-t-transparent inline-block ${
      size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'
    } ${
      color === 'blue' ? 'border-blue-500' : 
      color === 'white' ? 'border-white' : 
      color === 'gray' ? 'border-gray-500' : 'border-blue-500'
    }`}
    role="status"
    aria-label="Loading"
  >
    <span className="sr-only">Loading...</span>
  </div>
);

export const FullPageSpinner = ({ text = "Đang tải..." }: { text?: string }) => (
  <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50">
    <LoadingSpinner size="xl" text={text} />
  </div>
);

export const CenteredSpinner = ({ text, className = "py-12" }: { text?: string; className?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <LoadingSpinner text={text} />
  </div>
);
