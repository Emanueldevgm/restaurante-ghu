import React, { useState } from 'react';
import { History, LogOut, Clock, CheckCircle2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useMyOrders, useOrderReview } from '@/hooks/useApi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewForm from '@/components/ReviewForm';

interface OrderItem {
  id: string;
  nome_item: string;
  quantidade: number;
  preco_unitario_kz: number;
  subtotal_kz: number;
}

interface Order {
  id: string;
  numero_pedido: number;
  tipo: 'delivery' | 'retirada' | 'mesa';
  status: string;
  total_kz: number;
  created_at: string;
  mesa_numero?: string;
  itens?: OrderItem[];
}

export function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { data: existingReview } = useOrderReview(selectedOrderId || '');

  if (!user || user.role !== 'client') {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'confirmado':
        return <Badge><CheckCircle2 className="w-3 h-3 mr-1" />Confirmado</Badge>;
      case 'em_preparo':
        return <Badge className="bg-warning text-warning-foreground"><Package className="w-3 h-3 mr-1" />Preparando</Badge>;
      case 'pronto':
        return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="w-3 h-3 mr-1" />Pronto</Badge>;
      case 'entregue':
        return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="w-3 h-3 mr-1" />Entregue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" variant="icon" />
            <div>
              <h1 className="font-display text-xl font-bold">Minha Conta</h1>
              <p className="text-sm text-primary-foreground/70">Olá, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              Ver Menu
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleLogout} 
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Meus Pedidos
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Avaliações
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {ordersLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
              </div>
            ) : orders.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
                  <Button className="mt-4" onClick={() => navigate('/#menu')}>Fazer um pedido</Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((order: Order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-display">
                        Pedido #{order.numero_pedido}
                      </CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      {order.mesa_numero && ` • Mesa ${order.mesa_numero}`}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {order.itens?.map((item: OrderItem) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.nome_item}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantidade}x {item.preco_unitario_kz.toFixed(2)} Kz
                            </p>
                          </div>
                          <span className="font-medium">
                            {item.subtotal_kz.toFixed(2)} Kz
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-display font-semibold">Total</span>
                      <span className="text-xl font-bold text-primary">
                        {order.total_kz.toFixed(2)} Kz
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  💡 Deixe uma avaliação para nossos pratos! Suas opiniões nos ajudam a melhorar.
                </p>
              </CardContent>
            </Card>

            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
              </div>
            ) : orders.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">Nenhum pedido para avaliar ainda.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {orders
                  .filter((order: Order) => order.status === 'entregue' || order.status === 'completado')
                  .map((order: Order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Pedido #{order.numero_pedido}
                          </CardTitle>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Completado
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Order Items Summary */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            ITENS PEDIDOS
                          </p>
                          <div className="space-y-1">
                            {order.itens?.slice(0, 3).map((item: OrderItem) => (
                              <p key={item.id} className="text-sm">
                                {item.quantidade}x {item.nome_item}
                              </p>
                            ))}
                            {order.itens && order.itens.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{order.itens.length - 3} mais item(ns)
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Review Form or Already Reviewed */}
                        {existingReview && selectedOrderId === order.id ? (
                          <Card className="border-green-200 bg-green-50">
                            <CardContent className="pt-4">
                              <p className="text-sm text-green-700 font-medium">
                                ✓ Você já avaliou este pedido com {existingReview.rating} estrelas
                              </p>
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                "{existingReview.comment}"
                              </p>
                            </CardContent>
                          </Card>
                        ) : selectedOrderId === order.id ? (
                          <ReviewForm
                            orderId={order.id}
                            onSuccess={() => {
                              setSelectedOrderId(null);
                            }}
                          />
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            Deixar Avaliação
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                {orders.filter((order: Order) => order.status === 'entregue' || order.status === 'completado').length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                      <p className="text-muted-foreground">Nenhum pedido completado para avaliar.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}