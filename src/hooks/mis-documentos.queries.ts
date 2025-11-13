import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import type { 
  MisDocumentosResponse, 
  SubirDocumentoRequest, 
  SubirDocumentoResponse 
} from "@/types/mis-documentos.types";

// 📋 Query Keys
export const misDocumentosKeys = {
  all: ["mis-documentos"] as const,
  data: () => [...misDocumentosKeys.all, "data"] as const,
};

// 🔍 Fetch Functions
const fetchMisDocumentos = async (): Promise<MisDocumentosResponse> => {
  const { data } = await api.get<MisDocumentosResponse>("/auth/mi-perfil/mis-documentos");
  return data;
};

const subirDocumento = async (documentoData: SubirDocumentoRequest): Promise<SubirDocumentoResponse> => {
  const formData = new FormData();
  formData.append('tipo_documento', documentoData.tipo_documento);
  formData.append('archivo', documentoData.archivo);

  const { data } = await api.post<SubirDocumentoResponse>(
    "/auth/mi-perfil/subir-documento",
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
};

// 📊 Hooks
export const useMisDocumentos = () => {
  return useQuery({
    queryKey: misDocumentosKeys.data(),
    queryFn: fetchMisDocumentos,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

export const useSubirDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subirDocumento,
    onSuccess: (data) => {
      // Invalidar y refetch los datos de documentos
      queryClient.invalidateQueries({ queryKey: misDocumentosKeys.all });
      toast.success(data.message || "Documento subido correctamente");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || "Error al subir documento";
      toast.error(message);
    },
  });
};