import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, ChefHat, Clock, CheckCircle, AlertTriangle, Timer, Flame, Users, Home } from 'lucide-react';
import { useAllOrders } from '@/hooks/use-restaurant';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export function CozinhaDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  // Hooks para dados
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();

  if (!user || user.role !== 'kitchen') {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  // Filtrar pedidos para cozinha
  const cozinhaOrders = orders.filter((o: any) => ['confirmado', 'em_preparo', 'pronto'].includes(o.status));
  const pedidosConfirmados = cozinhaOrders.filter((o: any) => o.status === 'confirmado');
  const pedidosEmPreparo = cozinhaOrders.filter((o: any) => o.status === 'em_preparo');
  const pedidosProntos = cozinhaOrders.filter((o: any) => o.status === 'pronto');

  // Calcular tempo médio de preparação (simulado)
  const tempoMedio = pedidosEmPreparo.length > 0 ? '15-20 min' : 'N/A';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display text-xl font-bold">Painel da Cozinha</h1>
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
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span className="hidden sm:inline">Fila</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Status</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Status dos Pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-yellow-500">{pedidosConfirmados.length}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Aguardando início
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Preparo</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-blue-500">{pedidosEmPreparo.length}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Sendo preparados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prontos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-green-500">{pedidosProntos.length}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Aguardando entrega
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Pedidos */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos em Preparo</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : cozinhaOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum pedido em preparo.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cozinhaOrders.slice(0, 10).map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between border-b pb-4"
                      >
                        <div>
                          <p className="font-medium">#{order.numero_pedido}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.tipo === 'mesa' ? `Mesa ${order.mesa_numero}` : 'Delivery'} • {format(new Date(order.created_at), 'HH:mm', { locale: ptBR })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.total_kz?.toFixed(2)} Kz
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              order.status === 'pronto' ? 'default' :
                              order.status === 'em_preparo' ? 'secondary' :
                              'outline'
                            }
                          >
                            {order.status === 'confirmado' ? 'Confirmado' :
                             order.status === 'em_preparo' ? 'Em Preparo' :
                             'Pronto'}
                          </Badge>
                          {order.status === 'confirmado' && (
                            <Button size="sm">
                              Iniciar Preparo
                            </Button>
                          )}
                          {order.status === 'em_preparo' && (
                            <Button size="sm" variant="outline">
                              Finalizar
                            </Button>
                          )}
                          {order.status === 'pronto' && (
                            <Button size="sm" variant="secondary">
                              Entregar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Fila de Preparação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : pedidosConfirmados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>🎉 Fila vazia!</p>
                    <p className="text-sm">Nenhum pedido aguardando preparo.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pedidosConfirmados.map((order: any, index: number) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">#{order.numero_pedido}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.tipo === 'mesa' ? `Mesa ${order.mesa_numero}` : 'Delivery'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.created_at), 'HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Aguardando</Badge>
                          <Button size="sm">
                            Iniciar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tempo Médio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Estatísticas de Preparo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{tempoMedio}</p>
                    <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{pedidosProntos.length}</p>
                    <p className="text-sm text-muted-foreground">Prontos Hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  Status da Cozinha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Status Geral */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Status da Cozinha</p>
                        <p className="text-sm text-muted-foreground">Operacional</p>
                      </div>
                    </div>
                    <Badge variant="default">Ativa</Badge>
                  </div>

                  {/* Capacidade */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Capacidade Atual</span>
                      </div>
                      <p className="text-2xl font-bold">{pedidosEmPreparo.length}/5</p>
                      <p className="text-sm text-muted-foreground">Pedidos simultâneos</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">Próximo Pedido</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {pedidosConfirmados.length > 0 ? '~5 min' : 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">Tempo estimado</p>
                    </div>
                  </div>

                  {/* Alertas */}
                  {pedidosConfirmados.length > 3 && (
                    <div className="flex items-center gap-3 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Fila Crescente</p>
                        <p className="text-sm text-yellow-700">
                          {pedidosConfirmados.length} pedidos aguardando. Considere aumentar equipe.
                        </p>
                      </div>
                    </div>
                  )}

                  {pedidosEmPreparo.length === 0 && pedidosConfirmados.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>🍳 Cozinha em Standby</p>
                      <p className="text-sm">Aguardando novos pedidos.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default CozinhaDashboard;