import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface CambioDestino {
  id: number;
  fecha_destino: string;
  motivo_cambio: string;
  activo: boolean;
  created_at: string;
  unidad_destino: string | null;
  unidad_anterior: string | null;
}

export interface EstadisticasCambios {
  total: number;
  activos: number;
  inactivos: number;
}

export interface MisCambiosDestinoResponse {
  data: CambioDestino[];
  total: number;
  estadisticas: EstadisticasCambios;
}

export const useMisCambiosDestino = () => {
  return useQuery<MisCambiosDestinoResponse>({
    queryKey: ['mis-cambios-destino'],
    queryFn: async () => {
      const response = await api.get('/auth/mi-perfil/mis-cambios-destino');
      return response.data;
    },
  });
};