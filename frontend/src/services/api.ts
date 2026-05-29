import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * URL base da API
 *
 * Prioridade:
 * 1. VITE_API_BASE_URL (definida na Vercel para produção)
 * 2. http://localhost:10000/api (desenvolvimento local)
 */
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ INTERCEPTOR DE REQUEST ============

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage.getItem('restaurant_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erro ao acessar localStorage:', error);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ============ INTERCEPTOR DE RESPONSE ============

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('restaurant_token');
        localStorage.removeItem('restaurant_user');
      } catch (e) {
        console.warn('Erro ao limpar localStorage:', e);
      }
      // Redireciona apenas se não estiver já na página de auth
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// =============================================
// INTERFACES
// =============================================

export interface User {
  id: string;
  nome_completo: string;
  email: string | null;
  telefone: string;
  telefone_alternativo?: string | null;
  bi?: string | null;
  nif?: string | null;
  role: 'cliente' | 'administrador' | 'garcom' | 'cozinha' | 'entregador' | 'gerente';
  status: 'ativo' | 'inativo' | 'bloqueado';
  foto_perfil?: string | null;
  data_nascimento?: string | null;
  genero?: string | null;
  created_at?: string;
  ultimo_acesso?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface MenuItem {
  id: string;
  categoria_id: string;
  nome: string;
  nome_en: string | null;
  descricao: string | null;
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

export interface Category {
  id: string;
  nome: string;
  nome_en: string | null;
  descricao: string | null;
  imagem: string | null;
  ordem_exibicao: number;
  ativo: boolean;
}

export interface Table {
  id: string;
  numero: string;
  capacidade: number;
  localizacao: string | null;
  tipo: 'normal' | 'vip' | 'familia' | 'casal';
  ativa: boolean;
  observacoes?: string | null;
}

export interface Reservation {
  id: string;
  usuario_id?: string | null;
  mesa_id?: string | null;
  mesa_numero?: string | null;
  nome_cliente: string;
  telefone_cliente: string;
  email_cliente: string | null;
  quantidade_pessoas: number;
  data_reserva: string;
  hora_reserva: string;
  status: 'pendente' | 'confirmada' | 'em_andamento' | 'finalizada' | 'cancelada' | 'nao_compareceu';
  ocasiao_especial: string | null;
  observacoes: string | null;
  created_at?: string;
}

export interface Review {
  id: string;
  pedido_id: string;
  usuario_id: string;
  usuario_nome?: string;
  nota: number;
  comentario?: string;
  resposta_restaurante?: string;
  created_at: string;
}

export interface Order {
  id: string;
  numero_pedido: number;
  usuario_id: string | null;
  tipo: 'delivery' | 'retirada' | 'mesa';
  status: 'carrinho' | 'pendente' | 'confirmado' | 'em_preparo' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado';
  endereco_id: string | null;
  mesa_id: string | null;
  taxa_entrega_kz: number;
  distancia_km: number | null;
  subtotal_kz: number;
  desconto_kz: number;
  total_kz: number;
  observacoes: string | null;
  observacoes_entrega: string | null;
  tempo_estimado: number | null;
  data_prevista_entrega: string | null;
  reserva_id: string | null;
  cupom_id: string | null;
  created_at: string;
  updated_at: string;
  confirmado_em: string | null;
  finalizado_em: string | null;
}

export interface TableStatus {
  id: string;
  numero: string;
  status_mesa: 'disponivel' | 'ocupada' | 'reservada';
  capacidade: number;
}

// =============================================
// TIPOS AUXILIARES
// =============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================
// UTILITÁRIO DE IMAGEM
// =============================================

/**
 * Constrói a URL completa para uma imagem do backend
 * @param imagem - Caminho relativo ou URL absoluta da imagem
 * @returns URL completa da imagem ou placeholder
 */
export const buildImageUrl = (imagem: string | null | undefined): string => {
  if (!imagem) {
    return '/placeholder.svg';
  }
  // Se já for URL absoluta, retorna diretamente
  if (imagem.startsWith('http')) {
    return imagem;
  }
  // Constrói URL a partir da base da API (remove o /api final)
  const baseUrl = API_URL.replace(/\/api\/?$/, '');
  const cleanPath = imagem.startsWith('/') ? imagem : `/${imagem}`;
  return `${baseUrl}${cleanPath}`;
};

// =============================================
// AUTH API
// =============================================

export interface LoginPayload {
  email?: string;
  telefone?: string;
  senha: string;
}

export interface RegisterPayload {
  nome_completo: string;
  telefone: string;
  email?: string;
  senha: string;
}

export interface CreateUserPayload {
  nome_completo: string;
  email?: string;
  telefone: string;
  telefone_alternativo?: string;
  senha: string;
  bi?: string;
  nif?: string;
  role?: string;
  status?: string;
  data_nascimento?: string;
  genero?: string;
}

export const authApi = {
  login: async (email: string, telefone: string, senha: string): Promise<AuthResponse> => {
    const payload: LoginPayload = { senha };
    if (email?.trim()) payload.email = email;
    if (telefone?.trim()) payload.telefone = telefone;
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const payload: RegisterPayload = {
      nome_completo: data.nome_completo,
      telefone: data.telefone,
      senha: data.senha,
    };
    if (data.email?.trim()) payload.email = data.email;
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>('/auth/profile', data);
    return response.data;
  },

  changePassword: async (senhaAtual: string, novaSenha: string): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>('/auth/change-password', {
      senha_atual: senhaAtual,
      nova_senha: novaSenha,
    });
    return response.data;
  },

  listUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>('/auth/users');
    return response.data;
  },

  createUser: async (userData: CreateUserPayload): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/users', userData);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/auth/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/auth/users/${id}`);
    return response.data;
  },

  updateUserStatus: async (id: string, status: string): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`/auth/users/${id}/status`, { status });
    return response.data;
  },
};

// =============================================
// MENU API
// =============================================

export interface CreateCategoryPayload {
  nome: string;
  descricao?: string;
  imagem?: string;
}

export const menuApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/menu/categories');
    return response.data.data!;
  },

  createCategory: async (data: CreateCategoryPayload): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/menu/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/menu/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/menu/categories/${id}`);
    return response.data;
  },

  getMenuItems: async (filters?: {
    categoria_id?: string;
    destaque?: boolean;
    prato_do_dia?: boolean;
    vegetariano?: boolean;
    search?: string;
    limit?: number;
  }): Promise<MenuItem[]> => {
    const response = await api.get<ApiResponse<MenuItem[]>>('/menu/items', { params: filters });
    return response.data.data!;
  },

  getMenuItem: async (id: string): Promise<MenuItem> => {
    const response = await api.get<ApiResponse<MenuItem>>(`/menu/items/${id}`);
    return response.data.data!;
  },

  createMenuItem: async (data: Partial<MenuItem>): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/menu/items', data);
    return response.data;
  },

  updateMenuItem: async (id: string, data: Partial<MenuItem>): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/menu/items/${id}`, data);
    return response.data;
  },

  deleteMenuItem: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/menu/items/${id}`);
    return response.data;
  },
};

// =============================================
// TABLES API
// =============================================

export const tablesApi = {
  getTables: async (): Promise<Table[]> => {
    const response = await api.get<ApiResponse<Table[]>>('/tables');
    return response.data.data!;
  },

  getTableStatus: async (): Promise<TableStatus[]> => {
    const response = await api.get<ApiResponse<TableStatus[]>>('/tables/status');
    return response.data.data!;
  },

  createTable: async (data: Partial<Table>): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/tables', data);
    return response.data;
  },

  updateTable: async (id: string, data: Partial<Table>): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/tables/${id}`, data);
    return response.data;
  },

  toggleTable: async (id: string): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`/tables/${id}/toggle`);
    return response.data;
  },

  deleteTable: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/tables/${id}`);
    return response.data;
  },
};

// =============================================
// RESERVATIONS API
// =============================================

export interface CreateReservationPayload {
  mesa_id?: string;
  nome_cliente: string;
  telefone_cliente: string;
  email_cliente?: string;
  quantidade_pessoas: number;
  data_reserva: string;
  hora_reserva: string;
  ocasiao_especial?: string;
  observacoes?: string;
}

export interface ReservationResponse {
  success: boolean;
  message: string;
  data?: { id: string };
}

export const reservationsApi = {
  createReservation: async (data: CreateReservationPayload): Promise<ReservationResponse> => {
    const response = await api.post<ReservationResponse>('/reservations', data);
    return response.data;
  },

  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await api.get<ApiResponse<Reservation[]>>('/reservations/my-reservations');
    return response.data.data!;
  },

  cancelReservation: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/reservations/${id}`);
    return response.data;
  },

  getAllReservations: async (filters?: {
    status?: string;
    data?: string;
    mesa_id?: string;
  }): Promise<Reservation[]> => {
    const response = await api.get<ApiResponse<Reservation[]>>('/reservations/admin/all', {
      params: filters,
    });
    return response.data.data!;
  },

  confirmReservation: async (id: string): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`/reservations/${id}/confirm`);
    return response.data;
  },

  checkInReservation: async (id: string): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`/reservations/${id}/check-in`);
    return response.data;
  },

  checkOutReservation: async (id: string): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`/reservations/${id}/check-out`);
    return response.data;
  },

  getReservation: async (id: string): Promise<Reservation> => {
    const response = await api.get<ApiResponse<Reservation>>(`/reservations/${id}`);
    return response.data.data!;
  },

  updateReservationStatus: async (id: string, status: string): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`/reservations/${id}/status`, { status });
    return response.data;
  },
};

// =============================================
// ORDERS API
// =============================================

export interface CreateOrderPayload {
  tipo: 'delivery' | 'retirada' | 'mesa';
  endereco_id?: string;
  mesa_id?: string;
  itens: Array<{
    item_cardapio_id: string;
    quantidade: number;
    observacoes?: string;
  }>;
  observacoes?: string;
  observacoes_entrega?: string;
  cupom_codigo?: string;
}

export interface OrderFilters {
  status?: string;
  tipo?: string;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
}

export const ordersApi = {
  createOrder: async (data: CreateOrderPayload): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  getMyOrders: async (filters?: { status?: string; tipo?: string }): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>('/orders/my-orders', { params: filters });
    return response.data.data!;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data!;
  },

  cancelOrder: async (id: string): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`/orders/${id}/cancel`);
    return response.data;
  },

  getAllOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>('/orders/admin/all', { params: filters });
    return response.data.data!;
  },

  updateOrderStatus: async (id: string, status: string): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`/orders/${id}/status`, { status });
    return response.data;
  },
};

// =============================================
// REVIEWS API
// =============================================

export interface CreateReviewPayload {
  pedido_id: string;
  nota: number;
  comentario?: string;
}

export interface RestaurantRating {
  media: number;
  total: number;
  distribuicao: Record<number, number>;
}

export const reviewsApi = {
  getReviews: async (limit = 10, offset = 0): Promise<ApiResponse<Review[]>> => {
    const response = await api.get<ApiResponse<Review[]>>('/reviews', {
      params: { limit, offset },
    });
    return response.data;
  },

  getReview: async (id: string): Promise<Review> => {
    const response = await api.get<ApiResponse<Review>>(`/reviews/${id}`);
    return response.data.data!;
  },

  getOrderReview: async (orderId: string): Promise<Review | null> => {
    const response = await api.get<ApiResponse<Review>>(`/reviews/order/${orderId}`);
    return response.data.data ?? null;
  },

  getRestaurantRating: async (): Promise<RestaurantRating> => {
    const response = await api.get<ApiResponse<RestaurantRating>>('/reviews/restaurant/rating');
    return response.data.data!;
  },

  createReview: async (data: CreateReviewPayload): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.post<ApiResponse<{ id: string }>>('/reviews', data);
    return response.data;
  },

  respondReview: async (id: string, resposta_restaurante: string): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/reviews/${id}/respond`, {
      resposta_restaurante,
    });
    return response.data;
  },
};