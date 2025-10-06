import { cn } from '@/lib/utils';
import { PremiumButton } from '@/components/ui/premium-button';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const variantClasses = {
    default: 'border-gray-300 border-t-orange-600',
    primary: 'border-gray-300 border-t-orange-600',
    secondary: 'border-gray-300 border-t-gray-600',
    success: 'border-gray-300 border-t-green-600',
    warning: 'border-gray-300 border-t-yellow-600',
    error: 'border-gray-300 border-t-red-600'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({ 
  isLoading, 
  loadingText = 'Loading...', 
  children, 
  className,
  disabled,
  onClick,
  variant = 'default',
  size = 'md'
}: LoadingButtonProps) {
  return (
    <PremiumButton
      className={className}
      disabled={disabled || isLoading}
      onClick={onClick}
      variant={variant === 'secondary' ? 'secondary' : variant === 'success' ? 'success' : variant === 'warning' ? 'warning' : variant === 'error' ? 'error' : 'primary'}
      loading={isLoading}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      title={isLoading ? loadingText : undefined}
    >
      {children}
    </PremiumButton>
  );
}

/**
 * Full-page loading component
 */
interface LoadingPageProps {
  message?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function LoadingPage({ 
  message = 'Loading...', 
  variant = 'default',
  className 
}: LoadingPageProps) {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center',
      className
    )}>
      <div className="text-center">
        <LoadingSpinner size="xl" variant={variant} className="mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline loading component for smaller areas
 */
interface LoadingInlineProps {
  message?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingInline({ 
  message = 'Loading...', 
  variant = 'default',
  size = 'md',
  className 
}: LoadingInlineProps) {
  return (
    <div className={cn(
      'flex items-center justify-center py-4',
      className
    )}>
      <div className="flex items-center space-x-2">
        <LoadingSpinner size={size} variant={variant} />
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
}

/**
 * Loading overlay for modals and cards
 */
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'Loading...', 
  variant = 'default',
  className,
  children 
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="text-center">
          <LoadingSpinner size="lg" variant={variant} className="mx-auto mb-2" />
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}
