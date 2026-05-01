/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AddressSelector } from '@/components/checkout/AddressSelector';
import { useCreateOrder } from '@/hooks/useApi';
import { useCalculateDeliveryFee } from '@/hooks/useDeliveryFee';
import api from '@/services/api';
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

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, totalPrice, removeItem, updateQuantity, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const [orderType, setOrderType] = useState<'delivery' | 'retirada' | 'mesa'>('retirada');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const { mutate: calculateFee } = useCalculateDeliveryFee();

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
      },
      {
        onSuccess: (response: any) => {
          toast.success(`Pedido #${response.data?.numero_pedido} criado!`);
          clearCart();
          setIsCartOpen(false);
          setSelectedAddressId('');
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
                    src={item.imagem || '/placeholder.svg'}
                    className="h-full w-full object-cover"
                    alt={item.nome}
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
              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  variant={orderType === 'retirada' ? 'default' : 'outline'}
                  onClick={() => setOrderType('retirada')}
                  className="h-auto flex-col py-2 text-xs hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Store className="mb-1 h-4 w-4" />
                  Retirada
                </Button>
                <Button
                  variant={orderType === 'delivery' ? 'default' : 'outline'}
                  onClick={() => setOrderType('delivery')}
                  className="h-auto flex-col py-2 text-xs hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Truck className="mb-1 h-4 w-4" />
                  Delivery
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
