import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  hint?: string;
  showForgot?: boolean;
  onForgot?: () => void;
}

export function PasswordField({
  id,
  label,
  placeholder = '••••••••',
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  hint,
  showForgot = false,
  onForgot,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-gray-700 font-medium text-sm">
          {label}
        </Label>
        {showForgot && (
          <button
            type="button"
            onClick={onForgot}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Recuperar?
          </button>
        )}
      </div>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
          <Lock className="w-4 h-4" />
        </div>
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`pl-10 pr-10 h-11 bg-white border border-gray-200 rounded-lg
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-blue-50/50
            hover:border-gray-300 transition-all duration-200
            disabled:bg-gray-50 disabled:text-gray-400
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={disabled}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-gray-500 text-xs">{hint}</p>}
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
}
