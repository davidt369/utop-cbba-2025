"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Edit,
    Trash2,
    MoreHorizontal,
    Search,
    RotateCcw,
    Building,
    Activity,
} from "lucide-react";
import { FuncionarioCargo } from "@/types/funcionarioCargo.types";
import { useFuncionarioCargoStore } from "@/store/funcionarioCargo.store";
import { useRestoreFuncionarioCargo } from "@/hooks/funcionarioCargo.queries";

interface FuncionarioCargoTableProps {
    data: FuncionarioCargo[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    tipoAreaFilter: string;
    setTipoAreaFilter: (filter: string) => void;
    showDeleted: boolean;
    setShowDeleted: (show: boolean) => void;
}

export function FuncionarioCargoTable({
    data,
    searchTerm,
    setSearchTerm,
    tipoAreaFilter,
    setTipoAreaFilter,
    showDeleted,
    setShowDeleted,
}: FuncionarioCargoTableProps) {
    const { openEditDialog, openDeleteDialog } = useFuncionarioCargoStore();
    const restoreFuncionarioCargoMutation = useRestoreFuncionarioCargo();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const handleRestore = (funcionarioCargo: FuncionarioCargo) => {
        restoreFuncionarioCargoMutation.mutate(funcionarioCargo.id);
    };

    const getTipoAreaBadge = (tipoArea: string) => {
        switch (tipoArea) {
            case 'Administrativa':
                return (
                    <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                        <Building className="h-3 w-3" />
                        Administrativa
                    </Badge>
                );
            case 'Operativa':
                return (
                    <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                        <Activity className="h-3 w-3" />
                        Operativa
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="whitespace-nowrap">{tipoArea}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            {/* Filtros - responsive con wrap */}
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                {/* Búsqueda */}
                <div className="w-full sm:w-auto">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar funcionario, cargo o área..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full sm:w-64"
                        />
                    </div>
                </div>

                {/* Filtros adicionales - wrap en móviles */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <Select value={tipoAreaFilter} onValueChange={setTipoAreaFilter}>
                        <SelectTrigger className="w-full sm:w-40 md:w-48">
                            <SelectValue placeholder="Área" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las áreas</SelectItem>
                            <SelectItem value="Administrativa">Administrativa</SelectItem>
                            <SelectItem value="Operativa">Operativa</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="show-deleted"
                            checked={showDeleted}
                            onCheckedChange={(checked) => setShowDeleted(checked as boolean)}
                        />
                        <Label htmlFor="show-deleted" className="text-sm whitespace-nowrap">
                            Mostrar eliminados
                        </Label>
                    </div>
                </div>
            </div>

            {/* Contenedor con scroll horizontal para móviles */}
            <div className="rounded-md border overflow-x-auto">
                <div className="min-w-[650px] md:min-w-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">Funcionario</TableHead>
                                <TableHead className="whitespace-nowrap">Cargo</TableHead>
                                <TableHead className="whitespace-nowrap">Tipo de Área</TableHead>
                                <TableHead className="whitespace-nowrap">Fecha de Asignación</TableHead>
                                <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="text-muted-foreground">
                                            {data.length === 0
                                                ? "No hay funcionario-cargos registrados"
                                                : "No se encontraron resultados"}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentData.map((funcionarioCargo) => (
                                    <TableRow
                                        key={funcionarioCargo.id}
                                        className={funcionarioCargo.deleted_at ? "opacity-60 bg-muted/50" : ""}
                                    >
                                        <TableCell>
                                            <div className="font-medium max-w-[180px] truncate md:max-w-none">
                                                {funcionarioCargo.funcionario.nombre_completo}
                                                {funcionarioCargo.deleted_at && (
                                                    <Badge variant="destructive" className="ml-2 text-xs">
                                                        Eliminado
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium max-w-[160px] truncate md:max-w-none">
                                                {funcionarioCargo.cargo.nombre_cargo}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getTipoAreaBadge(funcionarioCargo.tipo_area)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {funcionarioCargo.fecha_asignacion
                                                    ? formatDate(funcionarioCargo.fecha_asignacion)
                                                    : 'No especificada'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menú</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {funcionarioCargo.deleted_at ? (
                                                        <DropdownMenuItem
                                                            onClick={() => handleRestore(funcionarioCargo)}
                                                            disabled={restoreFuncionarioCargoMutation.isPending}
                                                        >
                                                            <RotateCcw className="mr-2 h-4 w-4" />
                                                            {restoreFuncionarioCargoMutation.isPending
                                                                ? "Restaurando..."
                                                                : "Restaurar"}
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => openEditDialog(funcionarioCargo)}
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => openDeleteDialog(funcionarioCargo)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </>
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
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                        Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
                        <span className="font-medium">{Math.min(endIndex, data.length)}</span> de{" "}
                        <span className="font-medium">{data.length}</span> resultados
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                        <div className="flex flex-wrap justify-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className="w-8 h-8 p-0 text-xs"
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}