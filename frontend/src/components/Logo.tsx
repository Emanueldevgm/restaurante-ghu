interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const logoSizeClassMap = {
  sm: 'h-115 w-15',
  md: 'h-15 w-15',
  lg: 'h-15 w-15',
  xl: 'h-15 w-15',
} as const;

export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const logoAlt = variant === 'icon' ? 'GHU' : 'Restaurante GHU';

  return (
    <img
      src="/img/logo.png"
      alt={logoAlt}
      className={`object-contain ${logoSizeClassMap[size]} ${className}`.trim()}
    />
  );
}
