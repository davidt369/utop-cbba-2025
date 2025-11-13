import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Funcionario,
  FuncionarioCreateData,
  FuncionarioUpdateData,
  FuncionarioStats,
  FuncionarioApiResponse,
  FuncionarioStatsApiResponse,
} from "@/types/funcionario.types";

// Hook para obtener todos los funcionarios
export function useFuncionarios(withTrashed = false) {
  return useQuery<Funcionario[], Error>({
    queryKey: ["funcionarios", withTrashed],
    queryFn: async () => {
      const params = withTrashed ? "?with_trashed=1" : "";
      const response = await api.get<FuncionarioApiResponse>(
        `/auth/funcionarios${params}`
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para obtener estadísticas de funcionarios
export function useFuncionariosEstadisticas() {
  return useQuery<FuncionarioStats, Error>({
    queryKey: ["funcionarios-estadisticas"],
    queryFn: async () => {
      const response = await api.get<FuncionarioStatsApiResponse>(
        "/auth/funcionarios/estadisticas"
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener un funcionario específico
export function useFuncionario(id: number) {
  return useQuery<Funcionario, Error>({
    queryKey: ["funcionario", id],
    queryFn: async () => {
      const response = await api.get<{ data: Funcionario }>(
        `/auth/funcionarios/${id}`
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Hook para crear funcionario (registro completo con estado)
export function useCreateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FuncionarioCreateData) => {
      const response = await api.post("/auth/funcionarios", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-estadisticas"],
      });
    },
    onError: (error: any) => {
      console.error("Error al crear funcionario:", error);
    },
  });
}

// Hook para actualizar funcionario
export function useUpdateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: FuncionarioUpdateData;
    }) => {
      const response = await api.patch(`/auth/funcionarios/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
      queryClient.invalidateQueries({
        queryKey: ["funcionario", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-estadisticas"],
      });
    },
    onError: (error: any) => {
      console.error("Error al actualizar funcionario:", error);
    },
  });
}

// Hook para eliminar funcionario (soft delete)
export function useDeleteFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/auth/funcionarios/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-estadisticas"],
      });
    },
    onError: (error: any) => {
      console.error("Error al eliminar funcionario:", error);
    },
  });
}

// Hook para restaurar funcionario
export function useRestoreFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/auth/funcionarios/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-estadisticas"],
      });
    },
    onError: (error: any) => {
      console.error("Error al restaurar funcionario:", error);
    },
  });
}

// Hook para obtener estados válidos de funcionarios
export function useEstadosFuncionarios() {
  return useQuery<string[], Error>({
    queryKey: ["funcionarios-estados"],
    queryFn: async () => {
      const response = await api.get<{ estados: string[] }>(
        "/auth/funcionarios/estados"
      );
      return response.data.estados;
    },
    staleTime: 60 * 60 * 1000, // 1 hora (los estados no cambian frecuentemente)
  });
}

// Hook para obtener total de funcionarios por estado específico
export function useFuncionariosPorEstado(estado: string) {
  return useQuery<{ estado: string; total: number }, Error>({
    queryKey: ["funcionarios-por-estado", estado],
    queryFn: async () => {
      const response = await api.get(
        `/auth/funcionarios/estadisticas/${estado}`
      );
      return response.data;
    },
    enabled: !!estado,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para obtener nombres completos de funcionarios (útil para selects)
export function useFuncionariosNombresCompletos() {
  return useQuery<{ id: number; nombre_completo: string }[], Error>({
    queryKey: ["funcionarios-nombres-completos"],
    queryFn: async () => {
      const response = await api.get<{
        data: { id: number; nombre_completo: string }[];
      }>("/auth/funcionarios/nombres-completos");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para actualizar solo datos básicos del funcionario (sin email/password)
export function useUpdateFuncionarioDatos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Omit<FuncionarioUpdateData, "email" | "password" | "rol_id">;
    }) => {
      const response = await api.patch(`/auth/funcionarios/${id}/datos`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
      queryClient.invalidateQueries({
        queryKey: ["funcionario", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-estadisticas"],
      });
    },
    onError: (error: any) => {
      console.error("Error al actualizar datos del funcionario:", error);
    },
  });
}

// Hook para actualizar solo el email del funcionario
export function useUpdateFuncionarioEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, email }: { id: number; email: string }) => {
      const response = await api.patch(`/auth/funcionarios/${id}/email`, {
        email,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
      queryClient.invalidateQueries({
        queryKey: ["funcionario", variables.id],
      });
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.errors;
        if (validationErrors) {
          console.error("Errores de validación:", validationErrors);
          Object.keys(validationErrors).forEach((field) => {
            console.error(`${field}: ${validationErrors[field].join(", ")}`);
          });
        }
      } else {
        console.error("Error al actualizar email:", error);
      }
    },
  });
}

// Hook para actualizar solo la contraseña del funcionario
export function useUpdateFuncionarioPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      const response = await api.patch(`/auth/funcionarios/${id}/password`, {
        password,
      });
      return response.data;
    },
    onSuccess: () => {
      // No necesitamos invalidar queries porque solo cambia la contraseña
    },
    onError: (error: any) => {
      console.error("Error al actualizar contraseña:", error);
    },
  });
}
