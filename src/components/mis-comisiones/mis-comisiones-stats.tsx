'use client';

import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { MisComisionesEstadisticas } from '@/types/mis-comisiones.types';

interface MisComisionesStatsProps {
  estadisticas: MisComisionesEstadisticas;
  isLoading?: boolean;
}

const formatMes = (mesString: string) => {
  const [year, month] = mesString.split('-');
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
};

export function MisComisionesStats({ estadisticas, isLoading }: MisComisionesStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-12 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
            <p className="text-xs text-muted-foreground">
              Comisiones registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas.activas}</div>
            <p className="text-xs text-muted-foreground">
              En curso o programadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estadisticas.finalizadas}</div>
            <p className="text-xs text-muted-foreground">
              Comisiones completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{estadisticas.proximas_a_vencer}</div>
            <p className="text-xs text-muted-foreground">
              Dentro de 7 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actividad por mes */}
      {estadisticas.comisiones_por_mes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Comisiones por Mes
            </CardTitle>
            <CardDescription>
              Últimos 6 meses de actividad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estadisticas.comisiones_por_mes.map((item) => (
                <div key={item.mes} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{formatMes(item.mes)}</span>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">{item.total} comisiones</div>
                    <div 
                      className="h-2 bg-primary rounded-full"
                      style={{
                        width: `${Math.max(20, (item.total / Math.max(...estadisticas.comisiones_por_mes.map(m => m.total))) * 100)}px`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}