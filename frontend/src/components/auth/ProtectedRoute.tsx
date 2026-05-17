import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'cliente' | 'administrador' | 'garcom' | 'cozinha' | 'entregador' | 'gerente';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  allowedRoles = [], 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role as UserRole)) {
    // Redireciona para o dashboard padrão da role do usuário
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
}