import React from 'react';
import { Star, Sparkles, Percent, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/services/api';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image?: string;
    categoryId: string;
  };
}

export function ProductCard({ item }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAdd = () => {
    const adaptedItem: MenuItem = {
      id: item.id,
      categoria_id: item.categoryId,
      nome: item.name,
      nome_en: null,
      descricao: item.description,
      preco_kz: item.price,
      preco_promocional_kz: item.originalPrice ?? null,
      tempo_preparo: null,
      vegetariano: false,
      vegano: false,
      sem_gluten: false,
      picante: false,
      status: 'disponivel',
      destaque: false,
      prato_do_dia: false,
      imagem: item.image ?? null,
    };

    addItem(adaptedItem);
  };

  const discountPercent = item.originalPrice
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : null;

  return (
    <Card className="group relative overflow-hidden border border-white/80 bg-white/95 shadow-elegant transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-56 overflow-hidden">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discountPercent && (
            <Badge className="border-0 bg-red-500 text-white shadow-md">
              <Percent className="mr-1 h-3 w-3" />
              -{discountPercent}%
            </Badge>
          )}
          <Badge className="border-0 bg-white/90 text-primary shadow-md">
            <Sparkles className="mr-1 h-3 w-3" />
            Destaque
          </Badge>
        </div>

        <Button
          onClick={handleAdd}
          size="sm"
          className="absolute bottom-4 right-4 bg-white/95 text-primary opacity-0 shadow-lg transition-opacity duration-300 hover:bg-white group-hover:opacity-100"
        >
          <ShoppingCart className="mr-1 h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <CardContent className="p-5">
        <h3 className="font-display mb-2 text-xl font-bold transition-colors group-hover:text-primary">{item.name}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">{item.price.toFixed(0)} Kz</span>
            {item.originalPrice && (
              <span className="ml-2 text-sm text-muted-foreground line-through">
                {item.originalPrice.toFixed(0)} Kz
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">4.8</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
