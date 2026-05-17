import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
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
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Elementos decorativos suaves (opcional mas mantidos) */}
      <div className="absolute left-[-6rem] top-24 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />
      <div className="absolute bottom-0 right-[-4rem] h-80 w-80 rounded-full bg-blue-50 blur-3xl" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-700 font-medium">Aguarde...</p>
          </div>
        </div>
      )}

      {/* Container centralizado */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          {/* Cabeçalho */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
              {formMode === 'login' ? 'Acesso seguro' : 'Novo cadastro'}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {formMode === 'login' ? 'Bem-vindo de volta' : 'Crie a sua conta'}
            </h2>
            <p className="mt-3 text-gray-600">
              {formMode === 'login'
                ? 'Entre com as suas credenciais para continuar.'
                : 'Comece agora a sua jornada gastronómica.'}
            </p>
          </div>

          {/* Cartão do formulário */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">
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
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      Recuperar senha
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10"
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
                    Lembrar de mim
                  </label>
                </div>

                <Button type="submit" className="w-full py-6 text-base" disabled={isLoading}>
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
                  <Label htmlFor="register-name">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="register-name"
                      placeholder="Nome completo"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="pl-10"
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
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="+244 923 456 789"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="pl-10"
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
                      placeholder="Mínimo 6 caracteres"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-10 pr-10"
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

                <Button type="submit" className="w-full py-6 text-base" disabled={isLoading}>
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
          </div>

          {/* Separador "ou" */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-500">ou</span>
            </div>
          </div>

          {/* Alternância entre login/cadastro */}
          <p className="text-center text-sm text-gray-600">
            {formMode === 'login' ? (
              <>
                Não tem uma conta?{' '}
                <button
                  type="button"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
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
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
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
  );
}