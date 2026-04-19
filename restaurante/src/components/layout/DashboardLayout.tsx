import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Home,
  ShoppingBag,
  Calendar,
  Users,
  ChefHat,
  Truck,
  BarChart3,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type UserRole = 'cliente' | 'administrador' | 'garcom' | 'cozinha' | 'entregador' | 'gerente';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Cliente
  { label: 'Visão Geral', href: '/cliente', icon: Home, roles: ['cliente'] },
  { label: 'Meus Pedidos', href: '/cliente/pedidos', icon: ShoppingBag, roles: ['cliente'] },
  { label: 'Minhas Reservas', href: '/cliente/reservas', icon: Calendar, roles: ['cliente'] },
  { label: 'Perfil', href: '/cliente/perfil', icon: User, roles: ['cliente'] },
  
  // Admin / Gerente
  { label: 'Dashboard', href: '/admin', icon: BarChart3, roles: ['administrador', 'gerente'] },
  { label: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag, roles: ['administrador', 'gerente'] },
  { label: 'Cardápio', href: '/admin/cardapio', icon: ChefHat, roles: ['administrador', 'gerente'] },
  { label: 'Mesas', href: '/admin/mesas', icon: Users, roles: ['administrador', 'gerente'] },
  { label: 'Reservas', href: '/admin/reservas', icon: Calendar, roles: ['administrador', 'gerente'] },
  { label: 'Usuários', href: '/admin/usuarios', icon: Users, roles: ['administrador'] },
  { label: 'Configurações', href: '/admin/configuracoes', icon: Settings, roles: ['administrador', 'gerente'] },
  
  // Garçom
  { label: 'Mesas', href: '/garcom', icon: Users, roles: ['garcom'] },
  { label: 'Pedidos em Aberto', href: '/garcom/pedidos', icon: ShoppingBag, roles: ['garcom'] },
  
  // Cozinha
  { label: 'Pedidos Pendentes', href: '/cozinha', icon: ChefHat, roles: ['cozinha'] },
  { label: 'Histórico', href: '/cozinha/historico', icon: ShoppingBag, roles: ['cozinha'] },
  
  // Entregador
  { label: 'Entregas', href: '/entregador', icon: Truck, roles: ['entregador'] },
  { label: 'Histórico', href: '/entregador/historico', icon: ShoppingBag, roles: ['entregador'] },
];

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" variant="icon" />
            <span className="font-display text-lg font-semibold">GHU</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-sidebar-primary flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate capitalize">{role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link to="/">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}