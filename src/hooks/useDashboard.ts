import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";

export interface DashboardStats {
  totalFuncionarios: number;
  funcionariosActivos: number;
  funcionariosSuspendidos: number;
  funcionariosBajaMedica: number;
  funcionariosVacaciones: number;
  totalUnidades: number;
  ausenciasPendientes: number;
  sancionesActivas: number;
  documentosPendientes: number;
  comisionesActivas: number;
}

export interface Activity {
  type: string;
  action: string;
  user: string;
  time: string;
}

export interface FuncionarioDetalle {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  numero_carnet: string;
  telefono?: string;
  email?: string;
  estado_funcionario: string;
  cargo?: {
    id: number;
    nombre_cargo: string;
  };
  unidad?: {
    id: number;
    nombre_unidad: string;
  };
  usuario?: {
    id: number;
    email: string;
  };
}

export interface AusenciaDetalle {
  id: number;
  tipo_ausencia: string;
  motivo: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  aprobado: boolean;
  activo: boolean;
  created_at: string;
  funcionario: {
    id: number;
    primer_nombre: string;
    primer_apellido: string;
    numero_carnet: string;
  };
}

export interface SancionDetalle {
  id: number;
  tipo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: string;
  funcionario: {
    id: number;
    primer_nombre: string;
    primer_apellido: string;
    numero_carnet: string;
  };
  falta_disciplinaria?: {
    id: number;
    descripcion: string;
  };
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useAuthStore((state) => state.token);

  const fetchStats = async () => {
    try {
      const response = await api.get("/auth/dashboard/estadisticas-generales");

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Error al obtener estadísticas"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get("/auth/dashboard/actividades-recientes");

      if (response.data.success) {
        setActivities(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Error al obtener actividades"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const fetchFuncionariosByEstado = async (
    estado: string
  ): Promise<{ data: FuncionarioDetalle[]; pagination: any } | null> => {
    try {
      const response = await api.get(`/auth/dashboard/funcionarios/${estado}`);

      if (response.data.success) {
        return {
          data: response.data.data.data,
          pagination: {
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
            per_page: response.data.data.per_page,
            total: response.data.data.total,
          },
        };
      } else {
        throw new Error(
          response.data.message || "Error al obtener funcionarios"
        );
      }
    } catch (err) {
      console.error("Error fetching funcionarios:", err);
      return null;
    }
  };

  const fetchAusenciasByEstado = async (
    estado: string
  ): Promise<{ data: AusenciaDetalle[]; pagination: any } | null> => {
    try {
      const response = await api.get(`/auth/dashboard/ausencias/${estado}`);

      if (response.data.success) {
        return {
          data: response.data.data.data,
          pagination: {
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
            per_page: response.data.data.per_page,
            total: response.data.data.total,
          },
        };
      } else {
        throw new Error(response.data.message || "Error al obtener ausencias");
      }
    } catch (err) {
      console.error("Error fetching ausencias:", err);
      return null;
    }
  };

  const fetchSancionesByEstado = async (
    estado: string
  ): Promise<{ data: SancionDetalle[]; pagination: any } | null> => {
    try {
      const response = await api.get(`/auth/dashboard/sanciones/${estado}`);

      if (response.data.success) {
        return {
          data: response.data.data.data,
          pagination: {
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
            per_page: response.data.data.per_page,
            total: response.data.data.total,
          },
        };
      } else {
        throw new Error(response.data.message || "Error al obtener sanciones");
      }
    } catch (err) {
      console.error("Error fetching sanciones:", err);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      await Promise.all([fetchStats(), fetchActivities()]);

      setLoading(false);
    };

    loadData();
  }, [token]);

  return {
    stats,
    activities,
    loading,
    error,
    refetch: async () => {
      if (!token) return;
      setLoading(true);
      await Promise.all([fetchStats(), fetchActivities()]);
      setLoading(false);
    },
    fetchFuncionariosByEstado,
    fetchAusenciasByEstado,
    fetchSancionesByEstado,
  };
};
