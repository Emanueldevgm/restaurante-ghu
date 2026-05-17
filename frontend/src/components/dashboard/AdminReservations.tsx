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
import { useAllReservations } from '@/hooks/use-restaurant';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  observacoes: string | null;
  created_at: string;
}

interface AdminReservationsProps {
  onViewDetails: (reservationId: string) => void;
}

export function AdminReservations({ onViewDetails }: AdminReservationsProps) {
  const { data: reservations = [] } = useAllReservations() as { data: Reservation[] };
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filteredReservations = reservations.filter((res) => {
    if (statusFilter === 'todos') return true;
    return res.status === statusFilter;
  });

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Reservas</CardTitle>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="finalizada">Finalizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="nao_compareceu">Não Compareceu</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Pessoas</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  Nenhuma reserva encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <span className="font-medium">{reservation.nome_cliente}</span>
                    <span className="block text-xs text-muted-foreground">
                      {reservation.telefone_cliente}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(reservation.data_reserva), 'dd/MM/yyyy')} às{' '}
                    {reservation.hora_reserva.substring(0, 5)}
                  </TableCell>
                  <TableCell>{reservation.quantidade_pessoas}</TableCell>
                  <TableCell>
                    {reservation.mesa_numero ? `Mesa ${reservation.mesa_numero}` : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(reservation.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                      {reservation.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(reservation.id)}
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

export default AdminReservations;