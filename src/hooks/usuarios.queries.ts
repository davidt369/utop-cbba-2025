import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  Usuario,
  CreateUsuarioData,
  CreateUsuarioWithFuncionarioData,
  UpdateUsuarioData,
} from "@/types/usuario";

// Obtener lista de usuarios administradores
export const useUsuarios = () => {
  return useQuery<Usuario[]>({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const response = await axios.get("/auth/usuarios/administradores");
      // Asegurar que siempre retornemos un array válido
      return response.data?.data || response.data || [];
    },
  });
};

// Crear nuevo usuario
export const useCreateUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation<Usuario, Error, CreateUsuarioData>({
    mutationFn: async (data: CreateUsuarioData) => {
      const response = await axios.post("/auth/usuarios", data);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["usuarios-estadisticas"] });
    },
  });
};

// Crear usuario con funcionario
export const useCreateUsuarioWithFuncionario = () => {
  const queryClient = useQueryClient();

  return useMutation<Usuario, Error, CreateUsuarioWithFuncionarioData>({
    mutationFn: async (data: CreateUsuarioWithFuncionarioData) => {
      const response = await axios.post(
        "/auth/usuarios/with-funcionario",
        data
      );
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["usuarios-estadisticas"] });
    },
  });
};

// Actualizar usuario existente
export const useUpdateUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation<Usuario, Error, { id: number; data: UpdateUsuarioData }>({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`/auth/usuarios/${id}`, data);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["usuarios-estadisticas"] });
    },
  });
};

// Eliminar usuario
export const useDeleteUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await axios.delete(`/auth/usuarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["usuarios-estadisticas"] });
    },
  });
};

// Obtener usuario específico por ID
export const useUsuario = (id: number) => {
  return useQuery<Usuario>({
    queryKey: ["usuario", id],
    queryFn: async () => {
      const response = await axios.get(`/auth/usuarios/${id}`);
      return response.data?.data || response.data;
    },
    enabled: !!id,
  });
};

// Obtener roles disponibles
export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await axios.get("/auth/roles");
      return response.data?.data || response.data || [];
    },
  });
};

// Obtener estadísticas de usuarios por rol
export const useUsuariosEstadisticas = () => {
  return useQuery({
    queryKey: ["usuarios-estadisticas"],
    queryFn: async () => {
      const response = await axios.get("/auth/usuarios/estadisticas");
      return response.data?.data || response.data;
    },
  });
};
