import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Date utility functions - centralized date handling
 * Following cursorrules: centralized utilities for all date operations
 */

/**
 * Convert string or Date to Date object
 * @param date - The date to convert (string or Date object)
 * @returns A Date object
 * @example
 * ```typescript
 * toDate('2023-12-25') // Returns Date object for Christmas 2023
 * toDate(new Date()) // Returns the same Date object
 * ```
 */
export function toDate(date: Date | string): Date {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
}

/**
 * Get current date as Date object
 * @returns Current date as Date object
 * @example
 * ```typescript
 * const today = getCurrentDate(); // Returns current date
 * ```
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * Get current date as ISO string
 * @returns Current date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @example
 * ```typescript
 * const now = getCurrentDateISO(); // Returns "2023-12-25T10:30:00.000Z"
 * ```
 */
export function getCurrentDateISO(): string {
  return new Date().toISOString();
}

/**
 * Add days to a date
 * @param date - The base date (string or Date object)
 * @param days - Number of days to add (can be negative to subtract)
 * @returns New Date object with days added
 * @example
 * ```typescript
 * addDays('2023-12-25', 7) // Returns date 7 days after Christmas
 * addDays(new Date(), -30) // Returns date 30 days ago
 * ```
 */
export function addDays(date: Date | string, days: number): Date {
  const d = toDate(date);
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Add months to a date
 * @param date - The base date (string or Date object)
 * @param months - Number of months to add (can be negative to subtract)
 * @returns New Date object with months added
 * @example
 * ```typescript
 * addMonths('2023-12-25', 1) // Returns January 25, 2024
 * addMonths(new Date(), -6) // Returns date 6 months ago
 * ```
 */
export function addMonths(date: Date | string, months: number): Date {
  const d = toDate(date);
  const result = new Date(d);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 * @param date - The base date (string or Date object)
 * @param years - Number of years to add (can be negative to subtract)
 * @returns New Date object with years added
 * @example
 * ```typescript
 * addYears('2023-12-25', 1) // Returns December 25, 2024
 * addYears(new Date(), -1) // Returns date 1 year ago
 * ```
 */
export function addYears(date: Date | string, years: number): Date {
  const d = toDate(date);
  const result = new Date(d);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Format dates consistently across the application
 * @param date - The date to format (string or Date object)
 * @param format - The format type ('short', 'long', 'input', 'iso')
 * @returns Formatted date string
 * @example
 * ```typescript
 * formatDate('2023-12-25', 'short') // Returns "Dec 25, 2023"
 * formatDate(new Date(), 'long') // Returns "Monday, December 25, 2023"
 * formatDate('2023-12-25', 'input') // Returns "2023-12-25"
 * formatDate('2023-12-25', 'iso') // Returns "2023-12-25T00:00:00.000Z"
 * ```
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'input' | 'iso' = 'short'): string {
  const d = toDate(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    case 'long':
      return d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    case 'input':
      return d.toISOString().split('T')[0]
    case 'iso':
      return d.toISOString()
    default:
      return d.toLocaleDateString()
  }
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param date - The date to format (string or Date object)
 * @returns Date string in YYYY-MM-DD format for HTML input fields
 * @example
 * ```typescript
 * formatDateForInput('2023-12-25') // Returns "2023-12-25"
 * formatDateForInput(new Date()) // Returns current date in YYYY-MM-DD format
 * ```
 */
export function formatDateForInput(date: Date | string): string {
  return formatDate(date, 'input');
}

/**
 * Get date 30 days from now (common for renewal dates)
 * @returns Date object 30 days from current date
 * @example
 * ```typescript
 * const renewalDate = getDefaultRenewalDate(); // Returns date 30 days from now
 * ```
 */
export function getDefaultRenewalDate(): Date {
  return addDays(getCurrentDate(), 30);
}

/**
 * Get date 1 year from now
 * @returns Date object 1 year from current date
 * @example
 * ```typescript
 * const yearlyRenewal = getDefaultYearlyRenewalDate(); // Returns date 1 year from now
 * ```
 */
export function getDefaultYearlyRenewalDate(): Date {
  return addYears(getCurrentDate(), 1);
}

/**
 * Calculate days until renewal
 * @param renewalDate - The renewal date (string or Date object)
 * @returns Number of days until renewal (negative if past due)
 * @example
 * ```typescript
 * getDaysUntilRenewal('2024-01-15') // Returns days until January 15, 2024
 * getDaysUntilRenewal(new Date()) // Returns 0 (today)
 * ```
 */
export function getDaysUntilRenewal(renewalDate: Date | string): number {
  const renewal = toDate(renewalDate);
  const today = getCurrentDate();
  const diffTime = renewal.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate unique ID
 * @returns A random 9-character alphanumeric string
 * @example
 * ```typescript
 * const id = generateId(); // Returns something like "a1b2c3d4e"
 * ```
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

/**
 * Sanitize input strings by removing HTML tags and trimming whitespace
 * @param input - The input string to sanitize
 * @returns Sanitized string with HTML tags removed and trimmed
 * @example
 * ```typescript
 * sanitizeInput('  <script>alert("xss")</script>  ') // Returns "alert("xss")"
 * sanitizeInput('  Hello World  ') // Returns "Hello World"
 * ```
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
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
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get subscription status color classes for UI styling
 * @param status - The subscription status ('active', 'paused', 'canceled')
 * @returns Tailwind CSS classes for status styling
 * @example
 * ```typescript
 * getStatusColor('active') // Returns "bg-green-100 text-green-800"
 * getStatusColor('paused') // Returns "bg-yellow-100 text-yellow-800"
 * ```
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'canceled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get priority color classes for UI styling
 * @param priority - The priority level ('high', 'medium', 'low')
 * @returns Tailwind CSS classes for priority styling
 * @example
 * ```typescript
 * getPriorityColor('high') // Returns "bg-red-100 text-red-800"
 * getPriorityColor('medium') // Returns "bg-yellow-100 text-yellow-800"
 * ```
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Calculate yearly cost from monthly cost based on billing cycle
 * @param monthlyCost - The monthly cost amount
 * @param billingCycle - The billing cycle ('Monthly', 'Yearly', 'Weekly', 'Quarterly', 'Free')
 * @returns The calculated yearly cost
 * @example
 * ```typescript
 * calculateYearlyCost(10, 'Monthly') // Returns 120 (10 * 12)
 * calculateYearlyCost(100, 'Yearly') // Returns 100 (already yearly)
 * calculateYearlyCost(5, 'Weekly') // Returns 260 (5 * 52)
 * ```
 */
export function calculateYearlyCost(monthlyCost: number, billingCycle: string): number {
  switch (billingCycle) {
    case 'Monthly':
      return monthlyCost * 12
    case 'Yearly':
      return monthlyCost
    case 'Weekly':
      return monthlyCost * 52
    case 'Quarterly':
      return monthlyCost * 4
    case 'Free':
      return 0
    default:
      return monthlyCost * 12
  }
}

/**
 * Debounce function to limit the rate of function execution
 * @param func - The function to debounce
 * @param wait - The delay in milliseconds
 * @returns A debounced version of the function
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 * 
 * debouncedSearch('a'); // Will wait 300ms
 * debouncedSearch('ab'); // Will cancel previous and wait 300ms
 * debouncedSearch('abc'); // Will cancel previous and wait 300ms
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
