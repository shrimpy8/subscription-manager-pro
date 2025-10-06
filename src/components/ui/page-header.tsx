"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PremiumButton } from '@/components/ui/premium-button';
import { cn } from '@/lib/utils';

export interface PageHeaderAction {
  key: string;
  label: string;
  onClick?: () => void;
  href?: string;
  iconLeft?: React.ReactNode;
  variant?: 'secondary' | 'orange-gradient' | 'primary' | 'ghost' | 'success' | 'warning' | 'error';
  disabled?: boolean;
  loading?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  className?: string;
  actions?: PageHeaderAction[];
}

export function PageHeader({ title, subtitle, badgeText, className, actions = [] }: PageHeaderProps) {
  return (
    <header className={cn('bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-30', className)}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h2 className="section-title">{title}</h2>
            {badgeText && (
              <Badge variant="secondary" className="btn-secondary">
                {badgeText}
              </Badge>
            )}
          </div>
          {actions.length > 0 && (
            <div className="flex items-center space-x-4">
              {actions.map((a) => (
                <PremiumButton
                  key={a.key}
                  variant={a.variant || 'secondary'}
                  onClick={a.onClick}
                  disabled={a.disabled}
                  loading={a.loading}
                >
                  {a.iconLeft}
                  {a.label}
                </PremiumButton>
              ))}
            </div>
          )}
        </div>
        {subtitle && (
          <div className="pb-4 -mt-2">
            <p className="text-sm text-neutral-600">{subtitle}</p>
          </div>
        )}
      </div>
    </header>
  );
}

export default PageHeader;


