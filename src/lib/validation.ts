/**
 * Centralized Validation System
 * Type-safe validation utilities for the entire application
 */

import { ValidationValue, ValidationRule, ValidationResult } from '@/types/common';
import { Subscription, SubscriptionCategory } from '@/types/subscription';

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Generic field validation
export function validateField(
  field: string,
  value: ValidationValue,
  rules: ValidationRule[]
): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!validateRule(value, rule)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: { [field]: errors }
  };
}

// Rule validation logic
function validateRule(value: ValidationValue, rule: ValidationRule): boolean {
  switch (rule.type) {
    case 'required':
      return value !== null && value !== undefined && value !== '';
    
    case 'email':
      return typeof value === 'string' && isValidEmail(value);
    
    case 'url':
      return typeof value === 'string' && isValidUrl(value);
    
    case 'minLength':
      return typeof value === 'string' && value.length >= (rule.value as number || 0);
    
    case 'maxLength':
      return typeof value === 'string' && value.length <= (rule.value as number || Infinity);
    
    case 'min':
      return typeof value === 'number' && value >= (rule.value as number || 0);
    
    case 'max':
      return typeof value === 'number' && value <= (rule.value as number || Infinity);
    
    case 'pattern':
      return typeof value === 'string' && new RegExp(rule.value as string).test(value);
    
    case 'custom':
      return rule.validator ? rule.validator(value) : true;
    
    default:
      return true;
  }
}

// Subscription validation
export function validateSubscription(data: Partial<Subscription>): ValidationResult {
  const errors: Record<string, string[]> = {};

  // Required fields
  const requiredFields: (keyof Subscription)[] = [
    'name', 'category', 'status', 'cost', 'currency', 'billing_cycle',
    'url', 'account_email', 'renewal_date', 'start_date', 'usage_importance',
    'usage_frequency', 'auto_renew'
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      errors[field] = [`${field} is required`];
    }
  }

  // Email validation
  if (data.account_email && !isValidEmail(data.account_email)) {
    errors.account_email = ['Invalid email format'];
  }

  // URL validation
  if (data.url && !isValidUrl(data.url)) {
    errors.url = ['Invalid URL format'];
  }

  // Cost validation
  if (data.cost !== undefined && data.cost < 0) {
    errors.cost = ['Cost cannot be negative'];
  }

  // Billing cycle validation
  if (data.billing_cycle && !['Monthly', 'Yearly', 'Weekly', 'Quarterly', 'Free'].includes(data.billing_cycle)) {
    errors.billing_cycle = ['Invalid billing cycle'];
  }

  // Category validation
  if (data.category && !isValidCategory(data.category)) {
    errors.category = ['Invalid category'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Category validation
function isValidCategory(category: string): category is SubscriptionCategory {
  const validCategories: SubscriptionCategory[] = [
    'AI Tools', 'SaaS', 'Entertainment', 'Productivity', 'Utilities',
    'Newsletter', 'Streaming Service', 'Online Learning', 'Magazine',
    'Cloud Provider', 'Development Tools', 'Design Tools', 'Communication',
    'Security', 'Other'
  ];
  return validCategories.includes(category as SubscriptionCategory);
}

// Form validation
export function validateForm<T extends Record<string, ValidationValue>>(
  data: T,
  rules: Record<keyof T, ValidationRule[]>
): ValidationResult {
  const errors: Record<string, string[]> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const fieldResult = validateField(field, data[field as keyof T], fieldRules);
    if (!fieldResult.isValid) {
      errors[field] = fieldResult.errors[field];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validation rules for common fields
export const VALIDATION_RULES = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    type: 'required',
    message
  }),
  
  email: (message: string = 'Invalid email format'): ValidationRule => ({
    type: 'email',
    message
  }),
  
  url: (message: string = 'Invalid URL format'): ValidationRule => ({
    type: 'url',
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    type: 'minLength',
    value: min,
    message: message || `Minimum length is ${min} characters`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    value: max,
    message: message || `Maximum length is ${max} characters`
  }),
  
  min: (min: number, message?: string): ValidationRule => ({
    type: 'min',
    value: min,
    message: message || `Minimum value is ${min}`
  }),
  
  max: (max: number, message?: string): ValidationRule => ({
    type: 'max',
    value: max,
    message: message || `Maximum value is ${max}`
  }),
  
  pattern: (regex: string, message: string): ValidationRule => ({
    type: 'pattern',
    value: regex,
    message
  }),
  
  custom: (validator: (value: ValidationValue) => boolean, message: string): ValidationRule => ({
    type: 'custom',
    validator,
    message
  })
};
