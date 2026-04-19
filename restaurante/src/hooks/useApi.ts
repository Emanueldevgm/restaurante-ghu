import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi, tablesApi, reservationsApi, ordersApi, reviewsApi } from '@/services/api';
import { toast } from 'sonner';
import { adaptOrder } from '@/utils/adapters';

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
        staleTime: 2 * 60 * 1000, // 2 minutos
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
        staleTime: 1 * 60 * 1000, // 1 minuto
    });
};

export const useTableStatus = () => {
    return useQuery({
        queryKey: ['tableStatus'],
        queryFn: tablesApi.getTableStatus,
        refetchInterval: 30000, // Atualiza a cada 30 segundos
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

// ============ ORDERS HOOKS ============

export const useMyOrders = () => {
    return useQuery({
        queryKey: ['myOrders'],
        queryFn: async () => {
            const orders = await ordersApi.getMyOrders();
            return orders.map(adaptOrder);
        },
        staleTime: 1 * 60 * 1000,
    });
};

export const useOrder = (id: string) => {
    return useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const order = await ordersApi.getOrder(id);
            return adaptOrder(order);
        },
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

// ============ REVIEWS HOOKS ============

export const useReviews = (limit = 10, offset = 0) => {
    return useQuery({
        queryKey: ['reviews', limit, offset],
        queryFn: () => reviewsApi.getReviews(limit, offset),
        staleTime: 2 * 60 * 1000,
    });
};

export const useRestaurantRating = () => {
    return useQuery({
        queryKey: ['restaurantRating'],
        queryFn: reviewsApi.getRestaurantRating,
        staleTime: 5 * 60 * 1000,
    });
};

export const useOrderReview = (orderId: string) => {
    return useQuery({
        queryKey: ['orderReview', orderId],
        queryFn: () => reviewsApi.getOrderReview(orderId),
        enabled: !!orderId,
    });
};

export const useCreateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: reviewsApi.createReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['restaurantRating'] });
            toast.success('Avaliação enviada com sucesso!');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao enviar avaliação');
        },
    });
};

// ============ ADMIN HOOKS ============

export const useAllOrders = () => {
    return useQuery({
        queryKey: ['allOrders'],
        queryFn: async () => {
            const orders = await ordersApi.getAllOrders();
            return orders.map(adaptOrder);
        },
        staleTime: 30000, // 30 segundos
        refetchInterval: 30000, // Auto-refresh
    });
};

export const useAllReservations = () => {
    return useQuery({
        queryKey: ['allReservations'],
        queryFn: reservationsApi.getAllReservations,
        staleTime: 30000,
        refetchInterval: 30000,
    });
};
export const useReservation = (id: string) => {
    return useQuery({
        queryKey: ['reservation', id],
        queryFn: () => reservationsApi.getReservation(id),
        enabled: !!id,
    });
};

export const useUpdateReservationStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: ({ id, status }: { id: string; status: any }) =>
            reservationsApi.updateReservationStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allReservations'] });
            queryClient.invalidateQueries({ queryKey: ['myReservations'] });
            toast.success('Status da reserva atualizado');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar status');
        },
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

// ============ TABLE MANAGEMENT HOOKS (ADMIN) ============

export const useCreateTable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: tablesApi.createTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            toast.success('Mesa criada com sucesso!');
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
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            tablesApi.updateTable(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            toast.success('Mesa atualizada com sucesso!');
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
            queryClient.invalidateQueries({ queryKey: ['tableStatus'] });
            toast.success('Mesa deletada com sucesso!');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao deletar mesa');
        },
    });
};
