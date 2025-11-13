import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import type {
  CambioDestino,
  CreateCambioDestinoRequest,
  UpdateCambioDestinoRequest,
  CambioDestinoEstadisticas,
  FuncionarioBasic,
  UnidadBasic,
  CambioDestinoApiResponse,
  CambioDestinoCreateResponse,
  CambioDestinoDeleteResponse,
  CambioDestinoRestoreResponse,
  CambioDestinoFilters,
} from "@/types/cambio-destino.types";

// 📋 Query Keys
export const cambioDestinoKeys = {
  all: ["cambios-destino"] as const,
  lists: () => [...cambioDestinoKeys.all, "list"] as const,
  list: (filters: CambioDestinoFilters) =>
    [...cambioDestinoKeys.lists(), filters] as const,
  details: () => [...cambioDestinoKeys.all, "detail"] as const,
  detail: (id: number) => [...cambioDestinoKeys.details(), id] as const,
  estadisticas: () => [...cambioDestinoKeys.all, "estadisticas"] as const,
  funcionarios: () => [...cambioDestinoKeys.all, "funcionarios"] as const,
  allFuncionarios: () => [...cambioDestinoKeys.all, "all-funcionarios"] as const,
  funcionariosConDestino: () =>
    [...cambioDestinoKeys.all, "funcionarios-con-destino"] as const,
  funcionariosSinDestino: () =>
    [...cambioDestinoKeys.all, "funcionarios-sin-destino"] as const,
  unidades: () => [...cambioDestinoKeys.all, "unidades"] as const,
};

// 🔍 Fetch Functions
const fetchCambiosDestino = async (
  filters: CambioDestinoFilters = {}
): Promise<CambioDestino[]> => {
  const params = new URLSearchParams();

  if (filters.withDeleted) params.append("with_deleted", "true");

  const { data } = await api.get<CambioDestinoApiResponse>(
    `/auth/cambios-destino?${params.toString()}`
  );
  return data.data;
};

const fetchCambioDestino = async (id: number): Promise<CambioDestino> => {
  const { data } = await api.get<CambioDestino>(`/auth/cambios-destino/${id}`);
  return data;
};

const fetchCambioDestinoEstadisticas = async (
  withDeleted = false
): Promise<CambioDestinoEstadisticas> => {
  const params = withDeleted ? "?with_deleted=true" : "";
  const { data } = await api.get<{ data: CambioDestinoEstadisticas }>(
    `/auth/cambios-destino/estadisticas${params}`
  );
  return data.data;
};

const fetchFuncionariosBasic = async (): Promise<FuncionarioBasic[]> => {
  const { data } = await api.get<{ data: FuncionarioBasic[] }>(
    `/auth/cambios-destino/funcionarios-basic`
  );
  return data.data;
};

const fetchAllFuncionarios = async (): Promise<FuncionarioBasic[]> => {
  const { data } = await api.get<{ data: FuncionarioBasic[] }>(
    `/auth/cambios-destino/funcionarios-all`
  );
  return data.data;
};

const fetchFuncionariosConDestinoActivo = async (): Promise<
  (FuncionarioBasic & { destino_actual?: any })[]
> => {
  const { data } = await api.get<{
    data: (FuncionarioBasic & { destino_actual?: any })[];
  }>(`/auth/cambios-destino/funcionarios-con-destino-activo`);
  return data.data;
};

const fetchFuncionariosSinDestinoActivo = async (): Promise<
  FuncionarioBasic[]
> => {
  const { data } = await api.get<{ data: FuncionarioBasic[] }>(
    `/auth/cambios-destino/funcionarios-sin-destino-activo`
  );
  return data.data;
};

const fetchUnidadesBasic = async (): Promise<UnidadBasic[]> => {
  const { data } = await api.get<UnidadBasic[]>(
    `/auth/cambios-destino/unidades-basic`
  );
  return data;
};

// 📖 Query Hooks
export const useCambiosDestino = (filters: CambioDestinoFilters = {}) => {
  return useQuery({
    queryKey: cambioDestinoKeys.list(filters),
    queryFn: () => fetchCambiosDestino(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useCambioDestino = (id: number) => {
  return useQuery({
    queryKey: cambioDestinoKeys.detail(id),
    queryFn: () => fetchCambioDestino(id),
    enabled: !!id,
  });
};

export const useCambioDestinoEstadisticas = (withDeleted = false) => {
  return useQuery({
    queryKey: [...cambioDestinoKeys.estadisticas(), withDeleted],
    queryFn: () => fetchCambioDestinoEstadisticas(withDeleted),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useFuncionariosBasic = () => {
  return useQuery({
    queryKey: cambioDestinoKeys.funcionarios(),
    queryFn: fetchFuncionariosBasic,
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false, // Evita refetch automático
    refetchOnMount: false, // Solo refetch si los datos están obsoletos
  });
};

export const useAllFuncionarios = () => {
  return useQuery({
    queryKey: cambioDestinoKeys.allFuncionarios(),
    queryFn: fetchAllFuncionarios,
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false, // Evita refetch automático
    refetchOnMount: false, // Solo refetch si los datos están obsoletos
  });
};

export const useFuncionariosConDestinoActivo = () => {
  return useQuery({
    queryKey: cambioDestinoKeys.funcionariosConDestino(),
    queryFn: fetchFuncionariosConDestinoActivo,
    staleTime: 5 * 60 * 1000, // 5 minutos (datos más dinámicos)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useFuncionariosSinDestinoActivo = () => {
  return useQuery({
    queryKey: cambioDestinoKeys.funcionariosSinDestino(),
    queryFn: fetchFuncionariosSinDestinoActivo,
    staleTime: 5 * 60 * 1000, // 5 minutos (datos más dinámicos)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useUnidadesBasic = () => {
  return useQuery({
    queryKey: cambioDestinoKeys.unidades(),
    queryFn: fetchUnidadesBasic,
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
};

// ✏️ Mutation Functions
const createCambioDestino = async (
  data: CreateCambioDestinoRequest
): Promise<CambioDestino> => {
  const response = await api.post<CambioDestinoCreateResponse>(
    `/auth/cambios-destino`,
    data
  );
  return response.data.data;
};

const updateCambioDestino = async ({
  id,
  data,
}: {
  id: number;
  data: UpdateCambioDestinoRequest;
}): Promise<CambioDestino> => {
  const response = await api.put<CambioDestinoCreateResponse>(
    `/auth/cambios-destino/${id}`,
    data
  );
  return response.data.data;
};

const deleteCambioDestino = async (id: number): Promise<void> => {
  await api.delete<CambioDestinoDeleteResponse>(`/auth/cambios-destino/${id}`);
};

const restoreCambioDestino = async (id: number): Promise<void> => {
  await api.post<CambioDestinoRestoreResponse>(
    `/auth/cambios-destino/${id}/restore`,
    {}
  );
};

// 🔄 Mutation Hooks
export const useCreateCambioDestino = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCambioDestino,
    onSuccess: () => {
      // Invalidar solo las queries necesarias
      queryClient.invalidateQueries({ queryKey: cambioDestinoKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.estadisticas(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionariosConDestino(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionariosSinDestino(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionarios(),
      });
      toast.success("Cambio de destino creado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Error al crear el cambio de destino";
      toast.error(message);
    },
  });
};

export const useUpdateCambioDestino = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCambioDestino,
    onSuccess: (data, variables) => {
      // Invalidar solo las queries necesarias
      queryClient.invalidateQueries({ queryKey: cambioDestinoKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.estadisticas(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionariosConDestino(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionariosSinDestino(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionarios(),
      });
      toast.success("Cambio de destino actualizado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Error al actualizar el cambio de destino";
      toast.error(message);
    },
  });
};

export const useDeleteCambioDestino = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCambioDestino,
    onSuccess: () => {
      // Invalidar solo las queries necesarias
      queryClient.invalidateQueries({ queryKey: cambioDestinoKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.estadisticas(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionariosConDestino(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionariosSinDestino(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionarios(),
      });
      toast.success("Cambio de destino eliminado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Error al eliminar el cambio de destino";
      toast.error(message);
    },
  });
};

export const useRestoreCambioDestino = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreCambioDestino,
    onSuccess: () => {
      // Invalidar solo las queries necesarias
      queryClient.invalidateQueries({ queryKey: cambioDestinoKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.estadisticas(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionariosConDestino(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionariosSinDestino(),
      });
      queryClient.invalidateQueries({
        queryKey: cambioDestinoKeys.funcionarios(),
      });
      toast.success("Cambio de destino restaurado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Error al restaurar el cambio de destino";
      toast.error(message);
    },
  });
};
