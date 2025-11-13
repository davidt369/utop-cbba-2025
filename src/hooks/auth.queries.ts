import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
import api from "@/lib/axios";
import { useAuthStore, User } from "@/store/auth.store";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  rol_id?: number;
  funcionario?: {
    primer_nombre: string;
    primer_apellido: string;
    expedido: string;
    sexo: string;
    grado_jerarquico: string;
    estado_funcionario: string;
  };
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  data?: {
    token: string;
    user: User;
  };
}

interface UserResponse {
  success: boolean;
  user: User;
  data?: User;
}

export function useLogin() {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    // useLogin mutation function
    mutationFn: async (
      credentials: LoginCredentials
    ): Promise<{ token: string; user: User }> => {
      const { data } = await api.post<any>("/auth/login", credentials);

      // Manejar diferentes formatos de respuesta posibles
      if (data.success && data.data && data.data.token && data.data.user) {
        return data.data;
      } else if (data.token && data.user) {
        return { token: data.token, user: data.user };
      } else if (data.success === false) {
        throw new Error(data.message || "Error en el login");
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    },
    onSuccess: (data) => {
      // Establecer token y usuario en el store
      setToken(data.token);
      setUser(data.user);

      // Limpiar e invalidar queries para forzar refresh
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: ["me"] });

      toast.success("Inicio de sesión exitoso");
    },
    onError: (error: any) => {
      // Manejar errores de autenticación con mejor UX
      const message =
        error.response?.data?.message || "Error al iniciar sesión";

      // Si hay errores de validación específicos, mostrarlos
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat();
        if (errorMessages.length > 0) {
          errorMessages.forEach((msg: any) => toast.error(msg));
          return;
        }
      }

      // Mostrar mensaje de error genérico
      toast.error(message);
    },
  });
}

export function useRegister() {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    /* useRegister */
    mutationFn: async (
      registerData: RegisterData
    ): Promise<{ token: string; user: User }> => {
      const { data } = await api.post<any>("/auth/register", registerData);

      // Manejar diferentes formatos de respuesta posibles
      if (data.success && data.data && data.data.token && data.data.user) {
        return data.data;
      } else if (data.token && data.user) {
        return { token: data.token, user: data.user };
      } else if (data.success === false) {
        throw new Error(data.message || "Error en el registro");
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Registro exitoso");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Error al registrar";

      // Si hay errores de validación específicos, mostrarlos
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat();
        if (errorMessages.length > 0) {
          errorMessages.forEach((msg: any) => toast.error(msg));
          return;
        }
      }

      // Solo mostrar toast genérico si no es error de validación (422)
      if (error.response?.status !== 422) {
        toast.error(message);
      }
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success("Sesión cerrada exitosamente");

      // Redirigir al login después del logout usando window.location
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
    onError: (error: any) => {
      // Aunque falle el logout en el servidor, limpiar el estado local
      clearAuth();
      queryClient.clear();

      // Redirigir incluso si hay error en el servidor
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
  });
}
/**
 * Hook to fetch current authenticated user and update auth store
 */
export function useMe() {
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const query = useQuery<User, Error>({
    queryKey: ["me"],
    queryFn: async (): Promise<User> => {
      const { data } = await api.get<any>("/auth/me");

      // Manejar diferentes formatos de respuesta posibles
      if (data.success && data.data) {
        return data.data;
      } else if (data.user) {
        return data.user;
      } else if (data.id && data.email) {
        // Respuesta directa del usuario sin wrapper
        return data as User;
      } else if (data.success === false) {
        // Error desde el servidor
        throw new Error(data.message || "Error al obtener usuario");
      } else {
        throw new Error("No se pudo obtener la información del usuario");
      }
    },
    enabled: !!token, // Solo ejecutar la query si hay un token
    retry: (failureCount, error: any) => {
      // No reintentar si es error 401 (no autorizado)
      if (error?.response?.status === 401) {
        return false;
      }
      // Reintentar hasta 2 veces para otros errores
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false, // No refetch automático al cambiar ventana
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
}

/**
 * Hook para verificar autenticación automáticamente al iniciar la app
 */
export function useAuthCheck() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  const { data, error, isLoading, isError } = useMe();

  useEffect(() => {
    // Solo procesar si ya se hidrato el estado
    if (!hasHydrated) {
      return;
    }

    // Si no hay token, no hacer nada
    if (!token) {
      return;
    }

    // Si hay token pero la verificación falla, manejar según el tipo de error
    if (error && isError) {
      const statusCode = (error as any)?.response?.status;

      if (statusCode === 401) {
        clearAuth();
      } else if (statusCode === 404) {
        // No limpiar auth en este caso, podría ser problema temporal del servidor
      } else {
        // Solo limpiar auth si es un error persistente después de varios intentos
      }
    } else if (data && !isError) {
    }
  }, [token, error, clearAuth, hasHydrated, isError, data]);

  // Estados más precisos
  const isAuthenticated =
    hasHydrated && !!token && (!!data || !!user) && !isError;
  const isLoadingAuth =
    !hasHydrated || (!!token && isLoading && !data && !user);

  return {
    isAuthenticated,
    isLoading: isLoadingAuth,
    user: data || user,
    token,
    hasHydrated,
    error: isError ? error : null,
  };
}
