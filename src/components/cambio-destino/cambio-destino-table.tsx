'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    RotateCcw,
    Search,
    Filter,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Clock,
    User,
    Building
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatDate } from '@/lib/utils';
import { useCambioDestinoStore } from '@/store/cambio-destino.store';
import { useCambiosDestino } from '@/hooks/cambio-destino.queries';
import type { CambioDestino } from '@/types/cambio-destino.types';

const ITEMS_PER_PAGE = 10;

export function CambioDestinoTable() {
    const {
        searchTerm,
        setSearchTerm,
        showDeleted,
        setShowDeleted,
        filters,
        openEditDialog,
        openDeleteDialog,
        openRestoreDialog,
        openViewDialog,
    } = useCambioDestinoStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortField, setSortField] = useState<'fecha_destino' | 'funcionario' | 'unidad_destino'>('fecha_destino');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const { data: cambiosDestino = [], isLoading, error } = useCambiosDestino({
        withDeleted: showDeleted,
        ...filters
    });

    // Resetear página cuando cambien los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, showDeleted, sortField, sortDirection]);

    // Filtrar y ordenar datos
    const filteredCambios = useMemo(() => {
        let filtered = cambiosDestino;

        if (showDeleted) {
            filtered = filtered.filter(cambio => cambio.deleted_at !== null);
        } else {
            filtered = filtered.filter(cambio => cambio.deleted_at === null);
        }

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((cambio) =>
                cambio.funcionario.nombre_completo.toLowerCase().includes(searchLower) ||
                cambio.funcionario.numero_carnet.toLowerCase().includes(searchLower) ||
                cambio.unidad_destino.nombre_unidad.toLowerCase().includes(searchLower) ||
                cambio.motivo_cambio.toLowerCase().includes(searchLower) ||
                (cambio.unidad_anterior?.nombre_unidad?.toLowerCase().includes(searchLower))
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((cambio) =>
                statusFilter === 'active' ? cambio.activo : !cambio.activo
            );
        }

        const sorted = [...filtered].sort((a, b) => {
            let valueA: any;
            let valueB: any;

            switch (sortField) {
                case 'fecha_destino':
                    valueA = new Date(a.fecha_destino).getTime();
                    valueB = new Date(b.fecha_destino).getTime();
                    break;
                case 'funcionario':
                    valueA = a.funcionario.nombre_completo.toLowerCase();
                    valueB = b.funcionario.nombre_completo.toLowerCase();
                    break;
                case 'unidad_destino':
                    valueA = a.unidad_destino.nombre_unidad.toLowerCase();
                    valueB = b.unidad_destino.nombre_unidad.toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [cambiosDestino, searchTerm, statusFilter, showDeleted, sortField, sortDirection]);

    // Paginación
    const totalPages = Math.ceil(filteredCambios.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentCambios = filteredCambios.slice(startIndex, endIndex);

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, showDeleted]);

    const handleViewCambio = (cambio: CambioDestino) => {
        openViewDialog(cambio);
    };

    const handleEditCambio = (cambio: CambioDestino) => {
        openEditDialog(cambio);
    };

    const handleDeleteCambio = (cambio: CambioDestino) => {
        openDeleteDialog(cambio);
    };

    const handleRestoreCambio = (cambio: CambioDestino) => {
        openRestoreDialog(cambio);
    };

    const handleSort = (field: 'fecha_destino' | 'funcionario' | 'unidad_destino') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getSortIcon = (field: 'fecha_destino' | 'funcionario' | 'unidad_destino') => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp className="ml-2 h-4 w-4" />
            : <ArrowDown className="ml-2 h-4 w-4" />;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-destructive">Error al cargar los cambios de destino</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filtros y búsqueda - responsive */}
            <div className="flex flex-col gap-4 sm:flex-wrap sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row flex-1 gap-2 sm:gap-4 w-full">
                    <div className="relative flex-1 max-w-full sm:max-w-xs w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar cambios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="active">Activos</SelectItem>
                            <SelectItem value="inactive">Inactivos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Switch
                        id="show-deleted"
                        checked={showDeleted}
                        onCheckedChange={setShowDeleted}
                    />
                    <label htmlFor="show-deleted" className="text-sm text-muted-foreground">
                        {showDeleted ? 'Solo eliminados' : 'Mostrar eliminados'}
                    </label>
                </div>
            </div>

            {/* Contenedor de tabla con scroll horizontal */}
            <div className="rounded-md border overflow-x-auto">
                <div className="min-w-[700px]">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('funcionario')}
                                        className="h-auto p-0 font-semibold hover:bg-transparent"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Funcionario
                                        {getSortIcon('funcionario')}
                                    </Button>
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('unidad_destino')}
                                        className="h-auto p-0 font-semibold hover:bg-transparent"
                                    >
                                        <Building className="mr-2 h-4 w-4" />
                                        Unidad Destino
                                        {getSortIcon('unidad_destino')}
                                    </Button>
                                </TableHead>
                                <TableHead className="whitespace-nowrap">Unidad Anterior</TableHead>
                                <TableHead className="whitespace-nowrap">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('fecha_destino')}
                                        className="h-auto p-0 font-semibold hover:bg-transparent"
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        Fecha Destino
                                        {getSortIcon('fecha_destino')}
                                    </Button>
                                </TableHead>
                                <TableHead className="whitespace-nowrap">Estado</TableHead>
                                <TableHead className="whitespace-nowrap">Motivo</TableHead>
                                <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentCambios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        {showDeleted
                                            ? 'No hay cambios eliminados.'
                                            : searchTerm
                                                ? 'No se encontraron resultados.'
                                                : 'No hay cambios registrados.'
                                        }
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentCambios.map((cambio) => (
                                    <TableRow key={cambio.id} className={cambio.deleted_at ? 'opacity-60' : ''}>
                                        <TableCell className="break-words max-w-[140px] sm:max-w-[180px]">
                                            <div className="space-y-1">
                                                <div className="font-medium break-words text-xs sm:text-sm md:text-base">
                                                    {cambio.funcionario.nombre_completo}
                                                </div>
                                                <div className="text-xs sm:text-sm text-muted-foreground break-words">
                                                    C.I. {cambio.funcionario.numero_carnet}
                                                </div>
                                                {'grado_jerarquico' in cambio.funcionario && (cambio.funcionario as any).grado_jerarquico && (
                                                    <div className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit break-words inline-block mt-1">
                                                        {(cambio.funcionario as any).grado_jerarquico}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="break-words max-w-[120px] sm:max-w-[160px]">
                                            <div className="space-y-1">
                                                <div className="font-medium flex items-center gap-1 sm:gap-2 break-words text-xs sm:text-sm md:text-base">
                                                    <Building className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                                    {cambio.unidad_destino.nombre_unidad}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="break-words max-w-[120px] sm:max-w-[160px]">
                                            {cambio.unidad_anterior ? (
                                                <div className="space-y-1">
                                                    <div className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 break-words">
                                                        <Building className="h-2 w-2 sm:h-3 sm:w-3 text-gray-500" />
                                                        {cambio.unidad_anterior.nombre_unidad}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs sm:text-sm">
                                                    Primer destino
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="break-words max-w-[100px] sm:max-w-[120px]">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs sm:text-sm font-medium">
                                                    {formatDate(cambio.fecha_destino)}
                                                </span>
                                            </div>
                                            {cambio.created_at && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Registrado: {formatDate(cambio.created_at)}
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="break-words max-w-[100px]">
                                            <div className="flex flex-wrap items-center gap-1">
                                                <Badge variant={cambio.activo ? 'default' : 'secondary'} className="text-xs sm:text-sm px-1.5 py-0.5">
                                                    {cambio.activo ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                                {cambio.deleted_at && (
                                                    <Badge variant="destructive" className="text-xs sm:text-sm px-1.5 py-0.5">
                                                        Eliminado
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="break-words max-w-[140px] sm:max-w-[180px]">
                                            <div className="text-xs sm:text-sm line-clamp-2" title={cambio.motivo_cambio}>
                                                {cambio.motivo_cambio}
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
                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem onClick={() => handleViewCambio(cambio)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Ver detalles
                                                    </DropdownMenuItem>

                                                    {!cambio.deleted_at && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleEditCambio(cambio)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteCambio(cambio)}
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}

                                                    {cambio.deleted_at && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleRestoreCambio(cambio)}
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
            </div>

            {/* Paginación - responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <div>
                        Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCambios.length)} de {filteredCambios.length} cambios
                    </div>
                    {showDeleted && (
                        <Badge variant="outline" className="text-xs">
                            Solo eliminados
                        </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                        Ordenado por: {sortField === 'fecha_destino' ? 'Fecha' : sortField === 'funcionario' ? 'Funcionario' : 'Unidad'}
                        {sortDirection === 'desc' ? ' ↓' : ' ↑'}
                    </Badge>
                </div>

                {totalPages > 1 && (
                    <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="text-xs sm:text-sm"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </Button>

                        <span className="text-xs sm:text-sm text-muted-foreground">
                            Página {currentPage} de {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="text-xs sm:text-sm"
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}