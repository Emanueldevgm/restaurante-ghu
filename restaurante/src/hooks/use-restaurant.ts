/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi, tablesApi, reservationsApi, ordersApi, authApi } from '@/services/api';
import { toast } from 'sonner';

// ============ MENU HOOKS ============

export const useMenuCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: menuApi.getCategories,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        refetchInterval: 30000, // Atualiza a cada 30 segundos
    });
};

// Admin - criar/atualizar/deletar mesas
export const useCreateTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tablesApi.createTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success('Mesa criada com sucesso');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar mesa');
        },
    });
};

export const useUpdateTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: ({ id, data }: { id: string; data: any }) => tablesApi.updateTable(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success('Mesa atualizada com sucesso');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar mesa');
        },
    });
};

export const useDeleteTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tablesApi.deleteTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success('Mesa removida com sucesso');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            toast.success('Reserva criada com sucesso!');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            toast.success('Reserva cancelada');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao cancelar reserva');
        },
    });
};

// Admin
export const useAllReservations = () => {
    return useQuery({
        queryKey: ['allReservations'],
        queryFn: reservationsApi.getAllReservations,
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
            toast.success('Reserva confirmada');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            toast.success('Check-in realizado');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            toast.success('Check-out realizado');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro no check-out');
        },
    });
};

// ============ ORDERS HOOKS ============

export const useMyOrders = () => {
    return useQuery({
        queryKey: ['myOrders'],
        queryFn: ordersApi.getMyOrders,
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
            toast.success('Pedido criado com sucesso!');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            toast.success('Pedido cancelado');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao cancelar pedido');
        },
    });
};

// Admin
export const useAllOrders = () => {
    return useQuery({
        queryKey: ['allOrders'],
        queryFn: ordersApi.getAllOrders,
        staleTime: 30000,
        refetchInterval: 30000,
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: ({ id, status }: { id: string; status: any }) =>
            ordersApi.updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allOrders'] });
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
            toast.success('Status do pedido atualizado');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar status');
        },
    });
};

// ============ DAILY STATS HOOKS ============

export const useDailyStats = () => {
    const { data: orders = [] } = useAllOrders();

    // Filtrar pedidos de hoje
    const today = new Date().toDateString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todayOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.created_at).toDateString();
        return orderDate === today && order.status !== 'cancelado';
    });

    // Calcular estatísticas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const faturamento = todayOrders.reduce((sum: number, order: any) => {
        return sum + (order.total || 0);
    }, 0);

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

// ============ USERS HOOKS ============

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await authApi.listUsers();
            return response.data || [];
        },
        staleTime: 1 * 60 * 1000,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Usuário criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erro ao criar usuário');
        },
    });
};