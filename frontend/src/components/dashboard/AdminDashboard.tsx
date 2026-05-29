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
  Save,
  X,
  Loader,
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
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  useUpdateUser,
  useDeleteUser,
  useUpdateUserStatus,
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import type {
  HourlyOrderData,
  DailyRevenueData,
  MonthlyRevenueData,
  TableOccupancyData,
  CustomerSatisfactionData,
  OrderCategoryData,
} from '@/types/charts';

interface UserData {
  id: string;
  nome_completo: string;
  email: string | null;
  telefone: string;
  telefone_alternativo?: string | null;
  bi?: string | null;
  nif?: string | null;
  role: string;
  status: string;
  foto_perfil?: string | null;
  data_nascimento?: string | null;
  genero?: string | null;
  created_at?: string;
  ultimo_acesso?: string | null;
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const { logs, clearLogs } = useAccessLog();
  const navigate = useNavigate();
  const ordersTabRef = useRef<HTMLButtonElement>(null);

  const { data: menuItems = [] } = useMenuItems({ limit: 100 });
  const { data: tables = [] } = useTables();
  const { data: orders = [] } = useAllOrders();
  const { data: reservations = [] } = useAllReservations();
  const { data: dailyStats } = useDailyStats();
  const { data: users = [], refetch: refetchUsers } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const updateUserStatusMutation = useUpdateUserStatus();

  const { data: monthlyRevenue = [] } = useMonthlyRevenue() as { data: MonthlyRevenueData[] };
  const { data: weeklyRevenue = [] } = useWeeklyRevenue() as { data: DailyRevenueData[] };
  const { data: hourlyOrders = [] } = useHourlyOrders() as { data: HourlyOrderData[] };
  const { data: topProducts = [] } = useTopProducts();
  const { data: orderCategories = [] } = useOrderCategories() as { data: OrderCategoryData[] };
  const { data: tableOccupancy = [] } = useTableOccupancy() as { data: TableOccupancyData[] };
  const { data: performanceMetrics } = usePerformanceMetrics();
  const { data: customerSatisfaction = [] } = useCustomerSatisfaction() as { data: CustomerSatisfactionData[] };

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logFilterAction, setLogFilterAction] = useState<string>('all');

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [editUserForm, setEditUserForm] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    role: '',
    status: '',
    data_nascimento: '',
    genero: '',
  });

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

  // 🔧 CORREÇÃO: Garantir que os valores sejam números antes de usar .toFixed()
  const totalVendasHoje = Number(dailyStats?.faturamento_kz) || 0;
  const totalPedidosHoje = Number(dailyStats?.total_pedidos) || 0;
  const ticketMedio = Number(dailyStats?.ticket_medio_kz) || 0;
  const pedidosPendentes = orders.filter((o: any) => o.status === 'pendente').length;
  const occupiedTables = tables.filter((t: any) => t.status === 'occupied').length;

  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch = log.userName?.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchesAction = logFilterAction === 'all' || log.action === logFilterAction;
    return matchesSearch && matchesAction;
  });

  const filteredUsers = users.filter((u: UserData) => {
    if (!userSearchTerm) return true;
    const term = userSearchTerm.toLowerCase();
    return (
      u.nome_completo?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.telefone?.includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  const handleExportLogs = () => {
    const csvContent = [
      ['ID', 'Usuário', 'Email', 'Ação', 'Página', 'Data/Hora', 'Função'].join(','),
      ...filteredLogs.map((log: any) =>
        [log.id, log.userName, log.userEmail, log.action, log.page || '-', new Date(log.timestamp).toISOString(), log.userRole].join(',')
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
          refetchUsers();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Erro ao criar usuário');
        },
      }
    );
  };

  const handleViewUser = (u: UserData) => {
    setSelectedUser(u);
    setShowUserDetails(true);
  };

  const handleEditUser = (u: UserData) => {
    setSelectedUser(u);
    setEditUserForm({
      nome_completo: u.nome_completo || '',
      email: u.email || '',
      telefone: u.telefone || '',
      role: u.role || 'cliente',
      status: u.status || 'ativo',
      data_nascimento: u.data_nascimento || '',
      genero: u.genero || '',
    });
    setShowEditUser(true);
  };

  const handleSaveEditUser = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate(
      {
        id: selectedUser.id,
        data: {
          nome_completo: editUserForm.nome_completo,
          email: editUserForm.email || null,
          telefone: editUserForm.telefone,
          role: editUserForm.role,
          status: editUserForm.status,
          data_nascimento: editUserForm.data_nascimento || null,
          genero: editUserForm.genero || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Usuário atualizado com sucesso!');
          setShowEditUser(false);
          refetchUsers();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Erro ao atualizar usuário');
        },
      }
    );
  };

  const handleDeleteUser = (userId: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar este usuário? Esta ação não pode ser desfeita.')) return;
    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        toast.success('Usuário eliminado com sucesso!');
        refetchUsers();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao eliminar usuário');
      },
    });
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativo' ? 'bloqueado' : 'ativo';
    updateUserStatusMutation.mutate(
      { id: userId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Usuário ${newStatus === 'ativo' ? 'ativado' : 'bloqueado'}!`);
          refetchUsers();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Erro ao alterar status');
        },
      }
    );
  };

  const orderTotal = (order: any): number => order.total_kz || order.total || 0;

  return (
    <div className="min-h-screen bg-background">
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
            <Button variant="ghost" onClick={() => navigate('/')} className="text-primary-foreground hover:bg-primary-foreground/10">
              <Home className="w-4 h-4 mr-2" /> Início
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10">
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

          {/* ============ OVERVIEW TAB ============ */}
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
                  <BarChart3 className="h-5 w-5" /> Pedidos da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { day: 'Seg', pedidos: 45 }, { day: 'Ter', pedidos: 52 }, { day: 'Qua', pedidos: 48 },
                      { day: 'Qui', pedidos: 61 }, { day: 'Sex', pedidos: 78 }, { day: 'Sáb', pedidos: 92 }, { day: 'Dom', pedidos: 68 },
                    ]}>
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
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5" /> Receita Semanal</CardTitle></CardHeader>
                <CardContent>
                  {weeklyRevenue.length > 0 ? (
                    <ChartContainer config={{}} className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyRevenue}>
                          <XAxis dataKey="day" /><YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Sem dados de receita semanal disponíveis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><PieChartIcon className="h-5 w-5" /> Tipos de Pedido</CardTitle></CardHeader>
                <CardContent>
                  {orderCategories.length > 0 ? (
                    <ChartContainer config={{}} className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={orderCategories} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                            {orderCategories.map((_entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${(index * 60) % 360}, 70%, 50%)`} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                      <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Sem dados de categorias disponíveis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pedidos Recentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={goToOrdersTab}>Ver todos</Button>
              </CardHeader>
              <CardContent>
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">#{order.numero_pedido}</p>
                      <p className="text-sm text-gray-500">{order.tipo} · {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={order.status === 'entregue' ? 'secondary' : 'default'}>{order.status}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrderId(order.id)}>Detalhes</Button>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-center py-6 text-muted-foreground">Nenhum pedido ainda.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ ORDERS TAB ============ */}
          <TabsContent value="orders">
            <AdminOrders onViewDetails={setSelectedOrderId} />
          </TabsContent>

          {/* ============ MENU TAB ============ */}
          <TabsContent value="menu">
            <AdminMenu />
          </TabsContent>

          {/* ============ TABLES TAB ============ */}
          <TabsContent value="tables">
            <AdminTables />
          </TabsContent>

          {/* ============ RESERVATIONS TAB ============ */}
          <TabsContent value="reservations">
            <AdminReservations onViewDetails={setSelectedReservationId} />
          </TabsContent>

          {/* ============ USERS TAB - TOTALMENTE FUNCIONAL ============ */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
                <p className="text-muted-foreground">{users.length} usuários cadastrados</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar usuário..." className="pl-10 w-64" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Usuário</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Criar Novo Usuário</DialogTitle><DialogDescription>Preencha os dados do novo usuário</DialogDescription></DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="nome_completo">Nome Completo *</Label><Input id="nome_completo" value={newUser.nome_completo} onChange={(e) => setNewUser({ ...newUser, nome_completo: e.target.value })} required /></div>
                        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="telefone">Telefone *</Label><Input id="telefone" value={newUser.telefone} onChange={(e) => setNewUser({ ...newUser, telefone: e.target.value })} required /></div>
                        <div><Label htmlFor="role">Função</Label>
                          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cliente">Cliente</SelectItem><SelectItem value="garcom">Garçom</SelectItem>
                              <SelectItem value="cozinha">Cozinha</SelectItem><SelectItem value="entregador">Entregador</SelectItem>
                              <SelectItem value="gerente">Gerente</SelectItem><SelectItem value="administrador">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="status">Status</Label>
                          <Select value={newUser.status} onValueChange={(value) => setNewUser({ ...newUser, status: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem><SelectItem value="bloqueado">Bloqueado</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div><Label htmlFor="senha">Senha *</Label><Input id="senha" type="password" value={newUser.senha} onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })} required /></div>
                      </div>
                      <DialogFooter><Button type="submit" disabled={createUserMutation.isPending}>{createUserMutation.isPending ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}Criar Usuário</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Telefone</TableHead><TableHead>Função</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado.</TableCell></TableRow>
                    ) : (
                      filteredUsers.map((u: UserData) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.nome_completo}</TableCell>
                          <TableCell>{u.email || '-'}</TableCell>
                          <TableCell>{u.telefone}</TableCell>
                          <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                          <TableCell><Badge variant={u.status === 'ativo' ? 'default' : u.status === 'bloqueado' ? 'destructive' : 'secondary'}>{u.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleViewUser(u)} title="Ver detalhes"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditUser(u)} title="Editar"><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleToggleUserStatus(u.id, u.status)} title={u.status === 'ativo' ? 'Bloquear' : 'Ativar'}>
                                {u.status === 'ativo' ? <UserX className="h-4 w-4 text-yellow-600" /> : <UserCheck className="h-4 w-4 text-green-600" />}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} title="Eliminar" className="text-destructive"><Trash className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Modal VER DETALHES */}
            <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
              <DialogContent>
                <DialogHeader><DialogTitle>Detalhes do Usuário</DialogTitle></DialogHeader>
                {selectedUser && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>Nome</Label><p className="font-medium">{selectedUser.nome_completo}</p></div>
                      <div><Label>Email</Label><p>{selectedUser.email || '-'}</p></div>
                      <div><Label>Telefone</Label><p>{selectedUser.telefone}</p></div>
                      <div><Label>Telefone Alt.</Label><p>{selectedUser.telefone_alternativo || '-'}</p></div>
                      <div><Label>BI</Label><p>{selectedUser.bi || '-'}</p></div>
                      <div><Label>NIF</Label><p>{selectedUser.nif || '-'}</p></div>
                      <div><Label>Função</Label><Badge variant="outline">{selectedUser.role}</Badge></div>
                      <div><Label>Status</Label><Badge variant={selectedUser.status === 'ativo' ? 'default' : 'destructive'}>{selectedUser.status}</Badge></div>
                      <div><Label>Data Nasc.</Label><p>{selectedUser.data_nascimento || '-'}</p></div>
                      <div><Label>Género</Label><p>{selectedUser.genero || '-'}</p></div>
                      <div><Label>Criado em</Label><p>{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString('pt-BR') : '-'}</p></div>
                      <div><Label>Último Acesso</Label><p>{selectedUser.ultimo_acesso ? new Date(selectedUser.ultimo_acesso).toLocaleString('pt-BR') : '-'}</p></div>
                    </div>
                  </div>
                )}
                <DialogFooter><Button variant="outline" onClick={() => setShowUserDetails(false)}>Fechar</Button></DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal EDITAR */}
            <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Editar Usuário</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2"><Label>Nome Completo</Label><Input value={editUserForm.nome_completo} onChange={(e) => setEditUserForm({ ...editUserForm, nome_completo: e.target.value })} /></div>
                  <div><Label>Email</Label><Input type="email" value={editUserForm.email} onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })} /></div>
                  <div><Label>Telefone</Label><Input value={editUserForm.telefone} onChange={(e) => setEditUserForm({ ...editUserForm, telefone: e.target.value })} /></div>
                  <div><Label>Função</Label>
                    <Select value={editUserForm.role} onValueChange={(value) => setEditUserForm({ ...editUserForm, role: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="cliente">Cliente</SelectItem><SelectItem value="garcom">Garçom</SelectItem><SelectItem value="cozinha">Cozinha</SelectItem><SelectItem value="entregador">Entregador</SelectItem><SelectItem value="gerente">Gerente</SelectItem><SelectItem value="administrador">Administrador</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Status</Label>
                    <Select value={editUserForm.status} onValueChange={(value) => setEditUserForm({ ...editUserForm, status: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem><SelectItem value="bloqueado">Bloqueado</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Data Nascimento</Label><Input type="date" value={editUserForm.data_nascimento} onChange={(e) => setEditUserForm({ ...editUserForm, data_nascimento: e.target.value })} /></div>
                  <div><Label>Género</Label>
                    <Select value={editUserForm.genero} onValueChange={(value) => setEditUserForm({ ...editUserForm, genero: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="masculino">Masculino</SelectItem><SelectItem value="feminino">Feminino</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditUser(false)}><X className="w-4 h-4 mr-2" /> Cancelar</Button>
                  <Button onClick={handleSaveEditUser} disabled={updateUserMutation.isPending}><Save className="w-4 h-4 mr-2" />{updateUserMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ============ ANALYTICS TAB ============ */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 mb-1">Receita Total</p><p className="text-2xl font-bold text-green-600">{orders.reduce((sum: number, order: any) => sum + orderTotal(order), 0).toLocaleString()} Kz</p></div><DollarSign className="h-8 w-8 text-green-600" /></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 mb-1">Pedidos Totais</p><p className="text-2xl font-bold text-blue-600">{orders.length}</p></div><Package className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 mb-1">Ticket Médio</p><p className="text-2xl font-bold text-purple-600">{orders.length > 0 ? Math.round(orders.reduce((sum: number, order: any) => sum + orderTotal(order), 0) / orders.length) : 0} Kz</p></div><TrendingUp className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 mb-1">Mesas Ocupadas</p><p className="text-2xl font-bold text-orange-600">{tables.filter((t: any) => t.status === 'occupied').length}/{tables.length}</p></div><Table2 className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Receita Mensal (Kz)</CardTitle></CardHeader><CardContent>{monthlyRevenue.length > 0 ? <ChartContainer config={{}} className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyRevenue}><XAxis dataKey="month" /><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></ChartContainer> : <div className="h-[300px] flex items-center justify-center text-gray-500"><BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum dado disponível</p></div>}</CardContent></Card>
              <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><PieChartIcon className="h-5 w-5" /> Pedidos por Categoria</CardTitle></CardHeader><CardContent>{orderCategories.length > 0 ? <ChartContainer config={{}} className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={orderCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>{orderCategories.map((_entry: any, index: number) => (<Cell key={`cell-${index}`} fill={`hsl(${(index * 60) % 360}, 70%, 50%)`} />))}</Pie><ChartTooltip content={<ChartTooltipContent />} /></PieChart></ResponsiveContainer></ChartContainer> : <div className="h-[300px] flex items-center justify-center text-gray-500"><PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum dado disponível</p></div>}</CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Receita por Dia da Semana</CardTitle></CardHeader><CardContent>{weeklyRevenue.length > 0 ? <ChartContainer config={{}} className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weeklyRevenue}><XAxis dataKey="dia" /><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} /></AreaChart></ResponsiveContainer></ChartContainer> : <div className="h-[250px] flex items-center justify-center text-gray-500"><TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum dado disponível</p></div>}</CardContent></Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Pedidos por Hora</CardTitle></CardHeader><CardContent>{hourlyOrders.length > 0 ? <ChartContainer config={{}} className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={hourlyOrders}><XAxis dataKey="hora" /><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="pedidos" fill="hsl(var(--primary))" /><Line type="monotone" dataKey="receita" stroke="hsl(var(--accent))" strokeWidth={2} /></ComposedChart></ResponsiveContainer></ChartContainer> : <div className="h-[250px] flex items-center justify-center text-gray-500"><BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum dado disponível</p></div>}</CardContent></Card>
              <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Satisfação dos Clientes</CardTitle></CardHeader><CardContent>{customerSatisfaction.length > 0 ? <ChartContainer config={{}} className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={customerSatisfaction}><PolarGrid /><PolarAngleAxis dataKey="subject" /><PolarRadiusAxis angle={90} domain={[0, 5]} /><Radar name="Avaliação" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} /></RadarChart></ResponsiveContainer></ChartContainer> : <div className="h-[250px] flex items-center justify-center text-gray-500"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum dado disponível</p></div>}</CardContent></Card>
            </div>
          </TabsContent>

          {/* ============ ACCESS TAB ============ */}
          <TabsContent value="access" className="space-y-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar usuário ou email..." value={logSearchQuery} onChange={(e) => setLogSearchQuery(e.target.value)} className="pl-10" /></div>
              <Select value={logFilterAction} onValueChange={setLogFilterAction}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas ações</SelectItem><SelectItem value="login">Login</SelectItem><SelectItem value="logout">Logout</SelectItem><SelectItem value="admin_access">Acesso Admin</SelectItem><SelectItem value="page_visit">Visita</SelectItem></SelectContent></Select>
              <Button variant="outline" onClick={handleExportLogs}><Download className="w-4 h-4 mr-2" /> Exportar</Button>
              <Button variant="outline" className="text-destructive" onClick={handleClearLogs}><Trash className="w-4 h-4 mr-2" /> Limpar</Button>
            </div>
            <Card className="border-0 shadow-lg">
              <CardHeader><CardTitle>Registro de Acessos ({filteredLogs.length})</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Email</TableHead><TableHead>Ação</TableHead><TableHead>Função</TableHead><TableHead>Data/Hora</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.userName}</TableCell><TableCell>{log.userEmail}</TableCell>
                        <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                        <TableCell><Badge variant={log.userRole === 'admin' ? 'default' : 'secondary'}>{log.userRole}</Badge></TableCell>
                        <TableCell className="whitespace-nowrap">{new Date(log.timestamp).toLocaleString('pt-BR')}</TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-6">Nenhum registro encontrado.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <OrderDetailsModal orderId={selectedOrderId} open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)} />
      <ReservationDetailsModal reservationId={selectedReservationId} open={!!selectedReservationId} onOpenChange={(open) => !open && setSelectedReservationId(null)} />
    </div>
  );
}

export default AdminDashboard;