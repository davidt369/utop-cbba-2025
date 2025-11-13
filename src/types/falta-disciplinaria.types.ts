// Tipos para el módulo de Faltas Disciplinarias

export interface Funcionario {
  documento: any;
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  nombre_completo: string;
  estado_funcionario: string;
}

export interface FaltaDisciplinaria {
  id: number;
  descripcion: string;
  funcionario_id: number;
  fecha_falta: string;
  tipo_gravedad: TipoGravedad;
  funcionario: Funcionario;
  pdf_respaldo_url?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Tipos de gravedad
export type TipoGravedad = "Leve" | "Grave" | "Muy Grave";

export const TIPOS_GRAVEDAD: TipoGravedad[] = ["Leve", "Grave", "Muy Grave"];

export const TIPOS_GRAVEDAD_OPTIONS = [
  { value: "Leve", label: "Leve" },
  { value: "Grave", label: "Grave" },
  { value: "Muy Grave", label: "Muy Grave" },
] as const;

// Datos para crear falta disciplinaria
export interface FaltaDisciplinariaCreateData {
  descripcion: string;
  funcionario_id: number;
  fecha_falta: string;
  tipo_gravedad: TipoGravedad;
}

// Datos para actualizar falta disciplinaria
export interface FaltaDisciplinariaUpdateData {
  descripcion?: string;
  funcionario_id?: number;
  fecha_falta?: string;
  tipo_gravedad?: TipoGravedad;
  // Para operaciones especiales desde el frontend
  delete_pdf?: 1;
}

// Respuesta de API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Estadísticas de faltas disciplinarias
export interface FaltaDisciplinariaEstadisticas {
  total: number;
  eliminadas: number;
  por_gravedad: Record<TipoGravedad, number>;
  funcionarios_con_faltas: number;
  faltas_por_mes: Array<{
    mes: string;
    total: number;
  }>;
  faltas_por_funcionario: Array<{
    nombre_completo: string;
    total_faltas: number;
  }>;
}

// Filtros
export interface FaltaDisciplinariaFiltros {
  searchTerm: string;
  gravedadFilter: TipoGravedad | "todos";
  showDeleted: boolean;
}

// Estados del store
export interface FaltaDisciplinariaState extends FaltaDisciplinariaFiltros {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedFalta: FaltaDisciplinaria | null;
}

// Acciones del store
export interface FaltaDisciplinariaActions {
  // Diálogos
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  openEditDialog: (falta: FaltaDisciplinaria) => void;
  closeEditDialog: () => void;
  openDeleteDialog: (falta: FaltaDisciplinaria) => void;
  closeDeleteDialog: () => void;

  // Filtros
  setSearchTerm: (term: string) => void;
  setGravedadFilter: (gravedad: TipoGravedad | "todos") => void;
  setShowDeleted: (show: boolean) => void;
  clearFilters: () => void;
}

export type FaltaDisciplinariaStore = FaltaDisciplinariaState &
  FaltaDisciplinariaActions;
