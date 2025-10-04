/**
 * Loading States Component
 * Apple-inspired loading indicators
 */

import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  state: 'idle' | 'loading' | 'success' | 'error' | 'pending';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState = ({ 
  state, 
  message, 
  size = 'md',
  className 
}: LoadingStateProps) => {
  const getIcon = () => {
    const iconClass = cn({
      'h-4 w-4': size === 'sm',
      'h-5 w-5': size === 'md',
      'h-6 w-6': size === 'lg',
    });

    switch (state) {
      case 'loading':
        return <Loader2 className={cn(iconClass, 'animate-spin text-primary-500')} />;
      case 'success':
        return <CheckCircle className={cn(iconClass, 'text-success-500')} />;
      case 'error':
        return <AlertCircle className={cn(iconClass, 'text-error-500')} />;
      case 'pending':
        return <Clock className={cn(iconClass, 'text-warning-500')} />;
      default:
        return null;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {getIcon()}
      {message && (
        <span className={cn('text-neutral-600', getTextSize())}>
          {message}
        </span>
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
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse bg-neutral-200 rounded',
            {
              'h-4 w-3/4': lines === 1,
              'h-4 w-full': lines > 1,
            },
            className
          )}
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
  showPercentage = true 
}: ProgressBarProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-neutral-600 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  return (
    <Loader2
      className={cn(
        'animate-spin text-primary-500',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        className
      )}
    />
  );
};
