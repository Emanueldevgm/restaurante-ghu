// Tipos para dados de gráficos

export interface HourlyOrderData {
  hora: string;
  pedidos: number;
  receita: number;
}

export interface DailyRevenueData {
  dia: string;
  receita: number;
  pedidos: number;
}

export interface MonthlyRevenueData {
  month: string;
  receita: number;
  pedidos: number;
}

export interface TableOccupancyData {
  hora: string;
  ocupacao: number;
}

export interface CustomerSatisfactionData {
  subject: string;
  A: number;
}

export interface OrderCategoryData {
  name: string;
  value: number;
}

export interface TopProductData {
  id: string;
  nome: string;
  vendas: number;
  receita: number;
}
