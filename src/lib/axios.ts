import axios from "axios";
import { getToken } from "@/store/auth.store";

// baseURL apunta al backend Laravel API. Ajusta env NEXT_PUBLIC_API_URL a 'http://127.0.0.1:8000/api'
// baseURL del backend Laravel API (sin el prefijo /auth). Ajusta env NEXT_PUBLIC_API_URL si es necesario.
// baseURL del backend Laravel API, incluye /api para los endpoints
// BaseURL relativo para proxy interno y evitar CORS
// Debug: verificar la variable de entorno

// URL del backend Laravel API - actualiza según donde esté corriendo tu backend
const baseURL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: baseURL, // Hardcodeado directamente para forzar actualización
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Para requests de archivos, remover Content-Type para que axios configure multipart/form-data automáticamente
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// Interceptor para manejar respuestas y errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (no autorizado), limpiar la autenticación
    if (error.response?.status === 401) {
      // Solo manejar 401 si no es una request de logout
      const isLogoutRequest = error.config?.url?.includes("/auth/logout");

      if (!isLogoutRequest) {
        console.warn(
          "🔐 Token inválido detectado por interceptor, limpiando autenticación"
        );

        // Importación dinámica para evitar problemas de dependencias circulares
        import("@/store/auth.store").then(({ useAuthStore }) => {
          const clearAuth = useAuthStore.getState().clearAuth;
          clearAuth();
          // Solo redirigir si no estamos ya en la página de login
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/login")
          ) {
            window.location.href = "/login";
          }
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
