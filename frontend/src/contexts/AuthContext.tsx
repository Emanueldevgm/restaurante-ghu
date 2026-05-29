import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, type User as ApiUser } from '@/services/api';
import { toast } from 'sonner';

// =============================================
// UTILITÁRIOS
// =============================================

const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// =============================================
// TIPOS
// =============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'waiter' | 'kitchen' | 'delivery' | 'client';
  avatar?: string;
  telefone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, telefone: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================
// ADAPTADOR
// =============================================

const adaptUser = (apiUser: ApiUser): User => {
  let role: User['role'] = 'client';
  switch (apiUser.role) {
    case 'administrador':
      role = 'admin';
      break;
    case 'gerente':
      role = 'manager';
      break;
    case 'garcom':
      role = 'waiter';
      break;
    case 'cozinha':
      role = 'kitchen';
      break;
    case 'entregador':
      role = 'delivery';
      break;
    default:
      role = 'client';
  }
  return {
    id: apiUser.id,
    name: apiUser.nome_completo,
    email: apiUser.email || '',
    telefone: apiUser.telefone,
    role,
    avatar: apiUser.foto_perfil || undefined,
  };
};

// =============================================
// PROVIDER
// =============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // =============================================
  // INICIALIZAÇÃO RESILIENTE
  // =============================================
  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      if (!isLocalStorageAvailable()) {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('restaurant_token');
      const storedUser = localStorage.getItem('restaurant_user');

      // 🔑 PASSO 1: Se há token e usuário no cache, restaura IMEDIATAMENTE
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
        } catch {
          // Dados corrompidos — limpa
          localStorage.removeItem('restaurant_token');
          localStorage.removeItem('restaurant_user');
        }
      }

      // 🔑 PASSO 2: Validar token em segundo plano (não bloqueia a UI)
      if (token) {
        try {
          const response = await authApi.getProfile();
          if (response.success && response.data) {
            const adaptedUser = adaptUser(response.data);
            setUser(adaptedUser);
            localStorage.setItem('restaurant_user', JSON.stringify(adaptedUser));
          } else {
            // Resposta inesperada — limpa
            throw new Error('Resposta inválida do servidor');
          }
        } catch (error: unknown) {
          const axiosError = error as { response?: { status?: number } };
          // 🔑 Só limpa a sessão se o erro for 401 (token expirado/inválido)
          if (axiosError.response?.status === 401) {
            console.warn('Token expirado — sessão encerrada');
            setUser(null);
            localStorage.removeItem('restaurant_token');
            localStorage.removeItem('restaurant_user');
            toast.error('Sessão expirada. Faça login novamente.');
          } else {
            // 🔑 Backend offline ou erro de rede — mantém sessão do cache
            console.warn('Backend indisponível — usando sessão em cache');
            // Não faz nada — o usuário continua logado com os dados do cache
          }
        }
      }

      // 🔑 PASSO 3: Finaliza o loading
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // =============================================
  // LOGIN
  // =============================================
  const login = useCallback(async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const isEmail = emailOrPhone.includes('@');
      const response = await authApi.login(
        isEmail ? emailOrPhone : '',
        !isEmail ? emailOrPhone : '',
        password,
      );

      if (response.success && response.data) {
        const { token, user: apiUser } = response.data;
        const adaptedUser = adaptUser(apiUser);

        // Guardar no state
        setUser(adaptedUser);

        // Guardar no localStorage
        if (isLocalStorageAvailable()) {
          localStorage.setItem('restaurant_token', token);
          localStorage.setItem('restaurant_user', JSON.stringify(adaptedUser));
        }

        toast.success(`Bem-vindo, ${adaptedUser.name}!`);
        return true;
      }

      toast.error(response.message || 'Erro ao fazer login');
      return false;
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const msg =
        axiosError.response?.data?.message ||
        'Credenciais inválidas. Verifique email/telefone e senha.';
      toast.error(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =============================================
  // LOGOUT
  // =============================================
  const logout = useCallback((): void => {
    setUser(null);
    if (isLocalStorageAvailable()) {
      localStorage.removeItem('restaurant_token');
      localStorage.removeItem('restaurant_user');
    }
    toast.info('Sessão terminada');
    window.location.href = '/auth';
  }, []);

  // =============================================
  // REGISTER
  // =============================================
  const register = useCallback(
    async (name: string, email: string, password: string, telefone: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        const response = await authApi.register({
          nome_completo: name,
          telefone,
          email: email || undefined,
          senha: password,
        });

        if (response.success && response.data) {
          const { token, user: apiUser } = response.data;
          const adaptedUser = adaptUser(apiUser);

          // Guardar no state
          setUser(adaptedUser);

          // Guardar no localStorage
          if (isLocalStorageAvailable()) {
            localStorage.setItem('restaurant_token', token);
            localStorage.setItem('restaurant_user', JSON.stringify(adaptedUser));
          }

          toast.success('Conta criada com sucesso!');
          return true;
        }

        toast.error(response.message || 'Erro ao criar conta');
        return false;
      } catch (error: unknown) {
        console.error('Erro no registro:', error);
        const axiosError = error as { response?: { data?: { message?: string } } };
        const msg =
          axiosError.response?.data?.message ||
          'Erro ao cadastrar. Verifique se o telefone já está cadastrado.';
        toast.error(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // =============================================
  // VALOR DO CONTEXTO
  // =============================================
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================
// HOOK
// =============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}