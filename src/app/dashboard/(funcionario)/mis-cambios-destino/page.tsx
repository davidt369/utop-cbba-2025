


"use client";

import { AlertTriangle, MapPin, TrendingUp } from "lucide-react";
import { useMisCambiosDestino } from "@/hooks/mis-cambios-destino.queries";
import { MisCambiosTable } from "@/components/mis-cambios-destino/mis-cambios-table";
import { MisCambiosEstadisticas } from "@/components/mis-cambios-destino/mis-cambios-estadisticas";

export default function MisCambiosDestinoPage() {
  const { data: misCambios, isLoading, error } = useMisCambiosDestino();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Mis Cambios de Destino
          </h2>
          <p className="text-muted-foreground">
            Historial completo de cambios de destino en tu carrera profesional
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Error al cargar información</span>
          </div>
          <p className="text-red-600 text-sm mt-1">
            No se pudo cargar la información de cambios de destino. Por favor, intenta nuevamente.
          </p>
        </div>
      )}

      {/* Estadísticas */}
      {misCambios && (
        <MisCambiosEstadisticas 
          estadisticas={misCambios.estadisticas}
          isLoading={isLoading}
        />
      )}

      {/* Tabla de Cambios */}
      <MisCambiosTable 
        cambios={misCambios?.data || []}
        isLoading={isLoading}
      />
    </div>
  );
}
