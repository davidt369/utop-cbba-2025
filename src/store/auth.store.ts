import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: number;
  email: string;
  name?: string;
  rol?: {
    id: number;
    nombre_rol: string;
    permisos?: string[];
  };
  funcionario?: {
    id: number;
    primer_nombre: string;
    primer_apellido: string;
    grado_jerarquico: string;
    ci?: string;
    estado?: string;
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  _hasHydrated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  getToken: () => string | null;
  setHasHydrated: (hasHydrated: boolean) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      setToken: (token: string) => {
        set({ token });
        // Guardar token en cookies también para el middleware
        if (typeof document !== "undefined") {
          document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax; Secure`;
        }
      },
      setUser: (user: User) => set({ user }),
      clearAuth: () => {
        set({ token: null, user: null });
        // Limpiar cookie también
        if (typeof document !== "undefined") {
          document.cookie =
            "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      },
      getToken: () => get().token,
      setHasHydrated: (hasHydrated: boolean) =>
        set({ _hasHydrated: hasHydrated }),
      isAuthenticated: () => {
        const state = get();
        return state._hasHydrated && !!state.token && !!state.user;
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          // Si hay token pero no hay usuario, intentar obtenerlo
          if (state.token && !state.user) {
          }
        }
        return state;
      },
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        // No persistir _hasHydrated
      }),
    }
  )
);

export const getToken = (): string | null => useAuthStore.getState().getToken();
