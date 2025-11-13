import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface FotoPerfilResponse {
  success: boolean;
  data?: {
    id: number;
    tipo_documento: string;
    aprobado: boolean;
    tiene_archivo: boolean;
    url_archivo: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export function useFotoPerfil() {
  return useQuery({
    queryKey: ["foto-perfil"],
    queryFn: async (): Promise<FotoPerfilResponse> => {
      try {
        const response = await api.get("/auth/mi-perfil/foto-perfil");
        return response.data;
      } catch (error: any) {
        // Si el error es 404, significa que no hay foto de perfil
        if (error.response?.status === 404) {
          return {
            success: false,
            error: "No hay foto de perfil",
          };
        }
        // Para otros errores, relanzar la excepción
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
