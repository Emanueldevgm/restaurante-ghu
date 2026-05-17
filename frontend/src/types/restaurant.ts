// Importa MenuItem da API
import { MenuItem } from '@/services/api';

// Re-exporta os tipos da API para o resto do frontend
export type { 
  MenuItem, 
  Category, 
  Table, 
  Reservation, 
  User as ApiUser 
} from '@/services/api';

// Tipo para o usuário no frontend (compatível com o AuthContext)
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  avatar?: string;
  telefone?: string;
}

// Tipo para o item do carrinho (MenuItem + quantidade)
export interface CartItem extends MenuItem {
  quantity: number;
}

// Tipo para pedido (exibição no cliente)
export interface Order {
  id: string;
  numero_pedido: number;
  tipo: 'delivery' | 'retirada' | 'mesa';
  status: string;
  total: number;
  items: CartItem[];
  createdAt: string;
  mesa_numero?: string;
}

// Tipo para avaliação (ainda não implementado no backend, mas deixamos)
export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Tipo para exibição no ProductCard (adaptado da API)
export interface AdaptedMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string | unknown;
  tags: ('bestseller' | 'new' | 'promotion')[];
  rating: number;
  reviewCount: number;
  originalItem?: MenuItem; // O item original da API para uso no carrinho
}

// Tipo para log de acesso (local)
export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'admin' | 'client';
  action: 'login' | 'logout' | 'page_visit' | 'menu_view' | 'reservation' | 'order' | 'admin_access';
  page?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}