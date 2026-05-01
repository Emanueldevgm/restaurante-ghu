import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Clock,
  CheckCircle2,
  Package,
  ShoppingBag,
  Star,
  ArrowUpRight,
  Home,
  Sparkles,
} from 'lucide-react';
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
      case 'pendente':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pendente</Badge>;
      case 'confirmado':
        return <Badge><CheckCircle2 className="mr-1 h-3 w-3" />Confirmado</Badge>;
      case 'em_preparo':
        return <Badge className="bg-blue-100 text-blue-800"><Package className="mr-1 h-3 w-3" />Preparando</Badge>;
      case 'pronto':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" />Pronto</Badge>;
      case 'entregue':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" />Entregue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pedidosAtivos = orders.filter((o: Order) => ['pendente', 'confirmado', 'em_preparo'].includes(o.status)).length;
  const ultimoPedido = orders[0]?.numero_pedido || '-';
  const totalGasto = orders
    .filter((o: Order) => o.status === 'entregue')
    .reduce((sum: number, o: Order) => sum + o.total_kz, 0)
    .toFixed(0);

  return (
    <div className="min-h-screen bg-transparent px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <header className="sticky top-4 z-40 mx-auto mb-8 max-w-7xl rounded-[1.75rem] border border-white/70 bg-white/80 px-4 py-4 shadow-elegant backdrop-blur-xl sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-3 shadow-accent">
              <Logo size="md" variant="icon" className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Minha Conta</h1>
              <p className="text-sm text-muted-foreground">Ola, {user.name.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Ver menu
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl">
        <section className="section-shell mb-8 overflow-hidden bg-gradient-to-r from-slate-950 via-blue-900 to-sky-500 px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Painel do cliente
              </div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Acompanhe pedidos, reservas e avaliacoes num so lugar.</h2>
              <p className="mt-3 max-w-xl text-sm text-blue-100/80 sm:text-base">
                Interface mais leve, organizada e pronta para uso em telemovel, tablet e desktop.
              </p>
            </div>
            <Button className="bg-white text-primary hover:bg-blue-50 sm:w-fit" onClick={() => navigate('/menu')}>
              Novo pedido
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="mx-auto grid w-full max-w-xl grid-cols-3 rounded-2xl border border-white/70 bg-white/90 p-1 shadow-sm">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all">
              Visao Geral
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all">
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all">
              Avaliacoes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border border-white/70 bg-white/90 shadow-elegant">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Pedidos ativos</span>
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">{pedidosAtivos}</div>
                  <p className="mt-2 text-xs text-muted-foreground">em andamento</p>
                </CardContent>
              </Card>
              <Card className="border border-white/70 bg-white/90 shadow-elegant">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Ultimo pedido</span>
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">#{ultimoPedido}</div>
                  <p className="mt-2 text-xs text-muted-foreground">{orders.length > 0 ? format(new Date(orders[0].created_at), 'dd/MM') : '-'}</p>
                </CardContent>
              </Card>
              <Card className="border border-white/70 bg-white/90 shadow-elegant">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total gasto</span>
                    <Star className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-3xl font-bold">{totalGasto} Kz</div>
                  <p className="mt-2 text-xs text-muted-foreground">em pedidos finalizados</p>
                </CardContent>
              </Card>
              <Card className="border border-white/70 bg-white/90 shadow-elegant">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Proxima reserva</span>
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-3xl font-bold">1</div>
                  <p className="mt-2 text-xs text-muted-foreground">esta semana</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-white/70 bg-white/90 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg font-display">Pedidos recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  orders.slice(0, 3).map((order: Order) => (
                    <div key={order.id} className="flex items-center justify-between border-b py-3 last:border-0">
                      <div>
                        <p className="font-medium">#{order.numero_pedido}</p>
                        <p className="text-sm text-muted-foreground">{order.tipo} · {format(new Date(order.created_at), 'dd/MM HH:mm')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{order.total_kz.toFixed(0)} Kz</span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))
                )}
                {orders.length === 0 && <p className="py-6 text-center text-muted-foreground">Nenhum pedido ainda.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {ordersLoading ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />) : orders.length === 0 ? (
              <Card className="border-2 border-dashed border-border bg-white/60">
                <CardContent className="pb-12 pt-12 text-center">
                  <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
                  <Button className="mt-4" onClick={() => navigate('/#menu')}>Fazer um pedido</Button>
                </CardContent>
              </Card>
            ) : orders.map((order: Order) => (
              <Card key={order.id} className="border border-white/70 bg-white/90 shadow-elegant transition-shadow hover:shadow-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-display">Pedido #{order.numero_pedido}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'as' HH:mm", { locale: ptBR })}
                    {order.mesa_numero && ` · Mesa ${order.mesa_numero}`}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.itens?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantidade}x {item.nome_item}</span>
                      <span className="font-medium">{item.subtotal_kz.toFixed(2)} Kz</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-3 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{order.total_kz.toFixed(2)} Kz</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardContent className="pt-6">
                <p className="text-sm">Deixe uma avaliacao para os pratos. O seu feedback melhora a experiencia.</p>
              </CardContent>
            </Card>
            {ordersLoading ? [1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />) : orders.filter((o: Order) => o.status === 'entregue').length === 0 ? (
              <Card className="border-2 border-dashed border-border bg-white/60">
                <CardContent className="pb-12 pt-12 text-center">
                  <p className="text-muted-foreground">Nenhum pedido completado para avaliar ainda.</p>
                </CardContent>
              </Card>
            ) : orders.filter((o: Order) => o.status === 'entregue').map((order: Order) => (
              <Card key={order.id} className="border border-white/70 bg-white/90 shadow-elegant">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">Pedido #{order.numero_pedido}</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Completado</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), "dd 'de' MMMM", { locale: ptBR })}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 rounded-2xl bg-secondary p-3">
                    <p className="mb-1 text-xs font-semibold">ITENS PEDIDOS</p>
                    {order.itens?.slice(0, 3).map((item) => (
                      <p key={item.id} className="text-sm">{item.quantidade}x {item.nome_item}</p>
                    ))}
                    {order.itens && order.itens.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{order.itens.length - 3} itens</p>
                    )}
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
