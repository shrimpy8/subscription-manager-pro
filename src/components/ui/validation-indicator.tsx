/**
 * Validation Indicator Component
 * 
 * Shows validation state indicators for form fields
 * with success, warning, and error states.
 */

import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Validation state type
 */
export type ValidationState = 'default' | 'success' | 'warning' | 'error' | 'loading';

/**
 * Validation indicator props
 */
export interface ValidationIndicatorProps {
  state: ValidationState;
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

/**
 * Validation indicator component
 */
export function ValidationIndicator({
  state,
  message,
  className,
  size = 'md',
  showMessage = true
}: ValidationIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const iconClasses = cn(sizeClasses[size], className);
  
  const renderIcon = () => {
    switch (state) {
      case 'success':
        return <CheckCircle className={cn(iconClasses, 'text-green-600')} />;
      case 'warning':
        return <AlertTriangle className={cn(iconClasses, 'text-yellow-600')} />;
      case 'error':
        return <AlertCircle className={cn(iconClasses, 'text-red-600')} />;
      case 'loading':
        return <Loader2 className={cn(iconClasses, 'text-orange-600 animate-spin')} />;
      default:
        return null;
    }
  };
  
  const renderMessage = () => {
    if (!showMessage || !message) return null;
    
    const messageClasses = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      loading: 'text-orange-600',
      default: 'text-gray-600'
    };
    
    return (
      <span className={cn('text-sm', messageClasses[state])}>
        {message}
      </span>
    );
  };
  
  return (
    <div className="flex items-center gap-2">
      {renderIcon()}
      {renderMessage()}
    </div>
  );
}

/**
 * Inline validation indicator for form fields
 */
export interface InlineValidationIndicatorProps {
  state: ValidationState;
  message?: string;
  className?: string;
  position?: 'top' | 'bottom' | 'right' | 'left';
}

export function InlineValidationIndicator({
  state,
  message,
  className,
  position = 'bottom'
}: InlineValidationIndicatorProps) {
  const positionClasses = {
    top: 'mb-1',
    bottom: 'mt-1',
    right: 'ml-2',
    left: 'mr-2'
  };
  
  return (
    <div className={cn(positionClasses[position], className)}>
      <ValidationIndicator
        state={state}
        message={message}
        size="sm"
        showMessage={Boolean(message)}
      />
    </div>
  );
}

/**
 * Field validation wrapper
 */
export interface FieldValidationWrapperProps {
  children: React.ReactNode;
  state: ValidationState;
  message?: string;
  className?: string;
  showIndicator?: boolean;
}

export function FieldValidationWrapper({
  children,
  state,
  message,
  className,
  showIndicator = true
}: FieldValidationWrapperProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {showIndicator && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <ValidationIndicator
            state={state}
            message={message}
            size="sm"
            showMessage={false}
          />
        </div>
      )}
    </div>
  );
}
