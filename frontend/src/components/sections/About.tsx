import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat, Award, Users, Heart } from 'lucide-react';

export function About() {
  const features = [
    {
      icon: ChefHat,
      title: 'Chefs Experientes',
      description: 'Nossos chefs possuem mais de 20 anos de experiência na culinária internacional e angolana.',
    },
    {
      icon: Award,
      title: 'Prêmios e Reconhecimento',
      description: 'Reconhecidos como o melhor restaurante da região em gastronomia e atendimento.',
    },
    {
      icon: Users,
      title: 'Equipe Dedicada',
      description: 'Uma equipe altamente treinada pronta para oferecer o melhor atendimento possível.',
    },
    {
      icon: Heart,
      title: 'Ingredientes Frescos',
      description: 'Utilizamos apenas ingredientes frescos e de qualidade superior em todos os nossos pratos.',
    },
  ];

  return (
    <section id="sobre" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Text Content */}
          <div>
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Quem Somos
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-6">
              Grande Hotel do Uige
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Bem-vindo ao Grande Hotel do Uige, o restaurante de destaque em Uige, Angola. 
              Desde nossa fundação em 2010, temos sido dedicados em proporcionar uma experiência 
              gastronômica inesquecível aos nossos clientes.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Nosso restaurante combina o melhor da culinária tradicional angolana com técnicas 
              internacionais refinadas. Cada prato é preparado com paixão pelos nossos chefs 
              renomados, utilizando ingredientes frescos e de qualidade excepcional.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Acreditamos que a boa comida é sobre mais do que apenas nutrição - é sobre criar 
              memórias, fortalecer relacionamentos e celebrar os momentos especiais da vida. 
              Convidamos você a desfrutar desta experiência única conosco.
            </p>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1504674900968-39ed53c174f5?w=600&h=400&fit=crop"
              alt="Grande Hotel do Uige"
              className="rounded-lg shadow-elegant w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Por Que Nos Escolher
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubra o que nos torna especiais e diferenciados no mercado gastronômico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="font-display text-4xl font-bold text-primary mb-2">14+</div>
            <p className="text-muted-foreground">Anos de Excelência</p>
          </div>
          <div>
            <div className="font-display text-4xl font-bold text-primary mb-2">50K+</div>
            <p className="text-muted-foreground">Clientes Satisfeitos</p>
          </div>
          <div>
            <div className="font-display text-4xl font-bold text-primary mb-2">25+</div>
            <p className="text-muted-foreground">Pratos Especiais</p>
          </div>
        </div>
      </div>
    </section>
  );
}
