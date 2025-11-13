import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import type {
  Documento,
  DocumentoEstadisticas,
  CreateDocumentoData,
  UpdateDocumentoData,
  FuncionarioOption,
  TipoDocumento,
} from "@/types/documento.types";

// 📋 Hook para obtener todos los documentos
export const useDocumentos = (showDeleted: boolean = false) => {
  return useQuery({
    queryKey: ["documentos", showDeleted],
    queryFn: async (): Promise<Documento[]> => {
      const params = showDeleted ? "?onlyTrashed=true" : "";
      const { data } = await api.get(`/auth/documentos${params}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

// 📊 Hook para obtener estadísticas de documentos
export const useDocumentoEstadisticas = () => {
  return useQuery({
    queryKey: ["documentos", "estadisticas"],
    queryFn: async (): Promise<DocumentoEstadisticas> => {
      const { data } = await api.get("/auth/documentos/estadisticas");
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
};

// 👥 Hook para obtener funcionarios para select
export const useFuncionariosParaDocumento = () => {
  return useQuery({
    queryKey: ["documentos", "funcionarios"],
    queryFn: async (): Promise<FuncionarioOption[]> => {
      const { data } = await api.get("/auth/documentos/funcionarios");
      return data.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
  });
};

// 📝 Hook para obtener tipos de documentos disponibles para un funcionario
export const useTiposDisponibles = (funcionarioId: number | null) => {
  return useQuery({
    queryKey: ["documentos", "tipos-disponibles", funcionarioId],
    queryFn: async (): Promise<TipoDocumento[]> => {
      if (!funcionarioId) return [];

      const { data } = await api.get(
        `/auth/documentos/tipos-disponibles/${funcionarioId}`
      );
      return data.data;
    },
    enabled: !!funcionarioId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

// 🔍 Hook para obtener un documento específico
export const useDocumento = (id: number) => {
  return useQuery({
    queryKey: ["documentos", id],
    queryFn: async (): Promise<Documento> => {
      const { data } = await api.get(`/auth/documentos/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

// ➕ Hook para crear documento
export const useCreateDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      documentoData: CreateDocumentoData
    ): Promise<Documento> => {
      const formData = new FormData();
      formData.append("tipo_documento", documentoData.tipo_documento);
      formData.append(
        "funcionario_id",
        documentoData.funcionario_id.toString()
      );
      formData.append("archivo", documentoData.archivo);
      if (documentoData.aprobado !== undefined) {
        formData.append("aprobado", documentoData.aprobado ? "1" : "0");
      }

      const { data } = await api.post("/auth/documentos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data.data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["documentos"] });

      // No mostramos toast aquí porque se maneja en el componente
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al crear documento";
      toast.error(message);
    },
  });
};

// ✏️ Hook para actualizar documento
export const useUpdateDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateDocumentoData;
    }): Promise<Documento> => {
      const formData = new FormData();
      formData.append("_method", "PUT");

      if (data.tipo_documento) {
        formData.append("tipo_documento", data.tipo_documento);
      }
      if (data.funcionario_id) {
        formData.append("funcionario_id", data.funcionario_id.toString());
      }
      if (data.archivo) {
        formData.append("archivo", data.archivo);
      }
      if (data.aprobado !== undefined) {
        formData.append("aprobado", data.aprobado ? "1" : "0");
      }

      const response = await api.post(`/auth/documentos/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["documentos"] });

      // No mostramos toast aquí porque se maneja en el componente
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al actualizar documento";
      toast.error(message);
    },
  });
};

// 🗑️ Hook para eliminar documento
export const useDeleteDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/auth/documentos/${id}`);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["documentos"] });

      // No mostramos toast aquí porque se maneja en el componente
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al eliminar documento";
      toast.error(message);
    },
  });
};

// 🔄 Hook para restaurar documento
export const useRestoreDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<Documento> => {
      const { data } = await api.post(`/auth/documentos/${id}/restore`);
      return data.data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["documentos"] });

      // No mostramos toast aquí porque se maneja en el componente
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al restaurar documento";
      toast.error(message);
    },
  });
};
