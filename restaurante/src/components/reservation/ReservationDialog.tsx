import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCreateReservation } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const reservationSchema = z.object({
  nome_cliente: z.string().min(3, 'Nome obrigatório'),
  telefone_cliente: z.string().min(7, 'Telefone obrigatório'),
  email_cliente: z.string().email('Email inválido').optional(),
  quantidade_pessoas: z.number().int().min(1).max(20),
  data_reserva: z.date(),
  hora_reserva: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
  observacoes: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesaId: string;
  mesaNumero: number;
  capacidade: number;
}

export function ReservationDialog({ open, onOpenChange, mesaId, mesaNumero, capacidade }: ReservationDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const { mutate: createReservation, isPending } = useCreateReservation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      nome_cliente: user?.name || '',
      telefone_cliente: user?.telefone || '',
      email_cliente: user?.email || '',
      quantidade_pessoas: capacidade,
      data_reserva: new Date(),
      hora_reserva: '19:00',
    },
  });

  const dataReserva = watch('data_reserva');
  const horaReserva = watch('hora_reserva');

  const onSubmit = (data: ReservationFormData) => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para fazer uma reserva');
      return;
    }

    createReservation({
      mesa_id: mesaId,
      nome_cliente: data.nome_cliente,
      telefone_cliente: data.telefone_cliente,
      email_cliente: data.email_cliente,
      quantidade_pessoas: data.quantidade_pessoas,
      data_reserva: format(data.data_reserva, 'yyyy-MM-dd'),
      hora_reserva: data.hora_reserva,
      observacoes: data.observacoes,
    }, {
      onSuccess: () => {
        toast.success(`Mesa ${mesaNumero} reservada com sucesso!`);
        onOpenChange(false);
        reset();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao criar reserva');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reservar Mesa {mesaNumero}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome_cliente">Nome completo *</Label>
            <Input id="nome_cliente" {...register('nome_cliente')} />
            {errors.nome_cliente && <p className="text-xs text-destructive mt-1">{errors.nome_cliente.message}</p>}
          </div>
          <div>
            <Label htmlFor="telefone_cliente">Telefone *</Label>
            <Input id="telefone_cliente" {...register('telefone_cliente')} />
            {errors.telefone_cliente && <p className="text-xs text-destructive mt-1">{errors.telefone_cliente.message}</p>}
          </div>
          <div>
            <Label htmlFor="email_cliente">E-mail</Label>
            <Input id="email_cliente" type="email" {...register('email_cliente')} />
            {errors.email_cliente && <p className="text-xs text-destructive mt-1">{errors.email_cliente.message}</p>}
          </div>
          <div>
            <Label htmlFor="quantidade_pessoas">Número de pessoas *</Label>
            <Input id="quantidade_pessoas" type="number" {...register('quantidade_pessoas', { valueAsNumber: true })} />
            {errors.quantidade_pessoas && <p className="text-xs text-destructive mt-1">{errors.quantidade_pessoas.message}</p>}
          </div>
          <div>
            <Label>Data da reserva *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dataReserva && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataReserva ? format(dataReserva, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataReserva}
                  onSelect={(date) => setValue('data_reserva', date!)}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.data_reserva && <p className="text-xs text-destructive mt-1">{errors.data_reserva.message}</p>}
          </div>
          <div>
            <Label htmlFor="hora_reserva">Hora *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="hora_reserva" {...register('hora_reserva')} className="pl-9" placeholder="19:00" />
            </div>
            {errors.hora_reserva && <p className="text-xs text-destructive mt-1">{errors.hora_reserva.message}</p>}
          </div>
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" {...register('observacoes')} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Reservando...' : 'Confirmar Reserva'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}