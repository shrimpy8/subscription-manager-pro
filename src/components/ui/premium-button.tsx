/**
 * Premium Button Component
 * Apple-inspired design with smooth interactions
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const PremiumButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  onClick,
  type = 'button'
}: PremiumButtonProps) => {
  return (
    <Button
      type={type}
      className={cn(
        'relative overflow-hidden transition-all duration-300 ease-out btn-animate',
        'focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          // Variants
          'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500': variant === 'primary',
          'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 focus:ring-neutral-500': variant === 'secondary',
          'bg-transparent hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-500': variant === 'ghost',
          'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white focus:ring-primary-500': variant === 'gradient',
          'bg-success-500 hover:bg-success-600 text-white focus:ring-success-500': variant === 'success',
          'bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-500': variant === 'warning',
          'bg-error-500 hover:bg-error-600 text-white focus:ring-error-500': variant === 'error',
          
          // Sizes
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
};

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup = ({ children, className }: ButtonGroupProps) => {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {children}
    </div>
  );
};
