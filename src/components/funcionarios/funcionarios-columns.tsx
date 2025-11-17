"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, RotateCcw, Eye } from "lucide-react";
import { Funcionario } from "@/types/funcionario.types";
import { useFuncionariosStore } from "@/store/funcionarios.store";
import { useRestoreFuncionario } from "@/hooks/funcionarios.queries";
import Link from "next/link";
import { toast } from "sonner";

// Función helper para obtener el color del badge según el estado
const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
        case 'Activo':
            return 'default';
        case 'Suspendido':
            return 'destructive';
        case 'Baja medica':
            return 'secondary';
        case 'De Vacaciones':
            return 'outline';
        case 'En permiso':
            return 'secondary';
        case 'Baja Definitiva':
            return 'destructive';
        default:
            return 'secondary';
    }
};

// Función helper para obtener el color del badge según el rol
const getRolBadgeVariant = (rol: string) => {
    switch (rol) {
        case 'SuperAdministrador':
            return 'destructive';
        case 'Administrador':
            return 'default';
        case 'Usuario':
            return 'secondary';
        default:
            return 'outline';
    }
};

export const funcionariosColumns: ColumnDef<Funcionario>[] = [
    {
        accessorKey: "numero_carnet",
        header: "Carnet",
        cell: ({ row }) => {
            const carnet = row.getValue("numero_carnet") as string;
            const expedido = row.original.expedido;
            return carnet ? `${carnet} ${expedido}` : "Sin carnet";
        },
    },
    {
        id: "nombre_completo",
        header: "Nombre Completo",
        cell: ({ row }) => {
            const funcionario = row.original;
            const nombreCompleto = [
                funcionario.primer_nombre,
                funcionario.segundo_nombre,
                funcionario.primer_apellido,
                funcionario.segundo_apellido,
            ]
                .filter(Boolean)
                .join(" ");

            return (
                <div className="flex flex-col break-words max-w-[180px]">
                    <span className="font-medium text-xs sm:text-sm break-words">{nombreCompleto}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground break-words">
                        {funcionario.grado_jerarquico}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "sexo",
        header: "Sexo",
        cell: ({ row }) => {
            const sexo = row.getValue("sexo") as string;
            return sexo === "M" ? "Masculino" : "Femenino";
        },
    },
    {
        accessorKey: "estado_funcionario",
        header: "Estado",
        cell: ({ row }) => {
            const estado = row.getValue("estado_funcionario") as string;
            return (
                <Badge variant={getEstadoBadgeVariant(estado)} className="w-fit text-xs px-2 py-1 break-words">
                    {estado}
                </Badge>
            );
        },
    },
    {
        id: "usuario_info",
        header: "Usuario/Rol",
        cell: ({ row }) => {
            const usuario = row.original.usuario;

            if (!usuario) {
                return (
                    <div className="text-xs sm:text-sm text-muted-foreground">
                        Sin usuario asignado
                    </div>
                );
            }

            return (
                <div className="flex flex-col gap-1 max-w-[180px] break-words">
                    <span className="text-xs sm:text-sm break-words">{usuario.email}</span>
                    <div className="flex flex-wrap gap-1">
                        {usuario.rol && usuario.rol.nombre_rol ? (
                            <Badge variant={getRolBadgeVariant(usuario.rol.nombre_rol)} className="w-fit text-xs px-2 py-1 break-words">
                                {usuario.rol.nombre_rol}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="w-fit text-xs px-2 py-1 break-words">
                                Sin rol
                            </Badge>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "numero_celular",
        header: "Celular",
        cell: ({ row }) => {
            const celular = row.getValue("numero_celular") as string;
            return celular || "No registrado";
        },
    },
    {
        accessorKey: "numero_escalafon",
        header: "Escalafón",
        cell: ({ row }) => {
            const escalafon = row.getValue("numero_escalafon") as string;
            return escalafon || "No asignado";
        },
    },
    {
        id: "estado_registro",
        header: "Estado Registro",
        cell: ({ row }) => {
            const deleted_at = row.original.deleted_at;
            return (
                <Badge variant={deleted_at ? "outline" : "default"} className="w-fit text-xs px-2 py-1">
                    {deleted_at ? "Eliminado" : "Activo"}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
            const funcionario = row.original;
            const { openEditDialog, openDeleteDialog } = useFuncionariosStore();
            const restoreFuncionarioMutation = useRestoreFuncionario();

            const nombreCompleto = [
                funcionario.primer_nombre,
                funcionario.segundo_nombre,
                funcionario.primer_apellido,
                funcionario.segundo_apellido,
            ]
                .filter(Boolean)
                .join(" ");

            const handleRestore = () => {
                restoreFuncionarioMutation.mutate(funcionario.id, {
                    onSuccess: () => {
                        toast.success("Funcionario restaurado", {
                            description: `${nombreCompleto} ha sido restaurado correctamente.`,
                        });
                    },
                    onError: (error: any) => {
                        toast.error("Error al restaurar", {
                            description: error.response?.data?.message || error.message || "No se pudo restaurar el funcionario.",
                        });
                    },
                });
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/funcionarios/${funcionario.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => openEditDialog(funcionario)}
                            className="cursor-pointer"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>

                        {funcionario.deleted_at ? (
                            <DropdownMenuItem
                                onClick={handleRestore}
                                className="cursor-pointer text-orange-600"
                                disabled={restoreFuncionarioMutation.isPending}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {restoreFuncionarioMutation.isPending ? "Restaurando..." : "Restaurar"}
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                onClick={() => openDeleteDialog(funcionario)}
                                className="cursor-pointer text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];