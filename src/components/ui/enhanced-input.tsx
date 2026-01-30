/**
 * Enhanced Input Component
 * Apple-inspired design with validation states and user feedback
 */

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  loading?: boolean;
  className?: string;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ label, error, success, helperText, loading, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <Label className="text-sm font-medium text-neutral-700">
            {label}
          </Label>
        )}
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              'transition-all duration-200',
              'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              {
                'border-error-500 focus:ring-error-500 focus:border-error-500': error,
                'border-success-500 focus:ring-success-500 focus:border-success-500': success && !error,
                'border-neutral-300': !error && !success,
              },
              className
            )}
            {...props}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500 animate-spin" />
          )}
          {error && !loading && (
            <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-error-500" />
          )}
          {success && !error && !loading && (
            <CheckCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-success-500" />
          )}
        </div>
        {error && (
          <p className="text-sm text-error-500 flex items-center space-x-1">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  loading?: boolean;
  className?: string;
}

export const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ label, error, success, helperText, loading, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <Label className="text-sm font-medium text-neutral-700">
            {label}
          </Label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            className={cn(
              'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200',
              'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              {
                'border-error-500 focus:ring-error-500 focus:border-error-500': error,
                'border-success-500 focus:ring-success-500 focus:border-success-500': success && !error,
                'border-neutral-300': !error && !success,
              },
              className
            )}
            {...props}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 text-primary-500 animate-spin" />
          )}
          {error && !loading && (
            <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-error-500" />
          )}
          {success && !error && !loading && (
            <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-success-500" />
          )}
        </div>
        {error && (
          <p className="text-sm text-error-500 flex items-center space-x-1">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

EnhancedTextarea.displayName = 'EnhancedTextarea';