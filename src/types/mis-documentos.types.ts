export interface MiDocumento {
  id: number;
  tipo_documento:
    | "Foto de perfil"
    | "Memorandum destino"
    | "Foto ubicación / croquis"
    | "Foto AVC04"
    | "Sigep"
    | "Foto carnet";
  aprobado: boolean;
  tiene_archivo: boolean;
  url_archivo: string | null;
  created_at: string;
  updated_at: string;
}

export interface MisDocumentosEstadisticas {
  total: number;
  aprobados: number;
  pendientes: number;
  con_archivo: number;
  tipos_completados: number;
  porcentaje_completado: number;
}

export interface MisDocumentosResponse {
  data: MiDocumento[];
  estadisticas: MisDocumentosEstadisticas;
  tipos_disponibles: string[];
  tipos_faltantes: string[];
}

export interface SubirDocumentoRequest {
  tipo_documento: string;
  archivo: File;
}

export interface SubirDocumentoResponse {
  success: boolean;
  message: string;
  data: MiDocumento;
}
