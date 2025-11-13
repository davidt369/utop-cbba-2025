import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Unidad,
  UnidadCreateData,
  UnidadUpdateData,
  UnidadStats,
} from "@/types/unidad.types";

// 📋 Listar unidades
export const useUnidades = (withDeleted = false) => {
  return useQuery({
    queryKey: ["unidades", { withDeleted }],
    queryFn: async (): Promise<Unidad[]> => {
      const params = new URLSearchParams();
      if (withDeleted) params.append("with_deleted", "1");

      const response = await api.get(`/auth/unidades?${params}`);
      return response.data.data;
    },
  });
};

// 📊 Estadísticas de unidades
export const useUnidadesStats = () => {
  return useQuery({
    queryKey: ["unidades-stats"],
    queryFn: async (): Promise<UnidadStats> => {
      const response = await api.get("/auth/unidades/estadisticas");
      return response.data;
    },
  });
};

// ➕ Crear unidad
export const useCreateUnidad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UnidadCreateData) => {
      const response = await api.post("/auth/unidades", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      queryClient.invalidateQueries({ queryKey: ["unidades-stats"] });
      toast.success("Unidad creada correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

// ✏️ Actualizar unidad
export const useUpdateUnidad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UnidadUpdateData;
    }) => {
      const response = await api.put(`/auth/unidades/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      queryClient.invalidateQueries({ queryKey: ["unidades-stats"] });
      toast.success("Unidad actualizada correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

// 🗑️ Eliminar unidad
export const useDeleteUnidad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/auth/unidades/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      queryClient.invalidateQueries({ queryKey: ["unidades-stats"] });
      toast.success("Unidad eliminada correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

// ♻️ Restaurar unidad
export const useRestoreUnidad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/auth/unidades/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      queryClient.invalidateQueries({ queryKey: ["unidades-stats"] });
      toast.success("Unidad restaurada correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};
