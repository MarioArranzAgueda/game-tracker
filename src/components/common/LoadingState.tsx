'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingState({
  className = '',
  size = 'md',
  message,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex h-96 items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
        {message && (
          <p className="text-slate-400 text-sm animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
}
