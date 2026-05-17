import React from 'react';

export function FormDivider() {
  return (
    <div className="relative my-7">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 bg-white text-gray-400 text-xs font-semibold tracking-wide">OU</span>
      </div>
    </div>
  );
}
