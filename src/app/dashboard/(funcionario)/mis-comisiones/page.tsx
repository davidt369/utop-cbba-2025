'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMisComisiones } from '@/hooks/mis-comisiones.queries';
import { MisComisionesStats } from '@/components/mis-comisiones/mis-comisiones-stats';
import { MisComisionesTable } from '@/components/mis-comisiones/mis-comisiones-table';

export default function MisComisionesPage() {
  const { data, isLoading, refetch } = useMisComisiones();

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mis Comisiones</h2>
          <p className="text-muted-foreground">
            Visualiza todas tus comisiones asignadas y su estado actual.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <MisComisionesStats 
        estadisticas={data?.estadisticas || {
          total: 0,
          activas: 0,
          finalizadas: 0,
          proximas_a_vencer: 0,
          comisiones_por_mes: [],
        }} 
        isLoading={isLoading} 
      />

      {/* Tabla de comisiones */}
      <MisComisionesTable 
        comisiones={data?.data || []} 
        isLoading={isLoading} 
      />
    </div>
  );
}