export interface Ausencia {
  id: number;
  tipo_ausencia: "Permiso" | "Baja Médica" | "Vacaciones";
  motivo: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string | null;
  aprobado: boolean;
  activo: boolean;
  funcionario_id: number;
  pdf_respaldo_ruta: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  funcionario?: FuncionarioBasic;
}

export interface FuncionarioBasic {
  id: number;
  nombre_completo: string;
  numero_carnet: string;
  estado_funcionario?: string;
  puede_tener_ausencia?: boolean;
  razon_restriccion?: string | null;
}

export interface AusenciaFormData {
  tipo_ausencia: "Permiso" | "Baja Médica" | "Vacaciones";
  motivo?: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion?: string;
  aprobado: boolean;
  activo?: boolean; // Opcional porque se calcula automáticamente en el backend
  funcionario_id: number;
  pdf_respaldo?: File;
}

export interface AusenciaEstadisticas {
  total: number;
  activas: number;
  inactivas: number;
  aprobadas: number;
  pendientes: number;
  eliminadas: number;
  ausencias_por_mes: Array<{
    mes: string;
    total: number;
  }>;
  ausencias_por_tipo: Array<{
    tipo: string;
    total: number;
  }>;
  funcionarios_proximos_finalizar: Array<{
    id: number;
    nombre_completo: string;
    fecha_fin: string;
    tipo_ausencia: string;
    dias_restantes: number;
  }>;
}

export interface AusenciaResponse {
  success: boolean;
  data: Ausencia[];
  message?: string;
}

export interface AusenciaCreateResponse {
  success: boolean;
  data: Ausencia;
  message: string;
}

export interface AusenciaUpdateResponse {
  success: boolean;
  data: Ausencia;
  message: string;
}

export interface AusenciaDeleteResponse {
  success: boolean;
  message: string;
}

export interface AusenciaEstadisticasResponse {
  success: boolean;
  data: AusenciaEstadisticas;
}

export interface FuncionarioBasicResponse {
  success: boolean;
  data: FuncionarioBasic[];
}

export const TIPOS_AUSENCIA: Array<{
  value: "Permiso" | "Baja Médica" | "Vacaciones";
  label: string;
}> = [
  { value: "Permiso", label: "Permiso" },
  { value: "Baja Médica", label: "Baja Médica" },
  { value: "Vacaciones", label: "Vacaciones" },
];
