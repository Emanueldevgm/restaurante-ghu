import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { History, LogOut, Clock, CheckCircle2, Package, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useMyOrders } from '@/hooks/useApi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewForm from '@/components/ReviewForm';

interface Order {
  id: string;
  numero_pedido: number;
  tipo: 'delivery' | 'retirada' | 'mesa';
  status: string;
  total_kz: number;
  created_at: string;
  mesa_numero?: string;
  itens?: Array<{
    id: string;
    nome_item: string;
    quantidade: number;
    preco_unitario_kz: number;
    subtotal_kz: number;
  }>;
}

export function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || user.role !== 'client') {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'confirmado': return <Badge><CheckCircle2 className="w-3 h-3 mr-1" />Confirmado</Badge>;
      case 'em_preparo': return <Badge className="bg-warning text-warning-foreground"><Package className="w-3 h-3 mr-1" />Preparando</Badge>;
      case 'pronto': return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="w-3 h-3 mr-1" />Pronto</Badge>;
      case 'entregue': return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="w-3 h-3 mr-1" />Entregue</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const pedidosAtivos = orders.filter((o: Order) => ['pendente','confirmado','em_preparo'].includes(o.status)).length;
  const ultimoPedido = orders[0]?.numero_pedido || '-';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-4 px-6 sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-full">
              <Logo size="md" variant="icon" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Minha Conta</h1>
              <p className="text-sm text-primary-foreground/70">Olá, {user.name.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-primary-foreground hover:bg-primary-foreground/10">
              Ver Menu
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50 p-1 rounded-xl mx-auto">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all">
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all">
              Avaliações
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-primary/10 to-transparent border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Pedidos ativos</span>
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">{pedidosAtivos}</div>
                  <p className="text-xs text-muted-foreground mt-2">em andamento</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/10 to-transparent border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Último pedido</span>
                    <ShoppingBag className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold">#{ultimoPedido}</div>
                  <p className="text-xs text-muted-foreground mt-2">{orders.length > 0 ? format(new Date(orders[0].created_at), "dd/MM") : '—'}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-success/10 to-transparent border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Total gasto</span>
                    <Star className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-3xl font-bold">{orders.filter((o:Order) => o.status === 'entregue').reduce((sum:number, o:Order) => sum + o.total_kz, 0).toFixed(0)} Kz</div>
                  <p className="text-xs text-muted-foreground mt-2">em pedidos finalizados</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-warning/10 to-transparent border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Próxima reserva</span>
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-3xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground mt-2">esta semana</p>
                </CardContent>
              </Card>
            </div>
            <Card className="border-0 shadow-lg">
              <CardHeader><CardTitle className="text-lg font-display">Pedidos recentes</CardTitle></CardHeader>
              <CardContent>
                {ordersLoading ? <Skeleton className="h-24 w-full" /> : orders.slice(0,3).map((order:Order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">#{order.numero_pedido}</p>
                      <p className="text-sm text-muted-foreground">{order.tipo} · {format(new Date(order.created_at), "dd/MM HH:mm")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{order.total_kz.toFixed(0)} Kz</span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-center py-6 text-muted-foreground">Nenhum pedido ainda.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pedidos */}
          <TabsContent value="orders" className="space-y-4">
            {ordersLoading ? [1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />) : orders.length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
                  <Button className="mt-4" onClick={() => navigate('/#menu')}>Fazer um pedido</Button>
                </CardContent>
              </Card>
            ) : orders.map((order: Order) => (
              <Card key={order.id} className="border-0 shadow-md hover:shadow-xl transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-display">Pedido #{order.numero_pedido}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    {order.mesa_numero && ` • Mesa ${order.mesa_numero}`}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.itens?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantidade}x {item.nome_item}</span>
                      <span className="font-medium">{item.subtotal_kz.toFixed(2)} Kz</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{order.total_kz.toFixed(2)} Kz</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Avaliações */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardContent className="pt-6">
                <p className="text-sm">💡 Deixe uma avaliação para nossos pratos! Suas opiniões nos ajudam a melhorar.</p>
              </CardContent>
            </Card>
            {ordersLoading ? [1,2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />) : orders.filter((o:Order) => o.status === 'entregue').length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">Nenhum pedido completado para avaliar ainda.</p>
                </CardContent>
              </Card>
            ) : orders.filter((o:Order) => o.status === 'entregue').map((order: Order) => (
              <Card key={order.id} className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">Pedido #{order.numero_pedido}</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Completado</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), "dd 'de' MMMM", { locale: ptBR })}</p>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-xs font-semibold mb-1">ITENS PEDIDOS</p>
                    {order.itens?.slice(0,3).map(item => (
                      <p key={item.id} className="text-sm">{item.quantidade}x {item.nome_item}</p>
                    ))}
                    {order.itens && order.itens.length > 3 && <p className="text-xs text-muted-foreground">+{order.itens.length-3} itens</p>}
                  </div>
                  <ReviewForm orderId={order.id} onSuccess={() => {}} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}