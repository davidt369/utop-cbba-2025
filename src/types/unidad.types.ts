// Tipos para el módulo de Unidades

export interface Unidad {
  id: number;
  nombre_unidad: string;
  descripcion?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnidadCreateData {
  nombre_unidad: string;
  descripcion?: string;
}

export interface UnidadUpdateData {
  nombre_unidad?: string;
  descripcion?: string;
}

export interface UnidadStats {
  total: number;
  activos: number;
  eliminados: number;
  crecimiento_mes: Array<{
    mes: string;
    total: number;
  }>;
}
