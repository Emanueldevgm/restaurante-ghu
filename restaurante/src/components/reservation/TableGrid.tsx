/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Users, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTables, useTableStatus } from '@/hooks/useApi';
import { Table } from '@/services/api';
import { ReservationDialog } from './ReservationDialog';
import { Skeleton } from '@/components/ui/skeleton';

export function TableGrid() {
  const { data: tables = [], isLoading: tablesLoading } = useTables();
  const { data: tableStatus = [], isLoading: statusLoading } = useTableStatus();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tablesWithStatus = tables.map(table => {
    const statusInfo = tableStatus.find((st: any) => st.id === table.id);
    return { ...table, status: statusInfo?.status_mesa || 'disponivel' };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTableClick = (table: any) => {
    if (table.status !== 'disponivel') {
      toast.error('Mesa indisponível');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Faça login para reservar');
      navigate('/auth');
      return;
    }
    setSelectedTable(table);
    setShowReservationDialog(true);
  };

  const getTableStyle = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-success hover:bg-success/80 hover:scale-105 cursor-pointer shadow-success/30';
      case 'ocupada': return 'bg-destructive/80 cursor-not-allowed';
      case 'reservada': return 'bg-warning/80 cursor-not-allowed';
      default: return 'bg-muted';
    }
  };

  if (tablesLoading || statusLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-40 mx-auto mb-8" />
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-sm font-bold text-accent uppercase tracking-widest">Reserve sua Mesa</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mapa de Mesas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Escolha uma mesa disponível e faça sua reserva em segundos.
          </p>
        </div>

        <div className="flex justify-center gap-8 mb-10">
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-success shadow-lg shadow-success/30" /><span>Disponível</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-destructive/80" /><span>Ocupada</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-warning/80" /><span>Reservada</span></div>
        </div>

        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8 text-xs font-medium text-muted-foreground uppercase">Entrada</div>
          <div className="grid grid-cols-4 gap-4">
            {tablesWithStatus.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                disabled={table.status !== 'disponivel'}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-white font-bold transition-all duration-300 ${getTableStyle(table.status)}`}
              >
                <span className="text-2xl">{table.numero}</span>
                <div className="flex items-center gap-1 text-xs opacity-90"><Users className="w-3 h-3" />{table.capacidade}</div>
              </button>
            ))}
          </div>
          <div className="text-center mt-8 text-xs font-medium text-muted-foreground uppercase">Cozinha</div>
        </div>

        {selectedTable && (
          <ReservationDialog
            open={showReservationDialog}
            onOpenChange={setShowReservationDialog}
            mesaId={selectedTable.id}
            mesaNumero={Number(selectedTable.numero)}
            capacidade={selectedTable.capacidade}
          />
        )}
      </div>
    </section>
  );
}