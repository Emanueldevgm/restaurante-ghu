import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Painel Esquerdo - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600" />

        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl" />

        {/* Content */}
        <div className="relative z-10 w-full flex flex-col justify-between p-12 lg:p-16">
          {/* Logo/Branding */}
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-8 backdrop-blur">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              A jornada <br />
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                começa aqui
              </span>
            </h1>
            <p className="text-lg text-blue-50/90 max-w-md leading-relaxed">
              Junte-se à nossa comunidade e desfrute da melhor experiência gastronómica em Angola.
            </p>

            {/* Features */}
            <div className="space-y-4 pt-6">
              {[
                { icon: '⚡', text: 'Rápido e simples' },
                { icon: '🔒', text: 'Segurança garantida' },
                { icon: '🎯', text: 'Experiência premium' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 text-blue-50/80 group">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg group-hover:bg-white/20 transition-colors">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-blue-50/60 text-xs">
            © 2026 Restaurante Premium. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Painel Direito - Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
