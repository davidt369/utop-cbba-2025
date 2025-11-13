import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface FaltaDisciplinaria {
  id: number;
  descripcion: string;
  fecha_falta: string;
  tipo_gravedad: 'Leve' | 'Grave' | 'Muy Grave';
  created_at: string;
}

export interface EstadisticasFaltas {
  total: number;
  leves: number;
  graves: number;
  muy_graves: number;
}

export interface MisFaltasResponse {
  data: FaltaDisciplinaria[];
  total: number;
  estadisticas: EstadisticasFaltas;
}

export const useMisFaltasDisciplinarias = () => {
  return useQuery<MisFaltasResponse>({
    queryKey: ['mis-faltas-disciplinarias'],
    queryFn: async () => {
      const response = await api.get('/auth/mi-perfil/mis-faltas-disciplinarias');
      return response.data;
    },
  });
};