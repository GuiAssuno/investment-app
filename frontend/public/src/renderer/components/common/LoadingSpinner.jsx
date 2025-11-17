import React from 'react';
import { cn } from '@/utils/cn';

const LoadingSpinner = ({ size = 'default', className, text }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <svg
        className={cn(
          'animate-spin text-primary',
          sizeClasses[size],
          className
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};

const LoadingOverlay = ({ children, loading, text = 'Carregando...' }) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <LoadingSpinner text={text} />
        </div>
      )}
    </div>
  );
};

const LoadingPage = ({ text = 'Carregando aplicação...' }) => {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
};

export { LoadingSpinner, LoadingOverlay, LoadingPage };
