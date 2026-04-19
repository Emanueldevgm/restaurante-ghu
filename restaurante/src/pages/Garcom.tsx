/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Utensils, Users, Clock, CheckCircle, AlertTriangle, Table2, UserCheck, Bell, Home } from 'lucide-react';
import { useAllOrders, useAllReservations, useTables, useTableStatus } from '@/hooks/use-restaurant';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export function GarcomDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  // Hooks para dados
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();
  const { data: reservations = [], isLoading: reservationsLoading } = useAllReservations();
  const { data: tables = [], isLoading: tablesLoading } = useTables();
  const { data: tableStatus, isLoading: statusLoading } = useTableStatus();

  if (!user || user.role !== 'waiter') {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  // Filtrar pedidos para mesa (responsabilidade do garçom)
  const mesaOrders = orders.filter((o: any) => o.tipo === 'mesa');
  const novosPedidos = mesaOrders.filter((o: any) => o.status === 'pendente');
  const pedidosEmAndamento = mesaOrders.filter((o: any) => ['confirmado', 'em_preparo'].includes(o.status));
  const pedidosProntos = mesaOrders.filter((o: any) => o.status === 'pronto');

  // Reservas para check-in hoje
  const hoje = new Date().toISOString().split('T')[0];
  const reservasHoje = reservations.filter((r: any) =>
    r.data_reserva === hoje && r.status === 'confirmada'
  );

  // Status das mesas
  const mesasOcupadas = tables.filter((t: any) => t.status === 'occupied').length;
  const mesasDisponiveis = tables.filter((t: any) => t.status === 'available').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display text-xl font-bold">Painel do Garçom</h1>
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
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-2">
              <Table2 className="w-4 h-4" />
              <span className="hidden sm:inline">Mesas</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Reservas</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Status dos Pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Novos Pedidos</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-yellow-500">{novosPedidos.length}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Aguardando confirmação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-blue-500">{pedidosEmAndamento.length}</div>
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
                <CardTitle>Pedidos de Mesa</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : mesaOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum pedido de mesa encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mesaOrders.slice(0, 10).map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between border-b pb-4"
                      >
                        <div>
                          <p className="font-medium">#{order.numero_pedido}</p>
                          <p className="text-sm text-muted-foreground">
                            Mesa {order.mesa_numero} • {format(new Date(order.created_at), 'HH:mm', { locale: ptBR })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.total_kz?.toFixed(2)} Kz
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              order.status === 'pronto' ? 'default' :
                              order.status === 'cancelado' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {order.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                          {order.status === 'pronto' && (
                            <Button size="sm">
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

          {/* Tables Tab */}
          <TabsContent value="tables" className="space-y-6">
            {/* Status das Mesas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mesas Ocupadas</CardTitle>
                  <Users className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  {tablesLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-red-500">{mesasOcupadas}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Clientes atendendo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mesas Disponíveis</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {tablesLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-green-500">{mesasDisponiveis}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Prontas para novos clientes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Mesas */}
            <Card>
              <CardHeader>
                <CardTitle>Status das Mesas</CardTitle>
              </CardHeader>
              <CardContent>
                {tablesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tables.map((table: any) => (
                      <Card key={table.id} className={`border-2 ${
                        table.status === 'occupied' ? 'border-red-200 bg-red-50' :
                        table.status === 'reserved' ? 'border-yellow-200 bg-yellow-50' :
                        'border-green-200 bg-green-50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Mesa {table.numero}</p>
                              <p className="text-sm text-muted-foreground">
                                {table.capacidade} lugares
                              </p>
                            </div>
                            <Badge
                              variant={
                                table.status === 'occupied' ? 'destructive' :
                                table.status === 'reserved' ? 'secondary' :
                                'default'
                              }
                            >
                              {table.status === 'occupied' ? 'Ocupada' :
                               table.status === 'reserved' ? 'Reservada' :
                               'Disponível'}
                            </Badge>
                          </div>
                          <Button
                            className="w-full mt-3"
                            variant={table.status === 'available' ? 'default' : 'outline'}
                            size="sm"
                          >
                            {table.status === 'available' ? 'Atender Mesa' : 'Ver Detalhes'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservas para Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                {reservationsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : reservasHoje.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma reserva confirmada para hoje.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservasHoje.map((reservation: any) => (
                      <div
                        key={reservation.id}
                        className="flex items-center justify-between border-b pb-4"
                      >
                        <div>
                          <p className="font-medium">{reservation.nome_cliente}</p>
                          <p className="text-sm text-muted-foreground">
                            {reservation.quantidade_pessoas} pessoas • {reservation.hora_reserva}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reservation.telefone_cliente}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            Confirmada
                          </Badge>
                          <Button variant="outline" size="sm">
                            Check-in
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações e Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {novosPedidos.length > 0 && (
                    <div className="flex items-center gap-3 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Novos Pedidos</p>
                        <p className="text-sm text-yellow-700">
                          {novosPedidos.length} pedido(s) aguardando confirmação
                        </p>
                      </div>
                    </div>
                  )}

                  {pedidosProntos.length > 0 && (
                    <div className="flex items-center gap-3 p-4 border border-green-200 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Pedidos Prontos</p>
                        <p className="text-sm text-green-700">
                          {pedidosProntos.length} pedido(s) aguardando entrega
                        </p>
                      </div>
                    </div>
                  )}

                  {reservasHoje.length > 0 && (
                    <div className="flex items-center gap-3 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Reservas Hoje</p>
                        <p className="text-sm text-blue-700">
                          {reservasHoje.length} reserva(s) confirmada(s) para hoje
                        </p>
                      </div>
                    </div>
                  )}

                  {novosPedidos.length === 0 && pedidosProntos.length === 0 && reservasHoje.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>🎉 Nenhum alerta pendente!</p>
                      <p className="text-sm">Tudo está em ordem no restaurante.</p>
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

export default GarcomDashboard;