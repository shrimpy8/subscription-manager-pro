/**
 * Enhanced Input Component
 * Apple-inspired design with smooth interactions
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface EnhancedInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'url';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const EnhancedInput = ({
  label,
  error,
  success,
  helperText,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  className,
  value,
  onChange,
  onBlur,
  onFocus,
  ...props
}: EnhancedInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            'transition-all duration-200',
            'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            {
              'border-error-500 focus:ring-error-500': error,
              'border-success-500 focus:ring-success-500': success && !error,
              'border-primary-500 ring-2 ring-primary-500': isFocused && !error && !success,
              'opacity-50 cursor-not-allowed': disabled,
            },
            className
          )}
          {...props}
        />
        
        {/* Status Icons */}
        {error && (
          <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-error-500" />
        )}
        {success && !error && (
          <CheckCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-success-500" />
        )}
        
        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      {/* Helper Text */}
      {error && (
        <p className="text-sm text-error-500 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  suggestions?: string[];
  className?: string;
}

export const SearchInput = ({
  placeholder = 'Search...',
  onSearch,
  suggestions = [],
  className
}: SearchInputProps) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch?.(searchQuery);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <EnhancedInput
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-10"
        />
        <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400">
          🔍
        </div>
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            ✕
          </button>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 animate-fade-in">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(suggestion);
                setShowSuggestions(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-neutral-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
