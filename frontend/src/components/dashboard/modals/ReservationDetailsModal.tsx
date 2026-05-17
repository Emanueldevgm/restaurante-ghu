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
import { useReservation, useUpdateReservationStatus } from '@/hooks/useApi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Reservation {
  id: string;
  usuario_id: string | null;
  nome_cliente: string;
  telefone_cliente: string;
  email_cliente: string | null;
  data_reserva: string;
  hora_reserva: string;
  quantidade_pessoas: number;
  status:
    | 'pendente'
    | 'confirmada'
    | 'em_andamento'
    | 'finalizada'
    | 'cancelada'
    | 'nao_compareceu';
  mesa_id: string | null;
  mesa_numero: string | null;
  mesa_capacidade: number | null;
  observacoes: string | null;
  created_at: string;
  confirmada_em: string | null;
  check_in_em: string | null;
  check_out_em: string | null;
}

interface ReservationDetailsModalProps {
  reservationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReservationDetailsModal({
  reservationId,
  open,
  onOpenChange,
}: ReservationDetailsModalProps) {
  const { data: reservation, isLoading, error } = useReservation(reservationId) as {
    data: Reservation | undefined;
    isLoading: boolean;
    error: unknown;
  };
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateReservationStatus();
  const [newStatus, setNewStatus] = useState<string>('');

  const handleStatusUpdate = () => {
    if (!reservation || !newStatus) return;
    updateStatus(
      { id: reservation.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success('Status da reserva atualizado!');
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
          toast.error(message);
        },
      }
    );
  };

  const getStatusBadgeVariant = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmada':
        return 'default';
      case 'pendente':
        return 'secondary';
      case 'em_andamento':
        return 'success';
      case 'finalizada':
        return 'outline';
      case 'cancelada':
      case 'nao_compareceu':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Reserva</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Erro ao carregar reserva.
          </div>
        ) : reservation ? (
          <div className="space-y-4">
            {/* Informações do cliente */}
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <p className="font-medium">{reservation.nome_cliente}</p>
                <p className="text-sm">{reservation.telefone_cliente}</p>
                {reservation.email_cliente && (
                  <p className="text-sm text-muted-foreground">
                    {reservation.email_cliente}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={getStatusBadgeVariant(reservation.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                  {reservation.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data e Hora
                </p>
                <p>
                  {format(new Date(reservation.data_reserva), 'dd/MM/yyyy')} às{' '}
                  {reservation.hora_reserva.substring(0, 5)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nº de Pessoas
                </p>
                <p>{reservation.quantidade_pessoas}</p>
              </div>
            </div>

            {/* Informações da mesa */}
            <div>
              <p className="text-sm font-medium mb-1">Mesa</p>
              <div className="bg-muted/30 p-4 rounded-lg">
                {reservation.mesa_numero ? (
                  <>
                    <p className="font-medium">Mesa {reservation.mesa_numero}</p>
                    {reservation.mesa_capacidade && (
                      <p className="text-sm text-muted-foreground">
                        Capacidade: {reservation.mesa_capacidade} pessoas
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Mesa não atribuída</p>
                )}
              </div>
            </div>

            {/* Datas de confirmação/check-in/check-out */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Criada em</p>
                <p className="text-muted-foreground">
                  {format(new Date(reservation.created_at), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
              {reservation.confirmada_em && (
                <div>
                  <p className="font-medium">Confirmada em</p>
                  <p className="text-muted-foreground">
                    {format(new Date(reservation.confirmada_em), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              )}
              {reservation.check_in_em && (
                <div>
                  <p className="font-medium">Check-in</p>
                  <p className="text-muted-foreground">
                    {format(new Date(reservation.check_in_em), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              )}
              {reservation.check_out_em && (
                <div>
                  <p className="font-medium">Check-out</p>
                  <p className="text-muted-foreground">
                    {format(new Date(reservation.check_out_em), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              )}
            </div>

            {reservation.observacoes && (
              <div>
                <p className="text-sm font-medium mb-1">Observações</p>
                <p className="text-sm bg-muted/30 p-3 rounded-lg">
                  {reservation.observacoes}
                </p>
              </div>
            )}

            {/* Atualização de status */}
            <div className="border-t pt-4 flex items-end gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Atualizar status</p>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione novo status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmada">Confirmar</SelectItem>
                    <SelectItem value="em_andamento">Check-in (Em Andamento)</SelectItem>
                    <SelectItem value="finalizada">Check-out (Finalizada)</SelectItem>
                    <SelectItem value="cancelada">Cancelar</SelectItem>
                    <SelectItem value="nao_compareceu">Não Compareceu</SelectItem>
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
            Reserva não encontrada.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ReservationDetailsModal;