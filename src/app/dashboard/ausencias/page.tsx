'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Filter,
  FileX,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useAusencias, useAusenciaEstadisticas } from '@/hooks/ausencias.queries';
import useAusenciaStore from '@/store/ausencias.store';
import { useAusenciasTable } from '@/hooks/use-ausencias-table';
import AusenciaTable from '@/components/ausencias/ausencia-table';
import { AusenciaCreateDialog } from '@/components/ausencias/ausencia-create-dialog';
import { AusenciaEditDialog } from '@/components/ausencias/ausencia-edit-dialog';
import AusenciaDeleteDialog from '@/components/ausencias/ausencia-delete-dialog';
import { TIPOS_AUSENCIA } from '@/types/ausencia.types';

export default function AusenciasPage() {
  const {
    searchTerm,
    tipoFilter,
    estadoFilter,
    aprobadoFilter,
    showDeleted,
    sortField,
    sortDirection,
    openCreateDialog,
    setSearchTerm,
    setTipoFilter,
    setEstadoFilter,
    setAprobadoFilter,
    setShowDeleted,
    setSortField,
    setSortDirection,
    clearFilters,
  } = useAusenciaStore();

  const { data: ausencias = [], isLoading, error } = useAusencias(showDeleted);
  const { data: estadisticas, isLoading: isLoadingStats } = useAusenciaEstadisticas(showDeleted);
  const { filteredTotal } = useAusenciasTable(ausencias);

  const hasActiveFilters = searchTerm || tipoFilter !== 'todos' || estadoFilter !== 'todos' || aprobadoFilter !== 'todos';

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-destructive">
              <FileX className="h-5 w-5" />
              <span>Error al cargar las ausencias: {error.message}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Ausencias</h1>
          <p className="text-muted-foreground">
            Administra los permisos, bajas médicas y vacaciones del personal
          </p>
        </div>

        <Button onClick={openCreateDialog} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Ausencia
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ausencias</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : estadisticas?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de ausencias registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausencias Activas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoadingStats ? '...' : estadisticas?.activas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ausencias actualmente vigentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoadingStats ? '...' : estadisticas?.aprobadas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ausencias aprobadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos a Finalizar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoadingStats ? '...' : estadisticas?.funcionarios_proximos_finalizar?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Funcionarios que finalizan en 7 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
          <CardDescription>
            Filtra y busca ausencias por diferentes criterios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por funcionario, carnet, motivo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Filtro por tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo-filter">Tipo de Ausencia</Label>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger id="tipo-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {TIPOS_AUSENCIA.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por estado */}
            <div className="space-y-2">
              <Label htmlFor="estado-filter">Estado</Label>
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger id="estado-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activas">
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Activas
                    </div>
                  </SelectItem>
                  <SelectItem value="inactivas">
                    <div className="flex items-center">
                      <XCircle className="mr-2 h-4 w-4 text-red-600" />
                      Inactivas
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por aprobación */}
            <div className="space-y-2">
              <Label htmlFor="aprobacion-filter">Aprobación</Label>
              <Select value={aprobadoFilter} onValueChange={setAprobadoFilter}>
                <SelectTrigger id="aprobacion-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="aprobadas">
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Aprobadas
                    </div>
                  </SelectItem>
                  <SelectItem value="pendientes">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                      Pendientes
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de ordenamiento */}
            <div className="space-y-2">
              <Label htmlFor="sort-filter">Ordenar por</Label>
              <Select
                value={`${sortField}-${sortDirection}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split('-') as [string, 'asc' | 'desc'];
                  setSortField(field);
                  setSortDirection(direction);
                }}
              >
                <SelectTrigger id="sort-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fecha_inicio-desc">Fecha inicio (más reciente)</SelectItem>
                  <SelectItem value="fecha_inicio-asc">Fecha inicio (más antigua)</SelectItem>
                  <SelectItem value="fecha_fin-desc">Fecha fin (más reciente)</SelectItem>
                  <SelectItem value="fecha_fin-asc">Fecha fin (más antigua)</SelectItem>
                  <SelectItem value="funcionario-asc">Funcionario (A-Z)</SelectItem>
                  <SelectItem value="funcionario-desc">Funcionario (Z-A)</SelectItem>
                  <SelectItem value="tipo-asc">Tipo (A-Z)</SelectItem>
                  <SelectItem value="duracion-desc">Duración (mayor)</SelectItem>
                  <SelectItem value="duracion-asc">Duración (menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Switch para mostrar eliminados */}
            <div className="flex items-center justify-between space-x-2 pt-7">
              <Label htmlFor="show-deleted" className="text-sm font-medium">
                Solo eliminados
              </Label>
              <Switch
                id="show-deleted"
                checked={showDeleted}
                onCheckedChange={setShowDeleted}
              />
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {searchTerm && (
                <Badge variant="secondary">
                  Búsqueda: {searchTerm}
                </Badge>
              )}
              {tipoFilter !== 'todos' && (
                <Badge variant="secondary">
                  Tipo: {TIPOS_AUSENCIA.find(t => t.value === tipoFilter)?.label}
                </Badge>
              )}
              {estadoFilter !== 'todos' && (
                <Badge variant="secondary">
                  Estado: {estadoFilter}
                </Badge>
              )}
              {aprobadoFilter !== 'todos' && (
                <Badge variant="secondary">
                  Aprobación: {aprobadoFilter}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Ausencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Ausencias
            </div>
            <Badge variant="outline">
              {filteredTotal} de {ausencias.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Administra las ausencias del personal
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense fallback={<div>Cargando tabla...</div>}>
            <AusenciaTable
              ausencias={ausencias}
              isLoading={isLoading}
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* Diálogos */}
      <AusenciaCreateDialog />
      <AusenciaEditDialog />
      <AusenciaDeleteDialog />
    </div>
  );
}