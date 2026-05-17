import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/menu', label: 'Menu' },
    { href: '/reservas', label: 'Reservas' },
    { href: '/sobre', label: 'Sobre' },
  ];

  const isActive = (href: string) => {
    if (href.includes('#')) {
      return location.pathname === '/' && location.hash === href.replace('/', '');
    }

    return location.pathname === href;
  };

  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'manager':
        return '/gerente';
      case 'waiter':
        return '/garcom';
      case 'kitchen':
        return '/cozinha';
      case 'delivery':
        return '/entregador';
      case 'client':
      default:
        return '/cliente';
    }
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="container px-4">
        <div className="flex h-[4.5rem] items-center justify-between gap-3 py-3 md:h-20">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-[1.01]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-accent">
              <span className="font-display text-sm font-bold text-white">GHU</span>
            </div>
            <Logo size="md" variant="full" />
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-border/80 bg-white/90 p-1 shadow-sm lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive(link.href)
                    ? 'bg-secondary text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/80 hover:text-primary'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="outline"
              size="icon"
              className="relative border-white bg-white/90"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full border-white bg-white/90">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                      <span className="text-sm font-medium text-primary-foreground">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardRoute(user?.role || 'client')}>
                      Meu Painel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="hidden md:flex">
                <Link to="/auth">
                  <User className="mr-2 h-4 w-4" />
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              className="border-white bg-white/90 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="animate-fade-in border-t border-border py-4 lg:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive(link.href) ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {!isAuthenticated && (
                <Button asChild className="w-full">
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="mr-2 h-4 w-4" />
                    Entrar / Criar Conta
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
