/**
 * Loading States Component
 * Apple-inspired loading states with smooth animations
 */

import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  state: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState = ({ 
  state, 
  message, 
  className,
  size = 'md' 
}: LoadingStateProps) => {
  const getIcon = () => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    switch (state) {
      case 'loading':
        return <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-500`} />;
      case 'success':
        return <CheckCircle className={`${sizeClasses[size]} text-success-500`} />;
      case 'error':
        return <AlertCircle className={`${sizeClasses[size]} text-error-500`} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {getIcon()}
      {message && (
        <span className="text-sm text-neutral-600">{message}</span>
      )}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton = ({ className, lines = 1 }: SkeletonProps) => {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-neutral-200 rounded mb-2 last:mb-0"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export const ProgressBar = ({ 
  progress, 
  className,
  showPercentage = false 
}: ProgressBarProps) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-neutral-600">Progress</span>
        {showPercentage && (
          <span className="text-sm text-neutral-600">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={cn(`${sizeClasses[size]} animate-spin text-primary-500`, className)} />
  );
};

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}

export const LoadingButton = ({ 
  loading, 
  children, 
  className 
}: LoadingButtonProps) => {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center',
        'px-4 py-2 rounded-md text-sm font-medium',
        'bg-primary-500 text-white hover:bg-primary-600',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-200',
        className
      )}
      disabled={loading}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  );
};

interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay = ({ 
  loading, 
  message = 'Loading...', 
  children,
  className 
}: LoadingOverlayProps) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-3">
            <Spinner size="lg" />
            <span className="text-sm text-neutral-600">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface LoadingPageProps {
  message?: string;
  className?: string;
}

export const LoadingPage = ({ 
  message = 'Loading...', 
  className 
}: LoadingPageProps) => {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center',
      'bg-gradient-to-br from-neutral-50 to-neutral-100',
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        <span className="text-lg text-neutral-600">{message}</span>
      </div>
    </div>
  );
};