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

// ============ ANALYTICS HOOKS ============

export const useMonthlyRevenue = () => {
    const { data: orders = [] } = useAllOrders();

    // Agrupar por mês
    const monthlyData = orders.reduce((acc: any, order: any) => {
        if (order.status === 'cancelado') return acc;

        const date = new Date(order.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!acc[monthKey]) {
            acc[monthKey] = { month: monthKey, receita: 0, pedidos: 0 };
        }

        acc[monthKey].receita += order.total || 0;
        acc[monthKey].pedidos += 1;

        return acc;
    }, {});

    const data = Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));

    return {
        data,
        isLoading: false,
    };
};

export const useWeeklyRevenue = () => {
    const { data: orders = [] } = useAllOrders();

    // Agrupar por dia da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weeklyData = orders.reduce((acc: any, order: any) => {
        if (order.status === 'cancelado') return acc;

        const date = new Date(order.created_at);
        const dayIndex = date.getDay();
        const dayName = weekDays[dayIndex];

        if (!acc[dayName]) {
            acc[dayName] = { dia: dayName, receita: 0, pedidos: 0 };
        }

        acc[dayName].receita += order.total || 0;
        acc[dayName].pedidos += 1;

        return acc;
    }, {});

    const data = weekDays.map(day => weeklyData[day] || { dia: day, receita: 0, pedidos: 0 });

    return {
        data,
        isLoading: false,
    };
};

export const useHourlyOrders = () => {
    const { data: orders = [] } = useAllOrders();

    // Agrupar por hora
    const hourlyData = orders.reduce((acc: any, order: any) => {
        if (order.status === 'cancelado') return acc;

        const date = new Date(order.created_at);
        const hour = date.getHours();
        const hourKey = `${hour}h`;

        if (!acc[hourKey]) {
            acc[hourKey] = { hora: hourKey, pedidos: 0, receita: 0 };
        }

        acc[hourKey].pedidos += 1;
        acc[hourKey].receita += order.total || 0;

        return acc;
    }, {});

    const data = Array.from({ length: 24 }, (_, i) => {
        const hourKey = `${i}h`;
        return hourlyData[hourKey] || { hora: hourKey, pedidos: 0, receita: 0 };
    });

    return {
        data,
        isLoading: false,
    };
};

export const useTopProducts = () => {
    const { data: orders = [] } = useAllOrders();
    const { data: menuItems = [] } = useMenuItems();

    // Contar vendas por produto
    const productSales = orders.reduce((acc: any, order: any) => {
        if (order.status === 'cancelado' || !order.itens) return acc;

        order.itens.forEach((item: any) => {
            const productId = item.id_produto;
            if (!acc[productId]) {
                acc[productId] = { id: productId, vendas: 0, receita: 0 };
            }
            acc[productId].vendas += item.quantidade || 1;
            acc[productId].receita += (item.preco_unitario || 0) * (item.quantidade || 1);
        });

        return acc;
    }, {});

    // Combinar com dados do menu
    const topProducts = Object.values(productSales)
        .map((sale: any) => {
            const menuItem = menuItems.find((item: any) => item.id === sale.id);
            return {
                nome: menuItem?.nome || `Produto ${sale.id}`,
                vendas: sale.vendas,
                receita: sale.receita,
            };
        })
        .sort((a: any, b: any) => b.vendas - a.vendas)
        .slice(0, 5);

    return {
        data: topProducts,
        isLoading: false,
    };
};

export const useOrderCategories = () => {
    const { data: orders = [] } = useAllOrders();
    const { data: menuItems = [] } = useMenuItems();

    // Agrupar por categoria
    const categoryData = orders.reduce((acc: any, order: any) => {
        if (order.status === 'cancelado' || !order.itens) return acc;

        order.itens.forEach((item: any) => {
            const menuItem = menuItems.find((m: any) => m.id === item.id_produto);
            const category = menuItem?.categoria || 'Outros';

            if (!acc[category]) {
                acc[category] = { name: category, value: 0 };
            }
            acc[category].value += item.quantidade || 1;
        });

        return acc;
    }, {});

    const data = Object.values(categoryData);

    return {
        data,
        isLoading: false,
    };
};

export const useTableOccupancy = () => {
    const { data: reservations = [] } = useAllReservations();

    // Simular ocupação por hora (dados mockados por enquanto)
    const occupancyData = Array.from({ length: 24 }, (_, i) => ({
        hora: `${i}h`,
        ocupacao: Math.floor(Math.random() * 40) + 30, // 30-70% ocupação
    }));

    return {
        data: occupancyData,
        isLoading: false,
    };
};

export const usePerformanceMetrics = () => {
    const { data: orders = [] } = useAllOrders();

    // Calcular métricas de performance
    const completedOrders = orders.filter((o: any) => o.status === 'entregue');
    const cancelledOrders = orders.filter((o: any) => o.status === 'cancelado');

    const avgPrepTime = completedOrders.length > 0
        ? completedOrders.reduce((sum: number, order: any) => {
            // Simular tempo de preparo baseado no tipo de pedido
            const baseTime = order.tipo === 'delivery' ? 25 : 15;
            return sum + (baseTime + Math.random() * 10);
        }, 0) / completedOrders.length
        : 0;

    const cancellationRate = orders.length > 0 ? (cancelledOrders.length / orders.length) * 100 : 0;
    const deliveryEfficiency = 94 + Math.random() * 4; // 94-98%

    return {
        data: {
            avgPrepTime: Math.round(avgPrepTime),
            cancellationRate: Math.round(cancellationRate * 10) / 10,
            deliveryEfficiency: Math.round(deliveryEfficiency * 10) / 10,
        },
        isLoading: false,
    };
};

export const useCustomerSatisfaction = () => {
    // Dados mockados de satisfação (até ter sistema de reviews)
    const satisfactionData = [
        { subject: 'Qualidade', A: 4.8, fullMark: 5 },
        { subject: 'Serviço', A: 4.6, fullMark: 5 },
        { subject: 'Ambiente', A: 4.7, fullMark: 5 },
        { subject: 'Preço', A: 4.5, fullMark: 5 },
        { subject: 'Rapidez', A: 4.4, fullMark: 5 },
        { subject: 'Recomendação', A: 4.9, fullMark: 5 },
    ];

    return {
        data: satisfactionData,
        isLoading: false,
    };
};

// ============ USERS HOOKS ============

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
        mutationFn: authApi.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Usuário criado com sucesso!');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar usuário');
        },
    });
};