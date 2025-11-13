"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// Checkbox removed as requested
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  PlayCircle,
  PauseCircle,
  ArrowRight,
  ArrowDown,
  Minus,
  Check,
  X,
  ArrowUpDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

import { useSancionesStore } from "@/store/sanciones.store";
import { useToggleActivarSancion } from "@/hooks/sanciones.queries";
import { Sancion, TipoSancion, TIPOS_SANCION, TIPO_SANCION_LABELS, ESTADO_SANCION_COLORS } from "@/types/sancion.types";
import { PDFLink } from "@/components/sanciones/pdf-viewer";

interface SancionTableProps {
  data: Sancion[];
}

export function SancionTable({ data }: SancionTableProps) {
  // Estados internos para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoSancionFilter, setTipoSancionFilter] = useState<TipoSancion | 'all' | null>(null);
  const [estadoActivaFilter, setEstadoActivaFilter] = useState<'all' | 'activa' | 'inactiva' | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Estados para ordenamiento
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Estados para filtros avanzados
  const [fechaInicioFilter, setFechaInicioFilter] = useState<string>('');
  const [fechaFinFilter, setFechaFinFilter] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Se removió selección múltiple por checkbox
  // Hooks
  const {
    openEditDialog,
    openDeleteDialog,
    openRestoreDialog,
    openViewDialog,
  } = useSancionesStore();

  const toggleActivarMutation = useToggleActivarSancion();

  // Filtrar, ordenar y paginar datos
  const { filteredData, paginatedData, totalPages, totalItems } = useMemo(() => {
    if (!data) return { filteredData: [], paginatedData: [], totalPages: 0, totalItems: 0 };

    // 1. Filtrar datos
    let filtered = data.filter((sancion) => {
      // Filtro por eliminados
      const isDeleted = !!sancion.deleted_at;
      if (showDeleted && !isDeleted) {
        return false;
      }
      if (!showDeleted && isDeleted) {
        return false;
      }

      // Filtro por término de búsqueda
      if (searchTerm) {
        const termino = searchTerm.toLowerCase();
        if (
          !sancion.funcionario.nombre_completo.toLowerCase().includes(termino) &&
          !sancion.tipo_sancion.toLowerCase().includes(termino) &&
          !(sancion.descripcion?.toLowerCase().includes(termino))
        ) {
          return false;
        }
      }

      // Filtro por tipo de sanción
      if (tipoSancionFilter && tipoSancionFilter !== "all" && sancion.tipo_sancion !== tipoSancionFilter) {
        return false;
      }

      // Filtro por estado activa
      if (estadoActivaFilter && estadoActivaFilter !== "all") {
        if (estadoActivaFilter === "activa" && !sancion.activa) {
          return false;
        }
        if (estadoActivaFilter === "inactiva" && sancion.activa) {
          return false;
        }
      }

      // Filtro por fecha de inicio
      if (fechaInicioFilter && sancion.fecha_inicio) {
        const fechaInicio = new Date(sancion.fecha_inicio);
        const filtroFecha = new Date(fechaInicioFilter);
        if (fechaInicio < filtroFecha) {
          return false;
        }
      }

      // Filtro por fecha de fin
      if (fechaFinFilter && sancion.fecha_fin) {
        const fechaFin = new Date(sancion.fecha_fin);
        const filtroFecha = new Date(fechaFinFilter);
        if (fechaFin > filtroFecha) {
          return false;
        }
      }

      return true;
    });

    // 2. Ordenar datos
    if (sortField) {
      filtered.sort((a, b) => {
        let valueA: any;
        let valueB: any;

        switch (sortField) {
          case 'funcionario':
            valueA = a.funcionario.nombre_completo.toLowerCase();
            valueB = b.funcionario.nombre_completo.toLowerCase();
            break;
          case 'tipo_sancion':
            valueA = a.tipo_sancion.toLowerCase();
            valueB = b.tipo_sancion.toLowerCase();
            break;
          case 'activa':
            valueA = a.activa ? 1 : 0;
            valueB = b.activa ? 1 : 0;
            break;
          case 'fecha_inicio':
            valueA = a.fecha_inicio ? new Date(a.fecha_inicio).getTime() : 0;
            valueB = b.fecha_inicio ? new Date(b.fecha_inicio).getTime() : 0;
            break;
          case 'fecha_fin':
            valueA = a.fecha_fin ? new Date(a.fecha_fin).getTime() : 0;
            valueB = b.fecha_fin ? new Date(b.fecha_fin).getTime() : 0;
            break;
          case 'created_at':
            valueA = new Date(a.created_at).getTime();
            valueB = new Date(b.created_at).getTime();
            break;
          default:
            return 0;
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 3. Calcular paginación
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

    return {
      filteredData: filtered,
      paginatedData,
      totalPages,
      totalItems
    };
  }, [data, showDeleted, searchTerm, tipoSancionFilter, estadoActivaFilter, fechaInicioFilter, fechaFinFilter, sortField, sortDirection, currentPage, pageSize]);

  // Funciones para ordenamiento
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ?
      <ArrowUp className="h-4 w-4" /> :
      <ArrowDown className="h-4 w-4" />;
  };

  // Funciones para paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setTipoSancionFilter(null);
    setEstadoActivaFilter(null);
    setFechaInicioFilter('');
    setFechaFinFilter('');
    setCurrentPage(1);
  };

  // Funciones para selección múltiple
  // Acciones en lote removidas (no hay selección por checkbox)

  // Funciones para acciones individuales
  const handleToggleActivar = (sancion: Sancion) => {
    // Solo permitir activar desde UI; la desactivación se ha removido
    if (!sancion.activa) {
      toggleActivarMutation.mutate({ id: sancion.id, activar: true });
    }
  };



  const getEstadoBadge = (sancion: Sancion) => {
    if (sancion.deleted_at) {
      return <Badge variant="destructive">Eliminada</Badge>;
    }

    if (sancion.activa) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Activa</Badge>;
    } else {
      return <Badge variant="outline">Inactiva</Badge>;
    }
  };

  const getTipoSancionBadge = (tipo: TipoSancion) => {
    const colors = {
      'Suspencion': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      'Baja Definitiva': 'bg-red-100 text-red-800 hover:bg-red-200'
    };

    return (
      <Badge className={colors[tipo]}>
        {TIPO_SANCION_LABELS[tipo] || tipo}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span>Lista de Sanciones</span>
            <Badge variant="secondary">
              {totalItems} registros
            </Badge>
            {(searchTerm || tipoSancionFilter || estadoActivaFilter || fechaInicioFilter || fechaFinFilter) && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Filtros activos
              </Badge>
            )}
          </div>
          {/* Selección múltiple removida */}
        </CardTitle>
        <CardDescription>
          Gestione todas las sanciones registradas en el sistema.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controles de filtros */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-wrap w-full">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por funcionario, tipo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>

          {/* Filtro por tipo de sanción */}
          <Select
            value={tipoSancionFilter || "all"}
            onValueChange={(value) => setTipoSancionFilter(value === "all" ? null : value as TipoSancion)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo de sanción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {TIPOS_SANCION.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {TIPO_SANCION_LABELS[tipo] || tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por estado activa */}
          <Select
            value={estadoActivaFilter || "all"}
            onValueChange={(value) => setEstadoActivaFilter(value === "all" ? null : value as 'activa' | 'inactiva')}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="activa">Activas</SelectItem>
              <SelectItem value="inactiva">Inactivas</SelectItem>
            </SelectContent>
          </Select>

          {/* Tamaño de página */}
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-full sm:w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>

          {/* Toggle eliminados */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Switch
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={setShowDeleted}
            />
            <Label htmlFor="show-deleted" className="text-sm">
              Eliminados
            </Label>
          </div>

          {/* Botón filtros avanzados */}
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </Button>

          {/* Botón limpiar filtros */}
          <Button
            variant="outline"
            onClick={handleClearFilters}
            size="sm"
            className="w-full sm:w-auto"
          >
            Limpiar
          </Button>
        </div>

        {/* Filtros avanzados desplegables */}
        {showAdvancedFilters && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <h4 className="text-sm font-medium">Filtros Avanzados</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha-inicio-filter">Fecha inicio desde:</Label>
                <Input
                  id="fecha-inicio-filter"
                  type="date"
                  value={fechaInicioFilter}
                  onChange={(e) => setFechaInicioFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha-fin-filter">Fecha fin hasta:</Label>
                <Input
                  id="fecha-fin-filter"
                  type="date"
                  value={fechaFinFilter}
                  onChange={(e) => setFechaFinFilter(e.target.value)}
                />
              </div>
            </div>

            {(fechaInicioFilter || fechaFinFilter) && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Filtros activos:</span>
                {fechaInicioFilter && (
                  <Badge variant="secondary">
                    Inicio ≥ {fechaInicioFilter}
                  </Badge>
                )}
                {fechaFinFilter && (
                  <Badge variant="secondary">
                    Fin ≤ {fechaFinFilter}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Acciones en lote removidas */}


        {/* Tabla con ordenamiento */}
        <div className="border rounded-md overflow-x-auto w-full">
          <Table className="min-w-[900px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('funcionario')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Funcionario
                    {getSortIcon('funcionario')}
                  </Button>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('tipo_sancion')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Tipo
                    {getSortIcon('tipo_sancion')}
                  </Button>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('activa')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Estado
                    {getSortIcon('activa')}
                  </Button>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('fecha_inicio')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Período
                    {getSortIcon('fecha_inicio')}
                  </Button>
                </TableHead>
                <TableHead className="whitespace-nowrap">Descripción / PDF</TableHead>
                <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron sanciones.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((sancion) => (
                  <TableRow key={sancion.id}>
                    <TableCell className="font-medium break-words max-w-[180px]">
                      <div>
                        <p className="font-semibold text-sm md:text-base break-words">{sancion.funcionario.nombre_completo}</p>
                        <p className="text-xs md:text-sm text-muted-foreground break-words">
                          {sancion.funcionario.estado_funcionario}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="break-words max-w-[120px]">
                      {getTipoSancionBadge(sancion.tipo_sancion)}
                    </TableCell>
                    <TableCell className="break-words max-w-[100px]">
                      {getEstadoBadge(sancion)}
                    </TableCell>
                    <TableCell className="min-w-[140px] break-words max-w-[160px]">
                      <div className="space-y-1 text-xs md:text-sm">
                        {sancion.fecha_inicio ? (
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 text-green-700" />
                            <span>{formatDate(sancion.fecha_inicio)}</span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-xs">Sin inicio</div>
                        )}

                        {sancion.fecha_fin ? (
                          <div className="flex items-center gap-1">
                            <ArrowDown className="h-3 w-3 text-red-700" />
                            <span>{formatDate(sancion.fecha_fin)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Minus className="h-3 w-3" />
                            <span>Indefinida</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] break-words">
                      <div className="space-y-2">
                        {sancion.descripcion ? (
                          <p className="text-xs md:text-sm truncate" title={sancion.descripcion}>
                            {sancion.descripcion}
                          </p>
                        ) : (
                          <span className="text-muted-foreground text-xs md:text-sm">Sin descripción</span>
                        )}

                        {sancion.pdf_respaldo_ruta && (
                          <div>
                            <PDFLink
                              sancionId={sancion.id}
                              pdfFileName={sancion.pdf_respaldo_ruta.split('/').pop()}
                              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openViewDialog(sancion)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>

                          {!sancion.deleted_at && (
                            <>
                              <DropdownMenuItem onClick={() => openEditDialog(sancion)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleToggleActivar(sancion)}
                                disabled={toggleActivarMutation.isPending}
                              >
                                {sancion.activa ? (
                                  <>
                                    <PauseCircle className="mr-2 h-4 w-4" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Activar
                                  </>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(sancion)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </>
                          )}

                          {sancion.deleted_at && (
                            <DropdownMenuItem
                              onClick={() => openRestoreDialog(sancion)}
                              className="text-green-600"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restaurar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap items-center space-x-2 text-xs md:text-sm text-muted-foreground">
              <p>
                Mostrando {((currentPage - 1) * pageSize) + 1} a{' '}
                {Math.min(currentPage * pageSize, totalItems)} de {totalItems} registros
              </p>
            </div>
            <div className="flex flex-wrap items-center space-x-2 mt-2 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Números de página */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}