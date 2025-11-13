// Componentes del módulo Mis Documentos
export { MisDocumentosPage } from './mis-documentos-page';
export { MisDocumentosStats } from './mis-documentos-stats';
export { MisDocumentosTable } from './mis-documentos-table';
export { SubirDocumento } from './subir-documento';

// Re-export tipos y hooks relacionados
export type { 
  MiDocumento,
  MisDocumentosEstadisticas,
  MisDocumentosResponse,
  SubirDocumentoRequest,
  SubirDocumentoResponse
} from '@/types/mis-documentos.types';

export { 
  useMisDocumentos, 
  useSubirDocumento 
} from '@/hooks/mis-documentos.queries';