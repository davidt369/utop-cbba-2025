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
} from "lucide-react";
import { Unidad } from "@/types/unidad.types";
import { useUnidadStore } from "@/store/unidad.store";
import { useRestoreUnidad } from "@/hooks/unidad.queries";

interface UnidadTableProps {
    data: Unidad[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showDeleted: boolean;
    setShowDeleted: (show: boolean) => void;
}

export function UnidadTable({
    data,
    searchTerm,
    setSearchTerm,
    showDeleted,
    setShowDeleted,
}: UnidadTableProps) {
    const { openEditDialog, openDeleteDialog } = useUnidadStore();
    const restoreUnidadMutation = useRestoreUnidad();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const handleRestore = (unidad: Unidad) => {
        restoreUnidadMutation.mutate(unidad.id);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
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
                            placeholder="Buscar por nombre o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full sm:w-64"
                        />
                    </div>
                </div>

                {/* Mostrar eliminados */}
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

            {/* Contenedor con scroll horizontal para móviles */}
            <div className="rounded-md border overflow-x-auto">
                <div className="min-w-[500px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">Unidad</TableHead>
                                <TableHead className="whitespace-nowrap">Descripción</TableHead>
                                <TableHead className="whitespace-nowrap">Fecha de Creación</TableHead>
                                <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <div className="text-muted-foreground">
                                            {data.length === 0
                                                ? "No hay unidades registradas"
                                                : "No se encontraron resultados"}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentData.map((unidad) => (
                                    <TableRow
                                        key={unidad.id}
                                        className={unidad.deleted_at ? "opacity-60 bg-muted/50" : ""}
                                    >
                                        <TableCell>
                                            <div className="font-medium max-w-[180px] truncate">
                                                {unidad.nombre_unidad}
                                                {unidad.deleted_at && (
                                                    <Badge variant="destructive" className="ml-2 text-xs">
                                                        Eliminado
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                                                {unidad.descripcion || (
                                                    <span className="italic">Sin descripción</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground whitespace-nowrap">
                                                {formatDate(unidad.created_at)}
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
                                                    {unidad.deleted_at ? (
                                                        <DropdownMenuItem
                                                            onClick={() => handleRestore(unidad)}
                                                            disabled={restoreUnidadMutation.isPending}
                                                        >
                                                            <RotateCcw className="mr-2 h-4 w-4" />
                                                            {restoreUnidadMutation.isPending
                                                                ? "Restaurando..."
                                                                : "Restaurar"}
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => openEditDialog(unidad)}
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => openDeleteDialog(unidad)}
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