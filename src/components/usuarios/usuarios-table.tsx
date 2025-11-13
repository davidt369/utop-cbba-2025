'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ChevronDown, Search, Filter, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Usuario } from '@/types/usuario';
import { useUsuariosStore } from '@/store/usuarios.store';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UsuariosTableProps {
    data: Usuario[];
}

export function UsuariosTable({ data }: UsuariosTableProps) {
    const {
        openEditDialog,
        openDeleteDialog,
    } = useUsuariosStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<keyof Usuario | 'rol.nombre_rol' | null>(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    // Column visibility
    const [columnVisibility, setColumnVisibility] = useState({
        id: true,
        email: true,
        funcionario: true,
        rol: true,
        created_at: true,
    });

    // Get unique roles for filters
    const rolesUnicos = useMemo(() => {
        return [...new Set(data.map(u => u.rol?.nombre_rol).filter(Boolean))] as string[];
    }, [data]);

    // Filtering and sorting
    const filteredAndSortedUsuarios = useMemo(() => {
        let filtered = data.filter(usuario => {
            const funcionarioNombre = usuario.funcionario
                ? `${usuario.funcionario.primer_nombre} ${usuario.funcionario.primer_apellido}`.toLowerCase()
                : '';

            const matchesSearch =
                usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                usuario.id.toString().includes(searchTerm) ||
                usuario.rol?.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                funcionarioNombre.includes(searchTerm.toLowerCase());

            const matchesRol = selectedRoles.length === 0 || selectedRoles.includes(usuario.rol?.nombre_rol || '');

            return matchesSearch && matchesRol;
        });

        if (sortField) {
            filtered.sort((a, b) => {
                let aValue: any, bValue: any;

                if (sortField === 'rol.nombre_rol') {
                    aValue = a.rol?.nombre_rol || '';
                    bValue = b.rol?.nombre_rol || '';
                } else {
                    aValue = a[sortField];
                    bValue = b[sortField];
                }

                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [data, searchTerm, sortField, sortDirection, selectedRoles]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedUsuarios.length / itemsPerPage);
    const paginatedUsuarios = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedUsuarios.slice(start, start + itemsPerPage);
    }, [filteredAndSortedUsuarios, currentPage, itemsPerPage]);

    const handleSort = (field: keyof Usuario | 'rol.nombre_rol') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const toggleRolFilter = (rol: string) => {
        setSelectedRoles(prev =>
            prev.includes(rol)
                ? prev.filter(r => r !== rol)
                : [...prev, rol]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRoles([]);
        setCurrentPage(1);
    };

    const getRolColor = (rol: string) => {
        switch (rol) {
            case 'SuperAdministrador':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Administrador':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Usuario':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-4">
            {/* Filtros y búsqueda */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por email, ID, rol o nombre de funcionario..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-10"
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Rol ({selectedRoles.length || 'Todos'})
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {rolesUnicos.map(rol => (
                            <DropdownMenuCheckboxItem
                                key={rol}
                                checked={selectedRoles.includes(rol)}
                                onCheckedChange={() => toggleRolFilter(rol)}
                            >
                                {rol}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <ChevronDown className="h-4 w-4" />
                            Columnas
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {Object.entries(columnVisibility).map(([key, value]) => {
                            const columnName = key === 'funcionario' ? 'Funcionario' :
                                key === 'created_at' ? 'Fecha Creación' :
                                    key.charAt(0).toUpperCase() + key.slice(1);
                            return (
                                <DropdownMenuCheckboxItem
                                    key={key}
                                    checked={value}
                                    onCheckedChange={(checked) =>
                                        setColumnVisibility(prev => ({ ...prev, [key]: checked }))
                                    }
                                >
                                    {columnName}
                                </DropdownMenuCheckboxItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>

                {(searchTerm || selectedRoles.length > 0) && (
                    <Button variant="outline" onClick={clearFilters}>
                        Limpiar filtros
                    </Button>
                )}
            </div>

            {/* Controles de visualización */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    Mostrando {paginatedUsuarios.length} de {filteredAndSortedUsuarios.length} usuarios
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mostrar:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columnVisibility.id && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
                                    ID
                                </TableHead>
                            )}
                            {columnVisibility.email && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                                    Email
                                </TableHead>
                            )}
                            {columnVisibility.funcionario && (
                                <TableHead>
                                    Funcionario
                                </TableHead>
                            )}
                            {columnVisibility.rol && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('rol.nombre_rol')}>
                                    Rol
                                </TableHead>
                            )}
                            {columnVisibility.created_at && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                                    Fecha Creación
                                </TableHead>
                            )}
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedUsuarios.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length + 1} className="text-center py-8">
                                    No se encontraron usuarios
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedUsuarios.map((usuario) => (
                                <TableRow key={usuario.id}>
                                    {columnVisibility.id && (
                                        <TableCell className="font-medium">
                                            {usuario.id}
                                        </TableCell>
                                    )}
                                    {columnVisibility.email && (
                                        <TableCell className="lowercase">
                                            {usuario.email}
                                        </TableCell>
                                    )}
                                    {columnVisibility.funcionario && (
                                        <TableCell>
                                            {usuario.funcionario ? (
                                                <div className="space-y-1">
                                                    <div className="font-medium">
                                                        {usuario.funcionario.primer_nombre} {usuario.funcionario.primer_apellido}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        CI: {usuario.funcionario.numero_carnet} {usuario.funcionario.expedido}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {usuario.funcionario.grado_jerarquico}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">Sin funcionario asignado</span>
                                            )}
                                        </TableCell>
                                    )}
                                    {columnVisibility.rol && (
                                        <TableCell>
                                            <Badge className={getRolColor(usuario.rol?.nombre_rol || '')}>
                                                {usuario.rol?.nombre_rol || 'Sin rol'}
                                            </Badge>
                                        </TableCell>
                                    )}
                                    {columnVisibility.created_at && (
                                        <TableCell>
                                            {format(new Date(usuario.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                        </TableCell>
                                    )}
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => navigator.clipboard.writeText(usuario.email)}
                                                >
                                                    Copiar email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => openEditDialog(usuario)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => openDeleteDialog(usuario)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const page = i + 1;
                                const showPage = page <= 3 || page > totalPages - 3 || (page >= currentPage - 1 && page <= currentPage + 1);

                                if (!showPage && i > 0 && i < 4) {
                                    return (
                                        <PaginationItem key={`ellipsis-${i}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }

                                if (!showPage) return null;

                                return (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(page)}
                                            isActive={currentPage === page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}