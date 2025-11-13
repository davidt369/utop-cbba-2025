import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

// Tipos para roles
export interface Rol {
  id: number;
  nombre_rol: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RolApiResponse {
  data: Rol[];
}

// Hook para obtener todos los roles
export function useRoles(withTrashed = false) {
  return useQuery<Rol[], Error>({
    queryKey: ["roles", withTrashed],
    queryFn: async () => {
      const params = withTrashed ? "?with_trashed=1" : "";
      const response = await api.get<RolApiResponse>(`/auth/roles${params}`);
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (los roles no cambian frecuentemente)
  });
}

// Hook para obtener un rol específico
export function useRol(id: number) {
  return useQuery<Rol, Error>({
    queryKey: ["rol", id],
    queryFn: async () => {
      const response = await api.get<{ data: Rol }>(`/auth/roles/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Hook para obtener solo roles activos (útil para formularios)
export function useRolesActivos() {
  return useQuery<Rol[], Error>({
    queryKey: ["roles-activos"],
    queryFn: async () => {
      const response = await api.get<RolApiResponse>("/auth/roles");
      return response.data.data.filter((rol) => !rol.deleted_at);
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para obtener rol de Usuario específicamente (id: 3)
export function useRolUsuario() {
  return useQuery<Rol, Error>({
    queryKey: ["rol-usuario"],
    queryFn: async () => {
      const response = await api.get<{ data: Rol }>("/auth/roles/3");
      return response.data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutos (el rol de usuario es estático)
  });
}
