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
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  PlayCircle,
  ArrowRight,
  ArrowDown,
  Minus,
  Filter,
  Download,
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
      return <Badge variant="destructive" className="text-xs">Eliminada</Badge>;
    }

    if (sancion.activa) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-xs">Activa</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs">Inactiva</Badge>;
    }
  };

  const getTipoSancionBadge = (tipo: TipoSancion) => {
    const colors = {
      'Suspencion': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      'Baja Definitiva': 'bg-red-100 text-red-800 hover:bg-red-200'
    };

    return (
      <Badge className={`${colors[tipo]} text-xs`}>
        {TIPO_SANCION_LABELS[tipo] || tipo}
      </Badge>
    );
  };

  // Definición de columnas para DataTable
  const columns: ColumnDef<Sancion>[] = [
    {
      id: "funcionario",
      header: "Funcionario",
      accessorFn: (row) => row.funcionario?.nombre_completo ?? "-",
      cell: ({ row }) => {
        const sancion = row.original;
        const func = sancion.funcionario;

        if (!func) {
          return (
            <div>
              <p className="font-semibold text-sm">Sin funcionario</p>
              <p className="text-xs text-muted-foreground">—</p>
            </div>
          );
        }

        return (
          <div>
            <p className="font-semibold text-sm">{func.nombre_completo}</p>
            <p className="text-xs text-muted-foreground">{func.estado_funcionario}</p>
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
          <div className="space-y-1 text-xs min-w-[120px]">
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
          <div className="space-y-2 max-w-[150px]">
            {sancion.descripcion ? (
              <p className="text-xs truncate" title={sancion.descripcion}>
                {sancion.descripcion}
              </p>
            ) : (
              <span className="text-muted-foreground text-xs">Sin descripción</span>
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
            <DropdownMenuContent align="end" className="w-48">
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
  ];

  if (loadingSanciones || loadingEstadisticas) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-20 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
      <div className="container mx-auto p-4">
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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="container mx-auto p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Gestión de Sanciones</h1>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Administre las sanciones disciplinarias del personal
                </p>
              </div>

              <div className="flex flex-col xs:flex-row gap-2 w-full lg:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="flex-1 lg:flex-none"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={openCreateDialog}
                    className="flex-1 lg:flex-none"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => openBulkCreateDialog()}
                    className="flex-1 lg:flex-none"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Varios
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="container mx-auto p-4 space-y-6">
          {/* Estadísticas generales */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium">Total Sanciones</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">
                  {estadisticas?.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sanciones registradas
                </p>
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium">Activas</CardTitle>
                <Shield className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">
                  {estadisticas?.activas || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sanciones en vigor
                </p>
                {estadisticas?.total && estadisticas.total > 0 && (
                  <div className="mt-1">
                    <Badge variant="outline" className="text-red-600 bg-red-50 text-xs">
                      {((estadisticas.activas / estadisticas.total) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium">Funcionarios Sancionados</CardTitle>
                <UserX className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">
                  {estadisticas?.funcionarios_con_sanciones || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Con sanciones activas
                </p>
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium">Disponibles</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">
                  {estadisticas?.funcionarios_disponibles || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sin sanciones activas
                </p>
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium">Inactivas</CardTitle>
                <Clock className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">
                  {estadisticas?.inactivas || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sanciones finalizadas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de estadísticas */}
          {estadisticas && !loadingEstadisticas && (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Sanciones por mes */}
              {estadisticas.sanciones_por_mes && estadisticas.sanciones_por_mes.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                      <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />
                      Sanciones por Mes
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Evolución de sanciones en los últimos meses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={estadisticas.sanciones_por_mes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" fontSize={12} />
                        <YAxis fontSize={12} />
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
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                      <Activity className="h-4 w-4 lg:h-5 lg:w-5" />
                      Tipos de Sanción
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Distribución por tipo de sanción
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
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

          {/* Tabla de sanciones */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg lg:text-xl">Lista de Sanciones</CardTitle>
                  <CardDescription className="text-sm">
                    Gestione todas las sanciones registradas en el sistema
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {totalItems} registros
                  </Badge>
                  {(searchTerm || tipoSancionFilter || estadoActivaFilter || fechaInicioFilter || fechaFinFilter) && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                      Filtros activos
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Filtros principales */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:flex lg:flex-row gap-3">
                  {/* Filtro por tipo de sanción */}
                  <div className="flex-1 min-w-[150px]">
                    <Select
                      value={tipoSancionFilter || "all"}
                      onValueChange={(value) => setTipoSancionFilter(value === "all" ? null : value as TipoSancion)}
                    >
                      <SelectTrigger className="w-full">
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
                  </div>

                  {/* Filtro por estado activa */}
                  <div className="flex-1 min-w-[140px]">
                    <Select
                      value={estadoActivaFilter || "all"}
                      onValueChange={(value) => setEstadoActivaFilter(value === "all" ? null : value as 'activa' | 'inactiva')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="activa">Activas</SelectItem>
                        <SelectItem value="inactiva">Inactivas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Toggle eliminados */}
                  <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg xs:col-span-2 lg:col-span-1">
                    <Switch
                      id="show-deleted"
                      checked={showDeleted}
                      onCheckedChange={setShowDeleted}
                      className="scale-90"
                    />
                    <Label htmlFor="show-deleted" className="text-sm whitespace-nowrap">
                      Mostrar eliminados
                    </Label>
                  </div>
                </div>

                {/* Filtros avanzados */}
                <div className="flex flex-col-2 xs:flex-row mt-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2 flex-1 xs:flex-none"
                    size="sm"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filtros Avanzados</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    size="sm"
                    className="flex-1 xs:flex-none"
                  >
                    Limpiar Filtros
                  </Button>
                </div>

                {/* Filtros avanzados desplegables */}
                {showAdvancedFilters && (
                  <div className="bg-muted/30 p-4 rounded-lg space-y-4 border">
                    <h4 className="text-sm font-medium">Filtros por Fecha</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fecha-inicio-filter" className="text-sm">Fecha inicio desde:</Label>
                        <Input
                          id="fecha-inicio-filter"
                          type="date"
                          value={fechaInicioFilter}
                          onChange={(e) => setFechaInicioFilter(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fecha-fin-filter" className="text-sm">Fecha fin hasta:</Label>
                        <Input
                          id="fecha-fin-filter"
                          type="date"
                          value={fechaFinFilter}
                          onChange={(e) => setFechaFinFilter(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {(fechaInicioFilter || fechaFinFilter) && (
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>Filtros activos:</span>
                        {fechaInicioFilter && (
                          <Badge variant="secondary" className="text-xs">
                            Inicio ≥ {fechaInicioFilter}
                          </Badge>
                        )}
                        {fechaFinFilter && (
                          <Badge variant="secondary" className="text-xs">
                            Fin ≤ {fechaFinFilter}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Acciones en lote */}
              {selectedRows.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {selectedRows.length} seleccionado{selectedRows.length !== 1 ? 's' : ''}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSelection}
                        className="h-8 text-xs"
                      >
                        Limpiar
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkActivate}
                        disabled={toggleActivarMutation.isPending}
                        className="h-8 text-xs"
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Activar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* DataTable */}
              <div className="overflow-hidden">
                <DataTable
                  columns={columns}
                  data={filteredData}
                  searchKey="funcionario"
                  searchPlaceholder="Buscar por funcionario, tipo o descripción..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
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