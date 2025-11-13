import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  FuncionarioCargo,
  FuncionarioCargoCreateData,
  FuncionarioCargoBulkCreateData,
  FuncionarioCargoUpdateData,
  FuncionarioCargoStats,
  FuncionarioBasic,
  CargoBasic,
} from "@/types/funcionarioCargo.types";

// 📋 Listar funcionario-cargos
export const useFuncionarioCargos = (withDeleted = false) => {
  return useQuery({
    queryKey: ["funcionario-cargos", { withDeleted }],
    queryFn: async (): Promise<FuncionarioCargo[]> => {
      const params = new URLSearchParams();
      if (withDeleted) params.append("with_deleted", "1");

      const response = await api.get(`/auth/funcionario-cargos?${params}`);
      return response.data.data;
    },
  });
};

// 📊 Estadísticas por tipo de área
export const useFuncionarioCargoStats = () => {
  return useQuery({
    queryKey: ["funcionario-cargo-stats"],
    queryFn: async (): Promise<FuncionarioCargoStats> => {
      const response = await api.get("/auth/funcionario-cargos/estadisticas");
      return response.data;
    },
  });
};

// 👥 Obtener funcionarios para selects
export const useFuncionariosBasic = () => {
  return useQuery({
    queryKey: ["funcionarios-basic"],
    queryFn: async (): Promise<FuncionarioBasic[]> => {
      const response = await api.get("/auth/funcionarios/nombres-completos");
      return response.data.data;
    },
  });
};

// 💼 Obtener cargos para selects
export const useCargosBasic = () => {
  return useQuery({
    queryKey: ["cargos-basic"],
    queryFn: async (): Promise<CargoBasic[]> => {
      const response = await api.get("/auth/cargos/nombres-completos");
      return response.data;
    },
  });
};

// ➕ Crear funcionario-cargo
export const useCreateFuncionarioCargo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: FuncionarioCargoCreateData | FuncionarioCargoBulkCreateData
    ) => {
      const response = await api.post("/auth/funcionario-cargos", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionario-cargos"] });
      queryClient.invalidateQueries({ queryKey: ["funcionario-cargo-stats"] });
      toast.success("Funcionario-Cargo creado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

// ✏️ Actualizar funcionario-cargo
export const useUpdateFuncionarioCargo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: FuncionarioCargoUpdateData;
    }) => {
      const response = await api.put(`/auth/funcionario-cargos/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionario-cargos"] });
      queryClient.invalidateQueries({ queryKey: ["funcionario-cargo-stats"] });
      toast.success("Funcionario-Cargo actualizado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

// 🗑️ Eliminar funcionario-cargo
export const useDeleteFuncionarioCargo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/auth/funcionario-cargos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionario-cargos"] });
      queryClient.invalidateQueries({ queryKey: ["funcionario-cargo-stats"] });
      toast.success("Funcionario-Cargo eliminado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

// ♻️ Restaurar funcionario-cargo
export const useRestoreFuncionarioCargo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/auth/funcionario-cargos/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionario-cargos"] });
      queryClient.invalidateQueries({ queryKey: ["funcionario-cargo-stats"] });
      toast.success("Funcionario-Cargo restaurado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};
