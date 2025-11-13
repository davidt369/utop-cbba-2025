// Tipos para el módulo de Sanciones

export interface Funcionario {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  nombre_completo: string;
  estado_funcionario: string;
}

export interface Sancion {
  id: number;
  tipo_sancion: TipoSancion;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  funcionario_id: number;
  activa: boolean;
  pdf_respaldo_ruta?: string;
  funcionario: Funcionario;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  // Atributos computados del modelo
  es_activa?: boolean;
  duracion_dias?: number;
  estado_sancion?: EstadoSancion;
}

export type TipoSancion = "Suspencion" | "Baja Definitiva";
export type EstadoSancion = "Activa" | "Inactiva" | "Expirada" | "Pendiente";

export interface SancionCreateData {
  tipo_sancion: TipoSancion;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  funcionario_id: number;
  activa?: boolean;
  pdf_respaldo?: File;
}

// Tipo unión para permitir tanto objeto como FormData en create
export type SancionCreatePayload = SancionCreateData | FormData;

export interface SancionUpdateData {
  tipo_sancion?: TipoSancion;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  funcionario_id?: number;
  activa?: boolean;
  pdf_respaldo?: File;
}

// Tipo unión para permitir tanto objeto como FormData
export type SancionUpdatePayload = SancionUpdateData | FormData;

export interface SancionStats {
  total: number;
  activas: number;
  inactivas: number;
  eliminadas: number;
  por_tipo: Record<TipoSancion, number>;
  funcionarios_con_sanciones: number;
  funcionarios_disponibles: number;
  total_funcionarios_activos: number;
  sanciones_por_mes: {
    mes: string;
    total: number;
  }[];
  estados_funcionarios: Record<string, number>;
}

// Para selects simplificados
export interface FuncionarioBasic {
  id: number;
  nombre_completo: string;
  estado_funcionario: string;
}

export interface FuncionarioConSanciones extends FuncionarioBasic {
  sanciones_activas: Array<{
    id: number;
    tipo_sancion: TipoSancion;
    fecha_inicio?: string;
    fecha_fin?: string;
    descripcion?: string;
  }>;
}

// Opciones para validación de formularios
export const SANCION_VALIDATION = {
  tipo_sancion: {
    required: "El tipo de sanción es requerido",
  },
  funcionario_id: {
    required: "Debe seleccionar un funcionario",
  },
  descripcion: {
    maxLength: {
      value: 500,
      message: "La descripción no puede exceder 500 caracteres",
    },
  },
  fecha_inicio: {
    required: "La fecha de inicio es requerida",
  },
  fecha_fin: {
    validate: {
      afterStart: (value: string, context: any) => {
        const fechaInicio = context.fecha_inicio;
        if (fechaInicio && value && new Date(value) < new Date(fechaInicio)) {
          return "La fecha de fin debe ser posterior a la fecha de inicio";
        }
        return true;
      },
    },
  },
};

// Constantes
export const TIPOS_SANCION: TipoSancion[] = ["Suspencion", "Baja Definitiva"];

export const ESTADOS_SANCION: EstadoSancion[] = [
  "Activa",
  "Inactiva",
  "Expirada",
  "Pendiente",
];

export const TIPO_SANCION_LABELS: Record<TipoSancion, string> = {
  Suspencion: "Suspensión",
  "Baja Definitiva": "Baja Definitiva",
};

export const ESTADO_SANCION_COLORS: Record<EstadoSancion, string> = {
  Activa: "text-red-600 bg-red-50",
  Inactiva: "text-gray-600 bg-gray-50",
  Expirada: "text-orange-600 bg-orange-50",
  Pendiente: "text-yellow-600 bg-yellow-50",
};
