// Types for Comision module
export interface FuncionarioMini {
  id: number;
  nombre_completo: string;
}

export interface Comision {
  id: number;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  funcionario_id: number;
  activo: boolean; // Campo manual (para compatibilidad)
  es_activa: boolean; // Estado calculado automáticamente
  estado_comision: "programada" | "activa" | "finalizada" | "eliminada"; // Estado descriptivo
  dias_restantes: number; // Días restantes calculados
  pdf_respaldo_url: string | null; // URL del PDF de respaldo
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  funcionario: FuncionarioMini;
}

export interface ComisionCreateData {
  descripcion?: string;
  fecha_inicio: string; // ISO datetime or date-local with minutes
  fecha_fin: string;
  funcionario_id: number;
  pdf_respaldo?: File; // Archivo PDF de respaldo opcional
  // activo removido - ahora se calcula automáticamente
}

export interface ComisionUpdateData extends Partial<ComisionCreateData> {
  activo?: boolean; // Para compatibilidad con edición manual
}

export interface ComisionEstadisticas {
  total: number;
  eliminadas: number;
  activas: number;
  finalizadas: number;
  funcionarios_mas_comisiones: Array<{
    funcionario: string;
    comisiones_count: number;
  }>;
  funcionarios_sin_comisiones: Array<{
    funcionario: string;
    comisiones_count: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
