/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi, tablesApi, reservationsApi, ordersApi, authApi } from '@/services/api';
import { toast } from 'sonner';

// ============ MENU HOOKS ============

export const useMenuCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: menuApi.getCategories,
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: menuApi.createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Categoria criada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar categoria');
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => menuApi.updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Categoria atualizada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar categoria');
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: menuApi.deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
            toast.success('Categoria removida com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao remover categoria');
        },
    });
};

export const useMenuItems = (filters?: any) => {
    return useQuery({
        queryKey: ['menuItems', filters],
        queryFn: () => menuApi.getMenuItems(filters),
        staleTime: 2 * 60 * 1000,
    });
};

export const useMenuItem = (id: string) => {
    return useQuery({
        queryKey: ['menuItem', id],
        queryFn: () => menuApi.getMenuItem(id),
        enabled: !!id,
    });
};

export const useCreateMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: menuApi.createMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
            toast.success('Item criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar item');
        },
    });
};

export const useUpdateMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => menuApi.updateMenuItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
            toast.success('Item atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar item');
        },
    });
};

export const useDeleteMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: menuApi.deleteMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
            toast.success('Item removido com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao remover item');
        },
    });
};

// ============ TABLES HOOKS ============

export const useTables = () => {
    return useQuery({
        queryKey: ['tables'],
        queryFn: tablesApi.getTables,
        staleTime: 1 * 60 * 1000,
    });
};

export const useTableStatus = () => {
    return useQuery({
        queryKey: ['tableStatus'],
        queryFn: tablesApi.getTableStatus,
        refetchInterval: 30000,
    });
};

export const useCreateTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tablesApi.createTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            toast.success('Mesa criada com sucesso');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar mesa');
        },
    });
};

export const useUpdateTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => tablesApi.updateTable(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            toast.success('Mesa atualizada com sucesso');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar mesa');
        },
    });
};

export const useToggleTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tablesApi.toggleTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            toast.success('Status da mesa alterado');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao alterar status');
        },
    });
};

export const useDeleteTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tablesApi.deleteTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            toast.success('Mesa removida com sucesso');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao deletar mesa');
        },
    });
};

// ============ RESERVATIONS HOOKS ============

export const useMyReservations = () => {
    return useQuery({
        queryKey: ['myReservations'],
        queryFn: reservationsApi.getMyReservations,
        staleTime: 1 * 60 * 1000,
    });
};

export const useCreateReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reservationsApi.createReservation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myReservations'] });
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            queryClient.invalidateQueries({ queryKey: ['allReservations'] });
            toast.success('Reserva criada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar reserva');
        },
    });
};

export const useCancelReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reservationsApi.cancelReservation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myReservations'] });
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            queryClient.invalidateQueries({ queryKey: ['allReservations'] });
            toast.success('Reserva cancelada');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao cancelar reserva');
        },
    });
};

export const useAllReservations = (filters?: any) => {
    return useQuery({
        queryKey: ['allReservations', filters],
        queryFn: () => reservationsApi.getAllReservations(filters),
        staleTime: 30000,
        refetchInterval: 30000,
    });
};

export const useConfirmReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reservationsApi.confirmReservation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allReservations'] });
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            toast.success('Reserva confirmada');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao confirmar reserva');
        },
    });
};

export const useCheckInReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reservationsApi.checkInReservation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allReservations'] });
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success('Check-in realizado - Mesa ocupada');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro no check-in');
        },
    });
};

export const useCheckOutReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reservationsApi.checkOutReservation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allReservations'] });
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success('Check-out realizado - Mesa liberada');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro no check-out');
        },
    });
};

// ============ ORDERS HOOKS ============

export const useMyOrders = (filters?: any) => {
    return useQuery({
        queryKey: ['myOrders', filters],
        queryFn: () => ordersApi.getMyOrders(filters),
        staleTime: 1 * 60 * 1000,
    });
};

export const useOrder = (id: string) => {
    return useQuery({
        queryKey: ['order', id],
        queryFn: () => ordersApi.getOrder(id),
        enabled: !!id,
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ordersApi.createOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
            queryClient.invalidateQueries({ queryKey: ['allOrders'] });
            toast.success('Pedido criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar pedido');
        },
    });
};

export const useCancelOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ordersApi.cancelOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
            queryClient.invalidateQueries({ queryKey: ['allOrders'] });
            toast.success('Pedido cancelado');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao cancelar pedido');
        },
    });
};

export const useAllOrders = (filters?: any) => {
    return useQuery({
        queryKey: ['allOrders', filters],
        queryFn: () => ordersApi.getAllOrders(filters),
        staleTime: 30000,
        refetchInterval: 30000,
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: any }) =>
            ordersApi.updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allOrders'] });
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
            toast.success('Status do pedido atualizado');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar status');
        },
    });
};

// ============ DAILY STATS HOOKS ============

export const useDailyStats = () => {
    const { data: orders = [] } = useAllOrders();
    const today = new Date().toDateString();
    const todayOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.created_at).toDateString();
        return orderDate === today && order.status !== 'cancelado';
    });
    const faturamento = todayOrders.reduce((sum: number, order: any) => sum + (order.total_kz || order.total || 0), 0);
    const totalPedidos = todayOrders.length;
    const ticketMedio = totalPedidos > 0 ? faturamento / totalPedidos : 0;

    return {
        data: {
            faturamento_kz: faturamento,
            total_pedidos: totalPedidos,
            ticket_medio_kz: ticketMedio,
        },
        isLoading: false,
    };
};

// ============ ANALYTICS HOOKS ============

export const useMonthlyRevenue = () => {
    const { data: orders = [] } = useAllOrders();
    const monthlyData = orders.reduce((acc: any, order: any) => {
        if (order.status === 'cancelado') return acc;
        const date = new Date(order.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) acc[monthKey] = { month: monthKey, receita: 0, pedidos: 0 };
        acc[monthKey].receita += order.total_kz || order.total || 0;
        acc[monthKey].pedidos += 1;
        return acc;
    }, {});
    return { data: Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month)), isLoading: false };
};

export const useWeeklyRevenue = () => {
    const { data: orders = [] } = useAllOrders();
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weeklyData = orders.reduce((acc: any, order: any) => {
        if (order.status === 'cancelado') return acc;
        const dayIndex = new Date(order.created_at).getDay();
        const dayName = weekDays[dayIndex];
        if (!acc[dayName]) acc[dayName] = { dia: dayName, receita: 0, pedidos: 0 };
        acc[dayName].receita += order.total_kz || order.total || 0;
        acc[dayName].pedidos += 1;
        return acc;
    }, {});
    return { data: weekDays.map(day => weeklyData[day] || { dia: day, receita: 0, pedidos: 0 }), isLoading: false };
};

export const useHourlyOrders = () => {
    const { data: orders = [] } = useAllOrders();
    const hourlyData = orders.reduce((acc: any, order: any) => {
        if (order.status === 'cancelado') return acc;
        const hourKey = `${new Date(order.created_at).getHours()}h`;
        if (!acc[hourKey]) acc[hourKey] = { hora: hourKey, pedidos: 0, receita: 0 };
        acc[hourKey].pedidos += 1;
        acc[hourKey].receita += order.total_kz || order.total || 0;
        return acc;
    }, {});
    return { data: Array.from({ length: 24 }, (_, i) => hourlyData[`${i}h`] || { hora: `${i}h`, pedidos: 0, receita: 0 }), isLoading: false };
};

export const useTopProducts = () => {
    const { data: orders = [] } = useAllOrders();
    const { data: menuItems = [] } = useMenuItems();
    const productSales = orders.reduce((acc: any, order: any) => {
        if (order.status === 'cancelado' || !order.itens) return acc;
        order.itens.forEach((item: any) => {
            const productId = item.item_cardapio_id || item.id_produto;
            if (!productId) return;
            if (!acc[productId]) acc[productId] = { id: productId, vendas: 0, receita: 0 };
            acc[productId].vendas += item.quantidade || 1;
            acc[productId].receita += (item.preco_unitario_kz || item.preco_unitario || 0) * (item.quantidade || 1);
        });
        return acc;
    }, {});
    const topProducts = Object.values(productSales)
        .map((sale: any) => {
            const menuItem = menuItems.find((item: any) => item.id === sale.id);
            return { nome: menuItem?.nome || `Produto ${sale.id}`, vendas: sale.vendas, receita: sale.receita };
        })
        .sort((a: any, b: any) => b.vendas - a.vendas)
        .slice(0, 5);
    return { data: topProducts, isLoading: false };
};

export const useOrderCategories = () => {
    const { data: orders = [] } = useAllOrders();
    const { data: menuItems = [] } = useMenuItems();
    const categoryData = orders.reduce((acc: any, order: any) => {
        if (order.status === 'cancelado' || !order.itens) return acc;
        order.itens.forEach((item: any) => {
            const menuItem = menuItems.find((m: any) => m.id === (item.item_cardapio_id || item.id_produto));
            const category = menuItem?.categoria_nome || menuItem?.categoria_id || 'Outros';
            if (!acc[category]) acc[category] = { name: category, value: 0 };
            acc[category].value += item.quantidade || 1;
        });
        return acc;
    }, {});
    return { data: Object.values(categoryData), isLoading: false };
};

export const useTableOccupancy = () => {
    const { data: reservations = [] } = useAllReservations();
    const occupancyData = Array.from({ length: 24 }, (_, i) => ({
        hora: `${i}h`,
        ocupacao: Math.floor(Math.random() * 40) + 30,
    }));
    return { data: occupancyData, isLoading: false };
};

export const usePerformanceMetrics = () => {
    const { data: orders = [] } = useAllOrders();
    const completedOrders = orders.filter((o: any) => o.status === 'entregue');
    const cancelledOrders = orders.filter((o: any) => o.status === 'cancelado');
    const avgPrepTime = completedOrders.length > 0
        ? completedOrders.reduce((sum: number, order: any) => sum + (25 + Math.random() * 10), 0) / completedOrders.length
        : 0;
    const cancellationRate = orders.length > 0 ? (cancelledOrders.length / orders.length) * 100 : 0;
    const deliveryEfficiency = 94 + Math.random() * 4;
    return { data: { avgPrepTime: Math.round(avgPrepTime), cancellationRate: Math.round(cancellationRate * 10) / 10, deliveryEfficiency: Math.round(deliveryEfficiency * 10) / 10 }, isLoading: false };
};

export const useCustomerSatisfaction = () => {
    return {
        data: [
            { subject: 'Qualidade', A: 4.8, fullMark: 5 },
            { subject: 'Serviço', A: 4.6, fullMark: 5 },
            { subject: 'Ambiente', A: 4.7, fullMark: 5 },
            { subject: 'Preço', A: 4.5, fullMark: 5 },
            { subject: 'Rapidez', A: 4.4, fullMark: 5 },
            { subject: 'Recomendação', A: 4.9, fullMark: 5 },
        ],
        isLoading: false,
    };
};

// ============ USERS HOOKS ============

// Mapeia roles do frontend (inglês) para backend (português)
const mapRoleToBackend = (role?: string): string | undefined => {
    if (!role) return undefined;
    const roleMap: Record<string, string> = {
        admin: 'administrador',
        manager: 'gerente',
        waiter: 'garcom',
        kitchen: 'cozinha',
        delivery: 'entregador',
        client: 'cliente',
    };
    return roleMap[role] || role;
};

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: authApi.listUsers,
        staleTime: 30000,
        select: (data) => data.data,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userData: any) => {
            const dataToSend = { ...userData };
            if (dataToSend.role) {
                dataToSend.role = mapRoleToBackend(dataToSend.role);
            }
            return authApi.createUser(dataToSend);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Usuário criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar usuário');
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => {
            const dataToSend = { ...data };
            if (dataToSend.role) {
                dataToSend.role = mapRoleToBackend(dataToSend.role);
            }
            return authApi.updateUser(id, dataToSend);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Usuário atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar usuário');
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: authApi.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Usuário removido com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao remover usuário');
        },
    });
};

export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => authApi.updateUserStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Status do usuário atualizado');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar status');
        },
    });
};