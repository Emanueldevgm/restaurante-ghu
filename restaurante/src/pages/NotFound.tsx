import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">
        {/* Ícone decorativo animado */}
        <div className="mb-8 animate-scale-in">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-primary/10 rounded-full p-6 inline-block">
              <UtensilsCrossed className="w-16 h-16 text-accent" />
            </div>
          </div>
        </div>

        {/* Título 404 estilizado */}
        <h1 className="font-display text-8xl md:text-9xl font-bold text-primary mb-4 animate-fade-up">
          404
        </h1>
        
        {/* Mensagem de erro */}
        <div className="space-y-2 mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground">
            Oops! A página que você está procurando pode ter sido removida, 
            renomeada ou está temporariamente indisponível.
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Button asChild size="lg" className="group">
            <Link to="/">
              <Home className="w-4 h-4 mr-2 transition-transform group-hover:-translate-y-0.5" />
              Voltar ao início
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="group">
            <Link to="/#menu">
              <UtensilsCrossed className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
              Ver cardápio
            </Link>
          </Button>
        </div>

        {/* Link adicional para página de reservas */}
        <p className="mt-8 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "0.3s" }}>
          Ou acesse a{" "}
          <Link to="/reservas" className="text-accent hover:underline">
            página de reservas
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default NotFound;