/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllReservations, useConfirmReservation, useCheckInReservation, useCheckOutReservation, useCancelReservation } from '@/hooks/use-restaurant';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search } from 'lucide-react';

interface Reservation {
  id: string; nome_cliente: string; telefone_cliente: string; email_cliente: string | null;
  data_reserva: string; hora_reserva: string; quantidade_pessoas: number;
  status: 'pendente' | 'confirmada' | 'em_andamento' | 'finalizada' | 'cancelada' | 'nao_compareceu';
  mesa_id: string | null; mesa_numero: string | null; observacoes: string | null; created_at: string;
}

interface AdminReservationsProps {
  onViewDetails: (reservationId: string) => void;
}

export function AdminReservations({ onViewDetails }: AdminReservationsProps) {
  const { data: reservations = [] } = useAllReservations() as { data: Reservation[] };
  const confirmReservation = useConfirmReservation();
  const checkInReservation = useCheckInReservation();
  const checkOutReservation = useCheckOutReservation();
  const cancelReservation = useCancelReservation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      if (statusFilter !== 'todos' && res.status !== statusFilter) return false;
      if (dateFilter && res.data_reserva !== dateFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchNome = res.nome_cliente?.toLowerCase().includes(term);
        const matchTelefone = res.telefone_cliente?.includes(term);
        const matchMesa = res.mesa_numero?.toString().includes(term);
        if (!matchNome && !matchTelefone && !matchMesa) return false;
      }
      return true;
    });
  }, [reservations, statusFilter, dateFilter, searchTerm]);

  const getStatusBadgeVariant = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmada': return 'default';
      case 'pendente': return 'secondary';
      case 'em_andamento': return 'success';
      case 'finalizada': return 'outline';
      case 'cancelada':
      case 'nao_compareceu': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Reservas ({filteredReservations.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, telefone ou mesa..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
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
          <Input type="date" className="w-40" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>

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
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">Nenhuma reserva encontrada.</TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <span className="font-medium">{reservation.nome_cliente}</span>
                    <span className="block text-xs text-muted-foreground">{reservation.telefone_cliente}</span>
                  </TableCell>
                  <TableCell>{format(new Date(reservation.data_reserva), 'dd/MM/yyyy')} às {reservation.hora_reserva?.substring(0, 5)}</TableCell>
                  <TableCell>{reservation.quantidade_pessoas}</TableCell>
                  <TableCell>{reservation.mesa_numero ? `Mesa ${reservation.mesa_numero}` : '—'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(reservation.status) as any}>{reservation.status.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {reservation.status === 'pendente' && (
                        <Button variant="ghost" size="sm" onClick={() => confirmReservation.mutate(reservation.id)}>Confirmar</Button>
                      )}
                      {reservation.status === 'confirmada' && (
                        <Button variant="ghost" size="sm" onClick={() => checkInReservation.mutate(reservation.id)}>Check-in</Button>
                      )}
                      {reservation.status === 'em_andamento' && (
                        <Button variant="ghost" size="sm" onClick={() => checkOutReservation.mutate(reservation.id)}>Check-out</Button>
                      )}
                      {['pendente', 'confirmada'].includes(reservation.status) && (
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => cancelReservation.mutate(reservation.id)}>Cancelar</Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => onViewDetails(reservation.id)}>Detalhes</Button>
                    </div>
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