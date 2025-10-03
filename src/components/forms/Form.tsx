/**
 * Generic Form Component
 * Type-safe form with validation
 */

import React, { useState, useCallback } from 'react';
import { FormConfig, FormData, ValidationResult, ValidationValue, ValidationRule } from '@/types/common';
import { FormField } from './FormField';
import { Button } from '@/components/ui/button';
import { validateForm } from '@/lib/validation';

interface FormProps<T extends FormData> {
  config: FormConfig<T>;
  className?: string;
}

export function Form<T extends FormData>({ config, className = '' }: FormProps<T>) {
  const [formData, setFormData] = useState<T>(() => {
    const initialData = {} as T;
    config.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        (initialData as Record<string, ValidationValue>)[field.name] = field.defaultValue;
      }
    });
    return initialData;
  });
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = useCallback((fieldName: string, value: ValidationValue) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: []
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Validate form
      const validationRules: Record<string, ValidationRule[]> = {};
      config.fields.forEach(field => {
        if (field.rules) {
          validationRules[field.name] = field.rules;
        }
      });
      
      const validationResult = validateForm(formData, validationRules as Record<keyof T, ValidationRule[]>);
      
      if (!validationResult.isValid) {
        setErrors(validationResult.errors);
        return;
      }
      
      // Custom validation if provided
      if (config.onValidate) {
        const customValidation = config.onValidate(formData);
        if (!customValidation.isValid) {
          setErrors(customValidation.errors);
          return;
        }
      }
      
      // Submit form
      await config.onSubmit(formData);
      
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, config, errors]);

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {config.fields.map((field) => (
        <FormField
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.type}
          value={formData[field.name as keyof T] || field.defaultValue}
          onChange={(value) => handleFieldChange(field.name, value)}
          placeholder={field.placeholder}
          required={field.required}
          options={field.options}
          error={errors[field.name]?.[0]}
        />
      ))}
      
      <Button
        type="submit"
        disabled={isSubmitting || config.loading}
        className="w-full"
      >
        {isSubmitting || config.loading ? 'Submitting...' : (config.submitText || 'Submit')}
      </Button>
    </form>
  );
}
