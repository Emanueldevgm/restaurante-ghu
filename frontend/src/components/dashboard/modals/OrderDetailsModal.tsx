import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useApi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
  id: string;
  nome_item: string;
  quantidade: number;
  preco_unitario_kz: number;
  subtotal_kz: number;
  observacoes: string | null;
}

interface Order {
  id: string;
  numero_pedido: number;
  cliente_nome: string | null;
  cliente_telefone: string | null;
  cliente_email: string | null;
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
  subtotal_kz: number;
  desconto_kz: number;
  taxa_entrega_kz: number;
  total_kz: number;
  observacoes: string | null;
  created_at: string;
  itens: OrderItem[];
  endereco_entrega?: {
    rua: string;
    numero: string;
    bairro: string;
    municipio: string;
    provincia: string;
  } | null;
  mesa_numero?: string | null;
}

interface OrderDetailsModalProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsModal({
  orderId,
  open,
  onOpenChange,
}: OrderDetailsModalProps) {
  const { data: order, isLoading, error } = useOrder(orderId) as {
    data: Order | undefined;
    isLoading: boolean;
    error: unknown;
  };
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  const [newStatus, setNewStatus] = useState<string>('');

  const handleStatusUpdate = () => {
    if (!order || !newStatus) return;
    updateStatus(
      { id: order.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success('Status do pedido atualizado!');
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
          toast.error(message);
        },
      }
    );
  };

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido #{order?.numero_pedido}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Erro ao carregar pedido.
          </div>
        ) : order ? (
          <div className="space-y-4">
            {/* Informações gerais */}
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <p className="font-medium">{order.cliente_nome || 'Não identificado'}</p>
                {order.cliente_telefone && (
                  <p className="text-sm">{order.cliente_telefone}</p>
                )}
                {order.cliente_email && (
                  <p className="text-sm text-muted-foreground">{order.cliente_email}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={getStatusBadgeVariant(order.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <p className="capitalize">{order.tipo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data</p>
                <p>
                  {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>

            {/* Endereço (se delivery) */}
            {order.tipo === 'delivery' && order.endereco_entrega && (
              <div>
                <p className="text-sm font-medium mb-1">Endereço de entrega</p>
                <div className="bg-muted/30 p-3 rounded-lg text-sm">
                  <p>
                    {order.endereco_entrega.rua}, {order.endereco_entrega.numero}
                  </p>
                  <p>
                    {order.endereco_entrega.bairro} - {order.endereco_entrega.municipio},{' '}
                    {order.endereco_entrega.provincia}
                  </p>
                </div>
              </div>
            )}

            {/* Mesa (se tipo mesa) */}
            {order.tipo === 'mesa' && order.mesa_numero && (
              <div>
                <p className="text-sm font-medium mb-1">Mesa</p>
                <p className="bg-muted/30 p-3 rounded-lg text-sm">
                  Mesa {order.mesa_numero}
                </p>
              </div>
            )}

            {/* Itens do pedido */}
            <div>
              <p className="text-sm font-medium mb-2">Itens</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3">Item</th>
                      <th className="text-center p-3">Qtd</th>
                      <th className="text-right p-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.itens.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="p-3">
                          <p className="font-medium">{item.nome_item}</p>
                          {item.observacoes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Obs: {item.observacoes}
                            </p>
                          )}
                        </td>
                        <td className="text-center p-3">{item.quantidade}</td>
                        <td className="text-right p-3">
                          {item.subtotal_kz.toFixed(2)} Kz
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totais */}
            <div className="border-t pt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{order.subtotal_kz.toFixed(2)} Kz</span>
              </div>
              {order.desconto_kz > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Desconto</span>
                  <span>-{order.desconto_kz.toFixed(2)} Kz</span>
                </div>
              )}
              {order.taxa_entrega_kz > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>{order.taxa_entrega_kz.toFixed(2)} Kz</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>{order.total_kz.toFixed(2)} Kz</span>
              </div>
            </div>

            {order.observacoes && (
              <div>
                <p className="text-sm font-medium mb-1">Observações</p>
                <p className="text-sm bg-muted/30 p-3 rounded-lg">
                  {order.observacoes}
                </p>
              </div>
            )}

            {/* Atualização de status (apenas admin) */}
            <div className="border-t pt-4 flex items-end gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Atualizar status</p>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione novo status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="em_preparo">Em Preparo</SelectItem>
                    <SelectItem value="pronto">Pronto</SelectItem>
                    <SelectItem value="saiu_entrega">Saiu para Entrega</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleStatusUpdate}
                disabled={!newStatus || isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Pedido não encontrado.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default OrderDetailsModal;