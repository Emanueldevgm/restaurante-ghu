import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center lg:text-left">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{title}</h2>
      <p className="text-gray-500 text-base mt-3 leading-relaxed">{subtitle}</p>
    </div>
  );
}
