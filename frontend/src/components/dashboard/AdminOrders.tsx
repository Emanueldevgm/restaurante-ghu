/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllOrders, useUpdateOrderStatus } from '@/hooks/use-restaurant';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Filter } from 'lucide-react';

interface Order {
  id: string; numero_pedido: number; usuario_id: string | null; cliente_nome: string | null;
  cliente_telefone: string | null; tipo: 'delivery' | 'retirada' | 'mesa';
  status: 'carrinho' | 'pendente' | 'confirmado' | 'em_preparo' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado';
  total_kz: number; created_at: string;
}

interface AdminOrdersProps {
  onViewDetails: (orderId: string) => void;
}

export function AdminOrders({ onViewDetails }: AdminOrdersProps) {
  const { data: orders = [] } = useAllOrders() as { data: Order[] };
  const updateOrderStatus = useUpdateOrderStatus();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'todos' && order.status !== statusFilter) return false;
      if (tipoFilter !== 'todos' && order.tipo !== tipoFilter) return false;
      if (dateFilter) {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        if (orderDate !== dateFilter) return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchNumero = order.numero_pedido.toString().includes(term);
        const matchCliente = order.cliente_nome?.toLowerCase().includes(term);
        const matchTelefone = order.cliente_telefone?.includes(term);
        if (!matchNumero && !matchCliente && !matchTelefone) return false;
      }
      return true;
    });
  }, [orders, statusFilter, tipoFilter, dateFilter, searchTerm]);

  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateOrderStatus.mutate({ id, status: newStatus });
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'entregue': return 'secondary';
      case 'cancelado': return 'destructive';
      case 'pendente':
      case 'confirmado':
      case 'em_preparo': return 'default';
      case 'pronto': return 'success';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Pedidos ({filteredOrders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nº, cliente ou telefone..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="em_preparo">Em Preparo</SelectItem>
              <SelectItem value="pronto">Pronto</SelectItem>
              <SelectItem value="saiu_entrega">Saiu Entrega</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="retirada">Retirada</SelectItem>
              <SelectItem value="mesa">Mesa</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="w-40"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.numero_pedido}</TableCell>
                  <TableCell>
                    {order.cliente_nome || 'Não identificado'}
                    {order.cliente_telefone && <span className="block text-xs text-muted-foreground">{order.cliente_telefone}</span>}
                  </TableCell>
                  <TableCell className="capitalize">{order.tipo}</TableCell>
                  <TableCell>{Number(order.total_kz).toFixed(2)} Kz</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(val) => handleStatusUpdate(order.id, val)}>
                      <SelectTrigger className="w-36 h-8">
                        <Badge variant={getStatusBadgeVariant(order.status) as any} className="w-full justify-center">
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="em_preparo">Em Preparo</SelectItem>
                        <SelectItem value="pronto">Pronto</SelectItem>
                        <SelectItem value="saiu_entrega">Saiu Entrega</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onViewDetails(order.id)}>Detalhes</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminOrders;