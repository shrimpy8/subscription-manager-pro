/**
 * Field Error Component
 * 
 * Displays inline field-level error messages with proper
 * accessibility and styling.
 */

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Field error props
 */
export interface FieldErrorProps {
  error?: string;
  warning?: string;
  success?: boolean;
  touched?: boolean;
  className?: string;
  showIcon?: boolean;
}

/**
 * Field error component
 */
export function FieldError({
  error,
  warning,
  success = false,
  touched = false,
  className,
  showIcon = true
}: FieldErrorProps) {
  // Don't show anything if not touched or no error/warning
  if (!touched && !error && !warning) return null;
  
  // Don't show success state if there's an error
  if (error) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-red-600 mt-1', className)}>
        {showIcon && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
        <span>{error}</span>
      </div>
    );
  }
  
  if (warning) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-yellow-600 mt-1', className)}>
        {showIcon && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
        <span>{warning}</span>
      </div>
    );
  }
  
  if (success && touched) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-green-600 mt-1', className)}>
        {showIcon && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
        <span>Looks good!</span>
      </div>
    );
  }
  
  return null;
}

/**
 * Field error with multiple messages
 */
export interface FieldErrorListProps {
  errors?: string[];
  warnings?: string[];
  success?: boolean;
  touched?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function FieldErrorList({
  errors = [],
  warnings = [],
  success = false,
  touched = false,
  className,
  showIcon = true
}: FieldErrorListProps) {
  if (!touched && errors.length === 0 && warnings.length === 0) return null;
  
  if (errors.length > 0) {
    return (
      <div className={cn('mt-1', className)}>
        {errors.map((error, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-red-600">
            {showIcon && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{error}</span>
          </div>
        ))}
      </div>
    );
  }
  
  if (warnings.length > 0) {
    return (
      <div className={cn('mt-1', className)}>
        {warnings.map((warning, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-yellow-600">
            {showIcon && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            <span>{warning}</span>
          </div>
        ))}
      </div>
    );
  }
  
  if (success && touched) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-green-600 mt-1', className)}>
        {showIcon && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
        <span>Looks good!</span>
      </div>
    );
  }
  
  return null;
}
