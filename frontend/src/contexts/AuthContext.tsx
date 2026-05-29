/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, type User as ApiUser } from '@/services/api';
import { toast } from 'sonner';

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
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, telefone: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adaptUser = (apiUser: ApiUser): User => {
  let role: User['role'] = 'client';
  switch (apiUser.role) {
    case 'administrador': role = 'admin'; break;
    case 'gerente': role = 'manager'; break;
    case 'garcom': role = 'waiter'; break;
    case 'cozinha': role = 'kitchen'; break;
    case 'entregador': role = 'delivery'; break;
    default: role = 'client';
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!isLocalStorageAvailable()) {
          setIsLoading(false);
          return;
        }
        const token = localStorage.getItem('restaurant_token');
        if (token) {
          const response = await authApi.getProfile();
          if (response.success && response.data) {
            setUser(adaptUser(response.data));
          } else {
            localStorage.removeItem('restaurant_token');
            localStorage.removeItem('restaurant_user');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('restaurant_token');
        localStorage.removeItem('restaurant_user');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Determina se o campo é email ou telefone (simples heurística)
      const isEmail = emailOrPhone.includes('@');
      const response = await authApi.login(
        isEmail ? emailOrPhone : '',
        !isEmail ? emailOrPhone : '',
        password
      );
      if (response.success && response.data) {
        const { token, user: apiUser } = response.data;
        if (isLocalStorageAvailable()) {
          localStorage.setItem('restaurant_token', token);
          const adaptedUser = adaptUser(apiUser);
          localStorage.setItem('restaurant_user', JSON.stringify(adaptedUser));
        }
        setUser(adaptUser(apiUser));
        toast.success('Login realizado com sucesso!');
        return true;
      }
      toast.error(response.message || 'Erro ao fazer login');
      return false;
    } catch (error: any) {
      console.error('Erro no login:', error);
      const msg = error.response?.data?.message || 'Credenciais inválidas. Verifique email/telefone e senha.';
      toast.error(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (isLocalStorageAvailable()) {
      localStorage.removeItem('restaurant_user');
      localStorage.removeItem('restaurant_token');
    }
    toast.info('Logout realizado com sucesso');
    // Força recarregamento da página para garantir limpeza de estado
    window.location.href = '/auth';
  };

  const register = async (name: string, email: string, password: string, telefone: string): Promise<boolean> => {
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
        if (isLocalStorageAvailable()) {
          localStorage.setItem('restaurant_token', token);
          localStorage.setItem('restaurant_user', JSON.stringify(adaptUser(apiUser)));
        }
        setUser(adaptUser(apiUser));
        toast.success('Cadastro realizado com sucesso!');
        return true;
      }
      toast.error(response.message || 'Erro ao fazer cadastro');
      return false;
    } catch (error: any) {
      console.error('Erro no registro:', error);
      const msg = error.response?.data?.message || 'Erro ao cadastrar. Verifique se o telefone já está cadastrado.';
      toast.error(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}