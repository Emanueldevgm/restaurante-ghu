import React from 'react';
import { Compass, Clock, HeartHandshake, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Reserva Fácil',
    description: 'Garanta sua mesa em segundos com reserva online e atendimento rápido.',
    icon: Compass,
  },
  {
    title: 'Entrega Expressa',
    description: 'Peça pelo nosso cardápio e receba no conforto da sua casa.',
    icon: Clock,
  },
  {
    title: 'Chefs Especializados',
    description: 'Cozinha autoral com ingredientes locais e técnicas refinadas.',
    icon: Sparkles,
  },
  {
    title: 'Experiência Memorável',
    description: 'Ambiente elegante e serviço dedicado em cada visita.',
    icon: HeartHandshake,
  },
];

export function Features() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
            Destaques do Restaurante
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-4 mb-4">
            Um restaurante que entrega sabor, conforto e experiência.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Descubra por que nossos clientes escolhem o Grande Hotel do Uíge para refeições especiais, eventos e pedidos rápidos a qualquer hora.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-border/70 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex items-start gap-3 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold mb-2">
                      {feature.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
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
