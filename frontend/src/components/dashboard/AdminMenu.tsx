/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle, CheckCircle, XCircle, Loader, FolderPlus, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/services/api';
import axios from 'axios';

interface MenuItem {
  id: string; categoria_id: string; nome: string; descricao: string;
  preco_kz: number; preco_promocional_kz: number | null; tempo_preparo: number | null;
  calorias: number | null; vegetariano: boolean; vegano: boolean; sem_gluten: boolean;
  picante: boolean; status: 'disponivel' | 'indisponivel' | 'esgotado';
  destaque: boolean; prato_do_dia: boolean; imagem: string | null; categoria_nome?: string;
}

interface Categoria {
  id: string; nome: string; descricao: string | null;
}

const statusColors: Record<string, string> = {
  disponivel: 'bg-green-100 text-green-800',
  indisponivel: 'bg-red-100 text-red-800',
  esgotado: 'bg-yellow-100 text-yellow-800',
};

const statusIcons: Record<string, JSX.Element> = {
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
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    categoria_id: '', nome: '', descricao: '', preco_kz: '', preco_promocional_kz: '',
    tempo_preparo: '', calorias: '', vegetariano: false, vegano: false, sem_gluten: false,
    picante: false, destaque: false, prato_do_dia: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const [categoryFormData, setCategoryFormData] = useState({ nome: '', descricao: '' });

  useEffect(() => { loadData(); }, []);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG, WebP ou GIF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB');
      return;
    }
    setImageFile(file);
    setExistingImage(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        categoria_id: item.categoria_id, nome: item.nome, descricao: item.descricao || '',
        preco_kz: item.preco_kz.toString(), preco_promocional_kz: item.preco_promocional_kz?.toString() || '',
        tempo_preparo: item.tempo_preparo?.toString() || '', calorias: item.calorias?.toString() || '',
        vegetariano: item.vegetariano, vegano: item.vegano, sem_gluten: item.sem_gluten,
        picante: item.picante, destaque: item.destaque, prato_do_dia: item.prato_do_dia,
      });
      setExistingImage(item.imagem);
      setImageFile(null);
      setImagePreview(null);
    } else {
      setEditingItem(null);
      setFormData({
        categoria_id: '', nome: '', descricao: '', preco_kz: '', preco_promocional_kz: '',
        tempo_preparo: '', calorias: '', vegetariano: false, vegano: false, sem_gluten: false,
        picante: false, destaque: false, prato_do_dia: false,
      });
      setExistingImage(null);
      setImageFile(null);
      setImagePreview(null);
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
      if (isNaN(preco) || preco <= 0) { toast.error('Preço deve ser um número válido e positivo'); return; }

      setIsSaving(true);

      if (imageFile) {
        // Upload com imagem nova
        const formDataToSend = new FormData();
        formDataToSend.append('imagem', imageFile);
        formDataToSend.append('categoria_id', formData.categoria_id);
        formDataToSend.append('nome', formData.nome);
        formDataToSend.append('preco_kz', preco.toString());
        if (formData.descricao?.trim()) formDataToSend.append('descricao', formData.descricao.trim());
        if (formData.preco_promocional_kz) formDataToSend.append('preco_promocional_kz', formData.preco_promocional_kz);
        if (formData.tempo_preparo) formDataToSend.append('tempo_preparo', formData.tempo_preparo);
        if (formData.calorias) formDataToSend.append('calorias', formData.calorias);
        formDataToSend.append('vegetariano', String(formData.vegetariano));
        formDataToSend.append('vegano', String(formData.vegano));
        formDataToSend.append('sem_gluten', String(formData.sem_gluten));
        formDataToSend.append('picante', String(formData.picante));
        formDataToSend.append('destaque', String(formData.destaque));
        formDataToSend.append('prato_do_dia', String(formData.prato_do_dia));

        if (editingItem) {
          await api.put(`/menu/items/${editingItem.id}`, formDataToSend);
          toast.success('Item atualizado com sucesso');
        } else {
          await api.post('/menu/items', formDataToSend);
          toast.success('Item criado com sucesso');
        }
      } else {
        // Sem imagem nova
        const data: any = {
          categoria_id: formData.categoria_id,
          nome: formData.nome,
          descricao: formData.descricao?.trim() || undefined,
          preco_kz: preco,
          preco_promocional_kz: formData.preco_promocional_kz ? parseFloat(formData.preco_promocional_kz) : undefined,
          tempo_preparo: formData.tempo_preparo ? parseInt(formData.tempo_preparo) : undefined,
          calorias: formData.calorias ? parseInt(formData.calorias) : undefined,
          vegetariano: formData.vegetariano,
          vegano: formData.vegano,
          sem_gluten: formData.sem_gluten,
          picante: formData.picante,
          destaque: formData.destaque,
          prato_do_dia: formData.prato_do_dia,
        };

        // IMPORTANTE: Se o usuário removeu a imagem (existingImage === null e editingItem existe)
        if (editingItem && existingImage === null) {
          data.imagem = null;
        }

        if (editingItem) {
          await api.put(`/menu/items/${editingItem.id}`, data);
          toast.success('Item atualizado com sucesso');
        } else {
          await api.post('/menu/items', data);
          toast.success('Item criado com sucesso');
        }
      }

      setIsDialogOpen(false);
      loadData();
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || 'Falha ao salvar item' : 'Falha ao salvar item';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este item?')) return;
    try {
      await api.delete(`/menu/items/${id}`);
      toast.success('Item deletado com sucesso');
      loadData();
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || 'Falha ao deletar item' : 'Falha ao deletar item';
      toast.error(errorMessage);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/menu/items/${id}/status`, { status: newStatus });
      toast.success('Status atualizado com sucesso');
      loadData();
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || 'Falha ao atualizar status' : 'Falha ao atualizar status';
      toast.error(errorMessage);
    }
  };

  const handleOpenCategoryDialog = (category?: Categoria) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({ nome: category.nome, descricao: category.descricao || '' });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ nome: '', descricao: '' });
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (!categoryFormData.nome.trim()) { toast.error('Nome da categoria é obrigatório'); return; }
      if (editingCategory) {
        await api.put(`/menu/categories/${editingCategory.id}`, categoryFormData);
        toast.success('Categoria atualizada!');
      } else {
        await api.post('/menu/categories', categoryFormData);
        toast.success('Categoria criada!');
      }
      setIsCategoryDialogOpen(false);
      loadData();
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || 'Erro ao salvar categoria' : 'Erro ao salvar categoria';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta categoria? Itens vinculados serão afetados.')) return;
    try {
      await api.delete(`/menu/categories/${id}`);
      toast.success('Categoria removida!');
      loadData();
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || 'Erro ao remover categoria' : 'Erro ao remover categoria';
      toast.error(errorMessage);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchCategory = !selectedCategory || item.categoria_id === selectedCategory;
    const matchSearch = !searchTerm || item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || item.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const buildApiBaseUrl = (): string => {
    const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    let base = rawBase;

    if (base.startsWith('/')) {
      base = `${window.location.origin}${base}`;
    }

    base = base.replace(/\/api\/?$/, '');
    return base.replace(/\/$/, '');
  };

  const getImageUrl = (imagem: string | null): string | null => {
    if (!imagem) return null;
    if (imagem.startsWith('http')) return imagem;
    const cleanPath = imagem.startsWith('/') ? imagem : `/${imagem}`;
    return `${buildApiBaseUrl()}${cleanPath}`;
  };

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
        <div className="flex gap-2">
          <Button onClick={() => handleOpenCategoryDialog()} variant="outline" className="gap-2">
            <FolderPlus className="w-4 h-4" /> Nova Categoria
          </Button>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Item
          </Button>
        </div>
      </div>

      {/* Lista de Categorias */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Categorias ({categories.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat.id} variant="outline" className="text-sm py-2 px-4 flex items-center gap-2">
                {cat.nome}
                <button onClick={() => handleOpenCategoryDialog(cat)} className="hover:text-primary"><Edit2 className="w-3 h-3" /></button>
                <button onClick={() => handleDeleteCategory(cat.id)} className="hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input id="search" placeholder="Nome ou descrição..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="category">Categoria</Label>
                <select id="category" className="w-full px-3 py-2 border rounded-md bg-background" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="">Todas</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.nome}</option>))}
                </select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Mostrando {filteredItems.length} de {items.length} itens</div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <Card className="border-dashed"><CardContent className="pt-12 pb-12 text-center"><p className="text-muted-foreground">Nenhum item encontrado</p></CardContent></Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  {item.imagem && (
                    <div className="flex-shrink-0">
                      <img
                        src={getImageUrl(item.imagem)!}
                        alt={item.nome}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{item.nome}</h3>
                      <Badge variant="outline">{categories.find((c) => c.id === item.categoria_id)?.nome || item.categoria_nome}</Badge>
                      <Badge className={statusColors[item.status]}>
                        <span className="flex items-center gap-1">{statusIcons[item.status]}{item.status}</span>
                      </Badge>
                    </div>
                    {item.descricao && <p className="text-sm text-muted-foreground mb-3">{item.descricao}</p>}
                    <div className="flex gap-4 flex-wrap text-sm mb-3">
                      <span className="font-semibold text-primary">{item.preco_kz.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
                      {item.preco_promocional_kz && <span className="line-through text-muted-foreground">{item.preco_promocional_kz.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>}
                      {item.tempo_preparo && <span>⏱️ {item.tempo_preparo} min</span>}
                      {item.calorias && <span>🔥 {item.calorias} kcal</span>}
                    </div>
                    {(item.vegetariano || item.vegano || item.sem_gluten || item.picante) && (
                      <div className="flex gap-2 flex-wrap mb-3">
                        {item.vegetariano && <Badge variant="secondary">🥗 Vegetariano</Badge>}
                        {item.vegano && <Badge variant="secondary">🌿 Vegano</Badge>}
                        {item.sem_gluten && <Badge variant="secondary">🌾 Sem Glúten</Badge>}
                        {item.picante && <Badge variant="secondary">🌶️ Picante</Badge>}
                      </div>
                    )}
                    {(item.destaque || item.prato_do_dia) && (
                      <div className="flex gap-2 flex-wrap">
                        {item.destaque && <Badge className="bg-amber-600">⭐ Destaque</Badge>}
                        {item.prato_do_dia && <Badge className="bg-purple-600">🎯 Prato do Dia</Badge>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenDialog(item)}><Edit2 className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} className="px-2 py-1 text-sm border rounded bg-background">
                      <option value="disponivel">Disponível</option>
                      <option value="indisponivel">Indisponível</option>
                      <option value="esgotado">Esgotado</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Item */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item do Cardápio'}</DialogTitle>
            <DialogDescription>Preencha os detalhes do item</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Categoria *</Label>
              <select className="w-full px-3 py-2 border rounded-md bg-background" value={formData.categoria_id} onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}>
                <option value="">Selecione</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.nome}</option>))}
              </select>
            </div>
            <div className="col-span-2"><Label>Nome *</Label><Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} /></div>
            <div className="col-span-2"><Label>Descrição</Label><textarea className="w-full px-3 py-2 border rounded-md bg-background" rows={2} value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} /></div>

            {/* UPLOAD DE IMAGEM */}
            <div className="col-span-2">
              <Label>Imagem do Prato</Label>
              <div className="mt-2 space-y-3">
                {(imagePreview || existingImage) && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || getImageUrl(existingImage)!}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="imagem-upload"
                  />
                  <label htmlFor="imagem-upload">
                    <Button type="button" variant="outline" className="gap-2 cursor-pointer" asChild>
                      <span><Upload className="w-4 h-4" />{imageFile || existingImage ? 'Alterar Imagem' : 'Selecionar Imagem'}</span>
                    </Button>
                  </label>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WebP ou GIF (máx. 5MB)</span>
                </div>
                {!imagePreview && !existingImage && (
                  <div className="flex items-center justify-center w-32 h-32 bg-gray-100 rounded-lg border border-dashed">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div><Label>Preço (Kz) *</Label><Input type="number" step="0.01" value={formData.preco_kz} onChange={(e) => setFormData({ ...formData, preco_kz: e.target.value })} /></div>
            <div><Label>Preço Promocional</Label><Input type="number" step="0.01" value={formData.preco_promocional_kz} onChange={(e) => setFormData({ ...formData, preco_promocional_kz: e.target.value })} /></div>
            <div><Label>Tempo Preparo (min)</Label><Input type="number" value={formData.tempo_preparo} onChange={(e) => setFormData({ ...formData, tempo_preparo: e.target.value })} /></div>
            <div><Label>Calorias</Label><Input type="number" value={formData.calorias} onChange={(e) => setFormData({ ...formData, calorias: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveItem} disabled={isSaving}>
              {isSaving && <Loader className="w-4 h-4 animate-spin mr-2" />}
              {editingItem ? 'Atualizar' : 'Criar'} Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Categoria */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Nome *</Label><Input value={categoryFormData.nome} onChange={(e) => setCategoryFormData({ ...categoryFormData, nome: e.target.value })} /></div>
            <div><Label>Descrição</Label><Input value={categoryFormData.descricao} onChange={(e) => setCategoryFormData({ ...categoryFormData, descricao: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancelar</Button><Button onClick={handleSaveCategory}>{editingCategory ? 'Atualizar' : 'Criar'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}