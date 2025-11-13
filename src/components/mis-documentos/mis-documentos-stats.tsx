'use client';

import {
  FileText,
  CheckCircle,
  Clock,
  Upload,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { MisDocumentosEstadisticas } from '@/types/mis-documentos.types';

interface MisDocumentosStatsProps {
  estadisticas?: MisDocumentosEstadisticas;
  isLoading?: boolean;
}

export function MisDocumentosStats({ estadisticas, isLoading }: MisDocumentosStatsProps) {
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
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              de 6 requeridos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas?.aprobados || 0}</div>
            <p className="text-xs text-muted-foreground">
              Documentos aprobados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{estadisticas?.pendientes || 0}</div>
            <p className="text-xs text-muted-foreground">
              En revisión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Archivo</CardTitle>
            <Upload className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estadisticas?.con_archivo || 0}</div>
            <p className="text-xs text-muted-foreground">
              Archivos subidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progreso de completitud */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progreso de Documentación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {estadisticas?.tipos_completados || 0}/6 tipos de documentos
            </span>
          </div>
          <Progress value={estadisticas?.porcentaje_completado || 0} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{(estadisticas?.porcentaje_completado || 0).toFixed(1)}% completado</span>
            {estadisticas?.porcentaje_completado === 100 && (
              <span className="text-green-600 font-medium">¡Documentación completa!</span>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}