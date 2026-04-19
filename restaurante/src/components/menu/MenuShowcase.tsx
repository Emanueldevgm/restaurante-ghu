/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { useMenuItems, useMenuCategories } from '@/hooks/useApi';
import { MenuItem as ApiMenuItem } from '@/types/restaurant';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Grid3x3, Wine, Cake, UtensilsCrossed, Sparkles } from 'lucide-react';

interface Category {
  id: string;
  nome: string;
}

interface MenuCardItem {
  id: string | number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
}

const formatPrice = (value: number) => `${value.toFixed(0).replace('.', ',')} Kz`;

const adaptMenuItem = (item: ApiMenuItem): MenuCardItem => ({
  id: item.id,
  name: item.nome,
  description: item.descricao || 'Prato delicioso preparado especialmente para você.',
  price: typeof item.preco_kz === 'number' ? item.preco_kz : parseFloat(String(item.preco_kz || 0)),
  originalPrice: item.preco_promocional_kz
    ? (typeof item.preco_promocional_kz === 'number'
        ? item.preco_promocional_kz
        : parseFloat(String(item.preco_promocional_kz)))
    : undefined,
  categoryId: String(item.categoria_id ?? 'outros'),
});

export function MenuShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: items = [], isLoading: itemsLoading } = useMenuItems();
  const { data: categories = [], isLoading: categoriesLoading } = useMenuCategories();

  const menuItems = useMemo(() => items.map(adaptMenuItem), [items]);

  const categoryOptions: Category[] = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((category) => ({
        id: String((category as any).id ?? (category as any)._id ?? (category as any).nome),
        nome: (category as any).nome || (category as any).name || 'Categoria',
      }));
    }

    return [
      { id: 'entrada', nome: 'Entradas' },
      { id: 'principal', nome: 'Pratos Principais' },
      { id: 'sobremesa', nome: 'Sobremesas' },
      { id: 'bebida', nome: 'Bebidas' },
    ];
  }, [categories]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) {
      return menuItems;
    }
    return menuItems.filter((item) => item.categoryId === selectedCategory);
  }, [menuItems, selectedCategory]);

  if (itemsLoading || categoriesLoading) {
    return (
      <section id="menu" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-32 mx-auto mb-4" />
            <Skeleton className="h-12 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-44 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-accent uppercase tracking-wider">
            Nosso Cardápio
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4">
            Escolha por categorias e descubra pratos únicos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Navegue pelas categorias do cardápio para encontrar o prato certo: entradas, principais, sobremesas e bebidas.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            type="button"
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-background text-muted-foreground border border-border'
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </button>
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-background text-muted-foreground border border-border'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.nome}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Card key={item.id} className="border-border/70 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xl font-semibold text-primary-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">{formatPrice(item.price)}</p>
                        {item.originalPrice ? (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.originalPrice)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      {categoryOptions.find((cat) => cat.id === item.categoryId)?.nome || 'Outra categoria'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-border/70 bg-background p-8 text-center text-muted-foreground shadow-sm">
              Nenhum prato encontrado nesta categoria no momento.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
