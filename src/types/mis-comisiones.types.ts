export interface MiComision {
  id: number;
  descripcion: string;
  fecha_inicio: string; // YYYY-MM-DD format
  fecha_fin: string; // YYYY-MM-DD format
  activo: boolean;
  created_at: string;
  estado: 'programada' | 'en_curso' | 'finalizada' | 'vencida' | 'activa';
  dias_restantes: number;
}

export interface MisComisionesEstadisticas {
  total: number;
  activas: number;
  finalizadas: number;
  proximas_a_vencer: number;
  comisiones_por_mes: Array<{
    mes: string; // YYYY-MM format
    total: number;
  }>;
}

export interface MisComisionesResponse {
  data: MiComision[];
  total: number;
  estadisticas: MisComisionesEstadisticas;
}