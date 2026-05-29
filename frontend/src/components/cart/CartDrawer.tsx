/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AddressSelector } from '@/components/checkout/AddressSelector';
import { useCreateOrder, useTableStatus, useTables } from '@/hooks/useApi';
import { useCalculateDeliveryFee } from '@/hooks/useDeliveryFee';
import api, { buildImageUrl, Table } from '@/services/api';
import {
  Drawer,
  DrawerContent,
  DrawerContentRight,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Minus, Trash2, Truck, Store, Home } from 'lucide-react';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { toast } from 'sonner';

interface TableWithStatus extends Table {
  status: 'disponivel' | 'ocupada' | 'reservada';
}

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, totalPrice, removeItem, updateQuantity, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const { data: tables = [] } = useTables();
  const { data: tableStatus = [] } = useTableStatus();
  const [orderType, setOrderType] = useState<'delivery' | 'retirada' | 'mesa'>('retirada');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const { mutate: calculateFee } = useCalculateDeliveryFee();

  const normalizeTableStatus = (status: string): 'disponivel' | 'ocupada' | 'reservada' => {
    switch (status) {
      case 'occupied':
      case 'ocupada':
        return 'ocupada';
      case 'reserved':
      case 'reservada':
        return 'reservada';
      case 'disponivel':
      default:
        return 'disponivel';
    }
  };

  const tablesWithStatus = tables.map((table) => {
    const statusInfo = tableStatus.find((entry) => entry.id === table.id);
    return {
      ...table,
      status: normalizeTableStatus(statusInfo?.status_mesa || 'disponivel'),
    } satisfies TableWithStatus;
  });

  const availableTables = tablesWithStatus.filter((table) => table.ativa && table.status === 'disponivel');

  useEffect(() => {
    if (isAuthenticated && orderType === 'delivery') {
      api
        .get('/users/addresses')
        .then((res) => setAddresses(res.data))
        .catch(() => toast.error('Erro ao carregar enderecos'));
    }
  }, [isAuthenticated, orderType]);

  useEffect(() => {
    if (orderType === 'delivery' && selectedAddressId) {
      const addr = addresses.find((address) => address.id === selectedAddressId);
      if (addr) {
        calculateFee(
          { provincia: addr.provincia, municipio: addr.municipio, bairro: addr.bairro },
          {
            onSuccess: (data) => {
              setDeliveryFee(data.taxa_kz);
              setEstimatedTime(data.tempo_estimado_min);
            },
            onError: () => {
              toast.error('Nao foi possivel calcular a taxa');
              setDeliveryFee(null);
            },
          },
        );
      }
    } else {
      setDeliveryFee(null);
      setEstimatedTime(null);
    }
  }, [orderType, selectedAddressId, addresses, calculateFee]);

  useEffect(() => {
    if (orderType !== 'mesa') {
      setSelectedTableId('');
    }
  }, [orderType]);

  const totalWithFee = totalPrice + (deliveryFee || 0);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Faca login para finalizar.');
      setIsCartOpen(false);
      navigate('/auth');
      return;
    }

    if (orderType === 'delivery' && !selectedAddressId) {
      toast.error('Selecione um endereco');
      return;
    }

    if (orderType === 'mesa' && !selectedTableId) {
      toast.error('Selecione uma mesa');
      return;
    }

    createOrder(
      {
        tipo: orderType,
        itens: items.map((item) => ({
          item_cardapio_id: item.id,
          quantidade: item.quantity,
          observacoes: '',
        })),
        observacoes: '',
        ...(orderType === 'delivery' && { endereco_id: selectedAddressId }),
        ...(orderType === 'mesa' && { mesa_id: selectedTableId }),
      },
      {
        onSuccess: (response: any) => {
          toast.success(`Pedido #${response.data?.numero_pedido} criado!`);
          clearCart();
          setIsCartOpen(false);
          setSelectedAddressId('');
          setSelectedTableId('');
        },
        onError: (error: any) =>
          toast.error(error.response?.data?.message || 'Erro ao criar pedido'),
      },
    );
  };

  return (
    <Drawer open={isCartOpen} onOpenChange={setIsCartOpen} direction="right">
      <DrawerContentRight className="bg-white">
        <DrawerHeader className="border-b border-gray-200 bg-white sticky top-0 py-3 px-4">
          <DrawerTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Seu Carrinho
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <ShoppingCart className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>Seu carrinho esta vazio</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  <img
                    src={buildImageUrl(item.imagem)}
                    className="h-full w-full object-cover"
                    alt={item.nome}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = buildImageUrl(null);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{item.nome}</p>
                  <p className="text-sm text-muted-foreground">{Number(item.preco_kz).toFixed(2)} Kz</p>
                  <QuantityStepper
                    quantity={item.quantity}
                    onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                    onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                  />
                </div>
                <div className="text-right">
                  <p className="font-bold">{(item.preco_kz * item.quantity).toFixed(2)} Kz</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <DrawerFooter className="space-y-3 border-t border-gray-200 bg-gray-50 p-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{totalPrice.toFixed(2)} Kz</span>
              </div>
              {deliveryFee !== null && (
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>{deliveryFee.toFixed(2)} Kz</span>
                </div>
              )}
              {estimatedTime !== null && (
                <div className="flex justify-between text-sm">
                  <span>Tempo estimado</span>
                  <span>{estimatedTime} min</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{totalWithFee.toFixed(2)} Kz</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Tipo de pedido</Label>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  variant={orderType === 'retirada' ? 'default' : 'outline'}
                  onClick={() => setOrderType('retirada')}
                  className="h-auto flex-col py-2 text-xs hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Store className="mb-1 h-4 w-4" />
                  Retirada
                </Button>
                <Button
                  variant={orderType === 'mesa' ? 'default' : 'outline'}
                  onClick={() => setOrderType('mesa')}
                  className="h-auto flex-col py-2 text-xs hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Home className="mb-1 h-4 w-4" />
                  Mesa
                </Button>
              </div>
            </div>

            {orderType === 'delivery' && (
              <AddressSelector
                addresses={addresses}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
              />
            )}

            {orderType === 'mesa' && (
              <div className="space-y-2">
                <Label className="text-sm">Selecionar mesa</Label>
                <p className="text-xs text-muted-foreground">
                  Escolha uma mesa disponível para este pedido.
                </p>
                {availableTables.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3 text-center text-sm text-muted-foreground">
                    Nenhuma mesa disponível no momento.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableTables.map((table) => (
                      <Button
                        key={table.id}
                        type="button"
                        variant={selectedTableId === table.id ? 'default' : 'outline'}
                        onClick={() => setSelectedTableId(table.id)}
                        className="h-auto min-h-14 flex-col py-2 text-xs"
                      >
                        <span className="text-sm font-bold">Mesa {table.numero}</span>
                        <span className="text-[10px] opacity-80">{table.capacidade} pessoas</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleCheckout}
              disabled={isCreatingOrder}
              className="w-full bg-primary hover:bg-primary/90 py-5 text-base font-semibold hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {isCreatingOrder
                ? 'Finalizando...'
                : `Finalizar Pedido • ${totalWithFee.toFixed(0)} Kz`}
            </Button>
          </DrawerFooter>
        )}
      </DrawerContentRight>
    </Drawer>
  );
}