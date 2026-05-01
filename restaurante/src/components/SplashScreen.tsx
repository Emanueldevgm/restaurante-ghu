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
        {/* Estrela desenhando-se com traço contínuo */}
        <svg width="120" height="120" viewBox="0 0 120 120" className="animate-draw-star">
          <defs>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="star-color-stop-1" stopColor="#3B82F6" />
              <stop offset="100%" className="star-color-stop-2" stopColor="#1E3A8A" />
            </linearGradient>
          </defs>
          <path
            d="M60,15 L72,45 L105,45 L80,65 L88,95 L60,78 L32,95 L40,65 L15,45 L48,45 Z"
            fill="none"
            stroke="url(#starGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="320"
            strokeDashoffset="320"
            className="star-path"
          />
        </svg>

        {/* Texto */}
        <div className="text-center animate-fade-in-up">
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

      {/* Estilos das animações */}
      <style>{`
        @keyframes draw-star {
          0% { stroke-dashoffset: 320; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .star-path {
          animation: draw-star 2s ease-in-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.5s both;
        }
        .animate-progress {
          animation: progress 2.2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}