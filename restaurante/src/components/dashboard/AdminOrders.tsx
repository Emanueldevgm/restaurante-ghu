import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAllOrders } from '@/hooks/use-restaurant';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos baseados no schema do banco
interface OrderItem {
  id: string;
  nome_item: string;
  quantidade: number;
  subtotal_kz: number;
}

interface Order {
  id: string;
  numero_pedido: number;
  usuario_id: string | null;
  cliente_nome: string | null;
  cliente_telefone: string | null;
  tipo: 'delivery' | 'retirada' | 'mesa';
  status:
    | 'carrinho'
    | 'pendente'
    | 'confirmado'
    | 'em_preparo'
    | 'pronto'
    | 'saiu_entrega'
    | 'entregue'
    | 'cancelado';
  total_kz: number;
  created_at: string;
  itens: OrderItem[];
}

interface AdminOrdersProps {
  onViewDetails: (orderId: string) => void;
}

export function AdminOrders({ onViewDetails }: AdminOrdersProps) {
  const { data: orders = [] } = useAllOrders() as { data: Order[] };
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'todos') return true;
    return order.status === statusFilter;
  });

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'entregue':
        return 'secondary';
      case 'cancelado':
        return 'destructive';
      case 'pendente':
      case 'confirmado':
      case 'em_preparo':
        return 'default';
      case 'pronto':
        return 'success';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Pedidos</CardTitle>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="em_preparo">Em Preparo</SelectItem>
            <SelectItem value="pronto">Pronto</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
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
                  <TableCell className="font-medium">
                    #{order.numero_pedido}
                  </TableCell>
                  <TableCell>
                    {order.cliente_nome || 'Cliente não identificado'}
                    {order.cliente_telefone && (
                      <span className="block text-xs text-muted-foreground">
                        {order.cliente_telefone}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{order.tipo}</TableCell>
                  <TableCell>{order.total_kz.toFixed(2)} Kz</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(order.id)}
                    >
                      Detalhes
                    </Button>
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