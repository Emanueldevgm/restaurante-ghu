import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { useReviews, useRestaurantRating } from '@/hooks/useApi';
import { Skeleton } from '@/components/ui/skeleton';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  initials: string;
}

const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Emanuel Garcia',
    role: 'Cliente Frequente',
    content: 'A experiência no Grande Hotel do Uige foi simplesmente excelente! Os pratos são deliciosos, bem apresentados e a equipe é muito atenciosa. Com certeza voltarei muitas vezes!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    initials: 'JS',
  },
  {
    id: '2',
    name: 'Maria Costa',
    role: 'Visitante de Negócios',
    content: 'Restaurante impecável! Ambiente aconchegante, comida de primeira qualidade e preços justos. Recomendo para qualquer ocasião especial.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    initials: 'MC',
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    role: 'Chef Apaixonado',
    content: 'Como chef profissional, aprecio muito o refinamento na cozinha daqui. Cada detalhe é pensado com cuidado. Parabéns à equipe!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    initials: 'CM',
  },
  {
    id: '4',
    name: 'Ana Pereira',
    role: 'Celebração de Aniversário',
    content: 'Celebramos meu aniversário neste restaurante e foi memorável. O atendimento foi perfeito, a comida divina, e o ambiente perfeito para a ocasião.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    initials: 'AP',
  },
];

export function Testimonials() {
  const { data: reviews, isLoading } = useReviews(4, 0);
  const { data: ratingData } = useRestaurantRating();

  // Transform API reviews to testimonial format
  const displayedReviews = (reviews?.data || []).map((review: any) => ({
    id: review.id,
    name: review.user_name || 'Cliente',
    role: 'Cliente Verificado',
    content: review.comment,
    rating: review.rating,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name || 'Cliente')}&background=random`,
    initials: (review.user_name || 'C')
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
  }));

  // Use mock data if no reviews yet
  const testimonials = displayedReviews.length > 0 ? displayedReviews : mockTestimonials;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent uppercase tracking-wider">
            Avaliações
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {isLoading ? (
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="w-4 h-4 rounded-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex gap-1">
                  {ratingData &&
                    Array.from({ length: Math.round(ratingData.media_avaliacoes) }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                </div>
                <span className="text-sm font-medium">
                  {ratingData?.media_avaliacoes.toFixed(1) || '4.8'} / 5.0
                </span>
                <span className="text-xs text-muted-foreground">
                  ({ratingData?.total_avaliacoes || 0} avaliações)
                </span>
              </>
            )}
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Leia os depoimentos de clientes satisfeitos com nossa experiência gastronômica e atendimento de excelência.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {isLoading ? (
            // Loading skeletons
            [1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground text-sm mb-6 flex-grow leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
