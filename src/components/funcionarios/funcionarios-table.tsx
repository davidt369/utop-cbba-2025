"use client";

import { useState } from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
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
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronDown,
    Search,
    Filter
} from "lucide-react";
import { Funcionario, ESTADO_FUNCIONARIO_OPTIONS } from "@/types/funcionario.types";
import { funcionariosColumns } from "./funcionarios-columns";

interface FuncionariosTableProps {
    data: Funcionario[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    estadoFilter: string;
    setEstadoFilter: (estado: string) => void;
    showDeleted: boolean;
    setShowDeleted: (show: boolean) => void;
}

export function FuncionariosTable({
    data,
    searchTerm,
    setSearchTerm,
    estadoFilter,
    setEstadoFilter,
    showDeleted,
    setShowDeleted,
}: FuncionariosTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data,
        columns: funcionariosColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full space-y-4">
            {/* Controles de filtros */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Búsqueda y estado */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 flex-1">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar funcionarios..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="pl-8 w-full sm:w-[300px]"
                        />
                    </div>
                    <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            {ESTADO_FUNCIONARIO_OPTIONS.map((estado) => (
                                <SelectItem key={estado.value} value={estado.value}>
                                    {estado.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Controles adicionales */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 md:mt-0">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="show-deleted"
                            checked={showDeleted}
                            onCheckedChange={setShowDeleted}
                        />
                        <Label htmlFor="show-deleted" className="text-sm">
                            Mostrar eliminados
                        </Label>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columnas <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Información de resultados */}
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                    {data.length} funcionario{data.length !== 1 ? 's' : ''}
                </Badge>
                {searchTerm && (
                    <Badge variant="secondary">
                        Búsqueda: "{searchTerm}"
                    </Badge>
                )}
                {estadoFilter && estadoFilter !== 'all' && (
                    <Badge variant="secondary">
                        Estado: {ESTADO_FUNCIONARIO_OPTIONS.find(e => e.value === estadoFilter)?.label}
                    </Badge>
                )}
            </div>

            {/* Tabla */}
            <div className="rounded-md border overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent">
                <Table className="min-w-[700px] w-full text-xs sm:text-sm">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="whitespace-nowrap px-2 py-2">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={row.original.deleted_at ? "opacity-60" : ""}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="whitespace-nowrap px-2 py-2 max-w-[180px] overflow-x-auto">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={funcionariosColumns.length}
                                    className="h-24 text-center"
                                >
                                    No se encontraron funcionarios.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex flex-col md:flex-row flex-wrap items-center justify-between gap-2 px-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground w-full md:w-auto">
                    {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:gap-6 lg:gap-8 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <p className="text-sm font-medium whitespace-nowrap">Filas por página</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-full sm:w-[100px] items-center justify-center text-sm font-medium">
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Ir a la primera página</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Ir a la página anterior</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Ir a la página siguiente</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Ir a la última página</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}