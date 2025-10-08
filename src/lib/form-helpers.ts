/**
 * Form Helper Utilities
 * 
 * Centralized form handling utilities for consistent
 * form behavior across the application.
 */

import { ValidationValue, ValidationRule, ValidationResult } from '@/utils/validation';
import { isString, isNumber, isArray, isValidEmail, isValidUrl } from '@/utils/type-guards';

/**
 * Form field configuration
 */
export interface FormFieldConfig<T> {
  name: keyof T;
  label: string;
  type: 'text' | 'email' | 'url' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: ValidationValue;
  rules?: ValidationRule[];
}

/**
 * Form state interface
 */
export interface FormState<T> {
  data: T;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Form validation utilities
 */
export class FormValidator {
  /**
   * Validate a single field
   */
  public static validateField<T>(
    field: keyof T,
    value: ValidationValue,
    rules: ValidationRule[]
  ): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of rules) {
      const result = this.validateRule(value, rule);
      if (!result.isValid) {
        const fieldErrors = result.errors[String(field)] || [];
        errors.push(...fieldErrors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: { [String(field)]: errors }
    };
  }
  
  /**
   * Validate a single rule
   */
  private static validateRule(
    value: ValidationValue,
    rule: ValidationRule
  ): ValidationResult {
    const errors: string[] = [];
    
    switch (rule.type) {
      case 'required':
        if (this.isEmpty(value)) {
          errors.push(rule.message || 'This field is required');
        }
        break;
        
      case 'email':
        if (!this.isEmpty(value) && !isValidEmail(value)) {
          errors.push(rule.message || 'Please enter a valid email address');
        }
        break;
        
      case 'url':
        if (!this.isEmpty(value) && !isValidUrl(value)) {
          errors.push(rule.message || 'Please enter a valid URL');
        }
        break;
        
      case 'minLength':
        if (isString(value) && isNumber(rule.value) && value.length < rule.value) {
          errors.push(rule.message || `Must be at least ${rule.value} characters`);
        }
        break;
        
      case 'maxLength':
        if (isString(value) && isNumber(rule.value) && value.length > rule.value) {
          errors.push(rule.message || `Must be no more than ${rule.value} characters`);
        }
        break;
        
      case 'min':
        if (isNumber(value) && isNumber(rule.value) && value < rule.value) {
          errors.push(rule.message || `Must be at least ${rule.value}`);
        }
        break;
        
      case 'max':
        if (isNumber(value) && isNumber(rule.value) && value > rule.value) {
          errors.push(rule.message || `Must be no more than ${rule.value}`);
        }
        break;
        
      case 'pattern':
        if (isString(value) && rule.value instanceof RegExp && !rule.value.test(value)) {
          errors.push(rule.message || 'Invalid format');
        }
        break;
        
      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          errors.push(rule.message || 'Invalid value');
        }
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors: { field: errors }
    };
  }
  
  /**
   * Check if value is empty
   */
  private static isEmpty(value: ValidationValue): boolean {
    if (value === null || value === undefined) return true;
    if (isString(value)) return value.trim().length === 0;
    if (isArray(value)) return value.length === 0;
    return false;
  }
}

/**
 * Form state manager
 */
export class FormStateManager<T> {
  private state: FormState<T>;
  private validators: Map<keyof T, ValidationRule[]>;
  
  constructor(
    initialData: T,
    validators: Map<keyof T, ValidationRule[]> = new Map()
  ) {
    this.validators = validators;
    this.state = {
      data: initialData,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: false
    };
  }
  
  /**
   * Get current state
   */
  public getState(): FormState<T> {
    return { ...this.state };
  }
  
  /**
   * Update field value
   */
  public updateField(field: keyof T, value: ValidationValue): void {
    this.state.data = { ...this.state.data, [field]: value };
    this.state.touched = { ...this.state.touched, [field]: true };
    
    // Clear field errors when user starts typing
    if (this.state.errors[String(field)]) {
      const newErrors = { ...this.state.errors };
      delete newErrors[String(field)];
      this.state.errors = newErrors;
    }
    
    // Validate field if rules exist
    const rules = this.validators.get(field);
    if (rules && rules.length > 0) {
      const validation = FormValidator.validateField(field, value, rules);
      if (!validation.isValid) {
        this.state.errors = { ...this.state.errors, ...validation.errors };
      }
    }
    
    // Update form validity
    this.updateFormValidity();
  }
  
  /**
   * Validate entire form
   */
  public validateForm(): ValidationResult {
    const errors: Record<string, string[]> = {};
    let isValid = true;
    
    for (const [field, rules] of this.validators) {
      const value = this.state.data[field] as ValidationValue;
      const validation = FormValidator.validateField(field, value, rules);
      
      if (!validation.isValid) {
        errors[String(field)] = validation.errors[String(field)] || [];
        isValid = false;
      }
    }
    
    this.state.errors = errors;
    this.state.isValid = isValid;
    
    return {
      isValid,
      errors
    };
  }
  
  /**
   * Set field as touched
   */
  public touchField(field: keyof T): void {
    this.state.touched = { ...this.state.touched, [field]: true };
  }
  
  /**
   * Set submitting state
   */
  public setSubmitting(isSubmitting: boolean): void {
    this.state.isSubmitting = isSubmitting;
  }
  
  /**
   * Reset form state
   */
  public reset(initialData?: T): void {
    this.state = {
      data: initialData || this.state.data,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: false
    };
  }
  
  /**
   * Update form validity
   */
  private updateFormValidity(): void {
    const hasErrors = Object.keys(this.state.errors).length > 0;
    this.state.isValid = !hasErrors;
  }
}

/**
 * Form field utilities
 */
export class FormFieldUtils {
  /**
   * Get field error message
   */
  public static getFieldError(
    field: string,
    errors: Record<string, string[]>
  ): string | undefined {
    const fieldErrors = errors[field];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined;
  }
  
  /**
   * Check if field has error
   */
  public static hasFieldError(
    field: string,
    errors: Record<string, string[]>
  ): boolean {
    return Boolean(errors[field] && errors[field].length > 0);
  }
  
  /**
   * Check if field is touched
   */
  public static isFieldTouched(
    field: string,
    touched: Record<string, boolean>
  ): boolean {
    return Boolean(touched[field]);
  }
  
  /**
   * Get field validation state
   */
  public static getFieldValidationState(
    field: string,
    errors: Record<string, string[]>,
    touched: Record<string, boolean>
  ): 'error' | 'success' | 'default' {
    if (this.hasFieldError(field, errors) && this.isFieldTouched(field, touched)) {
      return 'error';
    }
    if (!this.hasFieldError(field, errors) && this.isFieldTouched(field, touched)) {
      return 'success';
    }
    return 'default';
  }
}

/**
 * Form submission utilities
 */
export class FormSubmissionUtils {
  /**
   * Handle form submission with validation
   */
  public static async handleSubmission<T>(
    formState: FormState<T>,
    onSubmit: (data: T) => Promise<void>,
    onError?: (error: Error) => void
  ): Promise<boolean> {
    if (formState.isSubmitting) return false;
    
    // Check if form is valid
    if (!formState.isValid) {
      return false;
    }
    
    try {
      await onSubmit(formState.data);
      return true;
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      return false;
    }
  }
  
  /**
   * Create form submission handler
   */
  public static createSubmissionHandler<T>(
    formState: FormState<T>,
    onSubmit: (data: T) => Promise<void>,
    onError?: (error: Error) => void
  ) {
    return async (event: React.FormEvent) => {
      event.preventDefault();
      return this.handleSubmission(formState, onSubmit, onError);
    };
  }
}

/**
 * Common form field configurations
 */
export const COMMON_FIELD_CONFIGS = {
  email: {
    type: 'email' as const,
    rules: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email address' }
    ]
  },
  
  url: {
    type: 'url' as const,
    rules: [
      { type: 'required', message: 'URL is required' },
      { type: 'url', message: 'Please enter a valid URL' }
    ]
  },
  
  name: {
    type: 'text' as const,
    rules: [
      { type: 'required', message: 'Name is required' },
      { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
    ]
  },
  
  description: {
    type: 'textarea' as const,
    rules: [
      { type: 'maxLength', value: 500, message: 'Description must be less than 500 characters' }
    ]
  }
} as const;
