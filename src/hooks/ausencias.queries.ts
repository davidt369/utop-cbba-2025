import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Ausencia,
  AusenciaCreateResponse,
  AusenciaDeleteResponse,
  AusenciaEstadisticasResponse,
  AusenciaFormData,
  AusenciaResponse,
  AusenciaUpdateResponse,
  FuncionarioBasicResponse,
} from "@/types/ausencia.types";
import axios from "@/lib/axios";

// 📋 Hook para obtener todas las ausencias
export const useAusencias = (withDeleted = false) => {
  return useQuery({
    queryKey: ["ausencias", withDeleted],
    queryFn: async (): Promise<Ausencia[]> => {
      const params = withDeleted ? "?with_deleted=true" : "";
      const { data } = await api.get<AusenciaResponse>(
        `/auth/ausencias${params}`
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

// 📊 Hook para obtener estadísticas de ausencias
export const useAusenciaEstadisticas = (withDeleted = false) => {
  return useQuery({
    queryKey: ["ausencia-estadisticas", withDeleted],
    queryFn: async () => {
      const params = withDeleted ? "?with_deleted=true" : "";
      const { data } = await api.get<AusenciaEstadisticasResponse>(
        `/auth/ausencias/estadisticas${params}`
      );
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
};

// 👥 Hook para obtener funcionarios básicos
export const useFuncionariosBasic = () => {
  return useQuery({
    queryKey: ["funcionarios-basic"],
    queryFn: async () => {
      const { data } = await api.get<FuncionarioBasicResponse>(
        "/auth/ausencias/funcionarios-basic"
      );
      return data.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
  });
};

// 👥 Hook para obtener solo funcionarios disponibles para ausencias (Activos y sin sanciones activas)
export const useFuncionariosDisponibles = () => {
  return useQuery({
    queryKey: ["funcionarios-disponibles"],
    queryFn: async () => {
      const { data } = await api.get<FuncionarioBasicResponse>(
        "/auth/ausencias/funcionarios-disponibles"
      );
      return data.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
  });
};

// ➕ Hook para crear ausencia
export const useCreateAusencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      ausenciaData: AusenciaFormData | FormData
    ): Promise<Ausencia> => {
      const { data } = await api.post<AusenciaCreateResponse>(
        "/auth/ausencias",
        ausenciaData,
        {
          headers:
            ausenciaData instanceof FormData
              ? {
                  "Content-Type": "multipart/form-data",
                }
              : undefined,
        }
      );
      return data.data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["ausencias"] });
      queryClient.invalidateQueries({ queryKey: ["ausencia-estadisticas"] });

      toast.success("Ausencia creada exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Error al crear ausencia";

      // Si hay errores de validación específicos, mostrarlos
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat();
        if (errorMessages.length > 0) {
          errorMessages.forEach((msg: any) => toast.error(msg));
          return;
        }
      }

      toast.error(message);
    },
  });
};

// ✏️ Hook para actualizar ausencia
export const useUpdateAusencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: AusenciaFormData | FormData;
    }): Promise<Ausencia> => {
      // Si es FormData, usar la ruta específica para archivos
      if (data instanceof FormData) {
        const response = await api.post<AusenciaUpdateResponse>(
          `/auth/ausencias/${id}/update-with-file`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data.data;
      } else {
        // Si es JSON regular, usar PUT normal
        const response = await api.put<AusenciaUpdateResponse>(
          `/auth/ausencias/${id}`,
          data
        );
        return response.data.data;
      }
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["ausencias"] });
      queryClient.invalidateQueries({ queryKey: ["ausencia-estadisticas"] });

      toast.success("Ausencia actualizada exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Error al actualizar ausencia";

      // Si hay errores de validación específicos, mostrarlos
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat();
        if (errorMessages.length > 0) {
          errorMessages.forEach((msg: any) => toast.error(msg));
          return;
        }
      }

      toast.error(message);
    },
  });
};

// 🗑️ Hook para eliminar ausencia
export const useDeleteAusencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/auth/ausencias/${id}`);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["ausencias"] });
      queryClient.invalidateQueries({ queryKey: ["ausencia-estadisticas"] });

      toast.success("Ausencia eliminada exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Error al eliminar ausencia";
      toast.error(message);
    },
  });
};

// 🔄 Hook para restaurar ausencia
export const useRestoreAusencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.post(`/auth/ausencias/${id}/restore`);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["ausencias"] });
      queryClient.invalidateQueries({ queryKey: ["ausencia-estadisticas"] });

      toast.success("Ausencia restaurada exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Error al restaurar ausencia";
      toast.error(message);
    },
  });
};

export function useAusenciasPorMes() {
  return useQuery({
    queryKey: ["ausencias-por-mes"],
    queryFn: async () => {
      // Llamamos a la ruta pública que creamos
      const res = await axios.get("/ausencias/por-mes-public");
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
