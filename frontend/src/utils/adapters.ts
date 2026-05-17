/**
 * Converte um pedido da API para o formato usado no frontend
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adaptOrder = (order: any) => {
  // Converte totais para números
  const subtotal_kz = typeof order.subtotal_kz === 'number' 
    ? order.subtotal_kz 
    : parseFloat(String(order.subtotal_kz || 0));
  
  const desconto_kz = typeof order.desconto_kz === 'number'
    ? order.desconto_kz
    : parseFloat(String(order.desconto_kz || 0));
  
  const total_kz = typeof order.total_kz === 'number'
    ? order.total_kz
    : parseFloat(String(order.total_kz || 0));
  
  const taxa_entrega_kz = typeof order.taxa_entrega_kz === 'number'
    ? order.taxa_entrega_kz
    : parseFloat(String(order.taxa_entrega_kz || 0));

  // Converte itens do pedido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = order.itens?.map((item: any) => ({
    ...item,
    preco_unitario_kz: typeof item.preco_unitario_kz === 'number'
      ? item.preco_unitario_kz
      : parseFloat(String(item.preco_unitario_kz || 0)),
    subtotal_kz: typeof item.subtotal_kz === 'number'
      ? item.subtotal_kz
      : parseFloat(String(item.subtotal_kz || 0)),
  })) || [];

  return {
    ...order,
    subtotal_kz,
    desconto_kz,
    total_kz,
    taxa_entrega_kz,
    itens: items,
  };
};