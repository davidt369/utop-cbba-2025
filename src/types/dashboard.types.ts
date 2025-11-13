// Tipos para las estadísticas del dashboard
export interface EstadisticasFuncionarios {
  total: number;
  activos: number;
  suspendidos: number;
  de_vacaciones: number;
  crecimiento_mes: CrecimientoMensual[];
}

export interface EstadisticasCargos {
  total: number;
  asignados: number;
  disponibles: number;
}

export interface EstadisticasDocumentos {
  total: number;
  aprobados: number;
  pendientes: number;
  con_archivo: number;
  por_tipo: Record<string, number>;
  subidos_mes: number;
}

export interface EstadisticasActividades {
  ausencias_mes: number;
  comisiones_mes: number;
  sanciones_mes: number;
  cambios_destino_mes: number;
}

export interface EstadisticasUnidades {
  total: number;
  con_funcionarios: number;
}

export interface ResumenMensual {
  funcionarios_nuevos: number;
  documentos_subidos: number;
  ausencias_solicitadas: number;
  comisiones_asignadas: number;
}

export interface CrecimientoMensual {
  mes: string;
  total: number;
}

export interface EstadisticasGenerales {
  funcionarios: EstadisticasFuncionarios;
  cargos: EstadisticasCargos;
  documentos: EstadisticasDocumentos;
  actividades_recientes: EstadisticasActividades;
  unidades: EstadisticasUnidades;
  resumen_mensual: ResumenMensual;
}

// Respuestas de API
export interface EstadisticasGeneralesResponse {
  success: boolean;
  data: EstadisticasGenerales;
}

export interface EstadisticasFuncionariosResponse {
  success: boolean;
  data: {
    por_estado: Record<string, number>;
    crecimiento_mensual: CrecimientoMensual[];
    total: number;
  };
}

export interface EstadisticasDocumentosResponse {
  success: boolean;
  data: EstadisticasDocumentos;
}

export interface EstadisticasActividadesResponse {
  success: boolean;
  data: {
    ausencias: {
      total: number;
      mes_actual: number;
      activas: number;
    };
    comisiones: {
      total: number;
      mes_actual: number;
      activas: number;
    };
    sanciones: {
      total: number;
      mes_actual: number;
    };
    cambios_destino: {
      total: number;
      mes_actual: number;
      activos: number;
    };
  };
}