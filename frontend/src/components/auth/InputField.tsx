import React, { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputFieldProps {
  id: string;
  label: string;
  icon: ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function InputField({
  id,
  label,
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700 font-medium text-sm">
        {label}
      </Label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
          {icon}
        </div>
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`pl-10 h-11 bg-white border border-gray-200 rounded-lg
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-blue-50/50
            hover:border-gray-300 transition-all duration-200
            disabled:bg-gray-50 disabled:text-gray-400
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
        />
      </div>
      {error && <p className="text-red-500 text-xs font-medium mt-1">{error}</p>}
    </div>
  );
}
