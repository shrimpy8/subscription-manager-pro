/**
 * Centralized validation utilities
 * 
 * Provides consistent validation patterns across the application
 * with proper error handling and user feedback.
 */

import { handleValidationError } from './error-handler';
import { Subscription } from '@/types/subscription';

/**
 * Interface for AI tool data validation
 */
export interface AIToolData {
  name: string;
  url: string;
  category: string;
  subcategory?: string;
  description?: string;
  cost?: number;
  currency?: string;
  billingCycle?: string;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of error messages */
  errors: string[];
  /** Array of warning messages (optional) */
  warnings?: string[];
}

/**
 * Configuration for validating a single field
 */
export interface FieldValidation {
  /** The name of the field being validated */
  field: string;
  /** The value to validate */
  value: ValidationValue;
  /** Array of validation rules to apply */
  rules: ValidationRule[];
}

/**
 * Supported validation value types
 */
export type ValidationValue = string | number | boolean | Date | null | undefined;

/**
 * A single validation rule
 */
export interface ValidationRule {
  /** The type of validation to perform */
  type: 'required' | 'email' | 'url' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  /** The value to compare against (for min/max/length rules) */
  value?: ValidationValue;
  /** The error message to display if validation fails */
  message: string;
  /** Custom validator function (for 'custom' type) */
  validator?: (value: ValidationValue) => boolean;
}

/**
 * Validate a single field against multiple rules
 * @param field - The name of the field being validated
 * @param value - The value to validate
 * @param rules - Array of validation rules to apply
 * @returns ValidationResult with validation status and error messages
 * @example
 * ```typescript
 * const result = validateField('email', 'user@example.com', [
 *   { type: 'required', message: 'Email is required' },
 *   { type: 'email', message: 'Invalid email format' }
 * ]);
 * ```
 */
export function validateField(field: string, value: ValidationValue, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of rules) {
    const isValid = validateRule(value, rule);
    
    if (!isValid) {
      if (rule.type === 'required') {
        errors.push(rule.message);
      } else {
        errors.push(rule.message);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate a single rule against a value
 * @param value - The value to validate
 * @param rule - The validation rule to apply
 * @returns True if the rule passes, false otherwise
 * @internal
 */
function validateRule(value: ValidationValue, rule: ValidationRule): boolean {
  switch (rule.type) {
    case 'required':
      return value !== null && value !== undefined && value !== '';
    
    case 'email':
      return isValidEmail(value);
    
    case 'url':
      return isValidUrl(value);
    
    case 'minLength':
      return typeof value === 'string' && value.length >= (rule.value || 0);
    
    case 'maxLength':
      return typeof value === 'string' && value.length <= (rule.value || Infinity);
    
    case 'min':
      return typeof value === 'number' && value >= (rule.value || 0);
    
    case 'max':
      return typeof value === 'number' && value <= (rule.value || Infinity);
    
    case 'pattern':
      return typeof value === 'string' && new RegExp(rule.value).test(value);
    
    case 'custom':
      return rule.validator ? rule.validator(value) : true;
    
    default:
      return true;
  }
}

/**
 * Validate multiple fields at once
 * @param fields - Array of field validation configurations
 * @returns ValidationResult with combined validation status and error messages
 * @example
 * ```typescript
 * const result = validateFields([
 *   { field: 'name', value: 'John', rules: [{ type: 'required', message: 'Name is required' }] },
 *   { field: 'email', value: 'john@example.com', rules: [{ type: 'email', message: 'Invalid email' }] }
 * ]);
 * ```
 */
export function validateFields(fields: FieldValidation[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  for (const field of fields) {
    const result = validateField(field.field, field.value, field.rules);
    allErrors.push(...result.errors);
    if (result.warnings) {
      allWarnings.push(...result.warnings);
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Validate subscription data with predefined rules
 * @param data - The subscription data to validate
 * @returns ValidationResult with validation status and error messages
 * @example
 * ```typescript
 * const result = validateSubscription({
 *   name: 'Netflix',
 *   cost: 15.99,
 *   currency: 'USD',
 *   billingCycle: 'Monthly'
 * });
 * ```
 */
export function validateSubscription(data: Partial<Subscription>): ValidationResult {
  const fields: FieldValidation[] = [
    {
      field: 'name',
      value: data.name,
      rules: [
        { type: 'required', message: 'Subscription name is required' },
        { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
        { type: 'maxLength', value: 100, message: 'Name must be less than 100 characters' }
      ]
    },
    {
      field: 'cost',
      value: data.cost,
      rules: [
        { type: 'required', message: 'Cost is required' },
        { type: 'min', value: 0, message: 'Cost must be a positive number' }
      ]
    },
    {
      field: 'currency',
      value: data.currency,
      rules: [
        { type: 'required', message: 'Currency is required' },
        { type: 'pattern', value: '^[A-Z]{3}$', message: 'Currency must be a 3-letter code (e.g., USD)' }
      ]
    },
    {
      field: 'billingCycle',
      value: data.billingCycle,
      rules: [
        { type: 'required', message: 'Billing cycle is required' },
        { 
          type: 'custom', 
          message: 'Invalid billing cycle',
          validator: (value) => ['Monthly', 'Yearly', 'Weekly', 'Quarterly', 'Free'].includes(value)
        }
      ]
    },
    {
      field: 'category',
      value: data.category,
      rules: [
        { type: 'required', message: 'Category is required' }
      ]
    },
    {
      field: 'status',
      value: data.status,
      rules: [
        { type: 'required', message: 'Status is required' },
        { 
          type: 'custom', 
          message: 'Invalid status',
          validator: (value) => ['active', 'paused', 'canceled'].includes(value)
        }
      ]
    },
    {
      field: 'url',
      value: data.url,
      rules: [
        { type: 'url', message: 'Please enter a valid URL' }
      ]
    },
    {
      field: 'accountEmail',
      value: data.accountEmail,
      rules: [
        { type: 'email', message: 'Please enter a valid email address' }
      ]
    }
  ];

  return validateFields(fields);
}

/**
 * Validate AI tool data with predefined rules
 * @param data - The AI tool data to validate
 * @returns ValidationResult with validation status and error messages
 * @example
 * ```typescript
 * const result = validateAITool({
 *   name: 'ChatGPT',
 *   url: 'https://chat.openai.com',
 *   category: 'AI Tools'
 * });
 * ```
 */
export function validateAITool(data: Partial<AIToolData>): ValidationResult {
  const fields: FieldValidation[] = [
    {
      field: 'name',
      value: data.name,
      rules: [
        { type: 'required', message: 'Tool name is required' },
        { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
        { type: 'maxLength', value: 100, message: 'Name must be less than 100 characters' }
      ]
    },
    {
      field: 'url',
      value: data.url,
      rules: [
        { type: 'required', message: 'URL is required' },
        { type: 'url', message: 'Please enter a valid URL' }
      ]
    },
    {
      field: 'category',
      value: data.category,
      rules: [
        { type: 'required', message: 'Category is required' }
      ]
    }
  ];

  return validateFields(fields);
}

/**
 * Validate email format using regex pattern
 * @param email - The email address to validate
 * @returns True if email format is valid, false otherwise
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // Returns true
 * isValidEmail('invalid-email') // Returns false
 * ```
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate URL format by attempting to create a URL object
 * @param url - The URL string to validate
 * @returns True if URL format is valid, false otherwise
 * @example
 * ```typescript
 * isValidUrl('https://example.com') // Returns true
 * isValidUrl('not-a-url') // Returns false
 * ```
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number format using regex pattern
 * @param phone - The phone number to validate
 * @returns True if phone number format is valid, false otherwise
 * @example
 * ```typescript
 * isValidPhone('+1234567890') // Returns true
 * isValidPhone('123-456-7890') // Returns true
 * isValidPhone('invalid') // Returns false
 * ```
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validate credit card number format (basic validation)
 * @param cardNumber - The credit card number to validate
 * @returns True if credit card number format is valid, false otherwise
 * @example
 * ```typescript
 * isValidCreditCard('4111111111111111') // Returns true
 * isValidCreditCard('1234') // Returns false
 * ```
 */
export function isValidCreditCard(cardNumber: string): boolean {
  if (!cardNumber || typeof cardNumber !== 'string') return false;
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{13,19}$/.test(cleaned);
}

/**
 * Validate password strength with multiple criteria
 * @param password - The password to validate
 * @returns ValidationResult with validation status and error messages
 * @example
 * ```typescript
 * const result = isValidPassword('MyPassword123!');
 * if (!result.isValid) {
 *   console.log('Password errors:', result.errors);
 * }
 * ```
 */
export function isValidPassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * React hook for real-time form validation
 * @returns Object with validation state and methods
 * @example
 * ```typescript
 * const { errors, validateField, clearErrors, hasErrors } = useValidation();
 * 
 * const handleFieldChange = (field: string, value: any) => {
 *   validateField(field, value, validationRules);
 * };
 * ```
 */
export function useValidation() {
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = React.useState(false);

  const validateFieldHook = React.useCallback(async (
    field: string, 
    value: ValidationValue, 
    rules: ValidationRule[]
  ) => {
    setIsValidating(true);
    
    try {
      const result = validateField(field, value, rules);
      
      setErrors(prev => ({
        ...prev,
        [field]: result.errors
      }));
      
      return result;
    } catch (error) {
      handleValidationError(field, 'Validation error', { component: 'useValidation' });
      return { isValid: false, errors: ['Validation failed'] };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearErrors = React.useCallback((field?: string) => {
    if (field) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  const hasErrors = React.useCallback((field?: string) => {
    if (field) {
      return errors[field] && errors[field].length > 0;
    }
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    errors,
    isValidating,
    validateField: validateFieldHook,
    clearErrors,
    hasErrors
  };
}

// Import React for the hook
import React from 'react';
