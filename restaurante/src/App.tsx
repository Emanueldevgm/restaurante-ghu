import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AccessLogProvider } from "@/contexts/AccessLogContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AccessTracker } from "@/components/AccessTracker";
import Index from "./pages/Index";
import About from "./pages/About";
import Reservas from "./pages/Reservas";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Cliente from "./pages/Cliente";
import Gerente from "./pages/Gerente";
import Garcom from "./pages/Garcom";
import Cozinha from "./pages/Cozinha";
import Entregador from "./pages/Entregador";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessLogProvider>
          <CartProvider>
            <AccessTracker>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/sobre" element={<About />} />
                    <Route path="/reservas" element={<Reservas />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/gerente" element={<Gerente />} />
                    <Route path="/garcom" element={<Garcom />} />
                    <Route path="/cozinha" element={<Cozinha />} />
                    <Route path="/entregador" element={<Entregador />} />
                    <Route path="/cliente" element={<Cliente />} />
                    <Route path="/menu" element={<Menu />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </AccessTracker>
          </CartProvider>
        </AccessLogProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
