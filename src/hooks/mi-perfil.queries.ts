import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";

// Tipos
export interface MiPerfil {
  id: number | null;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  numero_carnet: string | null;
  expedido: string;
  sexo: "M" | "F";
  grado_jerarquico: string;
  direccion: string | null;
  numero_celular: string | null;
  numero_escalafon: string | null;
  numero_cuenta_bancaria: string | null;
  estado_funcionario: string;
  created_at: string | null;
  updated_at: string | null;
  needs_completion?: boolean; // Flag para indicar si necesita completar datos
  usuario: {
    id: number;
    email: string;
    funcionario_id: number | null;
    rol_id: number;
    created_at: string;
    updated_at: string;
    rol: {
      id: number;
      nombre_rol: string;
      descripcion: string | null;
    };
  };
}

export interface EstadisticasPersonales {
  documentos: {
    total: number;
    aprobados: number;
    pendientes: number;
    con_archivo: number;
  };
  ausencias: {
    total: number;
    aprobadas: number;
    activas: number;
    pendientes: number;
  };
  comisiones: {
    total: number;
    aprobadas: number;
    pendientes: number;
    activas: number;
  };
  sanciones: {
    total: number;
    activas: number;
    inactivas: number;
  };
  faltas_disciplinarias: {
    total: number;
    leves: number;
    graves: number;
    muy_graves: number;
  };
  cargos: {
    total: number;
    activos: number;
    inactivos: number;
  };
  cambios_destino: number;
}

export interface ResumenActividades {
  actividades_recientes: {
    documentos: number;
    ausencias: number;
    comisiones: number;
    faltas: number;
    sanciones: number;
  };
  porcentaje_documentacion: number;
  periodo_consulta: string;
}

export interface UpdateDatosFuncionarioData {
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  numero_carnet?: string;
  expedido?: string;
  sexo?: string;
  grado_jerarquico?: string;
  direccion?: string;
  numero_celular?: string;
  numero_escalafon?: string;
  numero_cuenta_bancaria?: string;
  estado_funcionario?: string; // Agregado campo faltante
}

export interface UpdateEmailData {
  email: string;
  password: string;
}

export interface UpdatePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface MiCargo {
  id: number;
  cargo: {
    id: number | null;
    nombre: string;
    descripcion: string;
    area_tipo: string;
    nivel_jerarquico: string;
    unidad: {
      id: number | null;
      nombre: string;
      tipo: string;
    };
  };
  fecha_asignacion: string;
  fecha_cese: string | null;
  activo: boolean;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

export interface EstadisticasCargos {
  total_cargos: number;
  cargos_activos: number;
  cargos_administrativos: number;
  cargos_operativos: number;
  unidades_trabajadas: number;
  cargo_actual: MiCargo | null;
  tiempo_en_cargo_actual: string | null;
}

export interface MisCargosResponse {
  cargos: MiCargo[];
  estadisticas: EstadisticasCargos;
}

export interface MiAusencia {
  id: number;
  tipo_ausencia: "Permiso" | "Baja Médica" | "Vacaciones";
  motivo: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string | null;
  aprobado: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface EstadisticasAusencias {
  total_ausencias: number;
  ausencias_aprobadas: number;
  ausencias_pendientes: number;
  ausencias_activas: number;
  permisos: number;
  bajas_medicas: number;
  dias_ausencia_año: number;
  ausencia_actual: MiAusencia | null;
}

export interface MiAusencia {
  id: number;
  tipo_ausencia: "Permiso" | "Baja Médica" | "Vacaciones";
  motivo: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string | null;
  aprobado: boolean;
  activo: boolean;
  pdf_respaldo_ruta: string | null;
  created_at: string;
  updated_at: string;
}

export interface EstadisticasAusencias {
  total_ausencias: number;
  ausencias_activas: number;
  ausencias_pendientes: number;
  dias_ausencia_año: number;
  permisos: number;
  bajas_medicas: number;
  vacaciones: number;
  ausencia_actual: MiAusencia | null;
}

export interface MisAusenciasResponse {
  ausencias: MiAusencia[];
  estadisticas: EstadisticasAusencias;
}

export interface SolicitarAusenciaData {
  tipo_ausencia: "Permiso" | "Baja Médica" | "Vacaciones";
  motivo?: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion?: string;
}

export interface MiSancion {
  id: number;
  tipo: string;
  severidad: string;
  descripcion: string;
  fecha_aplicacion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
}

export interface EstadisticasSanciones {
  total: number;
  activas: number;
  finalizadas: number;
  por_tipo: {
    Leve: number;
    Grave: number;
    "Muy Grave": number;
  };
}

export interface MisSancionesResponse {
  estadisticas: EstadisticasSanciones;
  sancion_actual: MiSancion | null;
  historial_sanciones: MiSancion[];
}

// Hooks de queries
export const useMiPerfil = () => {
  return useQuery({
    queryKey: ["mi-perfil"],
    queryFn: async (): Promise<MiPerfil> => {
      const { data } = await api.get("/auth/mi-perfil");
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

export const useEstadisticasPersonales = () => {
  return useQuery({
    queryKey: ["mi-perfil", "estadisticas"],
    queryFn: async (): Promise<EstadisticasPersonales> => {
      const { data } = await api.get("/auth/mi-perfil/estadisticas");
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
};

export const useResumenActividades = () => {
  return useQuery({
    queryKey: ["mi-perfil", "resumen-actividades"],
    queryFn: async (): Promise<ResumenActividades> => {
      const { data } = await api.get("/auth/mi-perfil/resumen-actividades");
      return data.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
  });
};

// Hooks de mutations
export const useUpdateDatosFuncionario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateDatosFuncionarioData): Promise<MiPerfil> => {
      const response = await api.put("/auth/mi-perfil/datos-funcionario", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mi-perfil"] });
      toast.success("Datos actualizados correctamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || "Error al actualizar datos";
      toast.error(message);
    },
  });
};

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEmailData) => {
      const response = await api.put("/auth/mi-perfil/email", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mi-perfil"] });
      toast.success("Email actualizado correctamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || "Error al actualizar email";
      toast.error(message);
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      const response = await api.put("/auth/mi-perfil/password", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Contraseña actualizada correctamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || "Error al cambiar contraseña";
      toast.error(message);
    },
  });
};

export const useMisCargos = () => {
  return useQuery({
    queryKey: ["mi-perfil", "mis-cargos"],
    queryFn: async (): Promise<MisCargosResponse> => {
      const { data } = await api.get("/auth/mi-perfil/mis-cargos");
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useMisAusencias = () => {
  return useQuery({
    queryKey: ["mi-perfil", "mis-ausencias"],
    queryFn: async (): Promise<MisAusenciasResponse> => {
      const { data } = await api.get("/auth/mi-perfil/mis-ausencias");
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useSolicitarAusencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SolicitarAusenciaData | FormData) => {
      const config =
        data instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};

      const response = await api.post(
        "/auth/mi-perfil/solicitar-ausencia",
        data,
        config
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Solicitud de ausencia enviada correctamente");
      queryClient.invalidateQueries({
        queryKey: ["mi-perfil", "mis-ausencias"],
      });
      queryClient.invalidateQueries({
        queryKey: ["mi-perfil", "estadisticas"],
      });
      queryClient.invalidateQueries({
        queryKey: ["mi-perfil", "resumen-actividades"],
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || "Error al solicitar ausencia";
      toast.error(message);
    },
  });
};

export const useMisSanciones = () => {
  return useQuery({
    queryKey: ["mi-perfil", "mis-sanciones"],
    queryFn: async (): Promise<MisSancionesResponse> => {
      const { data } = await api.get("/auth/mi-perfil/mis-sanciones");
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
