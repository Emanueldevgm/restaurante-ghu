import React, { useState, useEffect } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    image: '/img/ghu.webp',
    alt: 'Grande Hotel do Uíge – Fachada principal',
  },
  {
    image: '/img/Captura de ecrã 2026-04-19 181345.png',
    alt: 'Restaurante e área de lazer',
  },
  {
    image: '/img/Captura de ecrã 2026-04-19 181419.png',
    alt: 'Gastronomia de excelência',
  },
  // fallback
  {
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    alt: 'Hotel de luxo com piscina',
  },
];

const AUTOPLAY_INTERVAL = 5000; // 5 segundos

export function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-12 pt-28 sm:pt-32">
      {/* Carrossel de fundo */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out"
          style={{
            backgroundImage: `url(${slide.image})`,
            opacity: index === current ? 1 : 0,
          }}
          aria-hidden={index !== current}
        />
      ))}

      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-blue-950/75 to-sky-500/60" />

      {/* Efeitos de luz suaves (opcional, mas mantidos para profundidade) */}
      <div className="absolute left-[-10%] top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute bottom-10 right-[-8%] h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

      {/* Indicadores do slide (discretos, no fundo) */}
      <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current ? 'w-8 bg-white' : 'w-2 bg-white/40'
            }`}
            aria-label={`Ir para imagem ${index + 1}`}
          />
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 container max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm animate-fade-up">
          <Star className="h-4 w-4 text-accent" fill="currentColor" />
          <span className="text-sm font-medium text-accent">
            ★★★★★ 4.8 · Hotel &amp; Restaurante Premium
          </span>
        </div>

        <h1 className="font-display mb-6 text-4xl font-bold leading-tight text-white animate-fade-up md:text-6xl lg:text-7xl">
          Grande Hotel do Uíge
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-lg text-blue-50/82 animate-fade-up md:text-xl">
          Conforto, gastronomia de excelência e hospitalidade angolana num só lugar.
        </p>

        <div className="flex flex-col items-center gap-4 animate-fade-up sm:flex-row sm:justify-center">
          <Button size="lg" className="group bg-white text-primary hover:bg-blue-50" asChild>
            <a href="/menu">
              Ver Cardápio
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/25 bg-white/10 text-white hover:bg-white/15"
            asChild
          >
            <a href="/reservas">Reservar Mesa</a>
          </Button>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 animate-bounce">
        <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white/30 pt-2">
          <div className="h-3 w-1 rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
}