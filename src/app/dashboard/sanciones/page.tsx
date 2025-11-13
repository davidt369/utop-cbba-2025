'use client';

import { useMemo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  Users,
  Clock,
  TrendingUp,
  Activity,
  Shield,
  UserX,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { useSancionesStore } from "@/store/sanciones.store";
import {
  useSanciones,
  useSancionesStats
} from "@/hooks/sanciones.queries";

// Componentes
import { SancionTable } from "@/components/sanciones/sancion-table";
import { DataTable } from "@/components/ui/data-table";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// Checkbox removed per request
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  PlayCircle,
  // PauseCircle removed per request
  ArrowRight,
  ArrowDown,
  Minus,
  Filter,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToggleActivarSancion } from "@/hooks/sanciones.queries";
import { Sancion, TipoSancion, TIPOS_SANCION, TIPO_SANCION_LABELS } from "@/types/sancion.types";
import { PDFLink } from "@/components/sanciones/pdf-viewer";
import { SancionCreateDialog } from "@/components/sanciones/sancion-create-dialog";
import { SancionEditDialog } from "@/components/sanciones/sancion-edit-dialog";
import { SancionDeleteDialog } from "@/components/sanciones/sancion-delete-dialog";
import { SancionRestoreDialog } from "@/components/sanciones/sancion-restore-dialog";
import { SancionViewDialog } from "@/components/sanciones/sancion-view-dialog";
import SancionBulkCreateDialog from "@/components/sanciones/sancion-bulk-create-dialog";

export default function SancionesPage() {
  const {
    openCreateDialog,
    showDeleted,
    searchTerm,
    tipoSancionFilter,
    estadoActivaFilter,
    setSearchTerm,
    setTipoSancionFilter,
    setEstadoActivaFilter,
    setShowDeleted,
  } = useSancionesStore();
  const { openBulkCreateDialog } = useSancionesStore();



  // Estados para filtros avanzados
  const [fechaInicioFilter, setFechaInicioFilter] = useState<string>('');
  const [fechaFinFilter, setFechaFinFilter] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estados para selección múltiple
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Efecto para mostrar acciones en lote
  useEffect(() => {
    setShowBulkActions(selectedRows.length > 0);
  }, [selectedRows]);

  // Efecto para limpiar selección cuando cambian los filtros
  useEffect(() => {
    setSelectedRows([]);
  }, [tipoSancionFilter, estadoActivaFilter, fechaInicioFilter, fechaFinFilter, showDeleted]);

  // Hook para acciones de sanciones
  const toggleActivarMutation = useToggleActivarSancion();

  const {
    data: sanciones,
    isLoading: loadingSanciones,
    error: errorSanciones,
    refetch: refetchSanciones
  } = useSanciones(true);

  const {
    data: estadisticas,
    isLoading: loadingEstadisticas,
    refetch: refetchEstadisticas
  } = useSancionesStats();



  // Filtrar datos para DataTable
  const filteredData = useMemo(() => {
    if (!sanciones) return [];

    return sanciones.filter((sancion) => {
      // Filtro por eliminados
      const isDeleted = !!sancion.deleted_at;
      if (showDeleted && !isDeleted) {
        return false;
      }
      if (!showDeleted && isDeleted) {
        return false;
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
  }, [sanciones, showDeleted, tipoSancionFilter, estadoActivaFilter, fechaInicioFilter, fechaFinFilter]);

  const totalItems = filteredData.length;
  console.log("Total items after filtering:", filteredData);
  const handleRefresh = () => {
    refetchSanciones();
    refetchEstadisticas();
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setTipoSancionFilter(null);
    setEstadoActivaFilter(null);
    setFechaInicioFilter('');
    setFechaFinFilter('');
  };

  // Funciones para selección múltiple
  const handleSelectRow = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map((item: Sancion) => item.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
    setShowBulkActions(false);
  };

  // Acciones en lote
  const handleBulkActivate = () => {
    selectedRows.forEach(id => {
      const sancion = filteredData.find((s: Sancion) => s.id === id);
      if (sancion && !sancion.activa && !sancion.deleted_at) {
        toggleActivarMutation.mutate({ id, activar: true });
      }
    });
    handleClearSelection();
  };

  const handleBulkDeactivate = () => {
    selectedRows.forEach(id => {
      const sancion = filteredData.find((s: Sancion) => s.id === id);
      if (sancion && sancion.activa && !sancion.deleted_at) {
        toggleActivarMutation.mutate({ id, activar: false });
      }
    });
    handleClearSelection();
  };



  // Funciones para acciones de sanciones
  const {
    openEditDialog,
    openDeleteDialog,
    openRestoreDialog,
    openViewDialog,
  } = useSancionesStore();

  const handleToggleActivar = (sancion: Sancion) => {
    toggleActivarMutation.mutate({
      id: sancion.id,
      activar: !sancion.activa,
    });
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
  // Definición de columnas para DataTable
  const columns: ColumnDef<Sancion>[] = [

    {
      id: "funcionario",
      header: "Funcionario",
      // Usar accessorFn seguro (fallback cuando no exista funcionario)
      accessorFn: (row) => row.funcionario?.nombre_completo ?? "-",
      cell: ({ row }) => {
        const sancion = row.original;
        const func = sancion.funcionario;

        // Si no hay funcionario, mostrar un placeholder seguro
        if (!func) {
          return (
            <div>
              <p className="font-semibold">Sin funcionario</p>
              <p className="text-sm text-muted-foreground">—</p>
            </div>
          );
        }

        return (
          <div>
            <p className="font-semibold">{func.nombre_completo}</p>
            <p className="text-sm text-muted-foreground">{func.estado_funcionario}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "tipo_sancion",
      header: "Tipo",
      cell: ({ row }) => getTipoSancionBadge(row.getValue("tipo_sancion")),
    },
    {
      accessorKey: "activa",
      header: "Estado",
      cell: ({ row }) => getEstadoBadge(row.original),
    },
    {
      accessorKey: "fecha_inicio",
      header: "Período",
      cell: ({ row }) => {
        const sancion = row.original;
        return (
          <div className="space-y-1 text-sm min-w-[140px]">
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
        );
      },
    },
    {
      accessorKey: "descripcion",
      header: "Descripción / PDF",
      cell: ({ row }) => {
        const sancion = row.original;
        return (
          <div className="space-y-2 max-w-[200px]">
            {sancion.descripcion ? (
              <p className="text-sm truncate" title={sancion.descripcion}>
                {sancion.descripcion}
              </p>
            ) : (
              <span className="text-muted-foreground text-sm">Sin descripción</span>
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
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const sancion = row.original;
        return (
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
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]; if (loadingSanciones || loadingEstadisticas) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Skeleton para cards de estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorSanciones) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar las sanciones: {errorSanciones.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Datos para gráficos
  const pieChartData = estadisticas?.por_tipo ? Object.entries(estadisticas.por_tipo).map(([tipo, cantidad]) => ({
    name: tipo === 'Suspencion' ? 'Suspensión' : tipo,
    value: cantidad,
    color: tipo === 'Suspencion' ? '#fb923c' : '#ef4444'
  })) : [];

  const COLORS = ['#fb923c', '#ef4444'];

  return (
    <>
      <div className="space-y-8">
        {/* Header -- MODIFICADO PARA SER RESPONSIVE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 pt-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Sanciones</h1>
            <p className="text-muted-foreground">
              Administre las sanciones disciplinarias del personal
            </p>
          </div>
          {/* grid de uno en mobile*/}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={openCreateDialog} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Sanción
              </Button>
              <Button variant="secondary" onClick={() => openBulkCreateDialog()} className="hidden sm:inline-flex">
                {/* Este botón será reemplazado por la acción real al importar el diálogo */}
                Asignar a varios
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas generales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 px-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sanciones</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingEstadisticas ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  estadisticas?.total || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Sanciones registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingEstadisticas ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  estadisticas?.activas || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Sanciones en vigor
              </p>
              {estadisticas?.total && estadisticas.total > 0 && (
                <div className="mt-1">
                  <Badge variant="outline" className="text-red-600 bg-red-50">
                    {((estadisticas.activas / estadisticas.total) * 100).toFixed(1)}%
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funcionarios Sancionados</CardTitle>
              <UserX className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingEstadisticas ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  estadisticas?.funcionarios_con_sanciones || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Con sanciones activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funcionarios Disponibles</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingEstadisticas ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  estadisticas?.funcionarios_disponibles || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Sin sanciones activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingEstadisticas ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  estadisticas?.inactivas || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Sanciones finalizadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de estadísticas */}
        {estadisticas && !loadingEstadisticas && (
          <div className="grid gap-4 md:grid-cols-2 px-6">
            {/* Sanciones por mes */}
            {estadisticas.sanciones_por_mes && estadisticas.sanciones_por_mes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Sanciones por Mes
                  </CardTitle>
                  <CardDescription>
                    Evolución de sanciones en los últimos meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={estadisticas.sanciones_por_mes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Distribución por tipo */}
            {pieChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Tipos de Sanción
                  </CardTitle>
                  <CardDescription>
                    Distribución por tipo de sanción
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}



        {/* Tabla de sanciones con DataTable de shadcn/ui */}
        <Card className="mx-6">
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
            </CardTitle>
            <CardDescription>
              Gestione todas las sanciones registradas en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Controles de filtros adicionales */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filtro por tipo de sanción */}
              <Select
                value={tipoSancionFilter || "all"}
                onValueChange={(value) => setTipoSancionFilter(value === "all" ? null : value as TipoSancion)}
              >
                <SelectTrigger className="w-[180px]">
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
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="activa">Activas</SelectItem>
                  <SelectItem value="inactiva">Inactivas</SelectItem>
                </SelectContent>
              </Select>

              {/* Toggle eliminados */}
              <div className="flex items-center space-x-2">
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
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </Button>

              {/* Botón limpiar filtros */}
              <Button
                variant="outline"
                onClick={handleClearFilters}
                size="sm"
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

            {/* Acciones en lote */}
            {selectedRows.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {selectedRows.length} elemento{selectedRows.length !== 1 ? 's' : ''} seleccionado{selectedRows.length !== 1 ? 's' : ''}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSelection}
                    >
                      Limpiar selección
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkActivate}
                      disabled={toggleActivarMutation.isPending}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Activar seleccionadas
                    </Button>
                    {/* Botón de desactivar eliminado */}
                  </div>
                </div>
              </div>
            )}

            {/* DataTable de shadcn/ui */}
            <DataTable
              columns={columns}
              data={filteredData}
              searchKey="funcionario"
              searchPlaceholder="Buscar por funcionario, tipo o descripción..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Diálogos */}
      <SancionCreateDialog />
      <SancionBulkCreateDialog />
      <SancionEditDialog />
      <SancionDeleteDialog />
      <SancionRestoreDialog />
      <SancionViewDialog />
    </>
  );
}
