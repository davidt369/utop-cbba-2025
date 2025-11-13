"use client";

import { AlertTriangle, History, Users, Calendar } from "lucide-react";
import { useMisFaltasDisciplinarias } from "@/hooks/mis-faltas-disciplinarias.queries";
import { MisFaltasTable } from "@/components/mis-faltas-disciplinarias/mis-faltas-table";
import { MisFaltasEstadisticas } from "@/components/mis-faltas-disciplinarias/mis-faltas-estadisticas";

export default function MisFaltasDisciplinariasPage() {
  const { data: misFaltas, isLoading, error } = useMisFaltasDisciplinarias();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-8 w-8" />
            Mis Faltas Disciplinarias
          </h2>
          <p className="text-muted-foreground">
            Historial completo de faltas disciplinarias registradas en tu expediente personal
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
            No se pudo cargar la información de faltas disciplinarias. Por favor, intenta nuevamente.
          </p>
        </div>
      )}

      {/* Estadísticas */}
      {misFaltas && (
        <MisFaltasEstadisticas 
          estadisticas={misFaltas.estadisticas}
          isLoading={isLoading}
        />
      )}

      {/* Tabla de Faltas */}
      <MisFaltasTable 
        faltas={misFaltas?.data || []}
        isLoading={isLoading}
      />
    </div>
  );
}