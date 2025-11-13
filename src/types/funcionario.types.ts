// Tipos para funcionarios basados en la migración y controlador Laravel

export type ExpedidoType =
  | "LP"
  | "OR"
  | "PT"
  | "CB"
  | "CH"
  | "TJ"
  | "SC"
  | "BE"
  | "PA";

export type SexoType = "M" | "F";

export type GradoJerarquicoType =
  | "Coronel"
  | "Teniente coronel"
  | "Mayor"
  | "Capitán"
  | "Teniente"
  | "Sub teniente"
  | "Sub oficial superior"
  | "Sub oficial primero"
  | "Sub oficial segundo"
  | "Sargento mayor"
  | "Sargento primero"
  | "Sargento segundo"
  | "Sargento inicial";

export type EstadoFuncionarioType =
  | "Activo"
  | "Suspendido"
  | "Baja medica"
  | "De Vacaciones"
  | "En permiso"
  | "Baja Definitiva";

export interface Usuario {
  id: number;
  email: string;
  funcionario_id: number;
  rol_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  rol: {
    id: number;
    nombre_rol: string;
    descripcion: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
}

export interface Funcionario {
  id: number;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  numero_carnet: string | null;
  expedido: ExpedidoType;
  sexo: SexoType;
  grado_jerarquico: GradoJerarquicoType;
  direccion: string | null;
  numero_celular: string | null;
  numero_escalafon: string | null;
  numero_cuenta_bancaria: string | null;
  estado_funcionario: EstadoFuncionarioType;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  usuario: Usuario | null;
}

export interface FuncionarioCreateData {
  // Datos del funcionario
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  numero_carnet?: string;
  expedido: ExpedidoType;
  sexo: SexoType;
  grado_jerarquico: GradoJerarquicoType;
  direccion?: string;
  numero_celular?: string;
  numero_escalafon?: string;
  numero_cuenta_bancaria?: string;
  estado_funcionario: EstadoFuncionarioType;

  // Datos del usuario asociado
  email: string;
  password: string;
  rol_id: number;
}

export interface FuncionarioUpdateData {
  // Datos del funcionario
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  numero_carnet?: string;
  expedido: ExpedidoType;
  sexo: SexoType;
  grado_jerarquico: GradoJerarquicoType;
  direccion?: string;
  numero_celular?: string;
  numero_escalafon?: string;
  numero_cuenta_bancaria?: string;
  estado_funcionario?: EstadoFuncionarioType;

  // Datos del usuario asociado
  email: string;
  password?: string; // Opcional en actualización
  rol_id?: number; // Opcional para no cambiar el rol actual
}

export interface FuncionarioStats {
  total: number;
  counts: Record<EstadoFuncionarioType, number>;
}

export interface FuncionarioApiResponse {
  data: Funcionario[];
}

export interface FuncionarioStatsApiResponse {
  total: number;
  counts: Record<EstadoFuncionarioType, number>;
}

// Constantes para formularios
export const EXPEDIDO_OPTIONS: { value: ExpedidoType; label: string }[] = [
  { value: "LP", label: "La Paz" },
  { value: "OR", label: "Oruro" },
  { value: "PT", label: "Potosí" },
  { value: "CB", label: "Cochabamba" },
  { value: "CH", label: "Chuquisaca" },
  { value: "TJ", label: "Tarija" },
  { value: "SC", label: "Santa Cruz" },
  { value: "BE", label: "Beni" },
  { value: "PA", label: "Pando" },
];

export const SEXO_OPTIONS: { value: SexoType; label: string }[] = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
];

export const GRADO_JERARQUICO_OPTIONS: {
  value: GradoJerarquicoType;
  label: string;
}[] = [
  { value: "Coronel", label: "Coronel" },
  { value: "Teniente coronel", label: "Teniente coronel" },
  { value: "Mayor", label: "Mayor" },
  { value: "Capitán", label: "Capitán" },
  { value: "Teniente", label: "Teniente" },
  { value: "Sub teniente", label: "Sub teniente" },
  { value: "Sub oficial superior", label: "Sub oficial superior" },
  { value: "Sub oficial primero", label: "Sub oficial primero" },
  { value: "Sub oficial segundo", label: "Sub oficial segundo" },
  { value: "Sargento mayor", label: "Sargento mayor" },
  { value: "Sargento primero", label: "Sargento primero" },
  { value: "Sargento segundo", label: "Sargento segundo" },
  { value: "Sargento inicial", label: "Sargento inicial" },
];

export const ESTADO_FUNCIONARIO_OPTIONS: {
  value: EstadoFuncionarioType;
  label: string;
}[] = [
  { value: "Activo", label: "Activo" },
  { value: "Suspendido", label: "Suspendido" },
  { value: "Baja medica", label: "Baja médica" },
  { value: "De Vacaciones", label: "De Vacaciones" },
  { value: "En permiso", label: "En permiso" },
  { value: "Baja Definitiva", label: "Baja Definitiva" },
];
