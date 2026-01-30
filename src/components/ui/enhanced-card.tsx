/**
 * Enhanced Card Component
 * Apple-inspired design with smooth interactions
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const EnhancedCard = ({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  padding = 'md',
  onMouseEnter,
  onMouseLeave
}: EnhancedCardProps) => {
  return (
        <Card
          className={cn(
            'transition-all duration-200 ease-out',
            {
              // Variants
              'shadow-sm border border-neutral-200 bg-white': variant === 'default',
              'shadow-lg border-0 bg-white': variant === 'elevated',
              'shadow-none border-2 border-neutral-300 bg-white': variant === 'outlined',
              'glass-card shadow-lg border-0': variant === 'glass',
              
              // Hover effects (subtle)
              'hover:shadow-md hover:border-primary-200': hover && variant === 'default',
              'hover:shadow-xl hover:border-primary-300': hover && variant === 'elevated',
              'hover:shadow-lg hover:border-primary-400': hover && variant === 'outlined',
              'hover:shadow-2xl hover:bg-white/90': hover && variant === 'glass',
              
              // Padding
              'p-3': padding === 'sm',
              'p-6': padding === 'md',
              'p-8': padding === 'lg',
            },
            className
          )}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
      {children}
    </Card>
  );
};

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const MetricsCard = ({
  title,
  value,
  change,
  trend,
  icon,
  className
}: MetricsCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-success-500';
      case 'down': return 'text-error-500';
      default: return 'text-neutral-500';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <EnhancedCard 
      variant="elevated" 
      hover={true}
      className={cn('hover-lift', className)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-neutral-900">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1 text-xs">
            <span className={getTrendColor()}>
              {getTrendIcon()} {Math.abs(change)}%
            </span>
            <span className="text-neutral-500">from last month</span>
          </div>
        )}
      </CardContent>
    </EnhancedCard>
  );
};
