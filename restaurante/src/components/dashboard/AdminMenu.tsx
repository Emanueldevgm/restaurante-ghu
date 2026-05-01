import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/services/api';
import axios from 'axios';

interface MenuItem {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string;
  preco_kz: number;
  preco_promocional_kz: number | null;
  tempo_preparo: number | null;
  calorias: number | null;
  vegetariano: boolean;
  vegano: boolean;
  sem_gluten: boolean;
  picante: boolean;
  status: 'disponivel' | 'indisponivel' | 'esgotado';
  destaque: boolean;
  prato_do_dia: boolean;
  imagem: string | null;
  categoria_nome?: string;
}

interface Categoria {
  id: string;
  nome: string;
  descricao: string | null;
}

const statusColors = {
  disponivel: 'bg-green-100 text-green-800',
  indisponivel: 'bg-red-100 text-red-800',
  esgotado: 'bg-yellow-100 text-yellow-800',
};

const statusIcons = {
  disponivel: <CheckCircle className="w-4 h-4" />,
  indisponivel: <XCircle className="w-4 h-4" />,
  esgotado: <AlertCircle className="w-4 h-4" />,
};

export function AdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    categoria_id: '',
    nome: '',
    descricao: '',
    preco_kz: '',
    preco_promocional_kz: '',
    tempo_preparo: '',
    calorias: '',
    vegetariano: false,
    vegano: false,
    sem_gluten: false,
    picante: false,
    destaque: false,
    prato_do_dia: false,
    imagem: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get('/menu/items?limit=1000'),
        api.get('/menu/categories?ativo=true'),
      ]);

      setItems(itemsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      toast.error('Falha ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        categoria_id: item.categoria_id,
        nome: item.nome,
        descricao: item.descricao || '',
        preco_kz: item.preco_kz.toString(),
        preco_promocional_kz: item.preco_promocional_kz?.toString() || '',
        tempo_preparo: item.tempo_preparo?.toString() || '',
        calorias: item.calorias?.toString() || '',
        vegetariano: item.vegetariano,
        vegano: item.vegano,
        sem_gluten: item.sem_gluten,
        picante: item.picante,
        destaque: item.destaque,
        prato_do_dia: item.prato_do_dia,
        imagem: item.imagem || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        categoria_id: '',
        nome: '',
        descricao: '',
        preco_kz: '',
        preco_promocional_kz: '',
        tempo_preparo: '',
        calorias: '',
        vegetariano: false,
        vegano: false,
        sem_gluten: false,
        picante: false,
        destaque: false,
        prato_do_dia: false,
        imagem: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      if (!formData.categoria_id || !formData.nome || !formData.preco_kz) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const preco = parseFloat(formData.preco_kz);
      if (isNaN(preco) || preco <= 0) {
        toast.error('Preço deve ser um número válido e positivo');
        return;
      }

      const data = {
        categoria_id: formData.categoria_id,
        nome: formData.nome,
        descricao: formData.descricao?.trim() || undefined,
        preco_kz: preco,
        preco_promocional_kz: formData.preco_promocional_kz
          ? parseFloat(formData.preco_promocional_kz)
          : undefined,
        tempo_preparo: formData.tempo_preparo ? parseInt(formData.tempo_preparo) : undefined,
        calorias: formData.calorias ? parseInt(formData.calorias) : undefined,
        vegetariano: formData.vegetariano,
        vegano: formData.vegano,
        sem_gluten: formData.sem_gluten,
        picante: formData.picante,
        destaque: formData.destaque,
        prato_do_dia: formData.prato_do_dia,
        imagem: formData.imagem?.trim() || undefined,
      };

      if (editingItem) {
        await api.put(`/menu/admin/items/${editingItem.id}`, data);
        toast.success('Item atualizado com sucesso');
      } else {
        await api.post('/menu/admin/items', data);
        toast.success('Item criado com sucesso');
      }

      setIsDialogOpen(false);
      loadData();
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Falha ao salvar item'
        : 'Falha ao salvar item';
      toast.error(errorMessage);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este item?')) return;

    try {
      await api.delete(`/menu/admin/items/${id}`);
      toast.success('Item deletado com sucesso');
      loadData();
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Falha ao deletar item'
        : 'Falha ao deletar item';
      toast.error(errorMessage);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/menu/admin/items/${id}/status`, { status: newStatus });
      toast.success('Status atualizado com sucesso');
      loadData();
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Falha ao atualizar status'
        : 'Falha ao atualizar status';
      toast.error(errorMessage);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchCategory = !selectedCategory || item.categoria_id === selectedCategory;
    const matchSearch =
      !searchTerm ||
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Cardápio</h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Item
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Nome ou descrição..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-48">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Mostrando {filteredItems.length} de {items.length} itens
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">Nenhum item encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{item.nome}</h3>
                      <Badge variant="outline">
                        {categories.find((c) => c.id === item.categoria_id)?.nome}
                      </Badge>
                      <Badge className={statusColors[item.status]}>
                        <span className="flex items-center gap-1">
                          {statusIcons[item.status]}
                          {item.status}
                        </span>
                      </Badge>
                    </div>

                    {item.descricao && (
                      <p className="text-sm text-muted-foreground mb-3">{item.descricao}</p>
                    )}

                    <div className="flex gap-4 flex-wrap text-sm mb-3">
                      <span className="font-semibold text-primary">
                        {item.preco_kz.toLocaleString('pt-AO', {
                          style: 'currency',
                          currency: 'AOA',
                        })}
                      </span>
                      {item.preco_promocional_kz && (
                        <span className="line-through text-muted-foreground">
                          {item.preco_promocional_kz.toLocaleString('pt-AO', {
                            style: 'currency',
                            currency: 'AOA',
                          })}
                        </span>
                      )}
                      {item.tempo_preparo && <span>⏱️ {item.tempo_preparo} min</span>}
                      {item.calorias && <span>🔥 {item.calorias} kcal</span>}
                    </div>

                    {(item.vegetariano || item.vegano || item.sem_gluten || item.picante) && (
                      <div className="flex gap-2 flex-wrap mb-3">
                        {item.vegetariano && (
                          <Badge variant="secondary" className="text-xs">
                            🥗 Vegetariano
                          </Badge>
                        )}
                        {item.vegano && (
                          <Badge variant="secondary" className="text-xs">
                            🌿 Vegano
                          </Badge>
                        )}
                        {item.sem_gluten && (
                          <Badge variant="secondary" className="text-xs">
                            🌾 Sem Glúten
                          </Badge>
                        )}
                        {item.picante && (
                          <Badge variant="secondary" className="text-xs">
                            🌶️ Picante
                          </Badge>
                        )}
                      </div>
                    )}

                    {(item.destaque || item.prato_do_dia) && (
                      <div className="flex gap-2 flex-wrap">
                        {item.destaque && <Badge className="bg-amber-600">⭐ Destaque</Badge>}
                        {item.prato_do_dia && (
                          <Badge className="bg-purple-600">🎯 Prato do Dia</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(item)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Deletar
                    </Button>

                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="px-2 py-1 text-sm border rounded bg-background"
                      >
                        <option value="disponivel">Disponível</option>
                        <option value="indisponivel">Indisponível</option>
                        <option value="esgotado">Esgotado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog para criar/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item do Cardápio'}</DialogTitle>
            <DialogDescription>Preencha os detalhes do item</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <select
                id="categoria"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Anguém à Moderna"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <textarea
                id="descricao"
                className="w-full px-3 py-2 border rounded-md bg-background"
                rows={2}
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do prato..."
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="imagem">URL da Imagem</Label>
              <Input
                id="imagem"
                type="url"
                value={formData.imagem}
                onChange={(e) => setFormData({ ...formData, imagem: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              {formData.imagem && (
                <div className="mt-2">
                  <img
                    src={formData.imagem}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="preco">Preço (Kz) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={formData.preco_kz}
                onChange={(e) => setFormData({ ...formData, preco_kz: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="preco_promo">Preço Promocional (Kz)</Label>
              <Input
                id="preco_promo"
                type="number"
                step="0.01"
                value={formData.preco_promocional_kz}
                onChange={(e) => setFormData({ ...formData, preco_promocional_kz: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="tempo">Tempo de Preparo (min)</Label>
              <Input
                id="tempo"
                type="number"
                value={formData.tempo_preparo}
                onChange={(e) => setFormData({ ...formData, tempo_preparo: e.target.value })}
                placeholder="30"
              />
            </div>

            <div>
              <Label htmlFor="calorias">Calorias (kcal)</Label>
              <Input
                id="calorias"
                type="number"
                value={formData.calorias}
                onChange={(e) => setFormData({ ...formData, calorias: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="vegetariano"
                checked={formData.vegetariano}
                onChange={(e) => setFormData({ ...formData, vegetariano: e.target.checked })}
              />
              <label htmlFor="vegetariano">🥗 Vegetariano</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="vegano"
                checked={formData.vegano}
                onChange={(e) => setFormData({ ...formData, vegano: e.target.checked })}
              />
              <label htmlFor="vegano">🌿 Vegano</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sem_gluten"
                checked={formData.sem_gluten}
                onChange={(e) => setFormData({ ...formData, sem_gluten: e.target.checked })}
              />
              <label htmlFor="sem_gluten">🌾 Sem Glúten</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="picante"
                checked={formData.picante}
                onChange={(e) => setFormData({ ...formData, picante: e.target.checked })}
              />
              <label htmlFor="picante">🌶️ Picante</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="destaque"
                checked={formData.destaque}
                onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
              />
              <label htmlFor="destaque">⭐ Destaque</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prato_dia"
                checked={formData.prato_do_dia}
                onChange={(e) => setFormData({ ...formData, prato_do_dia: e.target.checked })}
              />
              <label htmlFor="prato_dia">🎯 Prato do Dia</label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveItem}>{editingItem ? 'Atualizar' : 'Criar'} Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
