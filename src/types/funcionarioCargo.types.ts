// Tipos para el módulo de FuncionarioCargo

export interface FuncionarioCargo {
  id: number;
  tipo_area: "Administrativa" | "Operativa";
  fecha_asignacion?: string | null;
  deleted_at?: string | null;
  funcionario: {
    id: number;
    nombre_completo: string;
  };
  cargo: {
    id: number;
    nombre_cargo: string;
  };
}

export interface FuncionarioCargoCreateData {
  funcionario_id: number;
  cargo_id: number;
  tipo_area: "Administrativa" | "Operativa";
  fecha_asignacion?: string;
}

// Soporta creación en lote (varios funcionarios x varios cargos)
export interface FuncionarioCargoBulkCreateData {
  funcionario_ids?: number[];
  cargo_ids?: number[];
  tipo_area: "Administrativa" | "Operativa";
  fecha_asignacion?: string;
}

export interface FuncionarioCargoUpdateData {
  funcionario_id?: number;
  cargo_id?: number;
  tipo_area?: "Administrativa" | "Operativa";
  fecha_asignacion?: string;
}

export interface FuncionarioCargoStats {
  total: number;
  counts: {
    Administrativa: number;
    Operativa: number;
  };
}

// Opciones para selects
export const TIPO_AREA_OPTIONS = [
  { value: "Administrativa", label: "Administrativa" },
  { value: "Operativa", label: "Operativa" },
] as const;

// Para selects de funcionarios y cargos simplificados
export interface FuncionarioBasic {
  id: number;
  nombre_completo: string;
}

export interface CargoBasic {
  id: number;
  nombre_cargo: string;
}
