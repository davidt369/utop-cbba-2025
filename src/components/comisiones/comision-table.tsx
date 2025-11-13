"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { columns } from "./comision-columns";
import { ComisionCreateDialog } from "./comision-create-dialog";
import { ComisionEditDialog } from "./comision-edit-dialog";


import { useComisionStore } from "@/store/comision.store";
import { useComisiones, useFuncionariosParaComision } from "@/hooks/comision.queries";
import { Comision } from "@/types/comision.types";
import { ComisionDeleteDialog } from "./comision-delete-dialog";

interface FiltroEstado {
  funcionario?: number;
  activo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
}

export function ComisionTable({ showDeleted = false }: { showDeleted?: boolean }) {
  const { openCreateDialog } = useComisionStore();
  const [filtros, setFiltros] = useState<FiltroEstado>({});

  const { data: comisiones, isLoading } = useComisiones(showDeleted);
  const { data: funcionarios } = useFuncionariosParaComision();

  // Filtrar datos basado en los filtros aplicados
  const datosFiltrados = useMemo(() => {
    if (!comisiones) return [];

    return comisiones.filter((comision: Comision) => {
      // Filtro por estado eliminado
      if (showDeleted) {
        // Si showDeleted es true, mostrar SOLO las eliminadas
        if (!comision.deleted_at) {
          return false;
        }
      } else {
        // Si showDeleted es false, mostrar SOLO las NO eliminadas
        if (comision.deleted_at) {
          return false;
        }
      }

      // Filtro por búsqueda de texto
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const coincide =
          comision.descripcion?.toLowerCase().includes(busqueda) ||
          comision.funcionario?.nombre_completo?.toLowerCase().includes(busqueda) ||
          comision.estado_comision.toLowerCase().includes(busqueda) ||
          comision.id.toString().includes(busqueda);
        if (!coincide) return false;
      }

      // Filtro por funcionario
      if (filtros.funcionario && comision.funcionario_id !== filtros.funcionario) {
        return false;
      }

      // Filtro por estado (usando estado calculado automáticamente)
      if (filtros.activo && filtros.activo !== "todos") {
        if (filtros.activo === "activo" && !comision.es_activa) {
          return false;
        }
        if (filtros.activo === "inactivo" && comision.es_activa) {
          return false;
        }
        if (filtros.activo === "programada" && comision.estado_comision !== "programada") {
          return false;
        }
        if (filtros.activo === "finalizada" && comision.estado_comision !== "finalizada") {
          return false;
        }
      }

      // Filtro por fecha desde
      if (filtros.fechaDesde) {
        const fechaInicio = new Date(comision.fecha_inicio);
        const fechaDesde = new Date(filtros.fechaDesde);
        if (fechaInicio < fechaDesde) {
          return false;
        }
      }

      // Filtro por fecha hasta
      if (filtros.fechaHasta) {
        const fechaFin = new Date(comision.fecha_fin);
        const fechaHasta = new Date(filtros.fechaHasta);
        if (fechaFin > fechaHasta) {
          return false;
        }
      }

      return true;
    });
  }, [comisiones, filtros, showDeleted]);

  const limpiarFiltros = () => {
    setFiltros({});
  };

  const tienesFiltrosActivos = Object.values(filtros).some(valor => valor !== undefined && valor !== "");

  const contarFiltrosActivos = () => {
    return Object.values(filtros).filter(valor => valor !== undefined && valor !== "").length;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Cargando comisiones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
              {tienesFiltrosActivos && (
                <Badge variant="secondary" className="ml-2">
                  {contarFiltrosActivos()}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {tienesFiltrosActivos && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limpiarFiltros}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
              {!showDeleted && (
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Comisión
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Buscador principal */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por descripción, funcionario, estado o ID..."
                value={filtros.busqueda || ""}
                onChange={(e) =>
                  setFiltros(prev => ({
                    ...prev,
                    busqueda: e.target.value || undefined
                  }))
                }
                className="pl-10 max-w-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por funcionario */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Funcionario</label>
              <Select
                value={filtros.funcionario?.toString() || "todos"}
                onValueChange={(value) =>
                  setFiltros(prev => ({
                    ...prev,
                    funcionario: value === "todos" ? undefined : parseInt(value)
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los funcionarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los funcionarios</SelectItem>
                  {funcionarios?.map((funcionario) => (
                    <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                      {funcionario.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por estado activo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={filtros.activo || "todos"}
                onValueChange={(value) =>
                  setFiltros(prev => ({
                    ...prev,
                    activo: value === "todos" ? undefined : value
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="programada">Programadas</SelectItem>
                  <SelectItem value="activo">Activas</SelectItem>
                  <SelectItem value="finalizada">Finalizadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro fecha desde */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Desde</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filtros.fechaDesde || ""}
                onChange={(e) =>
                  setFiltros(prev => ({
                    ...prev,
                    fechaDesde: e.target.value || undefined
                  }))
                }
              />
            </div>

            {/* Filtro fecha hasta */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Hasta</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filtros.fechaHasta || ""}
                onChange={(e) =>
                  setFiltros(prev => ({
                    ...prev,
                    fechaHasta: e.target.value || undefined
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla principal */}
      <Card>
        <CardHeader>
          <CardTitle>
            {showDeleted ? "Comisiones Eliminadas" : "Comisiones"} ({datosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={datosFiltrados} />
        </CardContent>
      </Card>

      {/* Diálogos */}
      <ComisionCreateDialog />
      <ComisionEditDialog />
      <ComisionDeleteDialog />
    </div>
  );
}