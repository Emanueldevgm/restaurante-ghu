import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AddressSelector } from '@/components/checkout/AddressSelector';
import { useCalculateDeliveryFee } from '@/hooks/useDeliveryFee';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateOrder } from '@/hooks/useApi';
import api from '@/services/api';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const [orderType, setOrderType] = useState<'delivery' | 'retirada' | 'mesa'>('retirada');
  
  // Estados para endereço e taxa de entrega
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [addresses, setAddresses] = useState<any[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  
  const { mutate: calculateFee, isPending: isCalculatingFee } = useCalculateDeliveryFee();

  // Carregar endereços do usuário quando delivery é selecionado
  useEffect(() => {
    if (isAuthenticated && orderType === 'delivery') {
      api.get('/users/addresses')
        .then(res => setAddresses(res.data))
        .catch(() => toast.error('Erro ao carregar endereços'));
    }
  }, [isAuthenticated, orderType]);

  // Calcular taxa quando endereço é selecionado
  useEffect(() => {
    if (orderType === 'delivery' && selectedAddressId) {
      const addr = addresses.find(a => a.id === selectedAddressId);
      if (addr) {
        calculateFee(
          { provincia: addr.provincia, municipio: addr.municipio, bairro: addr.bairro },
          {
            onSuccess: (data) => {
              setDeliveryFee(data.taxa_kz);
              setEstimatedTime(data.tempo_estimado_min);
            },
            onError: () => {
              toast.error('Não foi possível calcular a taxa de entrega');
              setDeliveryFee(null);
              setEstimatedTime(null);
            }
          }
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
      toast.error('Login Necessário - Faça login para finalizar seu pedido.');
      setIsCartOpen(false);
      navigate('/auth');
      return;
    }

    if (orderType === 'delivery' && !selectedAddressId) {
      toast.error('Selecione um endereço de entrega');
      return;
    }

    const orderData = {
      tipo: orderType,
      itens: items.map(item => ({
        item_cardapio_id: item.id,
        quantidade: item.quantity,
        observacoes: '',
      })),
      observacoes: '',
      ...(orderType === 'delivery' && {
        endereco_id: selectedAddressId,
        taxa_entrega_kz: deliveryFee || 0,
      }),
    };

    createOrder(orderData, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSuccess: (response: any) => {
        toast.success(`Pedido Realizado! Seu pedido #${response.data?.numero_pedido} foi enviado para a cozinha.`);
        clearCart();
        setIsCartOpen(false);
        setSelectedAddressId('');
        setDeliveryFee(null);
        setEstimatedTime(null);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao criar pedido');
      },
    });
  };

  return (
    <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Carrinho de Compras</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground">Seu carrinho está vazio</p>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{item.nome}</p>
                  <p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
                </div>
                <p className="font-semibold">R$ {(item.preco_kz * item.quantity).toFixed(2)}</p>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <DrawerFooter className="space-y-4">
            <div className="flex justify-between items-center py-2 border-t font-semibold">
              <span>Total:</span>
              <span>R$ {totalWithFee.toFixed(2)}</span>
            </div>

            {/* Order type selector */}
            <div className="space-y-2">
              <Label>Tipo de pedido</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={orderType === 'retirada' ? 'default' : 'outline'}
                  onClick={() => setOrderType('retirada')}
                  className="flex-1"
                >
                  Retirada
                </Button>
                <Button
                  type="button"
                  variant={orderType === 'delivery' ? 'default' : 'outline'}
                  onClick={() => setOrderType('delivery')}
                  className="flex-1"
                >
                  Delivery
                </Button>
                <Button
                  type="button"
                  variant={orderType === 'mesa' ? 'default' : 'outline'}
                  onClick={() => setOrderType('mesa')}
                  className="flex-1"
                >
                  Mesa
                </Button>
              </div>
            </div>

            {/* Seletor de endereço para delivery */}
            {orderType === 'delivery' && (
              <AddressSelector
                addresses={addresses}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
                isLoading={isCalculatingFee}
              />
            )}

            <Button
              onClick={handleCheckout}
              disabled={isCreatingOrder}
              className="w-full"
              size="lg"
            >
              {isCreatingOrder ? 'Finalizando...' : 'Finalizar Pedido'}
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}