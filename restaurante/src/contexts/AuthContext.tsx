import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, type User as ApiUser } from '@/services/api';
import { toast } from 'sonner';

// Verificar se localStorage está disponível
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Adapter para compatibilidade com tipos antigos do frontend
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
  login: (email: string, password: string, telefone?: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, telefone: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para converter usuário da API para formato do frontend
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
    case 'cliente':
    default:
      role = 'client';
      break;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!isLocalStorageAvailable()) {
          console.warn('localStorage não está disponível');
          setIsLoading(false);
          return;
        }

        const storedUser = localStorage.getItem('restaurant_user');
        const token = localStorage.getItem('restaurant_token');

        if (storedUser && token) {
          // Validar token com a API
          try {
            const response = await authApi.getProfile();
            if (response.success && response.data) {
              setUser(adaptUser(response.data));
            }
          } catch (error) {
            // Token inválido, limpar localStorage
            try {
              localStorage.removeItem('restaurant_user');
              localStorage.removeItem('restaurant_token');
            } catch (e) {
              // Ignorar erro ao limpar
            }
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, telefone?: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // A API aceita email OU telefone
      const response = await authApi.login(
        email || '',
        telefone || '',
        password
      );

      if (response.success && response.data) {
        const { token, user: apiUser } = response.data;

        // Salvar token e usuário com proteção
        try {
          if (isLocalStorageAvailable()) {
            localStorage.setItem('restaurant_token', token);
            const adaptedUser = adaptUser(apiUser);
            localStorage.setItem('restaurant_user', JSON.stringify(adaptedUser));
          }
        } catch (storageError) {
          console.warn('Não foi possível salvar no localStorage:', storageError);
        }

        const adaptedUser = adaptUser(apiUser);
        setUser(adaptedUser);

        toast.success('Login realizado com sucesso!');
        return true;
      }

      toast.error(response.message || 'Erro ao fazer login');
      return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Erro no login:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      if (isLocalStorageAvailable()) {
        localStorage.removeItem('restaurant_user');
        localStorage.removeItem('restaurant_token');
      }
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
    }
    toast.info('Logout realizado com sucesso');
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    telefone: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await authApi.register({
        nome_completo: name,
        telefone,
        email,
        senha: password,
      });

      if (response.success && response.data) {
        const { token, user: apiUser } = response.data;

        // Salvar token e usuário com proteção
        try {
          if (isLocalStorageAvailable()) {
            localStorage.setItem('restaurant_token', token);
            const adaptedUser = adaptUser(apiUser);
            localStorage.setItem('restaurant_user', JSON.stringify(adaptedUser));
          }
        } catch (storageError) {
          console.warn('Não foi possível salvar no localStorage:', storageError);
        }

        const adaptedUser = adaptUser(apiUser);
        setUser(adaptedUser);

        toast.success('Cadastro realizado com sucesso!');
        return true;
      }

      toast.error(response.message || 'Erro ao fazer cadastro');
      return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Erro no registro:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao fazer cadastro. Tente novamente.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
