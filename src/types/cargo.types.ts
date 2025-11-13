// Tipos para el módulo de Cargos

export interface Cargo {
  id: number;
  nombre_cargo: string;
  descripcion?: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CargoCreateData {
  nombre_cargo: string;
  descripcion?: string;
}

export interface CargoUpdateData {
  nombre_cargo?: string;
  descripcion?: string;
}

export interface CargoStats {
  total: number;
  activos: number;
  eliminados: number;
  crecimiento_mes: {
    mes: string;
    total: number;
  }[];
}

// Para selects simplificados (usado en otros módulos)
export interface CargoBasic {
  id: number;
  nombre_cargo: string;
}

// Opciones para validación de formularios
export const CARGO_VALIDATION = {
  nombre_cargo: {
    required: "El nombre del cargo es requerido",
    maxLength: {
      value: 100,
      message: "El nombre del cargo no puede exceder 100 caracteres",
    },
  },
  descripcion: {
    maxLength: {
      value: 255,
      message: "La descripción no puede exceder 255 caracteres",
    },
  },
} as const;
