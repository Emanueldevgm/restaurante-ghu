import React from 'react';
import { Compass, Clock, HeartHandshake, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Reserva Facil',
    description: 'Garanta a sua mesa em segundos com um fluxo simples, rapido e adaptado para mobile.',
    icon: Compass,
  },
  {
    title: 'Entrega Expressa',
    description: 'Pedidos mais claros, carrinho com melhor leitura e finalizacao direta em qualquer dispositivo.',
    icon: Clock,
  },
  {
    title: 'Chefs Especializados',
    description: 'Cozinha autoral com destaque visual para pratos, categorias e promocoes.',
    icon: Sparkles,
  },
  {
    title: 'Experiencia Memoravel',
    description: 'Uma linguagem de interface premium que valoriza conforto, clareza e confianca.',
    icon: HeartHandshake,
  },
];

export function Features() {
  return (
    <section className="px-4 py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Destaques do Restaurante
          </span>
          <h2 className="font-display mt-4 mb-4 text-3xl font-bold sm:text-4xl">
            Um layout moderno que valoriza clareza, acoes e conversao.
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            A nova direcao visual usa azul, branco, superficies mais leves e componentes
            com melhor contraste para navegacao, pedidos e reservas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="overflow-hidden border border-white/70 bg-white/85 shadow-elegant transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardHeader className="flex items-start gap-3 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/20 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="mb-2 text-lg font-semibold">
                      {feature.title}
                    </CardTitle>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
