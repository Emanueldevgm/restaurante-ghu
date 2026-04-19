import React from 'react';
import { Star, Plus, Flame, Sparkles, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdaptedMenuItem } from '@/types/restaurant';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  item: AdaptedMenuItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const { addItem } = useCart();

  const hasPromotion = item.tags.includes('promotion') && item.originalPrice;
  const discountPercent = hasPromotion && item.originalPrice
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden border-border/50 hover:shadow-elegant hover:border-primary/20 transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.tags.includes('bestseller') && (
            <Badge className="bg-accent text-accent-foreground shadow-gold">
              <Flame className="w-3 h-3 mr-1" />
              Bestseller
            </Badge>
          )}
          {item.tags.includes('new') && (
            <Badge className="bg-success text-success-foreground">
              <Sparkles className="w-3 h-3 mr-1" />
              Novo
            </Badge>
          )}
          {hasPromotion && (
            <Badge className="bg-destructive text-destructive-foreground">
              <Percent className="w-3 h-3 mr-1" />
              {discountPercent}% OFF
            </Badge>
          )}
        </div>

        {/* Add Button Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold"
            onClick={() => {
              // Se tem o item original da API, usa ele; senão usa o item adaptado (que é compatível com MenuItem)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const itemForCart = item.originalItem || (item as any);
              addItem(itemForCart);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-accent" fill="currentColor" />
          <span className="text-sm font-medium">{item.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({item.reviewCount} avaliações)
          </span>
        </div>

        {/* Name & Description */}
        <h3 className="font-display text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">
            {item.price.toFixed(2).replace('.', ',')} Kz
          </span>
          {hasPromotion && item.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {item.originalPrice.toFixed(2).replace('.', ',')} Kz
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
