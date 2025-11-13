import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Cargo,
  CargoCreateData,
  CargoUpdateData,
  CargoStats,
} from "@/types/cargo.types";

// 📋 Listar cargos
export const useCargos = (withDeleted = false) => {
  return useQuery({
    queryKey: ["cargos", { withDeleted }],
    queryFn: async (): Promise<Cargo[]> => {
      const params = new URLSearchParams();
      if (withDeleted) params.append("with_deleted", "1");

      const response = await api.get(`/auth/cargos?${params}`);
      return response.data.data;
    },
  });
};

// 📊 Estadísticas de cargos
export const useCargosStats = () => {
  return useQuery({
    queryKey: ["cargos-stats"],
    queryFn: async (): Promise<CargoStats> => {
      const response = await api.get("/auth/cargos/estadisticas");
      return response.data;
    },
  });
};

// 📌 Obtener un cargo específico
export const useCargo = (id: number) => {
  return useQuery({
    queryKey: ["cargo", id],
    queryFn: async (): Promise<Cargo> => {
      const response = await api.get(`/auth/cargos/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// ➕ Crear cargo
export const useCreateCargo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CargoCreateData) => {
      const response = await api.post("/auth/cargos", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargos"] });
      queryClient.invalidateQueries({ queryKey: ["cargos-stats"] });
      queryClient.invalidateQueries({ queryKey: ["cargos-basic"] });
      toast.success("Cargo creado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

// ✏️ Actualizar cargo
export const useUpdateCargo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CargoUpdateData }) => {
      const response = await api.put(`/auth/cargos/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargos"] });
      queryClient.invalidateQueries({ queryKey: ["cargos-stats"] });
      queryClient.invalidateQueries({ queryKey: ["cargos-basic"] });
      toast.success("Cargo actualizado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

// 🗑️ Eliminar cargo
export const useDeleteCargo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/auth/cargos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargos"] });
      queryClient.invalidateQueries({ queryKey: ["cargos-stats"] });
      queryClient.invalidateQueries({ queryKey: ["cargos-basic"] });
      toast.success("Cargo eliminado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

// ♻️ Restaurar cargo
export const useRestoreCargo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/auth/cargos/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargos"] });
      queryClient.invalidateQueries({ queryKey: ["cargos-stats"] });
      queryClient.invalidateQueries({ queryKey: ["cargos-basic"] });
      toast.success("Cargo restaurado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};
