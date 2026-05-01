/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  Table2,
  CalendarDays,
  Users,
  BarChart3,
  Lock,
  Search,
  LogOut,
  Home,
  Plus,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Download,
  Trash,
  TrendingUp,
  PieChart as PieChartIcon,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/Logo';
import { AdminMenu } from '@/components/dashboard/AdminMenu';
import { AdminTables } from '@/components/dashboard/AdminTables';
import { AdminOrders } from '@/components/dashboard/AdminOrders';
import { AdminReservations } from '@/components/dashboard/AdminReservations';
import { OrderDetailsModal } from '@/components/dashboard/modals/OrderDetailsModal';
import { ReservationDetailsModal } from '@/components/dashboard/modals/ReservationDetailsModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessLog } from '@/contexts/AccessLogContext';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  useMenuItems,
  useTables,
  useAllOrders,
  useAllReservations,
  useDailyStats,
  useUsers,
  useCreateUser,
  useMonthlyRevenue,
  useWeeklyRevenue,
  useHourlyOrders,
  useTopProducts,
  useOrderCategories,
  useTableOccupancy,
  usePerformanceMetrics,
  useCustomerSatisfaction,
} from '@/hooks/use-restaurant';
import { toast } from 'sonner';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const { logs, clearLogs } = useAccessLog();
  const navigate = useNavigate();
  const ordersTabRef = useRef<HTMLButtonElement>(null);

  // Dados reais dos hooks
  const { data: menuItems = [] } = useMenuItems({ limit: 100 });
  const { data: tables = [] } = useTables();
  const { data: orders = [] } = useAllOrders();
  const { data: reservations = [] } = useAllReservations();
  const { data: dailyStats } = useDailyStats();
  const { data: users = [] } = useUsers();
  const createUserMutation = useCreateUser();

  // Dados de analytics
  const { data: monthlyRevenue = [] } = useMonthlyRevenue();
  const { data: weeklyRevenue = [] } = useWeeklyRevenue();
  const { data: hourlyOrders = [] } = useHourlyOrders();
  const { data: topProducts = [] } = useTopProducts();
  const { data: orderCategories = [] } = useOrderCategories();
  const { data: tableOccupancy = [] } = useTableOccupancy();
  const { data: performanceMetrics } = usePerformanceMetrics();
  const { data: customerSatisfaction = [] } = useCustomerSatisfaction();

  // Estados da UI
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logFilterAction, setLogFilterAction] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);

  // Estado para o formulário de criação de utilizador
  const [newUser, setNewUser] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    role: 'cliente',
    status: 'ativo',
    senha: '',
  });

  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goToOrdersTab = () => setActiveTab('orders');

  // Estatísticas
  const totalVendasHoje = dailyStats?.faturamento_kz || 0;
  const totalPedidosHoje = dailyStats?.total_pedidos || 0;
  const ticketMedio = dailyStats?.ticket_medio_kz || 0;
  const pedidosPendentes = orders.filter((o: any) => o.status === 'pendente').length;
  const occupiedTables = tables.filter((t: any) => t.status === 'occupied').length;

  // Filtro de logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.userName.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchesAction = logFilterAction === 'all' || log.action === logFilterAction;
    return matchesSearch && matchesAction;
  });

  const handleExportLogs = () => {
    const csvContent = [
      ['ID', 'Usuário', 'Email', 'Ação', 'Página', 'Data/Hora', 'Função'].join(','),
      ...filteredLogs.map((log) =>
        [
          log.id,
          log.userName,
          log.userEmail,
          log.action,
          log.page || '-',
          new Date(log.timestamp).toISOString(),
          log.userRole,
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs exportados!');
  };

  const handleClearLogs = () => {
    if (window.confirm('Limpar todos os logs de acesso?')) {
      clearLogs();
      toast.success('Logs limpos!');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nome_completo || !newUser.telefone || !newUser.senha) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    createUserMutation.mutate(
      {
        nome_completo: newUser.nome_completo,
        email: newUser.email || undefined,
        telefone: newUser.telefone,
        senha: newUser.senha,
        role: newUser.role,
        status: newUser.status,
      },
      {
        onSuccess: () => {
          toast.success('Usuário criado com sucesso!');
          setNewUser({ nome_completo: '', email: '', telefone: '', role: 'cliente', status: 'ativo', senha: '' });
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Erro ao criar usuário');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-4 px-6 sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-full">
              <Logo size="md" variant="icon" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Painel Admin</h1>
              <p className="text-sm opacity-80">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Home className="w-4 h-4 mr-2" /> Início
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-8 gap-1 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" ref={ordersTabRef}>
              <Package className="w-4 h-4 mr-1" /> Pedidos
            </TabsTrigger>
            <TabsTrigger value="menu" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UtensilsCrossed className="w-4 h-4 mr-1" /> Cardápio
            </TabsTrigger>
            <TabsTrigger value="tables" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Table2 className="w-4 h-4 mr-1" /> Mesas
            </TabsTrigger>
            <TabsTrigger value="reservations" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CalendarDays className="w-4 h-4 mr-1" /> Reservas
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-1" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-1" /> Análise
            </TabsTrigger>
            <TabsTrigger value="access" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Lock className="w-4 h-4 mr-1" /> Acessos
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-2">Vendas Hoje</p>
                  <p className="text-3xl font-bold">{totalVendasHoje.toFixed(0)} Kz</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-green-600 font-medium">+12% vs ontem</span>
                    <TrendingUp className="h-3 w-3 text-green-600 ml-1" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-2">Pedidos Hoje</p>
                  <p className="text-3xl font-bold">{totalPedidosHoje}</p>
                  <p className="text-xs mt-2 text-orange-600">{pedidosPendentes} pendentes</p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-2">Ticket Médio</p>
                  <p className="text-3xl font-bold">{ticketMedio.toFixed(0)} Kz</p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-2">Mesas Ocupadas</p>
                  <p className="text-3xl font-bold">{occupiedTables}/{tables.length}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Pedidos da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { day: 'Seg', pedidos: 45 },
                        { day: 'Ter', pedidos: 52 },
                        { day: 'Qua', pedidos: 48 },
                        { day: 'Qui', pedidos: 61 },
                        { day: 'Sex', pedidos: 78 },
                        { day: 'Sáb', pedidos: 92 },
                        { day: 'Dom', pedidos: 68 },
                      ]}
                    >
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="pedidos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Receita Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklyRevenue.length > 0 ? (
                    <ChartContainer config={{}} className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyRevenue}>
                          <XAxis dataKey="day" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Sem dados de receita semanal disponíveis</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Tipos de Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orderCategories.length > 0 ? (
                    <ChartContainer config={{}} className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={orderCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {orderCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill || `hsl(var(--primary))`} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Sem dados de categorias disponíveis</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pedidos Recentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={goToOrdersTab} className="hover:bg-gray-100 transition-colors duration-200">Ver todos</Button>
              </CardHeader>
              <CardContent>
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-gray-50 transition-colors duration-200">
                    <div>
                      <p className="font-medium">#{order.numero_pedido}</p>
                      <p className="text-sm text-gray-500">{order.tipo} · {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={order.status === 'entregue' ? 'secondary' : 'default'} className="hover:shadow-sm transition-shadow duration-200">{order.status}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrderId(order.id)} className="hover:bg-gray-100 transition-colors duration-200">Detalhes</Button>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-center py-6 text-muted-foreground">Nenhum pedido ainda.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <AdminOrders onViewDetails={setSelectedOrderId} />
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu">
            <AdminMenu />
          </TabsContent>

          {/* Tables Tab */}
          <TabsContent value="tables">
            <AdminTables />
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations">
            <AdminReservations onViewDetails={setSelectedReservationId} />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
                <p className="text-muted-foreground">{users.length} usuários cadastrados</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Usuário</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome_completo">Nome Completo *</Label>
                        <Input
                          id="nome_completo"
                          value={newUser.nome_completo}
                          onChange={(e) => setNewUser({ ...newUser, nome_completo: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="telefone">Telefone *</Label>
                        <Input
                          id="telefone"
                          value={newUser.telefone}
                          onChange={(e) => setNewUser({ ...newUser, telefone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Função</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cliente">Cliente</SelectItem>
                            <SelectItem value="garcom">Garçom</SelectItem>
                            <SelectItem value="cozinha">Cozinha</SelectItem>
                            <SelectItem value="entregador">Entregador</SelectItem>
                            <SelectItem value="gerente">Gerente</SelectItem>
                            <SelectItem value="administrador">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={newUser.status}
                          onValueChange={(value) => setNewUser({ ...newUser, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                            <SelectItem value="bloqueado">Bloqueado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="senha">Senha *</Label>
                        <Input
                          id="senha"
                          type="password"
                          value={newUser.senha}
                          onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createUserMutation.isPending}>
                        {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.nome_completo}</TableCell>
                        <TableCell>{u.email || '-'}</TableCell>
                        <TableCell>{u.telefone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.status === 'ativo' ? 'default' : 'destructive'}>
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(u);
                                setShowUserDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        {orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0).toLocaleString()} Kz
                      </p>
                      <p className="text-xs text-green-600 mt-1">Total acumulado</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pedidos Totais</p>
                      <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {orders.filter((o: any) => o.status === 'pendente').length} pendentes
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {orders.length > 0
                          ? Math.round(orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0) / orders.length)
                          : 0} Kz
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Mesas Ocupadas</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {tables.filter((t: any) => t.status === 'occupied').length}/{tables.length}
                      </p>
                    </div>
                    <Table2 className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Receita Mensal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Receita Mensal (Kz)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyRevenue.length > 0 ? (
                    <ChartContainer config={{}} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyRevenue}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum dado de receita mensal disponível</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pedidos por Categoria */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Pedidos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orderCategories.length > 0 ? (
                    <ChartContainer config={{}} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={orderCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {orderCategories.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${(index * 60) % 360}, 70%, 50%)`} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum dado de categorias disponível</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Receita por Dia da Semana */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Receita por Dia da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyRevenue.length > 0 ? (
                  <ChartContainer config={{}} className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyRevenue}>
                        <XAxis dataKey="dia" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum dado de receita semanal disponível</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance por Hora */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Pedidos por Hora do Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hourlyOrders.length > 0 ? (
                    <ChartContainer config={{}} className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={hourlyOrders}>
                          <XAxis dataKey="hora" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="pedidos" fill="hsl(var(--primary))" />
                          <Line type="monotone" dataKey="receita" stroke="hsl(var(--accent))" strokeWidth={2} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum dado de pedidos por hora disponível</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Satisfação dos Clientes */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Satisfação dos Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customerSatisfaction.length > 0 ? (
                    <ChartContainer config={{}} className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={customerSatisfaction}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={90} domain={[0, 5]} />
                          <Radar name="Avaliação" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum dado de satisfação disponível</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Produtos e Ocupação de Mesas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5" />
                    Top 5 Produtos Mais Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topProducts.length > 0 ? (
                    <div className="space-y-4">
                      {topProducts.map((produto: any, index: number) => (
                        <div key={produto.nome} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{produto.nome}</p>
                              <p className="text-sm text-gray-500">{produto.vendas} vendas</p>
                            </div>
                          </div>
                          <p className="font-bold text-green-600">{produto.receita.toLocaleString()} Kz</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum dado de produtos disponível</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Table2 className="h-5 w-5" />
                    Ocupação de Mesas por Hora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tableOccupancy.length > 0 ? (
                    <ChartContainer config={{}} className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={tableOccupancy}>
                          <XAxis dataKey="hora" />
                          <YAxis domain={[0, 100]} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="ocupacao" stroke="hsl(var(--primary))" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Table2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum dado de ocupação disponível</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Comparação de Períodos */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Comparação: Este Mês vs Mês Anterior
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyRevenue.length >= 2 ? (
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        {
                          categoria: 'Receita',
                          atual: monthlyRevenue[monthlyRevenue.length - 1]?.receita || 0,
                          anterior: monthlyRevenue[monthlyRevenue.length - 2]?.receita || 0
                        },
                        {
                          categoria: 'Pedidos',
                          atual: monthlyRevenue[monthlyRevenue.length - 1]?.pedidos || 0,
                          anterior: monthlyRevenue[monthlyRevenue.length - 2]?.pedidos || 0
                        }
                      ]}>
                        <XAxis dataKey="categoria" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="atual" fill="hsl(var(--primary))" name="Este Mês" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="anterior" fill="hsl(var(--muted))" name="Mês Anterior" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Dados insuficientes para comparação mensal</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Métricas de Performance Detalhadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Tempo Médio de Preparo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{performanceMetrics?.avgPrepTime || 0} min</p>
                    <p className="text-sm text-gray-500 mt-1">Meta: 20 min</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((performanceMetrics?.avgPrepTime || 0) / 25 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Taxa de Cancelamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{performanceMetrics?.cancellationRate || 0}%</p>
                    <p className="text-sm text-gray-500 mt-1">Meta: &lt; 5%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min((performanceMetrics?.cancellationRate || 0) / 10 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Eficiência de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{performanceMetrics?.deliveryEfficiency || 0}%</p>
                    <p className="text-sm text-gray-500 mt-1">Meta: &gt; 90%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${performanceMetrics?.deliveryEfficiency || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Access Tab */}
          <TabsContent value="access" className="space-y-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuário ou email..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={logFilterAction} onValueChange={setLogFilterAction}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas ações</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="admin_access">Acesso Admin</SelectItem>
                  <SelectItem value="page_visit">Visita</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportLogs}><Download className="w-4 h-4 mr-2" /> Exportar</Button>
              <Button variant="outline" className="text-destructive" onClick={handleClearLogs}><Trash className="w-4 h-4 mr-2" /> Limpar</Button>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Registro de Acessos ({filteredLogs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Data/Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.userName}</TableCell>
                        <TableCell>{log.userEmail}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.userRole === 'admin' ? 'default' : 'secondary'}>
                            {log.userRole}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">Nenhum registro encontrado.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <OrderDetailsModal
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      />
      <ReservationDetailsModal
        reservationId={selectedReservationId}
        open={!!selectedReservationId}
        onOpenChange={(open) => !open && setSelectedReservationId(null)}
      />
    </div>
  );
}

export default AdminDashboard;