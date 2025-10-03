/**
 * Type Guards and Type Safety Utilities
 * 
 * Provides type-safe utilities for runtime type checking
 * and eliminates the need for `any` or `unknown` types.
 */

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is a Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is an object (not null, not array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard to check if a value is a function
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * Type guard to check if a value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Type guard to check if a value is not null or undefined
 */
export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is a valid email
 */
export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Type guard to check if a value is a valid URL
 */
export function isValidUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard to check if a value is a valid date string (ISO format)
 */
export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.toISOString().split('T')[0] === value;
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * Type guard to check if a value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

/**
 * Type guard to check if a value is an integer
 */
export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

/**
 * Type guard to check if a value is a valid ID (non-empty string or positive number)
 */
export function isValidId(value: unknown): value is string | number {
  return isNonEmptyString(value) || isPositiveNumber(value);
}

/**
 * Type guard to check if a value is a valid currency code
 */
export function isValidCurrency(value: unknown): value is string {
  if (!isString(value)) return false;
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
  return validCurrencies.includes(value.toUpperCase());
}

/**
 * Type guard to check if a value is a valid subscription status
 */
export function isValidSubscriptionStatus(value: unknown): value is 'active' | 'paused' | 'canceled' {
  return isString(value) && ['active', 'paused', 'canceled'].includes(value);
}

/**
 * Type guard to check if a value is a valid priority level
 */
export function isValidPriority(value: unknown): value is 'low' | 'medium' | 'high' {
  return isString(value) && ['low', 'medium', 'high'].includes(value);
}

/**
 * Type guard to check if a value is a valid usage frequency
 */
export function isValidUsageFrequency(value: unknown): value is 'daily' | 'weekly' | 'monthly' | 'rarely' {
  return isString(value) && ['daily', 'weekly', 'monthly', 'rarely'].includes(value);
}

/**
 * Type guard to check if a value is a valid billing cycle
 */
export function isValidBillingCycle(value: unknown): value is 'Monthly' | 'Yearly' | 'Free' {
  return isString(value) && ['Monthly', 'Yearly', 'Free'].includes(value);
}

/**
 * Safe type assertion with runtime validation
 */
export function safeAssert<T>(
  value: unknown,
  typeGuard: (val: unknown) => val is T,
  errorMessage?: string
): T {
  if (!typeGuard(value)) {
    throw new Error(errorMessage || `Value does not match expected type`);
  }
  return value;
}

/**
 * Safe type casting with fallback
 */
export function safeCast<T>(
  value: unknown,
  typeGuard: (val: unknown) => val is T,
  fallback: T
): T {
  return typeGuard(value) ? value : fallback;
}

/**
 * Type-safe object property access
 */
export function safeGet<T, K extends keyof T>(
  obj: T,
  key: K,
  fallback: T[K]
): T[K] {
  return obj[key] ?? fallback;
}

/**
 * Type-safe array access
 */
export function safeArrayGet<T>(
  array: T[],
  index: number,
  fallback: T
): T {
  return array[index] ?? fallback;
}
