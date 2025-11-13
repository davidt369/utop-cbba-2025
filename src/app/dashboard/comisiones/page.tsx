'use client';

import { useState } from 'react';
import { useComisionEstadisticas } from '@/hooks/comision.queries';
import { ComisionTable } from '@/components/comisiones/comision-table';
import { ComisionDialogs } from '@/components/comisiones/comision-dialogs';
import { useComisionStore } from '@/store/comision.store';
import { AlertTriangle, Calendar, CheckCircle, Clock, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ComisionEstadisticas {
  total: number;
  activas: number;
  finalizadas: number;
  eliminadas: number;
  funcionarios_mas_comisiones: Array<{ funcionario: string; comisiones_count: number }>;
  funcionarios_sin_comisiones: Array<{ funcionario: string; comisiones_count: number }>;
}

export default function ComisionesPage() {
  const { showDeleted, setShowDeleted } = useComisionStore();
  const { data: estadisticas, isLoading } = useComisionEstadisticas();

  if (isLoading || !estadisticas) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comisiones</h1>
        <p className="text-muted-foreground">
          Gestión de comisiones de trabajo y sus asignaciones
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total || 0}</div>
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
            <div className="text-2xl font-bold text-green-600">{estadisticas.activas || 0}</div>
            <p className="text-xs text-muted-foreground">
              En curso actualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estadisticas.finalizadas || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eliminadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.eliminadas || 0}</div>
            <p className="text-xs text-muted-foreground">
              Removidas del sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información sobre funcionalidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">Estado Automatizado</h3>
              <p className="text-sm text-blue-700 mt-1">
                El estado de las comisiones se actualiza automáticamente basado en las fechas de inicio y fin.
                Una comisión está <strong>activa</strong> cuando la fecha actual se encuentra entre las fechas de inicio y fin.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Users className="h-5 w-5 text-green-600 mt-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-900">Funcionalidades</h3>
              <p className="text-sm text-green-700 mt-1">
                • Búsqueda por texto • Filtros avanzados • Ordenamiento de columnas<br />
                • Gestión de PDFs de respaldo • Estados calculados automáticamente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Funcionarios con Más Comisiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(estadisticas.funcionarios_mas_comisiones || []).slice(0, 5).map((item: { funcionario: string; comisiones_count: number }, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">{item.funcionario}</span>
                  <span className="text-sm text-muted-foreground">{item.comisiones_count} comisiones</span>
                </div>
              ))}
              {(!estadisticas.funcionarios_mas_comisiones || estadisticas.funcionarios_mas_comisiones.length === 0) && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Funcionarios sin Comisiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(estadisticas.funcionarios_sin_comisiones || []).slice(0, 5).map((item: { funcionario: string; comisiones_count: number }, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">{item.funcionario}</span>
                  <span className="text-sm text-muted-foreground">Sin comisiones</span>
                </div>
              ))}
              {(!estadisticas.funcionarios_sin_comisiones || estadisticas.funcionarios_sin_comisiones.length === 0) && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Todos los funcionarios tienen comisiones asignadas
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Configura qué comisiones mostrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={setShowDeleted}
            />
            <Label htmlFor="show-deleted" className="text-sm font-medium">
              Solo eliminadas
            </Label>
          </div>
        </CardContent>
      </Card>

      <ComisionTable showDeleted={showDeleted} />
      <ComisionDialogs />
    </div>
  );
}