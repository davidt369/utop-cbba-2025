export interface CambioDestino {
  id: number;
  fecha_destino: string; // ISO date string
  motivo_cambio: string;
  activo: boolean;
  deleted_at: string | null; // ISO date string or null
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  funcionario: {
    id: number;
    nombre_completo: string;
    numero_carnet: string;
  };
  unidad_destino: {
    id: number;
    nombre_unidad: string;
  };
  unidad_anterior: {
    id: number;
    nombre_unidad: string;
  } | null;
}

export interface CreateCambioDestinoRequest {
  funcionario_id: number;
  unidad_destino_id: number;
  destino_anterior_id?: number | null;
  fecha_destino: string; // ISO date string
  motivo_cambio: string;
  activo?: boolean;
}

export interface UpdateCambioDestinoRequest {
  funcionario_id?: number;
  unidad_destino_id?: number;
  destino_anterior_id?: number | null;
  fecha_destino?: string; // ISO date string
  motivo_cambio?: string;
  activo?: boolean;
}

export interface CambioDestinoEstadisticas {
  total: number;
  activos: number;
  inactivos: number;
  eliminados: number;
  cambios_por_mes: Array<{
    mes: string; // YYYY-MM format
    total: number;
  }>;
  unidades_populares: Array<{
    unidad: string;
    total: number;
  }>;
}

export interface FuncionarioBasic {
  id: number;
  nombre_completo: string;
  numero_carnet: string;
}

export interface UnidadBasic {
  id: number;
  nombre_unidad: string;
}

export interface CambioDestinoApiResponse {
  data: CambioDestino[];
}

export interface CambioDestinoCreateResponse {
  message: string;
  data: CambioDestino;
}

export interface CambioDestinoDeleteResponse {
  message: string;
}

export interface CambioDestinoRestoreResponse {
  message: string;
}

export interface CambioDestinoFilters {
  withDeleted?: boolean;
  funcionario?: string;
  unidad?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo?: boolean | null;
}

export interface CambioDestinoTableColumn {
  funcionario: string;
  unidad_destino: string;
  unidad_anterior: string | null;
  fecha_destino: string;
  motivo_cambio: string;
  activo: boolean;
  estado: 'activo' | 'eliminado';
  acciones: string;
}