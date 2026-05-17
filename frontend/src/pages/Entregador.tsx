import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Truck, MapPin, CheckCircle, Clock, AlertTriangle, Navigation, Phone, Home } from 'lucide-react';
import { useAllOrders } from '@/hooks/use-restaurant';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export function EntregadorDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('deliveries');

  // Hooks para dados
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();

  if (!user || user.role !== 'delivery') {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  // Filtrar pedidos para delivery
  const deliveryOrders = orders.filter((o: any) => o.tipo === 'delivery');
  const pedidosPendentes = deliveryOrders.filter((o: any) => o.status === 'pronto');
  const pedidosEmTransito = deliveryOrders.filter((o: any) => o.status === 'em_transito');
  const pedidosEntregues = deliveryOrders.filter((o: any) => o.status === 'entregue');

  // Calcular estatísticas
  const totalHoje = pedidosEntregues.length;
  const tempoMedio = pedidosEmTransito.length > 0 ? '25-35 min' : 'N/A';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display text-xl font-bold">Painel do Entregador</h1>
              <p className="text-sm text-primary-foreground/70">
                Bem-vindo, {user.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Voltar ao Início</span>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="deliveries" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Entregas</span>
            </TabsTrigger>
            <TabsTrigger value="route" className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              <span className="hidden sm:inline">Rota</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
          </TabsList>

          {/* Deliveries Tab */}
          <TabsContent value="deliveries" className="space-y-6">
            {/* Status das Entregas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-yellow-500">{pedidosPendentes.length}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Aguardando coleta
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Trânsito</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-blue-500">{pedidosEmTransito.length}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Sendo entregues
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Entregues</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-green-500">{pedidosEntregues.length}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Concluídas hoje
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Entregas */}
            <Card>
              <CardHeader>
                <CardTitle>Entregas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : [...pedidosPendentes, ...pedidosEmTransito].length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma entrega ativa.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...pedidosPendentes, ...pedidosEmTransito].slice(0, 10).map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between border-b pb-4"
                      >
                        <div>
                          <p className="font-medium">#{order.numero_pedido}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.endereco_entrega || 'Endereço não informado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.total_kz?.toFixed(2)} Kz • {format(new Date(order.created_at), 'HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              order.status === 'pronto' ? 'outline' :
                              order.status === 'em_transito' ? 'secondary' :
                              'default'
                            }
                          >
                            {order.status === 'pronto' ? 'Pronto' :
                             order.status === 'em_transito' ? 'Em Trânsito' :
                             'Entregue'}
                          </Badge>
                          {order.status === 'pronto' && (
                            <Button size="sm">
                              Coletar Pedido
                            </Button>
                          )}
                          {order.status === 'em_transito' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Phone className="w-4 h-4 mr-1" />
                                Ligar
                              </Button>
                              <Button size="sm">
                                Entregar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Route Tab */}
          <TabsContent value="route" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Rota Otimizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : pedidosEmTransito.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>🚗 Nenhuma entrega em andamento.</p>
                    <p className="text-sm">Colete pedidos para iniciar rota.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pedidosEmTransito.map((order: any, index: number) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">#{order.numero_pedido}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.endereco_entrega || 'Endereço não informado'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Distância estimada: ~{Math.floor(Math.random() * 5) + 2}km
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Próxima</Badge>
                          <Button size="sm" variant="outline">
                            <MapPin className="w-4 h-4 mr-1" />
                            GPS
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status da Rota */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Status da Rota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{tempoMedio}</p>
                    <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{totalHoje}</p>
                    <p className="text-sm text-muted-foreground">Entregas Hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Histórico de Entregas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : pedidosEntregues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>📦 Nenhuma entrega concluída hoje.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pedidosEntregues.slice(0, 10).map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
                      >
                        <div>
                          <p className="font-medium">#{order.numero_pedido}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.endereco_entrega || 'Endereço não informado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Entregue às {format(new Date(order.updated_at || order.created_at), 'HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Entregue</Badge>
                          <span className="text-sm font-medium text-green-600">
                            {order.total_kz?.toFixed(2)} Kz
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas de Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {deliveryOrders.length > 0 ? Math.round((pedidosEntregues.length / deliveryOrders.length) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Entregas bem-sucedidas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{tempoMedio}</div>
                  <p className="text-xs text-muted-foreground">
                    Por entrega
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default EntregadorDashboard;