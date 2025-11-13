'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  FileX, 
  Gavel,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { 
  useMisSanciones
} from '@/hooks/mi-perfil.queries';
import { formatDate } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { MiSancion } from '@/hooks/mi-perfil.queries';

const sancionesSeveridadColors: Record<string, string> = {
  'Leve': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
  'Grave': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
  'Muy Grave': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
};

const sancionesColumns: ColumnDef<MiSancion>[] = [
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('tipo')}
      </div>
    ),
  },
  {
    accessorKey: 'severidad',
    header: 'Severidad',
    cell: ({ row }) => {
      const severidad = row.getValue('severidad') as string;
      return (
        <Badge 
          variant="outline" 
          className={sancionesSeveridadColors[severidad] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}
        >
          {severidad}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">
        {row.getValue('descripcion')}
      </div>
    ),
  },
  {
    accessorKey: 'fecha_aplicacion',
    header: 'Fecha Aplicación',
    cell: ({ row }) => {
      const fecha = row.getValue('fecha_aplicacion') as string;
      return formatDate(fecha);
    },
  },
  {
    accessorKey: 'fecha_inicio',
    header: 'Fecha Inicio',
    cell: ({ row }) => {
      const fecha = row.getValue('fecha_inicio') as string;
      return formatDate(fecha);
    },
  },
  {
    accessorKey: 'fecha_fin',
    header: 'Fecha Fin',
    cell: ({ row }) => {
      const fecha = row.getValue('fecha_fin') as string;
      return fecha ? formatDate(fecha) : 'Sin fecha';
    },
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const estado = row.getValue('estado') as string;
      return (
        <Badge 
          variant={estado === 'Activa' ? 'destructive' : 'secondary'}
        >
          {estado}
        </Badge>
      );
    },
  },
];

export default function MisSancionesPage() {
  const { data: misSanciones, isLoading } = useMisSanciones();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const {
    estadisticas,
    sancion_actual,
    historial_sanciones
  } = misSanciones || {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Sanciones</h1>
          <p className="text-muted-foreground">
            Historial y estado actual de sanciones disciplinarias
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sanciones</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Historial completo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sanciones Activas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estadisticas?.activas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              En vigencia actual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sanciones Finalizadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estadisticas?.finalizadas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ya cumplidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sanciones Leves</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {estadisticas?.por_tipo?.Leve || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Nivel básico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sanciones Graves</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {estadisticas?.por_tipo?.Grave || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Nivel intermedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sanciones Muy Graves</CardTitle>
            <Gavel className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estadisticas?.por_tipo?.['Muy Grave'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Nivel máximo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sanción Actual */}
      {sancion_actual && (
       <Card className="border-destructive/30 bg-destructive/10">
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center gap-2 text-destructive">
      <XCircle className="h-5 w-5" />
      Sanción Activa Actual
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-0 space-y-3">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Tipo</p>
        <p className="font-medium">{sancion_actual.tipo}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Severidad</p>
        <Badge
          variant="outline"
          className={
            sancionesSeveridadColors[sancion_actual.severidad] ||
            "bg-muted text-foreground"
          }
        >
          {sancion_actual.severidad}
        </Badge>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Fecha Inicio</p>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">
            {formatDate(sancion_actual.fecha_inicio)}
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Fecha Fin</p>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">
            {sancion_actual.fecha_fin
              ? formatDate(sancion_actual.fecha_fin)
              : "Sin fecha"}
          </span>
        </div>
      </div>
    </div>

    {sancion_actual.descripcion && (
      <>
        <Separator className="my-2" />
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Descripción
          </p>
          <p className="text-sm text-muted-foreground">
            {sancion_actual.descripcion}
          </p>
        </div>
      </>
    )}
  </CardContent>
</Card>

      )}

      {/* Historial de Sanciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileX className="h-5 w-5" />
            Historial de Sanciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historial_sanciones && historial_sanciones.length > 0 ? (
            <DataTable
              columns={sancionesColumns}
              data={historial_sanciones}
              searchKey="tipo"
              searchPlaceholder="Buscar por tipo de sanción..."
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Gavel className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tienes sanciones registradas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}