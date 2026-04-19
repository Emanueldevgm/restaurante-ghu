import React from 'react';
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/img/ghu.webp)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/80" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full px-4 py-2 mb-6 animate-fade-up">
            <Star className="w-4 h-4 text-accent" fill="currentColor" />
            <span className="text-sm font-medium text-accent">
              Eleito Melhor Restaurante de Uíge
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Sabores autênticos com toque contemporâneo
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Peças únicas no cardápio, atendimento diferenciado e ambiente pensado para experiências memoráveis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold group"
              asChild
            >
              <a href="/menu">
                Ver Cardápio
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <a href="/reservas">
                Reservar Mesa
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-5 border border-primary-foreground/20 shadow-sm">
              <Clock className="w-6 h-6 text-accent mx-auto mb-3" />
              <p className="text-sm text-primary-foreground/80">Horário</p>
              <p className="font-semibold text-primary-foreground">12h - 23h (Todos os dias)</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-5 border border-primary-foreground/20 shadow-sm">
              <MapPin className="w-6 h-6 text-accent mx-auto mb-3" />
              <p className="text-sm text-primary-foreground/80">Localização</p>
              <p className="font-semibold text-primary-foreground">Av. da República, Uíge</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-5 border border-primary-foreground/20 shadow-sm">
              <Star className="w-6 h-6 text-accent mx-auto mb-3" fill="currentColor" />
              <p className="text-sm text-primary-foreground/80">Satisfação</p>
              <p className="font-semibold text-primary-foreground">4.9 / 5.0 de avaliações reais</p>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="relative rounded-3xl overflow-hidden shadow-elegant transform transition hover:scale-105">
              <img
                src="/img/ghu.webp"
                alt="Grande Hotel do Uíge - Vista principal"
                className="w-full h-64 md:h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-elegant transform transition hover:scale-105">
              <img
                src="/img/Captura de ecrã 2026-04-19 181345.png"
                alt="Ambiente do restaurante"
                className="w-full h-64 md:h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-elegant transform transition hover:scale-105">
              <img
                src="/img/Captura de ecrã 2026-04-19 181419.png"
                alt="Pratos especiais do restaurante"
                className="w-full h-64 md:h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
