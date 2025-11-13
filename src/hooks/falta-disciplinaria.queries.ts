import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  FaltaDisciplinaria,
  FaltaDisciplinariaCreateData,
  FaltaDisciplinariaUpdateData,
  FaltaDisciplinariaEstadisticas,
  Funcionario,
  TipoGravedad,
  ApiResponse,
} from "@/types/falta-disciplinaria.types";

// ===== QUERIES =====

/**
 * Hook para obtener todas las faltas disciplinarias
 */
export function useFaltasDisciplinarias(showDeleted = false) {
  return useQuery<FaltaDisciplinaria[]>({
    queryKey: ["faltas-disciplinarias", { showDeleted }],
    queryFn: async (): Promise<FaltaDisciplinaria[]> => {
      const params = showDeleted ? "?with_trashed=1" : "";
      const { data } = await api.get<ApiResponse<FaltaDisciplinaria[]>>(
        `/auth/faltas-disciplinarias${params}`
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener una falta disciplinaria específica
 */
export function useFaltaDisciplinaria(id: number) {
  return useQuery<FaltaDisciplinaria>({
    queryKey: ["faltas-disciplinarias", id],
    queryFn: async (): Promise<FaltaDisciplinaria> => {
      const { data } = await api.get<ApiResponse<FaltaDisciplinaria>>(
        `/auth/faltas-disciplinarias/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de faltas disciplinarias
 */
export function useFaltaDisciplinariaEstadisticas() {
  return useQuery<FaltaDisciplinariaEstadisticas>({
    queryKey: ["faltas-disciplinarias", "estadisticas"],
    queryFn: async (): Promise<FaltaDisciplinariaEstadisticas> => {
      const { data } = await api.get<
        ApiResponse<FaltaDisciplinariaEstadisticas>
      >(`/auth/faltas-disciplinarias/estadisticas`);
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener funcionarios para selección
 */
export function useFuncionarios() {
  return useQuery<Funcionario[]>({
    queryKey: ["faltas-disciplinarias", "funcionarios"],
    queryFn: async (): Promise<Funcionario[]> => {
      const { data } = await api.get<ApiResponse<Funcionario[]>>(
        `/auth/faltas-disciplinarias/funcionarios`
      );
      return data.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener tipos de gravedad
 */
export function useTiposGravedad() {
  return useQuery<TipoGravedad[]>({
    queryKey: ["faltas-disciplinarias", "tipos-gravedad"],
    queryFn: async (): Promise<TipoGravedad[]> => {
      const { data } = await api.get<ApiResponse<TipoGravedad[]>>(
        `/auth/faltas-disciplinarias/tipos-gravedad`
      );
      return data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
  });
}

// ===== MUTATIONS =====

/**
 * Hook para crear una nueva falta disciplinaria
 */
export function useCreateFaltaDisciplinaria() {
  const queryClient = useQueryClient();

  return useMutation<
    FaltaDisciplinaria,
    Error,
    FaltaDisciplinariaCreateData | FormData
  >({
    mutationFn: async (
      faltaData: FaltaDisciplinariaCreateData | FormData
    ): Promise<FaltaDisciplinaria> => {
      // Si es FormData, dejamos que axios maneje Content-Type multipart/form-data
      const { data } = await api.post<ApiResponse<FaltaDisciplinaria>>(
        "/auth/faltas-disciplinarias",
        faltaData as any
      );
      return data.data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["faltas-disciplinarias"] });

      toast.success("Falta disciplinaria creada exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Error al crear falta disciplinaria";
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar una falta disciplinaria
 */
export function useUpdateFaltaDisciplinaria() {
  const queryClient = useQueryClient();

  return useMutation<
    FaltaDisciplinaria,
    Error,
    { id: number; data: FaltaDisciplinariaUpdateData | FormData }
  >({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: FaltaDisciplinariaUpdateData | FormData;
    }): Promise<FaltaDisciplinaria> => {
      // PHP/Laravel doesn't handle multipart file uploads on PUT reliably in many setups.
      // If caller passed a FormData (contains file), send as POST with _method=PUT override.
      if (data instanceof FormData) {
        // Ensure method override
        if (!data.has("_method")) {
          data.append("_method", "PUT");
        }
        const response = await api.post<ApiResponse<FaltaDisciplinaria>>(
          `/auth/faltas-disciplinarias/${id}`,
          data as any
        );
        return response.data.data;
      }

      const response = await api.put<ApiResponse<FaltaDisciplinaria>>(
        `/auth/faltas-disciplinarias/${id}`,
        data as any
      );
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["faltas-disciplinarias"] });
      queryClient.invalidateQueries({
        queryKey: ["faltas-disciplinarias", id],
      });

      toast.success("Falta disciplinaria actualizada exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Error al actualizar falta disciplinaria";
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar una falta disciplinaria (soft delete)
 */
export function useDeleteFaltaDisciplinaria() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/auth/faltas-disciplinarias/${id}`);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["faltas-disciplinarias"] });

      toast.success("Falta disciplinaria eliminada exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Error al eliminar falta disciplinaria";
      toast.error(message);
    },
  });
}

/**
 * Hook para restaurar una falta disciplinaria eliminada
 */
export function useRestoreFaltaDisciplinaria() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number): Promise<void> => {
      await api.post(`/auth/faltas-disciplinarias/${id}/restore`);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["faltas-disciplinarias"] });

      toast.success("Falta disciplinaria restaurada exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Error al restaurar falta disciplinaria";
      toast.error(message);
    },
  });
}
