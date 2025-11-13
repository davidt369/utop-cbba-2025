export interface Documento {
  id: number;
  tipo_documento: TipoDocumento;
  funcionario: {
    id: number;
    nombre_completo: string;
  };
  aprobado: boolean;
  tiene_archivo: boolean;
  url_archivo: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type TipoDocumento =
  | "Foto de perfil"
  | "Memorandum destino"
  | "Foto ubicación / croquis"
  | "Foto AVC04"
  | "Sigep"
  | "Foto carnet";

export interface DocumentoEstadisticas {
  total: number;
  aprobados: number;
  pendientes: number;
  eliminados: number;
  por_tipo: Record<TipoDocumento, number>;
  funcionarios_completos: number;
  funcionarios_pendientes: number;
}

export interface CreateDocumentoData {
  tipo_documento: TipoDocumento;
  funcionario_id: number;
  archivo: File;
  aprobado?: boolean;
}

export interface UpdateDocumentoData {
  tipo_documento?: TipoDocumento;
  funcionario_id?: number;
  archivo?: File;
  aprobado?: boolean;
}

export interface FuncionarioOption {
  id: number;
  nombre_completo: string;
}

// Mapeo de tipos de documento a iconos y colores
export const TIPO_DOCUMENTO_CONFIG = {
  "Foto de perfil": {
    icon: "User",
    color: "bg-blue-100 text-blue-800",
    description: "Fotografía oficial del funcionario",
  },
  "Memorandum destino": {
    icon: "FileText",
    color: "bg-green-100 text-green-800",
    description: "Documento de asignación de destino",
  },
  "Foto ubicación / croquis": {
    icon: "MapPin",
    color: "bg-yellow-100 text-yellow-800",
    description: "Imagen de ubicación o croquis del lugar",
  },
  "Foto AVC04": {
    icon: "Camera",
    color: "bg-purple-100 text-purple-800",
    description: "Documento fotográfico AVC04",
  },
  Sigep: {
    icon: "Shield",
    color: "bg-red-100 text-red-800",
    description: "Documento del Sistema SIGEP",
  },
  "Foto carnet": {
    icon: "CreditCard",
    color: "bg-orange-100 text-orange-800",
    description: "Fotografía tipo carnet del funcionario",
  },
} as const;

export const TIPOS_DOCUMENTO: TipoDocumento[] = [
  "Foto de perfil",
  "Memorandum destino",
  "Foto ubicación / croquis",
  "Foto AVC04",
  "Sigep",
  "Foto carnet",
];
