import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const logoSizeMap = {
  sm: { fontSize: 14 },
  md: { fontSize: 18 },
  lg: { fontSize: 24 },
  xl: { fontSize: 30 },
};

export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const sizeConfig = logoSizeMap[size];
  const variantClassMap = {
    icon: 'font-semibold tracking-tight',
    text: 'font-bold tracking-tight',
    full: 'font-bold tracking-tight',
  } as const;

  return (
    <div
      className={`font-display text-primary ${variantClassMap[variant]} ${className}`}
      style={{ fontSize: sizeConfig.fontSize, lineHeight: 1.1 }}
    >
      {variant === 'icon' ? 'GHU' : 'Restaurante GHU'}
    </div>
  );
}
