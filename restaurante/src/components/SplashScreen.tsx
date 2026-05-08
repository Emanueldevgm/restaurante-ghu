/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Logo } from '@/components/Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const fadeOutTimer = setTimeout(() => setVisible(false), 2200);
    const completeTimer = setTimeout(onComplete, 2600);
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Fundo azul muito suave */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white" />

      {/* Grade hexagonal leve (padrão geométrico) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
            <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="#2563EB" strokeWidth="1" />
            <path d="M28 133L0 116L0 83L28 66L56 83L56 116L28 133L28 166" fill="none" stroke="#2563EB" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Logótipo do restaurante com animação de fade-in */}
        <div className="animate-fade-in-up">
          <Logo className="w-32 h-32" />
        </div>

        {/* Texto */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Restaurante <span className="text-blue-600">GHU</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Sabores que encantam, momentos que ficam.
          </p>
        </div>

        {/* Barra de progresso minimalista */}
        <div className="w-40 h-0.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-progress" />
        </div>
      </div>

      {/* Estilos das animações (removida a animação da estrela) */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out both;
        }
        .animate-progress {
          animation: progress 2.2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}