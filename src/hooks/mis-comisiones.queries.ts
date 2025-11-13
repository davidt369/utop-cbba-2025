import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { MisComisionesResponse } from "@/types/mis-comisiones.types";

// 📋 Query Keys
export const misComisionesKeys = {
  all: ["mis-comisiones"] as const,
  data: () => [...misComisionesKeys.all, "data"] as const,
};

// 🔍 Fetch Functions
const fetchMisComisiones = async (): Promise<MisComisionesResponse> => {
  const { data } = await api.get<MisComisionesResponse>("/auth/mi-perfil/mis-comisiones");
  return data;
};

// 📊 Hooks
export const useMisComisiones = () => {
  return useQuery({
    queryKey: misComisionesKeys.data(),
    queryFn: fetchMisComisiones,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};