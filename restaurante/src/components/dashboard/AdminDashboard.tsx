/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Table2,
  BarChart3,
  Lock,
  Search,
  LogOut,
  Download,
  Trash,
  Home,
  Package,
  CalendarDays,
  Plus,
  Save,
  X,
  Eye,
  Edit,
  UserCheck,
  UserX,
  MoreHorizontal,
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
  DialogClose,
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
} from '@/hooks/use-restaurant';
import { toast } from 'sonner';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const { logs, clearLogs } = useAccessLog();
  const navigate = useNavigate();
  const ordersTabRef = useRef<HTMLButtonElement>(null);

  // Hooks para dados reais
  const { data: menuItems = [] } = useMenuItems({ limit: 100 });
  const { data: tables = [] } = useTables();
  const { data: orders = [] } = useAllOrders();
  const { data: reservations = [] } = useAllReservations();
  const { data: dailyStats } = useDailyStats();
  const { data: users = [] } = useUsers();
  const createUserMutation = useCreateUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logFilterAction, setLogFilterAction] = useState<string>('all');

  // Estado para modais de detalhes
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] =
    useState<string | null>(null);

  // Estado para controle da tab ativa (para navegação programática)
  const [activeTab, setActiveTab] = useState('overview');

  // Estados para criação de usuário
  const [newUser, setNewUser] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    telefone_alternativo: '',
    senha: '',
    bi: '',
    nif: '',
    role: 'cliente',
    status: 'ativo',
    data_nascimento: '',
    genero: '',
  });

  // Estados para modais de usuário
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goToOrdersTab = () => {
    setActiveTab('orders');
  };

  // Estatísticas reais
  const totalVendasHoje = dailyStats?.faturamento_kz || 0;
  const totalPedidosHoje = dailyStats?.total_pedidos || 0;
  const ticketMedio = dailyStats?.ticket_medio_kz || 0;

  const pedidosPendentes = orders.filter(
    (o: any) => o.status === 'pendente'
  ).length;
  const pedidosEmPreparo = orders.filter(
    (o: any) => o.status === 'em_preparo'
  ).length;

  const occupiedTables = tables.filter(
    (t: any) => t.status === 'occupied'
  ).length;
  const availableTables = tables.filter(
    (t: any) => t.status === 'available'
  ).length;

  // Top itens mais vendidos (mock)
  const topItems = menuItems
    .filter((item: any) => item.destaque)
    .slice(0, 5)
    .map((item: any) => ({
      id: item.id,
      name: item.nome,
      price: item.preco_kz,
      image: item.imagem,
      sales: Math.floor(Math.random() * 50) + 10,
    }));

  // Dados para gráfico de vendas mensais (mock)
  const monthlySalesData = [
    { month: 'Jan', vendas: 12500 },
    { month: 'Fev', vendas: 15200 },
    { month: 'Mar', vendas: 14800 },
    { month: 'Abr', vendas: 18100 },
    { month: 'Mai', vendas: 20500 },
    { month: 'Jun', vendas: 22400 },
  ];

  // ========== LOGS DE ACESSO ==========
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchesAction =
      logFilterAction === 'all' || log.action === logFilterAction;
    return matchesSearch && matchesAction;
  });

  const handleExportLogs = () => {
    const csvContent = [
      ['ID', 'Usuário', 'Email', 'Ação', 'Página', 'Data/Hora', 'Função'].join(
        ','
      ),
      ...filteredLogs.map((log) =>
        [
          log.id,
          log.userName,
          log.userEmail,
          log.action,
          log.page || '-',
          new Date(log.timestamp).toLocaleString('pt-BR'),
          log.userRole,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Logs exportados! Os logs foram baixados com sucesso.');
  };

  const handleClearLogs = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os logs de acesso?')) {
      clearLogs();
      toast.success('Logs limpos! Todos os registros de acesso foram removidos.');
    }
  };

  // ========== FUNÇÕES DE USUÁRIO ==========
  const handleToggleUserStatus = async (user: any) => {
    const newStatus = user.status === 'ativo' ? 'inativo' : 'ativo';
    const action = newStatus === 'ativo' ? 'ativar' : 'desativar';

    if (window.confirm(`Tem certeza que deseja ${action} o usuário ${user.nome_completo}?`)) {
      try {
        const response = await fetch(`/api/auth/users/${user.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error('Erro ao alterar status do usuário');
        }

        toast.success(`Usuário ${action}do com sucesso!`);
        // Recarregar lista de usuários
        window.location.reload();
      } catch (error: any) {
        toast.error(error.message || 'Erro ao alterar status do usuário');
      }
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
              <h1 className="font-display text-xl font-bold">Painel Admin</h1>
              <p className="text-sm text-primary-foreground/70">
                Olá, {user.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Início</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-4xl grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center gap-2"
              ref={ordersTabRef}
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              <span className="hidden sm:inline">Cardápio</span>
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-2">
              <Table2 className="w-4 h-4" />
              <span className="hidden sm:inline">Mesas</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Reservas</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Análise</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Acessos</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Vendas Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalVendasHoje.toFixed(2)} Kz
                  </div>
                  <p className="text-xs text-success">+12% vs ontem</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pedidos Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPedidosHoje}</div>
                  <p className="text-xs text-muted-foreground">
                    {pedidosPendentes} pendentes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ticket Médio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {ticketMedio.toFixed(2)} Kz
                  </div>
                  <p className="text-xs text-muted-foreground">por pedido</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Mesas Ocupadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {occupiedTables}/{tables.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {availableTables} disponíveis
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de pedidos da semana */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[200px]">
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
                      <Bar
                        dataKey="pedidos"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Resumo rápido de pedidos recentes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pedidos Recentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={goToOrdersTab}>
                  Ver todos
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
                  {orders.slice(0, 5).map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">#{order.numero_pedido}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.tipo} •{' '}
                          {format(new Date(order.created_at), 'HH:mm')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            order.status === 'entregue'
                              ? 'secondary'
                              : order.status === 'cancelado'
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {order.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <AdminOrders onViewDetails={setSelectedOrderId} />
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Item ao Cardápio</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" placeholder="Ex: Moqueca de Peixe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoria</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entradas">Entradas</SelectItem>
                            <SelectItem value="principais">Pratos Principais</SelectItem>
                            <SelectItem value="sobremesas">Sobremesas</SelectItem>
                            <SelectItem value="bebidas">Bebidas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        placeholder="Descreva o prato..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preco">Preço (Kz)</Label>
                        <Input id="preco" type="number" min="0" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preco_promo">Preço Promocional (Kz)</Label>
                        <Input
                          id="preco_promo"
                          type="number"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="destaque" />
                        <Label htmlFor="destaque">Destaque</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="prato_do_dia" />
                        <Label htmlFor="prato_do_dia">Prato do Dia</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Item
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <AdminMenu />
          </TabsContent>

          {/* Tables Tab */}
          <TabsContent value="tables" className="space-y-6">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Mesa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Mesa</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input id="numero" placeholder="Ex: 10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacidade">Capacidade</Label>
                      <Input id="capacidade" type="number" min="1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="familia">Família</SelectItem>
                          <SelectItem value="casal">Casal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Mesa
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <AdminTables />
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="space-y-6">
            <AdminReservations onViewDetails={setSelectedReservationId} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas Mensais (Kz)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlySalesData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="vendas"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--accent))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Itens em Destaque</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <img
                        src={item.image || 'https://via.placeholder.com/40'}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.sales} vendas
                        </p>
                      </div>
                      <span className="font-semibold">
                        {item.price.toFixed(2)} Kz
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
                <p className="text-muted-foreground">
                  Gerencie todos os usuários do sistema ({users.length} usuários)
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      createUserMutation.mutate(newUser);
                      setNewUser({
                        nome_completo: '',
                        email: '',
                        telefone: '',
                        telefone_alternativo: '',
                        senha: '',
                        bi: '',
                        nif: '',
                        role: 'cliente',
                        status: 'ativo',
                        data_nascimento: '',
                        genero: '',
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome_completo">Nome Completo *</Label>
                        <Input
                          id="nome_completo"
                          placeholder="João Silva"
                          value={newUser.nome_completo}
                          onChange={(e) => setNewUser({...newUser, nome_completo: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="joao@email.com"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="telefone">Telefone *</Label>
                        <Input
                          id="telefone"
                          placeholder="923456789"
                          value={newUser.telefone}
                          onChange={(e) => setNewUser({...newUser, telefone: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefone_alternativo">Telefone Alternativo</Label>
                        <Input
                          id="telefone_alternativo"
                          placeholder="934567890"
                          value={newUser.telefone_alternativo}
                          onChange={(e) => setNewUser({...newUser, telefone_alternativo: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bi">BI</Label>
                        <Input
                          id="bi"
                          placeholder="123456789LA001"
                          value={newUser.bi}
                          onChange={(e) => setNewUser({...newUser, bi: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="nif">NIF</Label>
                        <Input
                          id="nif"
                          placeholder="123456789"
                          value={newUser.nif}
                          onChange={(e) => setNewUser({...newUser, nif: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="role">Função</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) => setNewUser({...newUser, role: value})}
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
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={newUser.status}
                          onValueChange={(value) => setNewUser({...newUser, status: value})}
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                        <Input
                          id="data_nascimento"
                          type="date"
                          value={newUser.data_nascimento}
                          onChange={(e) => setNewUser({...newUser, data_nascimento: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="genero">Gênero</Label>
                        <Select
                          value={newUser.genero}
                          onValueChange={(value) => setNewUser({...newUser, genero: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="feminino">Feminino</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="senha">Senha *</Label>
                      <Input
                        id="senha"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={newUser.senha}
                        onChange={(e) => setNewUser({...newUser, senha: e.target.value})}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button type="submit" disabled={createUserMutation.isPending}>
                        {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usuários do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum usuário encontrado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Função</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data de Criação</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.nome_completo}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {user.email || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {user.telefone}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.role === 'administrador' ? 'default' :
                                  user.role === 'gerente' ? 'secondary' :
                                  'outline'
                                }
                              >
                                {user.role === 'administrador' ? 'Admin' :
                                 user.role === 'gerente' ? 'Gerente' :
                                 user.role === 'garcom' ? 'Garçom' :
                                 user.role === 'cozinha' ? 'Cozinha' :
                                 user.role === 'entregador' ? 'Entregador' :
                                 'Cliente'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.status === 'ativo' ? 'default' :
                                  user.status === 'inativo' ? 'secondary' :
                                  'destructive'
                                }
                              >
                                {user.status === 'ativo' ? 'Ativo' :
                                 user.status === 'inativo' ? 'Inativo' :
                                 'Bloqueado'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserDetails(true);
                                  }}
                                  className="h-8 w-8 p-0"
                                  title="Ver detalhes"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowEditUser(true);
                                  }}
                                  className="h-8 w-8 p-0"
                                  title="Editar usuário"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleUserStatus(user)}
                                  className={`h-8 w-8 p-0 ${
                                    user.status === 'ativo'
                                      ? 'text-destructive hover:text-destructive'
                                      : 'text-success hover:text-success'
                                  }`}
                                  title={user.status === 'ativo' ? 'Desativar usuário' : 'Ativar usuário'}
                                >
                                  {user.status === 'ativo' ? (
                                    <UserX className="h-4 w-4" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Control Tab (COMPLETA) */}
          <TabsContent value="access" className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por usuário ou email..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={logFilterAction}
                  onValueChange={setLogFilterAction}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="admin_access">Acesso Admin</SelectItem>
                    <SelectItem value="page_visit">Visita de Página</SelectItem>
                    <SelectItem value="order">Pedido</SelectItem>
                    <SelectItem value="reservation">Reserva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleExportLogs}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
                <Button
                  onClick={handleClearLogs}
                  variant="outline"
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <Trash className="w-4 h-4" />
                  Limpar Logs
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Registro de Acessos ({filteredLogs.length})</CardTitle>
                  <Badge variant="secondary">Total: {logs.length} acessos</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum acesso registrado para os filtros selecionados.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Ação</TableHead>
                          <TableHead>Função</TableHead>
                          <TableHead>Página</TableHead>
                          <TableHead>Data/Hora</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">
                              {log.userName}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {log.userEmail}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  log.action === 'login'
                                    ? 'bg-success/10 text-success border-success/30'
                                    : log.action === 'logout'
                                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                                    : log.action === 'admin_access'
                                    ? 'bg-accent/10 text-accent border-accent/30'
                                    : 'bg-muted/50'
                                }
                              >
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  log.userRole === 'admin' ? 'default' : 'secondary'
                                }
                              >
                                {log.userRole === 'admin' ? 'Admin' : 'Cliente'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {log.page || '-'}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modais de Detalhes */}
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

      {/* Modal de Detalhes do Usuário */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome Completo</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.nome_completo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.email || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.telefone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone Alternativo</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.telefone_alternativo || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">BI</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.bi || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">NIF</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.nif || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Função</Label>
                  <Badge
                    variant={
                      selectedUser.role === 'administrador' ? 'default' :
                      selectedUser.role === 'gerente' ? 'secondary' :
                      'outline'
                    }
                  >
                    {selectedUser.role === 'administrador' ? 'Administrador' :
                     selectedUser.role === 'gerente' ? 'Gerente' :
                     selectedUser.role === 'garcom' ? 'Garçom' :
                     selectedUser.role === 'cozinha' ? 'Cozinheiro' :
                     selectedUser.role === 'entregador' ? 'Entregador' :
                     'Cliente'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={
                      selectedUser.status === 'ativo' ? 'default' :
                      selectedUser.status === 'inativo' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {selectedUser.status === 'ativo' ? 'Ativo' :
                     selectedUser.status === 'inativo' ? 'Inativo' :
                     'Bloqueado'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Data de Nascimento</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.data_nascimento ? new Date(selectedUser.data_nascimento).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gênero</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.genero === 'masculino' ? 'Masculino' :
                     selectedUser.genero === 'feminino' ? 'Feminino' :
                     selectedUser.genero === 'outro' ? 'Outro' : '-'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Data de Criação</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Último Acesso</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.ultimo_acesso ? new Date(selectedUser.ultimo_acesso).toLocaleString('pt-BR') : 'Nunca'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição do Usuário */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Implementar edição de usuário
                toast.info('Funcionalidade de edição será implementada em breve');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nome_completo">Nome Completo *</Label>
                  <Input
                    id="edit-nome_completo"
                    defaultValue={selectedUser.nome_completo}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    defaultValue={selectedUser.email || ''}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-telefone">Telefone *</Label>
                  <Input
                    id="edit-telefone"
                    defaultValue={selectedUser.telefone}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-telefone_alternativo">Telefone Alternativo</Label>
                  <Input
                    id="edit-telefone_alternativo"
                    defaultValue={selectedUser.telefone_alternativo || ''}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Função</Label>
                  <Select defaultValue={selectedUser.role}>
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
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select defaultValue={selectedUser.status}>
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
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}