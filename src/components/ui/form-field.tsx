/**
 * Reusable form field component with built-in validation
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ValidationRule, validateField } from '@/utils/validation';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'url' | 'number' | 'password' | 'tel' | 'date' | 'textarea';
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  validation?: ValidationRule[];
  showValidation?: boolean;
  helpText?: string;
  error?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  className,
  validation = [],
  showValidation = true,
  helpText,
  error
}: FormFieldProps) {
  const [localError, setLocalError] = useState<string>('');
  const [isTouched, setIsTouched] = useState(false);

  // Validate on value change
  useEffect(() => {
    if (isTouched && validation.length > 0) {
      const result = validateField(name, value, validation);
      setLocalError(result.errors[0] || '');
    }
  }, [value, validation, name, isTouched]);

  const handleBlur = () => {
    setIsTouched(true);
    if (validation.length > 0) {
      const result = validateField(name, value, validation);
      setLocalError(result.errors[0] || '');
    }
    onBlur?.();
  };

  const hasError = error || localError;
  const showError = showValidation && isTouched && hasError;

  const inputClasses = cn(
    'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
    {
      'border-red-300 focus:ring-red-500 focus:border-red-500': showError,
      'border-gray-300': !showError,
      'bg-gray-50 cursor-not-allowed': disabled
    },
    className
  );

  const labelClasses = cn(
    'block text-sm font-medium text-gray-700 mb-1',
    {
      'text-red-700': showError
    }
  );

  const renderInput = () => {
    const commonProps = {
      id: name,
      name,
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        onChange(newValue);
      },
      onBlur: handleBlur,
      placeholder,
      disabled,
      className: inputClasses,
      'aria-invalid': showError,
      'aria-describedby': showError ? `${name}-error` : undefined
    };

    if (type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={4}
        />
      );
    }

    return (
      <input
        {...commonProps}
        type={type}
        required={required}
      />
    );
  };

  return (
    <div className="space-y-1">
      <label htmlFor={name} className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {showError && (
        <p id={`${name}-error`} className="text-sm text-red-600" role="alert">
          {hasError}
        </p>
      )}
      
      {helpText && !showError && (
        <p className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}

/**
 * Form validation wrapper component
 */
interface FormValidationProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  validation?: Record<string, ValidationRule[]>;
  className?: string;
}

export function FormValidation({ children, onSubmit, validation = {}, className }: FormValidationProps) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (formData: any): boolean => {
    const newErrors: Record<string, string[]> = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(validation)) {
      const result = validateField(field, formData[field], rules);
      if (!result.isValid) {
        newErrors[field] = result.errors;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());

      if (validateForm(data)) {
        await onSubmit(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      <div className="mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
