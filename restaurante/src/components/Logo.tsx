import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const logoSizeMap = {
  sm: { width: 32, height: 32, fontSize: 12 },
  md: { width: 48, height: 48, fontSize: 16 },
  lg: { width: 64, height: 64, fontSize: 20 },
  xl: { width: 80, height: 80, fontSize: 24 },
};

export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const sizeConfig = logoSizeMap[size];

  if (variant === 'icon') {
    return (
      <svg
        width={sizeConfig.width}
        height={sizeConfig.height}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Shield background */}
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#7d2d4a', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#5a1f35', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#e6a84b', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#d4941f', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Main shield */}
        <path
          d="M32 5 L50 12 L50 32 C50 45 40 57 32 59 C24 57 14 45 14 32 L14 12 L32 5 Z"
          fill="url(#shieldGradient)"
          stroke="#f0e5d9"
          strokeWidth="1"
        />

        {/* Accent ring */}
        <circle cx="32" cy="30" r="16" fill="none" stroke="url(#accentGradient)" strokeWidth="2" />

        {/* Fork and Knife symbol */}
        <g fill="#f0e5d9">
          {/* Fork left side */}
          <rect x="22" y="18" width="2" height="20" rx="1" />
          <circle cx="22" cy="18" r="2" />
          <line x1="20" y1="37" x2="24" y2="37" stroke="#f0e5d9" strokeWidth="1.5" />
          <line x1="20.5" y1="39" x2="23.5" y2="39" stroke="#f0e5d9" strokeWidth="1.5" />
          <line x1="21" y1="41" x2="23" y2="41" stroke="#f0e5d9" strokeWidth="1.5" />

          {/* Knife right side */}
          <path
            d="M40 18 L44 28 L42 38 Q40 40 38 38 L42 28 Z"
            fill="#f0e5d9"
            stroke="#f0e5d9"
            strokeWidth="1"
          />
        </g>

        {/* Gold accent star */}
        <path
          d="M32 24 L34 29 L39 29 L35 33 L37 38 L32 34 L27 38 L29 33 L25 29 L30 29 Z"
          fill="url(#accentGradient)"
        />
      </svg>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`font-display font-bold ${className}`} style={{ fontSize: sizeConfig.fontSize }}>
        <span style={{ color: '#7d2d4a' }}>GHU</span>
        <span style={{ color: '#e6a84b' }}>.</span>
      </div>
    );
  }

  // Full variant (icon + text)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={sizeConfig.width}
        height={sizeConfig.height}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#7d2d4a', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#5a1f35', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#e6a84b', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#d4941f', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        <path
          d="M32 5 L50 12 L50 32 C50 45 40 57 32 59 C24 57 14 45 14 32 L14 12 L32 5 Z"
          fill="url(#shieldGradient)"
          stroke="#f0e5d9"
          strokeWidth="1"
        />

        <circle cx="32" cy="30" r="16" fill="none" stroke="url(#accentGradient)" strokeWidth="2" />

        <g fill="#f0e5d9">
          <rect x="22" y="18" width="2" height="20" rx="1" />
          <circle cx="22" cy="18" r="2" />
          <line x1="20" y1="37" x2="24" y2="37" stroke="#f0e5d9" strokeWidth="1.5" />
          <line x1="20.5" y1="39" x2="23.5" y2="39" stroke="#f0e5d9" strokeWidth="1.5" />
          <line x1="21" y1="41" x2="23" y2="41" stroke="#f0e5d9" strokeWidth="1.5" />

          <path
            d="M40 18 L44 28 L42 38 Q40 40 38 38 L42 28 Z"
            fill="#f0e5d9"
            stroke="#f0e5d9"
            strokeWidth="1"
          />
        </g>

        <path
          d="M32 24 L34 29 L39 29 L35 33 L37 38 L32 34 L27 38 L29 33 L25 29 L30 29 Z"
          fill="url(#accentGradient)"
        />
      </svg>

      <div className="font-display font-bold" style={{ fontSize: sizeConfig.fontSize }}>
        <div style={{ color: '#7d2d4a', lineHeight: '1' }}>GHU</div>
        <div style={{ color: '#e6a84b', fontSize: sizeConfig.fontSize * 0.6, fontWeight: 400 }}>RESTAURANT</div>
      </div>
    </div>
  );
}
