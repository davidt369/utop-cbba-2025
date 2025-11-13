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
    FileText,
} from "lucide-react";
import { Cargo } from "@/types/cargo.types";
import { useCargosStore } from "@/store/cargos.store";
import { useRestoreCargo } from "@/hooks/cargo.queries";

interface CargoTableProps {
    data: Cargo[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showDeleted: boolean;
    setShowDeleted: (show: boolean) => void;
}

export function CargoTable({
    data,
    searchTerm,
    setSearchTerm,
    showDeleted,
    setShowDeleted,
}: CargoTableProps) {
    const { openEditDialog, openDeleteDialog } = useCargosStore();
    const restoreCargoMutation = useRestoreCargo();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Paginación
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const handleRestore = (cargo: Cargo) => {
        restoreCargoMutation.mutate(cargo.id);
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
            {/* Filtros */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Búsqueda */}
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar cargo o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-80"
                        />
                    </div>
                </div>

                {/* Filtros adicionales */}
                <div className="flex items-center space-x-4">
                    {/* Mostrar eliminados */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="show-deleted"
                            checked={showDeleted}
                            onCheckedChange={(checked) => setShowDeleted(checked as boolean)}
                        />
                        <Label htmlFor="show-deleted" className="text-sm">
                            Mostrar eliminados
                        </Label>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre del Cargo</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Fecha de Creación</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    <div className="text-muted-foreground">
                                        {data.length === 0
                                            ? "No hay cargos registrados"
                                            : "No se encontraron resultados"}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentData.map((cargo) => (
                                <TableRow
                                    key={cargo.id}
                                    className={cargo.deleted_at ? "opacity-60 bg-muted/50" : ""}
                                >
                                    <TableCell>
                                        <div className="font-medium">
                                            {cargo.nombre_cargo}
                                            {cargo.deleted_at && (
                                                <Badge variant="destructive" className="ml-2 text-xs">
                                                    Eliminado
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-md">
                                            {cargo.descripcion ? (
                                                <div className="flex items-start gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {cargo.descripcion}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">
                                                    Sin descripción
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDate(cargo.created_at)}
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
                                                {cargo.deleted_at ? (
                                                    // Opciones para elementos eliminados
                                                    <DropdownMenuItem
                                                        onClick={() => handleRestore(cargo)}
                                                        disabled={restoreCargoMutation.isPending}
                                                    >
                                                        <RotateCcw className="mr-2 h-4 w-4" />
                                                        {restoreCargoMutation.isPending ? "Restaurando..." : "Restaurar"}
                                                    </DropdownMenuItem>
                                                ) : (
                                                    // Opciones para elementos activos
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => openEditDialog(cargo)}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteDialog(cargo)}
                                                            className="text-red-600"
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

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, data.length)} de {data.length} resultados
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className="w-8 h-8 p-0"
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