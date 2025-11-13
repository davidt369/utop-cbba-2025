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
import { Plus, Filter, X } from "lucide-react";

import { columns } from "./falta-disciplinaria-columns";
import { FaltaDisciplinariaCreateDialog } from "./falta-disciplinaria-create-dialog";
import { FaltaDisciplinariaEditDialog } from "./falta-disciplinaria-edit-dialog";
import { FaltaDisciplinariaDeleteDialog } from "./falta-disciplinaria-delete-dialog";

import { useFaltaDisciplinariaStore } from "@/store/falta-disciplinaria.store";
import { useFaltasDisciplinarias, useFuncionarios } from "@/hooks/falta-disciplinaria.queries";
import { FaltaDisciplinaria, TIPOS_GRAVEDAD } from "@/types/falta-disciplinaria.types";

interface FiltroEstado {
  funcionario?: number;
  tipoGravedad?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

interface FaltaDisciplinariaTableProps {
  showDeleted?: boolean;
}

export function FaltaDisciplinariaTable({ showDeleted = false }: FaltaDisciplinariaTableProps) {
  const { openCreateDialog } = useFaltaDisciplinariaStore();
  const [filtros, setFiltros] = useState<FiltroEstado>({});

  const { data: faltasDisciplinarias, isLoading } = useFaltasDisciplinarias(showDeleted);
  const { data: funcionarios } = useFuncionarios();

  // Debug log para verificar los datos
  console.log('showDeleted:', showDeleted);
  console.log('faltasDisciplinarias:', faltasDisciplinarias?.length, faltasDisciplinarias);

  // Filtrar datos basado en los filtros aplicados
  const datosFiltrados = useMemo(() => {
    if (!faltasDisciplinarias) return [];

    return faltasDisciplinarias.filter((falta: FaltaDisciplinaria) => {
      // Filtro por estado eliminado
      if (showDeleted) {
        // Si showDeleted es true, mostrar SOLO las eliminadas
        if (!falta.deleted_at) {
          return false;
        }
      } else {
        // Si showDeleted es false, mostrar SOLO las NO eliminadas
        if (falta.deleted_at) {
          return false;
        }
      }

      // Filtro por funcionario
      if (filtros.funcionario && falta.funcionario.id !== filtros.funcionario) {
        return false;
      }

      // Filtro por tipo de gravedad
      if (filtros.tipoGravedad && falta.tipo_gravedad !== filtros.tipoGravedad) {
        return false;
      }

      // Filtro por fecha desde
      if (filtros.fechaDesde) {
        const fechaFalta = new Date(falta.fecha_falta);
        const fechaDesde = new Date(filtros.fechaDesde);
        if (fechaFalta < fechaDesde) {
          return false;
        }
      }

      // Filtro por fecha hasta
      if (filtros.fechaHasta) {
        const fechaFalta = new Date(falta.fecha_falta);
        const fechaHasta = new Date(filtros.fechaHasta);
        if (fechaFalta > fechaHasta) {
          return false;
        }
      }

      return true;
    });
  }, [faltasDisciplinarias, filtros, showDeleted]);

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
            <p className="mt-2 text-sm text-muted-foreground">Cargando faltas disciplinarias...</p>
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
          </div>
        </CardHeader>
        <CardContent>
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

            {/* Filtro por tipo de gravedad */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Gravedad</label>
              <Select
                value={filtros.tipoGravedad || "todos"}
                onValueChange={(value) =>
                  setFiltros(prev => ({
                    ...prev,
                    tipoGravedad: value === "todos" ? undefined : value
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {TIPOS_GRAVEDAD.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>
                {showDeleted ? "Faltas Disciplinarias Eliminadas" : "Faltas Disciplinarias"}
              </CardTitle>
              <Badge variant="outline">
                {datosFiltrados.length}
              </Badge>
            </div>
            {!showDeleted && (
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Falta
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <DataTable
              columns={columns}
              data={datosFiltrados}
              searchKey="funcionario"
              searchPlaceholder="Buscar por funcionario..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Diálogos */}
      <FaltaDisciplinariaCreateDialog />
      <FaltaDisciplinariaEditDialog />
      <FaltaDisciplinariaDeleteDialog />
    </div>
  );
}