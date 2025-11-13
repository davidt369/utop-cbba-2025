import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type {
  EstadisticasGeneralesResponse,
  EstadisticasFuncionariosResponse,
  EstadisticasDocumentosResponse,
  EstadisticasActividadesResponse,
} from '@/types/dashboard.types';

// Hook para estadísticas generales del dashboard
export function useEstadisticasGenerales() {
  return useQuery({
    queryKey: ['dashboard', 'estadisticas-generales'],
    queryFn: async (): Promise<EstadisticasGeneralesResponse> => {
      const response = await api.get('/auth/dashboard/estadisticas-generales');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para estadísticas específicas de funcionarios
export function useEstadisticasFuncionarios() {
  return useQuery({
    queryKey: ['dashboard', 'estadisticas-funcionarios'],
    queryFn: async (): Promise<EstadisticasFuncionariosResponse> => {
      const response = await api.get('/auth/dashboard/estadisticas-funcionarios');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

// Hook para estadísticas específicas de documentos
export function useEstadisticasDocumentos() {
  return useQuery({
    queryKey: ['dashboard', 'estadisticas-documentos'],
    queryFn: async (): Promise<EstadisticasDocumentosResponse> => {
      const response = await api.get('/auth/dashboard/estadisticas-documentos');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

// Hook para estadísticas específicas de actividades
export function useEstadisticasActividades() {
  return useQuery({
    queryKey: ['dashboard', 'estadisticas-actividades'],
    queryFn: async (): Promise<EstadisticasActividadesResponse> => {
      const response = await api.get('/auth/dashboard/estadisticas-actividades');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}