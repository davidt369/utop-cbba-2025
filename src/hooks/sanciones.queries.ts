import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Sancion,
  SancionCreateData,
  SancionCreatePayload,
  SancionUpdateData,
  SancionUpdatePayload,
  SancionStats,
  FuncionarioBasic,
  FuncionarioConSanciones,
  TipoSancion,
} from "@/types/sancion.types";

// 📋 Listar sanciones
export const useSanciones = (withDeleted = false) => {
  return useQuery({
    queryKey: ["sanciones", { withDeleted }],
    queryFn: async (): Promise<Sancion[]> => {
      const params = new URLSearchParams();
      if (withDeleted) params.append("with_trashed", "1");

      const response = await api.get(`/auth/sanciones?${params}`);
      return response.data.data;
    },
  });
};

// 📊 Estadísticas de sanciones
export const useSancionesStats = () => {
  return useQuery({
    queryKey: ["sanciones-stats"],
    queryFn: async (): Promise<SancionStats> => {
      const response = await api.get("/auth/sanciones/estadisticas/general");
      return response.data.data;
    },
  });
};

// 👥 Funcionarios disponibles para sanción
export const useFuncionariosDisponibles = () => {
  return useQuery({
    queryKey: ["funcionarios-disponibles-sancion"],
    queryFn: async (): Promise<FuncionarioBasic[]> => {
      const response = await api.get(
        "/auth/sanciones/funcionarios/disponibles"
      );
      return response.data.data;
    },
  });
};

// 👥 Todos los funcionarios (para edición)
export const useFuncionarios = () => {
  return useQuery({
    queryKey: ["funcionarios-todos-sancion"],
    queryFn: async (): Promise<FuncionarioBasic[]> => {
      const response = await api.get("/auth/sanciones/funcionarios/todos");
      return response.data.data;
    },
  });
};

// 👥 Funcionarios con sanciones activas
export const useFuncionariosConSanciones = () => {
  return useQuery({
    queryKey: ["funcionarios-con-sanciones"],
    queryFn: async (): Promise<FuncionarioConSanciones[]> => {
      const response = await api.get(
        "/auth/sanciones/funcionarios/con-sanciones"
      );
      return response.data.data;
    },
  });
};

// 🏷️ Tipos de sanción disponibles
export const useTiposSancion = () => {
  return useQuery({
    queryKey: ["tipos-sancion"],
    queryFn: async (): Promise<TipoSancion[]> => {
      const response = await api.get("/auth/sanciones/tipos/disponibles");
      return response.data.data;
    },
  });
};

// 📌 Obtener una sanción específica
export const useSancion = (id: number) => {
  return useQuery({
    queryKey: ["sancion", id],
    queryFn: async (): Promise<Sancion> => {
      const response = await api.get(`/auth/sanciones/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// ➕ Crear sanción
export const useCreateSancion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SancionCreatePayload): Promise<any> => {
      // When sending FormData, do NOT set Content-Type manually so the browser
      // can append the correct boundary. Axios/Browser will set the header.
      const response = await api.post(
        "/auth/sanciones",
        data,
        data instanceof FormData
          ? undefined
          : { headers: { "Content-Type": "application/json" } }
      );
      return response.data; // Retornar toda la respuesta, no solo data
    },
    onSuccess: (responseData: any) => {
      queryClient.invalidateQueries({ queryKey: ["sanciones"] });
      queryClient.invalidateQueries({ queryKey: ["sanciones-stats"] });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-disponibles-sancion"],
      });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-con-sanciones"],
      });
      // También invalidar queries de ausencias ya que pueden haber sido desactivadas
      queryClient.invalidateQueries({ queryKey: ["ausencias"] });
      queryClient.invalidateQueries({ queryKey: ["ausencia-estadisticas"] });

      // Mostrar mensaje personalizado si se desactivaron ausencias
      if (
        responseData.ausencias_desactivadas &&
        responseData.ausencias_desactivadas.length > 0
      ) {
        toast.success(responseData.message || "Sanción creada exitosamente");
        // Mostrar información adicional sobre ausencias desactivadas
        const count = responseData.ausencias_desactivadas.length;
        toast.info(
          `Se ${count === 1 ? "desactivó" : "desactivaron"} ${count} ausencia${
            count === 1 ? "" : "s"
          } activa${count === 1 ? "" : "s"} del funcionario.`,
          { duration: 5000 }
        );
      } else {
        toast.success(responseData.message || "Sanción creada exitosamente");
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors ||
        "Error al crear la sanción";

      if (typeof errorMessage === "object") {
        // Mostrar el primer error si es un objeto de errores de validación
        const firstError = Object.values(errorMessage)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

// ✏️ Actualizar sanción
export const useUpdateSancion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: SancionUpdatePayload;
    }): Promise<any> => {
      console.log("🔧 Hook: Enviando datos para sanción ID:", id);
      console.log(
        "🔧 Hook: Tipo de datos:",
        data instanceof FormData ? "FormData" : "JSON"
      );

      if (data instanceof FormData) {
        console.log("🔧 Hook: Contenido del FormData:");
        for (let [key, value] of data.entries()) {
          console.log(`  ${key}:`, value);
        }

        // Verificar que _method esté presente (debería venir del diálogo)
        if (!data.has("_method")) {
          console.warn(
            "⚠️ Hook: _method no está presente en FormData, agregándolo"
          );
          data.append("_method", "PUT");
        } else {
          console.log("✅ Hook: _method ya está presente en FormData");
        }

        console.log(
          "🔧 Hook: Enviando POST con _method=PUT a:",
          `/auth/sanciones/${id}`
        );
        // For FormData, do not set Content-Type header explicitly (leave to browser)
        const response = await api.post(`/auth/sanciones/${id}`, data);
        return response.data; // Retornar toda la respuesta
      } else {
        console.log("🔧 Hook: Contenido del JSON:", data);
        console.log("🔧 Hook: Enviando PUT a:", `/auth/sanciones/${id}`);

        // Para JSON, usar PUT normal
        const response = await api.put(`/auth/sanciones/${id}`, data, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        return response.data; // Retornar toda la respuesta
      }
    },
    onSuccess: async (responseData) => {
      // Invalidar y refetch inmediatamente
      await queryClient.invalidateQueries({
        queryKey: ["sanciones"],
        refetchType: "active",
      });
      await queryClient.invalidateQueries({
        queryKey: ["sanciones-stats"],
        refetchType: "active",
      });
      await queryClient.invalidateQueries({
        queryKey: ["funcionarios-disponibles-sancion"],
        refetchType: "active",
      });
      await queryClient.invalidateQueries({
        queryKey: ["funcionarios-con-sanciones"],
        refetchType: "active",
      });
      await queryClient.invalidateQueries({
        queryKey: ["sancion", responseData.data.id],
        refetchType: "active",
      });
      // También invalidar queries de ausencias ya que pueden haber sido desactivadas
      await queryClient.invalidateQueries({ queryKey: ["ausencias"] });
      await queryClient.invalidateQueries({
        queryKey: ["ausencia-estadisticas"],
      });

      // También actualizar directamente el cache con los nuevos datos
      queryClient.setQueryData(
        ["sancion", responseData.data.id],
        responseData.data
      );

      // Actualizar la query de sanciones si existe en el cache
      const existingData = queryClient.getQueryData([
        "sanciones",
        { withDeleted: true },
      ]) as Sancion[] | undefined;
      if (existingData) {
        const updatedData = existingData.map((sancion) =>
          sancion.id === responseData.data.id ? responseData.data : sancion
        );
        queryClient.setQueryData(
          ["sanciones", { withDeleted: true }],
          updatedData
        );
      }

      // Mostrar mensaje personalizado si se desactivaron ausencias
      if (
        responseData.ausencias_desactivadas &&
        responseData.ausencias_desactivadas.length > 0
      ) {
        toast.success(
          responseData.message || "Sanción actualizada exitosamente"
        );
        // Mostrar información adicional sobre ausencias desactivadas
        const count = responseData.ausencias_desactivadas.length;
        toast.info(
          `Se ${count === 1 ? "desactivó" : "desactivaron"} ${count} ausencia${
            count === 1 ? "" : "s"
          } activa${count === 1 ? "" : "s"} del funcionario.`,
          { duration: 5000 }
        );
      } else {
        toast.success(
          responseData.message || "Sanción actualizada exitosamente"
        );
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors ||
        "Error al actualizar la sanción";

      if (typeof errorMessage === "object") {
        const firstError = Object.values(errorMessage)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

// 🔄 Activar/Desactivar sanción
export const useToggleActivarSancion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      activar,
    }: {
      id: number;
      activar: boolean;
    }): Promise<Sancion> => {
      const response = await api.post(`/auth/sanciones/${id}/toggle-activar`, {
        activar,
      });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sanciones"] });
      queryClient.invalidateQueries({ queryKey: ["sanciones-stats"] });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-disponibles-sancion"],
      });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-con-sanciones"],
      });
      queryClient.invalidateQueries({ queryKey: ["sancion", data.id] });
      toast.success(
        `Sanción ${variables.activar ? "activada" : "desactivada"} exitosamente`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Error al cambiar el estado de la sanción";
      toast.error(errorMessage);
    },
  });
};

// 🗑️ Eliminar sanción
export const useDeleteSancion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/auth/sanciones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanciones"] });
      queryClient.invalidateQueries({ queryKey: ["sanciones-stats"] });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-disponibles-sancion"],
      });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-con-sanciones"],
      });
      toast.success("Sanción eliminada exitosamente");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Error al eliminar la sanción";
      toast.error(errorMessage);
    },
  });
};

// ♻️ Restaurar sanción
export const useRestoreSancion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.post(`/auth/sanciones/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanciones"] });
      queryClient.invalidateQueries({ queryKey: ["sanciones-stats"] });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-disponibles-sancion"],
      });
      queryClient.invalidateQueries({
        queryKey: ["funcionarios-con-sanciones"],
      });
      toast.success("Sanción restaurada exitosamente");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Error al restaurar la sanción";
      toast.error(errorMessage);
    },
  });
};

// 🔎 Obtener sanciones cuya fecha_fin cae en el mes actual
export const useSancionesPorMes = () => {
  return useQuery({
    queryKey: ["sanciones-por-mes"],
    queryFn: async (): Promise<Sancion[]> => {
      const response = await api.get("/auth/sanciones/por-mes");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
