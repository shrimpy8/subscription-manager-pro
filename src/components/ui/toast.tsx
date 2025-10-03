/**
 * Toast Notification Components
 * 
 * Provides consistent toast notification system for the application
 * with accessibility support and customizable styling.
 */

import React from 'react';
import { Toaster, toast as hotToast } from 'react-hot-toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Toast notification variants
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification options
 */
export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  variant?: ToastVariant;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Enhanced toast notification system
 */
export class ToastService {
  /**
   * Show success toast
   */
  static success(message: string, options?: ToastOptions) {
    return hotToast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        border: '1px solid #059669',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      icon: <CheckCircle className="w-5 h-5" />,
    });
  }

  /**
   * Show error toast
   */
  static error(message: string, options?: ToastOptions) {
    return hotToast.error(message, {
      duration: options?.duration || 6000,
      position: options?.position || 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        border: '1px solid #DC2626',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      icon: <AlertCircle className="w-5 h-5" />,
    });
  }

  /**
   * Show warning toast
   */
  static warning(message: string, options?: ToastOptions) {
    return hotToast(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
      style: {
        background: '#F59E0B',
        color: '#fff',
        border: '1px solid #D97706',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      icon: <AlertTriangle className="w-5 h-5" />,
    });
  }

  /**
   * Show info toast
   */
  static info(message: string, options?: ToastOptions) {
    return hotToast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      style: {
        background: '#3B82F6',
        color: '#fff',
        border: '1px solid #2563EB',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      icon: <Info className="w-5 h-5" />,
    });
  }

  /**
   * Show loading toast
   */
  static loading(message: string, options?: ToastOptions) {
    return hotToast.loading(message, {
      duration: Infinity,
      position: options?.position || 'top-right',
      style: {
        background: '#6B7280',
        color: '#fff',
        border: '1px solid #4B5563',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    });
  }

  /**
   * Dismiss toast
   */
  static dismiss(toastId?: string) {
    if (toastId) {
      hotToast.dismiss(toastId);
    } else {
      hotToast.dismiss();
    }
  }

  /**
   * Dismiss all toasts
   */
  static dismissAll() {
    hotToast.dismiss();
  }
}

/**
 * Toast container component
 */
export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        // Success toast options
        success: {
          duration: 4000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
        },
        // Error toast options
        error: {
          duration: 6000,
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        },
        // Loading toast options
        loading: {
          duration: Infinity,
          style: {
            background: '#6B7280',
            color: '#fff',
          },
        },
      }}
    />
  );
}

/**
 * Hook for toast notifications
 */
export function useToast() {
  return {
    success: ToastService.success,
    error: ToastService.error,
    warning: ToastService.warning,
    info: ToastService.info,
    loading: ToastService.loading,
    dismiss: ToastService.dismiss,
    dismissAll: ToastService.dismissAll,
  };
}

// Export the toast service as default
export const toast = ToastService;
export default ToastService;
