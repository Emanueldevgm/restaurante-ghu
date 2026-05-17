import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat, Award, Users, Heart } from 'lucide-react';

const About = () => {
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
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 pt-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Sobre o Grande Hotel do Uige
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Conheça a história, valores e compromisso de excelência do nosso restaurante
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
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
          <div className="mt-20">
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

          {/* Mission and Vision */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-bold mb-4">Nossa Missão</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Proporcionar uma experiência gastronômica de classe mundial que celebra a 
                  culinária angolana e internacional, servindo com excelência, integridade e 
                  dedicação ao bem-estar dos nossos clientes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20">
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-bold mb-4">Nossa Visão</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ser reconhecido como o melhor restaurante de Uige e arredores, transformando 
                  cada refeição em um momento memorável que reúne pessoas e cria conexões 
                  significativas através da gastronomia.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="font-display text-5xl font-bold text-primary mb-2">14+</div>
              <p className="text-muted-foreground text-lg">Anos de Excelência</p>
            </div>
            <div>
              <div className="font-display text-5xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground text-lg">Clientes Satisfeitos</p>
            </div>
            <div>
              <div className="font-display text-5xl font-bold text-primary mb-2">25+</div>
              <p className="text-muted-foreground text-lg">Pratos Especiais</p>
            </div>
          </div>

          {/* Values */}
          <div className="mt-20">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
              Nossos Valores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h4 className="font-semibold text-lg mb-3">Qualidade</h4>
                <p className="text-muted-foreground">
                  Comprometidos com a excelência em cada aspecto, desde a seleção de ingredientes 
                  até a apresentação final do prato.
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-lg mb-3">Inovação</h4>
                <p className="text-muted-foreground">
                  Constantemente explorando novas técnicas e sabores para oferecer experiências 
                  gastronômicas inovadoras.
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-lg mb-3">Respeito</h4>
                <p className="text-muted-foreground">
                  Respeitamos nossos clientes, equipe e fornecedores, construindo relacionamentos 
                  baseados em confiança e integridade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
