interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const logoSizeClassMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-14 w-14',
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
