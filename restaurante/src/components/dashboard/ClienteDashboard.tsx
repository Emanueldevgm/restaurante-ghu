import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClienteOverview } from '@/components/dashboard/cliente/Overview';
import { ClientePedidos } from '@/components/dashboard/cliente/Pedidos';
import { ClienteReservas } from '@/components/dashboard/cliente/Reservas';
import { ClientePerfil } from '@/components/dashboard/cliente/Perfil';

export default function ClienteDashboard() {
  return (
    <DashboardLayout role="cliente">
      <Routes>
        <Route path="/" element={<ClienteOverview />} />
        <Route path="/pedidos" element={<ClientePedidos />} />
        <Route path="/reservas" element={<ClienteReservas />} />
        <Route path="/perfil" element={<ClientePerfil />} />
      </Routes>
    </DashboardLayout>
  );
}