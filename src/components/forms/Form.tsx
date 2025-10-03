/**
 * Generic Form Component
 * Type-safe form with validation
 */

import React, { useState, useCallback } from 'react';
import { FormConfig, FormData, ValidationValue } from '@/types/common';
import { FormField } from './FormField';
import { Button } from '@/components/ui/button';
import { FormStateManager } from '@/lib/form-helpers';
import { FieldError } from '@/components/ui/field-error';
import { ValidationIndicator } from '@/components/ui/validation-indicator';
import { useToast } from '@/components/ui/toast';
import { getUserFriendlyMessage } from '@/utils/error-messages';

interface FormProps<T extends FormData> {
  config: FormConfig<T>;
  className?: string;
}

export function Form<T extends FormData>({ config, className = '' }: FormProps<T>) {
  const toast = useToast();
  
  // Initialize form state manager
  const [formStateManager] = useState(() => {
    const initialData = {} as T;
    config.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        (initialData as Record<string, ValidationValue>)[field.name] = field.defaultValue;
      }
    });
    
    const validators = new Map();
    config.fields.forEach(field => {
      if (field.rules) {
        validators.set(field.name, field.rules);
      }
    });
    
    return new FormStateManager(initialData, validators);
  });
  
  const [formState, setFormState] = useState(formStateManager.getState());

  const handleFieldChange = useCallback((fieldName: string, value: ValidationValue) => {
    formStateManager.updateField(fieldName as keyof T, value);
    setFormState(formStateManager.getState());
  }, [formStateManager]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    formStateManager.setSubmitting(true);
    setFormState(formStateManager.getState());
    
    try {
      // Validate form
      const validationResult = formStateManager.validateForm();
      
      if (!validationResult.isValid) {
        setFormState(formStateManager.getState());
        const errorMessage = getUserFriendlyMessage('VALIDATION_ERROR');
        toast.error(errorMessage);
        return;
      }
      
      // Custom validation if provided
      if (config.onValidate) {
        const customValidation = config.onValidate(formState.data);
        if (!customValidation.isValid) {
          formStateManager.updateField('' as keyof T, ''); // Trigger state update
          setFormState(formStateManager.getState());
          const errorMessage = getUserFriendlyMessage('VALIDATION_ERROR');
          toast.error(errorMessage);
          return;
        }
      }
      
      // Submit form
      await config.onSubmit(formState.data);
      toast.success('Form submitted successfully!');
      
    } catch {
      const errorMessage = getUserFriendlyMessage('SAVE_ERROR');
      toast.error(errorMessage);
    } finally {
      formStateManager.setSubmitting(false);
      setFormState(formStateManager.getState());
    }
  }, [formState, config, formStateManager, toast]);

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {config.fields.map((field) => {
        const fieldError = formState.errors[field.name]?.[0];
        const fieldTouched = formState.touched[field.name];
        const hasError = Boolean(fieldError && fieldTouched);
        const hasSuccess = !hasError && fieldTouched && Boolean(formState.data[field.name as keyof T]);
        
        return (
          <div key={field.name} className="space-y-2">
            <FormField
              name={field.name}
              label={field.label}
              type={field.type}
              value={formState.data[field.name as keyof T] || field.defaultValue}
              onChange={(value) => handleFieldChange(field.name, value)}
              placeholder={field.placeholder}
              required={field.required}
              options={field.options}
              error={fieldError}
            />
            
            <FieldError
              error={fieldError}
              touched={fieldTouched}
              success={hasSuccess}
            />
            
            {fieldTouched && (
              <ValidationIndicator
                state={hasError ? 'error' : hasSuccess ? 'success' : 'default'}
                message={hasError ? fieldError : hasSuccess ? 'Looks good!' : undefined}
                size="sm"
              />
            )}
          </div>
        );
      })}
      
      <Button
        type="submit"
        disabled={formState.isSubmitting || config.loading}
        className="w-full"
      >
        {formState.isSubmitting || config.loading ? 'Submitting...' : (config.submitText || 'Submit')}
      </Button>
    </form>
  );
}
