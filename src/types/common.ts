/**
 * Centralized Type System
 * Provides consistent types across the entire application
 */

// Base validation types
export type ValidationValue = string | number | boolean | Date | null | undefined;

// Generic form data type
export type FormData<T = Record<string, ValidationValue>> = T;

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Loading state interface
export interface LoadingState {
  isLoading: boolean;
  loadingMessage: string | null;
  error: string | null;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// Generic validation rule
export interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  message: string;
  value?: ValidationValue;
  validator?: (value: ValidationValue) => boolean;
}

// Form field configuration
export interface FormFieldConfig<T = ValidationValue> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'number' | 'select' | 'textarea' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  rules?: ValidationRule[];
  defaultValue?: T;
}

// Generic form configuration
export interface FormConfig<T = Record<string, ValidationValue>> {
  fields: FormFieldConfig[];
  onSubmit: (data: T) => void | Promise<void>;
  onValidate?: (data: T) => ValidationResult;
  submitText?: string;
  loading?: boolean;
}

// Error handling types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// Utility types for better type safety
export type NonNullable<T> = T extends null | undefined ? never : T;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
