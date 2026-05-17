// src/hooks/useDeliveryFee.ts
import { useMutation } from '@tanstack/react-query';
import api from '@/services/api';

interface CalculateFeeParams {
  provincia: string;
  municipio: string;
  bairro: string;
}

interface CalculateFeeResponse {
  taxa_kz: number;
  tempo_estimado_min: number;
}

export function useCalculateDeliveryFee() {
  return useMutation<CalculateFeeResponse, Error, CalculateFeeParams>({
    mutationFn: async (params) => {
      const { data } = await api.post('/delivery/calculate-fee', params);
      return data;
    },
  });
}