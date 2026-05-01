import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [formMode, setFormMode] = useState<'login' | 'register'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loggedUser = await login(loginEmail, loginPassword);

      if (loggedUser) {
        toast.success('Bem-vindo de volta!');
        const storedUser = localStorage.getItem('restaurant_user');

        if (storedUser) {
          const userData = JSON.parse(storedUser);

          switch (userData.role) {
            case 'admin':
              navigate('/admin');
              break;
            case 'manager':
              navigate('/gerente');
              break;
            case 'waiter':
              navigate('/garcom');
              break;
            case 'kitchen':
              navigate('/cozinha');
              break;
            case 'delivery':
              navigate('/entregador');
              break;
            default:
              navigate('/cliente');
          }
        } else {
          navigate('/cliente');
        }
      } else {
        toast.error('Email ou senha incorretos.');
      }
    } catch {
      toast.error('Erro ao fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await register(
        registerName,
        registerEmail,
        registerPassword,
        registerPhone,
      );

      if (success) {
        toast.success('Conta criada com sucesso!');
        navigate('/cliente');
      } else {
        toast.error('Erro ao criar conta.');
      }
    } catch {
      toast.error('Erro no cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-700">Entrando...</p>
          </div>
        </div>
      )}
      <div className="overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="absolute left-[-6rem] top-24 h-72 w-72 rounded-full bg-gray-100 blur-3xl" />
        <div className="absolute bottom-0 right-[-4rem] h-80 w-80 rounded-full bg-gray-100 blur-3xl" />

        <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-lg lg:grid-cols-2">
          <div className="relative hidden overflow-hidden bg-gray-50 p-12 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-20 -translate-y-20 rounded-full bg-gray-200" />
            <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-20 translate-y-20 rounded-full bg-gray-200 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Plataforma moderna para restaurante
              </div>
              <h1 className="font-display mb-4 text-5xl font-bold leading-tight text-gray-900">
                O seu sistema agora tem presença premium.
              </h1>
              <p className="max-w-md text-lg text-gray-600">
                Entradas, pedidos, reservas e perfil do cliente numa experiência limpa, confiável e agradável em qualquer tela.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-gray-200">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Fluxo rápido para login e cadastro</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-gray-200">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-sm">Pagamentos e acessos com mais confiança visual</span>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-3xl border border-gray-200 bg-white p-5">
                <div>
                  <p className="text-3xl font-bold text-gray-900">24/7</p>
                  <p className="text-sm text-gray-500">reservas e pedidos online</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">4.9</p>
                  <p className="text-sm text-gray-500">experiência média dos clientes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-white p-6 sm:p-8 lg:p-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-gray-700">
                  {formMode === 'login' ? 'Acesso seguro' : 'Novo cadastro'}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  {formMode === 'login' ? 'Bem-vindo de volta' : 'Crie a sua conta'}
                </h2>
                <p className="mt-2 text-gray-600">
                  {formMode === 'login'
                    ? 'Entre com as suas credenciais para continuar no sistema.'
                    : 'Comece agora a sua jornada gastronomica com uma conta moderna.'}
                </p>
              </div>

              {formMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Digite o seu email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        Recuperar senha
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label htmlFor="remember-me" className="cursor-pointer text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>

                  <Button type="submit" className="w-full py-6 text-base hover:scale-105 active:scale-95 transition-all duration-200" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Entrar
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="register-name"
                        placeholder="Nome completo"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="pl-10 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="voce@exemplo.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+244 923 456 789"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        className="pl-10 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="Minimo de 6 caracteres"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10 pr-10 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full py-6 text-base hover:scale-105 active:scale-95 transition-all duration-200" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Criar conta
                      </>
                    )}
                  </Button>
                </form>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-gray-500">or</span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600">
                {formMode === 'login' ? (
                  <>
                    Nao tem uma conta?{' '}
                    <button
                      type="button"
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      onClick={() => setFormMode('register')}
                    >
                      Criar conta
                    </button>
                  </>
                ) : (
                  <>
                    Já tem uma conta?{' '}
                    <button
                      type="button"
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      onClick={() => setFormMode('login')}
                    >
                      Entrar
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}