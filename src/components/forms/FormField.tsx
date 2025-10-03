/**
 * Generic Form Field Component
 * Type-safe form field with validation
 */

import React from 'react';
import { ValidationValue, ValidationRule, ValidationResult } from '@/types/common';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface FormFieldProps<T = ValidationValue> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'number' | 'select' | 'textarea' | 'date';
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  error?: string;
  disabled?: boolean;
}

export function FormField<T extends ValidationValue>({
  name,
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  error,
  disabled = false
}: FormFieldProps<T>) {
  const handleChange = (newValue: string | number) => {
    if (type === 'number') {
      onChange(Number(newValue) as T);
    } else {
      onChange(newValue as T);
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={handleChange}
            disabled={disabled}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value instanceof Date ? value.toISOString().split('T')[0] : value as string}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        );
      
      default:
        return (
          <Input
            type={type}
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
