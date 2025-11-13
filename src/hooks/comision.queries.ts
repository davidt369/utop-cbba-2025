import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Comision,
  ComisionCreateData,
  ComisionUpdateData,
  ComisionEstadisticas,
  FuncionarioMini,
  ApiResponse,
} from "@/types/comision.types";

// ===== QUERIES =====

export function useComisiones(showDeleted = false) {
  return useQuery<Comision[]>({
    queryKey: ["comisiones", { showDeleted }],
    queryFn: async () => {
      const params = showDeleted ? "?with_trashed=1" : "";
      const { data } = await api.get<ApiResponse<Comision[]>>(
        `/auth/comisiones${params}`
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useComisionEstadisticas() {
  return useQuery<ComisionEstadisticas>({
    queryKey: ["comisiones", "estadisticas"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ComisionEstadisticas>>(
        `/auth/comisiones/estadisticas`
      );
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useFuncionariosParaComision() {
  return useQuery<FuncionarioMini[]>({
    queryKey: ["comisiones", "funcionarios"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<FuncionarioMini[]>>(
        "/auth/comisiones/funcionarios"
      );
      return data.data;
    },
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useComisionesPorMes() {
  return useQuery<any[]>({
    queryKey: ["comisiones", "por-mes"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any[]>>(
        "/auth/comisiones/por-mes"
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ===== MUTATIONS =====

export function useCreateComision() {
  const queryClient = useQueryClient();
  return useMutation<Comision, Error, ComisionCreateData>({
    mutationFn: async (payload) => {
      // Si hay archivo PDF, usar FormData
      if (payload.pdf_respaldo) {
        const formData = new FormData();
        formData.append("descripcion", payload.descripcion || "");
        formData.append("fecha_inicio", payload.fecha_inicio);
        formData.append("fecha_fin", payload.fecha_fin);
        formData.append("funcionario_id", payload.funcionario_id.toString());
        formData.append("pdf_respaldo", payload.pdf_respaldo);

        const { data } = await api.post<ApiResponse<Comision>>(
          "/auth/comisiones",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return data.data;
      } else {
        // Sin archivo, usar JSON normal
        const { data } = await api.post<ApiResponse<Comision>>(
          "/auth/comisiones",
          payload
        );
        return data.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comisiones"] });
      toast.success("Comisión creada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al crear comisión");
    },
  });
}

export function useUpdateComision() {
  const queryClient = useQueryClient();
  return useMutation<Comision, Error, { id: number; data: ComisionUpdateData }>(
    {
      mutationFn: async ({ id, data }) => {
        // Si hay archivo PDF, usar FormData con POST (el endpoint ya maneja el _method internamente)
        if (data.pdf_respaldo) {
          const formData = new FormData();
          if (data.descripcion !== undefined)
            formData.append("descripcion", data.descripcion || "");
          if (data.fecha_inicio)
            formData.append("fecha_inicio", data.fecha_inicio);
          if (data.fecha_fin) formData.append("fecha_fin", data.fecha_fin);
          if (data.funcionario_id)
            formData.append("funcionario_id", data.funcionario_id.toString());
          if (data.activo !== undefined)
            formData.append("activo", data.activo ? "1" : "0");
          formData.append("pdf_respaldo", data.pdf_respaldo);

          const response = await api.post<ApiResponse<Comision>>(
            `/auth/comisiones/${id}/update-with-file`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          return response.data.data;
        } else {
          // Sin archivo, usar PUT normal
          const response = await api.put<ApiResponse<Comision>>(
            `/auth/comisiones/${id}`,
            data
          );
          return response.data.data;
        }
      },
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ["comisiones"] });
        queryClient.invalidateQueries({ queryKey: ["comisiones", id] });
        toast.success("Comisión actualizada exitosamente");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Error al actualizar comisión"
        );
      },
    }
  );
}

export function useDeleteComision() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/auth/comisiones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comisiones"] });
      toast.success("Comisión eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al eliminar comisión"
      );
    },
  });
}

export function useRestoreComision() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.post(`/auth/comisiones/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comisiones"] });
      toast.success("Comisión restaurada exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al restaurar comisión"
      );
    },
  });
}
