import React, { useMemo, useState } from 'react';
import { useMenuItems, useMenuCategories } from '@/hooks/useApi';
import { MenuItem as ApiMenuItem } from '@/types/restaurant';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from './ProductCard';

interface MenuCardItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  categoryId: string;
}

const adaptMenuItem = (item: ApiMenuItem): MenuCardItem => ({
  id: item.id,
  name: item.nome,
  description: item.descricao || 'Prato delicioso preparado especialmente para voce.',
  price: typeof item.preco_kz === 'number' ? item.preco_kz : parseFloat(String(item.preco_kz || 0)),
  originalPrice: item.preco_promocional_kz ? parseFloat(String(item.preco_promocional_kz)) : undefined,
  image: item.imagem || undefined,
  categoryId: String(item.categoria_id ?? 'outros'),
});

export function MenuShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: items = [], isLoading: itemsLoading } = useMenuItems();
  const { data: categories = [], isLoading: categoriesLoading } = useMenuCategories();

  const menuItems = useMemo(() => items.map(adaptMenuItem), [items]);

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((category: { id?: string | number; nome?: string; name?: string }) => ({
        id: String(category.id ?? category.nome),
        nome: category.nome || category.name || 'Categoria',
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
      <section className="px-4 py-20">
        <div className="container section-shell px-6 py-12 sm:px-10">
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-4 h-8 w-40" />
            <Skeleton className="mx-auto h-10 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-20">
      <div className="container section-shell px-6 py-12 sm:px-10">
        <div className="mb-14 text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Cardapio Digital</span>
          <h2 className="font-display mt-4 mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Escolha por categorias
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Navegue pelas categorias e encontre pratos com apresentacao mais clara,
            destaque visual para promocoes e leitura confortavel em qualquer ecran.
          </p>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
              !selectedCategory
                ? 'scale-105 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                : 'border border-border bg-white hover:bg-secondary'
            }`}
          >
            Todos
          </button>
          {categoryOptions.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'scale-105 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                  : 'border border-border bg-white hover:bg-secondary'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              Nenhum prato encontrado nesta categoria.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
