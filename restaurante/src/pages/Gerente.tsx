/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, BarChart3, Settings, ChefHat, Truck, Clock, CheckCircle, AlertTriangle, DollarSign, TrendingUp, Calendar, Home } from 'lucide-react';
import { useAllOrders, useAllReservations, useTables, useUsers } from '@/hooks/use-restaurant';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export function GerenteDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Hooks para dados
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();
  const { data: reservations = [], isLoading: reservationsLoading } = useAllReservations();
  const { data: tables = [], isLoading: tablesLoading } = useTables();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  if (!user || user.role !== 'manager') {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  // Estatísticas calculadas
  const hoje = new Date().toISOString().split('T')[0];
  const pedidosHoje = orders.filter((o: any) => o.created_at?.startsWith(hoje));
  const totalVendasHoje = pedidosHoje.reduce((sum: number, order: any) => sum + (order.total_kz || 0), 0);
  const totalPedidosHoje = pedidosHoje.length;
  const ticketMedio = totalPedidosHoje > 0 ? totalVendasHoje / totalPedidosHoje : 0;

  const pedidosPendentes = orders.filter((o: any) => o.status === 'pendente').length;
  const pedidosEmPreparo = orders.filter((o: any) => o.status === 'em_preparo').length;
  const pedidosProntos = orders.filter((o: any) => o.status === 'pronto').length;

  const reservasPendentes = reservations.filter((r: any) => r.status === 'pendente').length;
  const reservasConfirmadas = reservations.filter((r: any) => r.status === 'confirmada').length;

  const mesasOcupadas = tables.filter((t: any) => t.status === 'occupied').length;
  const mesasDisponiveis = tables.filter((t: any) => t.status === 'available').length;

  const equipeAtiva = users.filter((u: any) => u.status === 'ativo' && u.role !== 'cliente').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display text-xl font-bold">Painel do Gerente</h1>
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
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Reservas</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Equipe</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">{totalVendasHoje.toFixed(2)} Kz</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    +20.1% em relação a ontem
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{totalPedidosHoje}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Ticket médio: {ticketMedio.toFixed(2)} Kz
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mesas Ocupadas</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {tablesLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{mesasOcupadas}/{tables.length}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {mesasDisponiveis} mesas disponíveis
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Equipe Ativa</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{equipeAtiva}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Funcionários em serviço
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status dos Pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    Pedidos Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <div className="text-3xl font-bold text-yellow-500">{pedidosPendentes}</div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Aguardando confirmação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-blue-500" />
                    Em Preparo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <div className="text-3xl font-bold text-blue-500">{pedidosEmPreparo}</div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Sendo preparados na cozinha
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Prontos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <div className="text-3xl font-bold text-green-500">{pedidosProntos}</div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Aguardando entrega/retirada
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Reservas do Dia */}
            <Card>
              <CardHeader>
                <CardTitle>Reservas de Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                {reservationsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Pendentes: </span>
                      <Badge variant="secondary">{reservasPendentes}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Confirmadas: </span>
                      <Badge variant="default">{reservasConfirmadas}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total: </span>
                      <Badge variant="outline">{reservations.length}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum pedido encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 10).map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between border-b pb-4"
                      >
                        <div>
                          <p className="font-medium">#{order.numero_pedido}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.tipo} • {format(new Date(order.created_at), 'HH:mm', { locale: ptBR })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.total_kz?.toFixed(2)} Kz
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              order.status === 'entregue' ? 'secondary' :
                              order.status === 'cancelado' ? 'destructive' :
                              'default'
                            }
                          >
                            {order.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
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
                <CardTitle>Gerenciamento de Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                {reservationsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma reserva encontrada.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations.slice(0, 10).map((reservation: any) => (
                      <div
                        key={reservation.id}
                        className="flex items-center justify-between border-b pb-4"
                      >
                        <div>
                          <p className="font-medium">{reservation.nome_cliente}</p>
                          <p className="text-sm text-muted-foreground">
                            {reservation.quantidade_pessoas} pessoas • {reservation.data_reserva} às {reservation.hora_reserva}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reservation.telefone_cliente}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              reservation.status === 'confirmada' ? 'default' :
                              reservation.status === 'cancelada' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {reservation.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão da Equipe</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : users.filter((u: any) => u.role !== 'cliente').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum funcionário encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.filter((u: any) => u.role !== 'cliente').map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between border-b pb-4"
                      >
                        <div>
                          <p className="font-medium">{user.nome_completo}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.role === 'administrador' ? 'Administrador' :
                             user.role === 'gerente' ? 'Gerente' :
                             user.role === 'garcom' ? 'Garçom' :
                             user.role === 'cozinha' ? 'Cozinheiro' :
                             user.role === 'entregador' ? 'Entregador' : 'Cliente'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.telefone}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              user.status === 'ativo' ? 'default' :
                              user.status === 'inativo' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {user.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Ver Perfil
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default GerenteDashboard;