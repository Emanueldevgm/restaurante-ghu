/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useTables, useCreateTable, useUpdateTable, useDeleteTable } from '@/hooks/useApi';
import { Table as ApiTable } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminTables() {
  const { data: tables = [], isLoading, refetch } = useTables();
  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const deleteTable = useDeleteTable();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<ApiTable | null>(null);
  const [formData, setFormData] = useState({
    numero: '',
    capacidade: '',
    tipo: 'normal' as ApiTable['tipo'],
    localizacao: '',
    observacoes: '',
  });

  const handleOpenDialog = (table?: ApiTable) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        numero: table.numero,
        capacidade: table.capacidade.toString(),
        tipo: table.tipo,
        localizacao: table.localizacao || '',
        observacoes: table.observacoes || '',
      });
    } else {
      setEditingTable(null);
      setFormData({
        numero: '',
        capacidade: '',
        tipo: 'normal',
        localizacao: '',
        observacoes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.numero || !formData.capacidade) {
      toast.error('Número e capacidade são obrigatórios');
      return;
    }

    const data = {
      numero: formData.numero,
      capacidade: parseInt(formData.capacidade),
      tipo: formData.tipo,
      localizacao: formData.localizacao || undefined,
      observacoes: formData.observacoes || undefined,
    };

    if (editingTable) {
      updateTable.mutate({ id: editingTable.id, data }, {
        onSuccess: () => {
          toast.success('Mesa atualizada');
          setIsDialogOpen(false);
          refetch();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => toast.error(error.response?.data?.message || 'Erro ao atualizar'),
      });
    } else {
      createTable.mutate(data, {
        onSuccess: () => {
          toast.success('Mesa criada');
          setIsDialogOpen(false);
          refetch();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => toast.error(error.response?.data?.message || 'Erro ao criar'),
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta mesa?')) return;
    deleteTable.mutate(id, {
      onSuccess: () => {
        toast.success('Mesa deletada');
        refetch();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => toast.error(error.response?.data?.message || 'Erro ao deletar'),
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Mesas</h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Mesa
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className="relative group">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold mb-1">Mesa {table.numero}</p>
              <p className="text-sm text-muted-foreground mb-2">
                {table.capacidade} lugares
              </p>
              <Badge variant={table.ativa ? 'default' : 'destructive'}>
                {table.ativa ? 'Ativa' : 'Inativa'}
              </Badge>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenDialog(table)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(table.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTable ? 'Editar Mesa' : 'Nova Mesa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="numero">Número da Mesa *</Label>
              <Input id="numero" value={formData.numero} onChange={e => setFormData({ ...formData, numero: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="capacidade">Capacidade (pessoas) *</Label>
              <Input id="capacidade" type="number" value={formData.capacidade} onChange={e => setFormData({ ...formData, capacidade: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              
              <Select value={formData.tipo} onValueChange={(val) => setFormData({ ...formData, tipo: val as 'normal' | 'vip' | 'familia' | 'casal' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="familia">Família</SelectItem>
                  <SelectItem value="casal">Casal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="localizacao">Localização</Label>
              <Input id="localizacao" value={formData.localizacao} onChange={e => setFormData({ ...formData, localizacao: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input id="observacoes" value={formData.observacoes} onChange={e => setFormData({ ...formData, observacoes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createTable.isPending || updateTable.isPending}>
              {createTable.isPending || updateTable.isPending ? <Loader className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}