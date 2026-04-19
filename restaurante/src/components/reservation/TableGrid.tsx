/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Users } from 'lucide-react';
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

  // Combinar dados de mesas com status
  const tablesWithStatus = tables.map(table => {
    const statusInfo = tableStatus.find((st: any) => st.id === table.id);
    return {
      ...table,
      status: statusInfo?.status_mesa || 'disponivel',
    };
  });

  const handleTableClick = (table: any) => {
    if (table.status !== 'disponivel') {
      toast.error('Mesa não está disponível no momento');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para fazer uma reserva');
      navigate('/auth');
      return;
    }

    setSelectedTable(table);
    setShowReservationDialog(true);
  };

  const getTableColor = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'bg-success hover:bg-success/80 cursor-pointer';
      case 'ocupada':
        return 'bg-destructive cursor-not-allowed opacity-70';
      case 'reservada':
        return 'bg-warning cursor-not-allowed opacity-70';
      default:
        return 'bg-muted';
    }
  };

  if (tablesLoading || statusLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-32 mx-auto mb-4" />
            <Skeleton className="h-12 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-accent uppercase tracking-wider">
            Reserve sua Mesa
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4">
            Mapa de Mesas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Selecione uma mesa disponível para fazer sua reserva. 
            Clique na mesa verde desejada e confirme sua reserva.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success" />
            <span className="text-sm">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive" />
            <span className="text-sm">Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning" />
            <span className="text-sm">Reservada</span>
          </div>
        </div>

        {/* Table Grid */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-elegant">
            <div className="text-center mb-6 pb-4 border-b border-border">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Entrada do Restaurante
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {tablesWithStatus.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  disabled={table.status !== 'disponivel'}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center
                    transition-all duration-200 transform hover:scale-105
                    ${getTableColor(table.status)}
                  `}
                >
                  <span className="text-lg font-bold text-foreground">
                    {table.numero}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-foreground/70">
                    <Users className="w-3 h-3" />
                    {table.capacidade}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center mt-6 pt-4 border-t border-border">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Cozinha
              </span>
            </div>
          </div>
        </div>

        {/* Reservation Dialog */}
        {selectedTable && (
          <ReservationDialog
            open={showReservationDialog}
            onOpenChange={setShowReservationDialog}
            mesaId={selectedTable.id}
            mesaNumero={Number(selectedTable.numero)}  // ✅ Convertendo para número
            capacidade={Number(selectedTable.capacidade)} // ✅ Também garantir número
          />
        )}
      </div>
    </section>
  );
}