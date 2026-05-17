import axios from 'axios';

// Configuração base da API
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem('restaurant_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn('Erro ao acessar localStorage:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            try {
                localStorage.removeItem('restaurant_token');
                localStorage.removeItem('restaurant_user');
            } catch (e) {
                console.warn('Erro ao limpar localStorage:', e);
            }
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default api;

// ============ INTERFACES ============

export interface User {
    id: string;
    nome_completo: string;
    email: string | null;
    telefone: string;
    role: 'cliente' | 'administrador' | 'garcom' | 'cozinha' | 'entregador' | 'gerente';
    foto_perfil?: string | null;
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
    vegetariano: boolean;
    vegano: boolean;
    sem_gluten: boolean;
    picante: boolean;
    status: 'disponivel' | 'indisponivel' | 'esgotado';
    destaque: boolean;
    prato_do_dia: boolean;
    imagem: string | null;
}

export interface Category {
    id: string;
    nome: string;
    nome_en: string | null;
    descricao: string | null;
    imagem: string | null;
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
    nome_cliente: string;
    telefone_cliente: string;
    email_cliente: string | null;
    quantidade_pessoas: number;
    data_reserva: string;
    hora_reserva: string;
    status: 'pendente' | 'confirmada' | 'em_andamento' | 'finalizada' | 'cancelada' | 'nao_compareceu';
    ocasiao_especial: string | null;
    observacoes: string | null;
}

// ============ AUTH API ============

export const authApi = {
    login: async (email: string, telefone: string, senha: string): Promise<AuthResponse> => {
        const payload = { senha };
        
        // Adicionar apenas campos não-vazios
        if (email && email.trim()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (payload as any).email = email;
        }
        if (telefone && telefone.trim()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (payload as any).telefone = telefone;
        }
        
        const response = await api.post<AuthResponse>('/auth/login', payload);
        return response.data;
    },

    register: async (data: {
        nome_completo: string;
        telefone: string;
        email?: string;
        senha: string;
    }): Promise<AuthResponse> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = {
            nome_completo: data.nome_completo,
            telefone: data.telefone,
            senha: data.senha,
        };
        
        // Adicionar email apenas se não estiver vazio
        if (data.email && data.email.trim()) {
            payload.email = data.email;
        }
        
        const response = await api.post<AuthResponse>('/auth/register', payload);
        return response.data;
    },

    getProfile: async (): Promise<{ success: boolean; data: User }> => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (data: Partial<User>): Promise<{ success: boolean; message: string }> => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },

    changePassword: async (senhaAtual: string, novaSenha: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.put('/auth/change-password', {
            senha_atual: senhaAtual,
            nova_senha: novaSenha,
        });
        return response.data;
    },

    listUsers: async (): Promise<{ success: boolean; data: User[] }> => {
        const response = await api.get('/auth/users');
        return response.data;
    },

    createUser: async (userData: {
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
    }): Promise<{ success: boolean; message: string; data: { user: User } }> => {
        const response = await api.post('/auth/users', userData);
        return response.data;
    },
};

// ============ MENU API ============

export const menuApi = {
    getCategories: async (): Promise<Category[]> => {
        const response = await api.get('/menu/categories');
        return response.data.data;
    },

    getMenuItems: async (filters?: {
        categoria_id?: string;
        destaque?: boolean;
        prato_do_dia?: boolean;
        vegetariano?: boolean;
        search?: string;
    }): Promise<MenuItem[]> => {
        const response = await api.get('/menu/items', { params: filters });
        return response.data.data;
    },

    getMenuItem: async (id: string): Promise<MenuItem> => {
        const response = await api.get(`/menu/items/${id}`);
        return response.data.data;
    },

    // ADMIN ONLY
    createMenuItem: async (data: Partial<MenuItem>): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/menu/items', data);
        return response.data;
    },

    updateMenuItem: async (id: string, data: Partial<MenuItem>): Promise<{ success: boolean; message: string }> => {
        const response = await api.put(`/menu/items/${id}`, data);
        return response.data;
    },

    deleteMenuItem: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/menu/items/${id}`);
        return response.data;
    },
};

// ============ TABLES API ============

export const tablesApi = {
    getTables: async (): Promise<Table[]> => {
        const response = await api.get('/tables');
        return response.data.data;
    },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTableStatus: async (): Promise<any> => {
        const response = await api.get('/tables/status');
        return response.data.data;
    },

    // ADMIN ONLY
    createTable: async (data: Partial<Table>): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/tables', data);
        return response.data;
    },

    updateTable: async (id: string, data: Partial<Table>): Promise<{ success: boolean; message: string }> => {
        const response = await api.put(`/tables/${id}`, data);
        return response.data;
    },

    toggleTable: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.patch(`/tables/${id}/toggle`);
        return response.data;
    },

    deleteTable: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/tables/${id}`);
        return response.data;
    },
};

// ============ RESERVATIONS API ============

export const reservationsApi = {
    createReservation: async (data: {
        nome_cliente: string;
        telefone_cliente: string;
        email_cliente?: string;
        quantidade_pessoas: number;
        data_reserva: string;
        hora_reserva: string;
        mesa_id?: string;
        ocasiao_especial?: string;
        observacoes?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }): Promise<{ success: boolean; message: string; data?: any }> => {
        const response = await api.post('/reservations', data);
        return response.data;
    },

    getMyReservations: async (): Promise<Reservation[]> => {
        const response = await api.get('/reservations/my-reservations');
        return response.data.data;
    },

    cancelReservation: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/reservations/${id}`);
        return response.data;
    },

    // ADMIN ONLY
    getAllReservations: async (): Promise<Reservation[]> => {
        const response = await api.get('/reservations/admin/all');
        return response.data.data;
    },

    confirmReservation: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.patch(`/reservations/${id}/confirm`);
        return response.data;
    },

    checkInReservation: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.patch(`/reservations/${id}/check-in`);
        return response.data;
    },

    checkOutReservation: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.patch(`/reservations/${id}/check-out`);
        return response.data;
    },

    getReservation: async (id: string): Promise<Reservation> => {
        const response = await api.get(`/reservations/${id}`);
        return response.data.data;
    },

    updateReservationStatus: async (
        id: string,
        status: 'pendente' | 'confirmada' | 'em_andamento' | 'finalizada' | 'cancelada' | 'nao_compareceu'
    ): Promise<{ success: boolean; message: string }> => {
        const response = await api.patch(`/reservations/${id}/status`, { status });
        return response.data;
    },
};

// ============ ORDERS API ============

export const ordersApi = {
    createOrder: async (data: {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }): Promise<{ success: boolean; message: string; data?: any }> => {
        const response = await api.post('/orders', data);
        return response.data;
    },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMyOrders: async (): Promise<any[]> => {
        const response = await api.get('/orders/my-orders');
        return response.data.data;
    },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getOrder: async (id: string): Promise<any> => {
        const response = await api.get(`/orders/${id}`);
        return response.data.data;
    },

    cancelOrder: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.patch(`/orders/${id}/cancel`);
        return response.data;
    },

    // ADMIN ONLY
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getAllOrders: async (): Promise<any[]> => {
        const response = await api.get('/orders/admin/all');
        return response.data.data;
    },

    updateOrderStatus: async (
        id: string,
        status: 'confirmado' | 'em_preparo' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado'
    ): Promise<{ success: boolean; message: string }> => {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
    },
};

// ============ REVIEWS API ============

export interface Review {
    id: string;
    pedido_id: string;
    usuario_id: string;
    usuario_nome?: string;
    nota_comida: number;
    nota_entrega: number;
    nota_atendimento: number;
    nota_preco: number;
    nota_geral: number;
    comentario?: string;
    resposta_restaurante?: string;
    publicar: boolean;
    data_criacao: string;
    data_atualizacao?: string;
}

export interface RestaurantRating {
    total_avaliacoes: number;
    media_geral: number;
    cinco_estrelas: number;
    quatro_estrelas: number;
    tres_estrelas: number;
    baixas_avaliacoes: number;
}

export const reviewsApi = {
    getReviews: async (limit = 10, offset = 0): Promise<{ data: Review[]; pagination: { limit: number; offset: number } }> => {
        const response = await api.get('/reviews', { params: { limit, offset } });
        return response.data;
    },

    getReview: async (id: string): Promise<Review> => {
        const response = await api.get(`/reviews/${id}`);
        return response.data.data;
    },

    getOrderReview: async (orderId: string): Promise<Review | null> => {
        const response = await api.get(`/reviews/order/${orderId}`);
        return response.data.data;
    },

    getRestaurantRating: async (): Promise<RestaurantRating> => {
        const response = await api.get('/reviews/restaurant/rating');
        return response.data.data;
    },

    createReview: async (data: {
        pedido_id: string;
        nota_comida: number;
        nota_entrega: number;
        nota_atendimento: number;
        nota_preco: number;
        comentario?: string;
    }): Promise<{ success: boolean; message: string; data?: { id: string } }> => {
        const response = await api.post('/reviews', data);
        return response.data;
    },

    respondReview: async (id: string, resposta_restaurante: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.put(`/reviews/${id}/respond`, { resposta_restaurante });
        return response.data;
    },
};
