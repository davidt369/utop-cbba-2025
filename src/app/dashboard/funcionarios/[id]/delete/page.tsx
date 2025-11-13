"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, RefreshCw, AlertTriangle, User, Mail, Badge, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useFuncionario, useDeleteFuncionario, useRestoreFuncionario } from "@/hooks/funcionarios.queries";
import { EstadoFuncionarioType } from "@/types/funcionario.types";

// Helper para obtener color del estado
const getEstadoColor = (estado: EstadoFuncionarioType) => {
    switch (estado) {
        case "Activo":
            return "bg-green-100 text-green-800 border-green-200";
        case "Suspendido":
            return "bg-red-100 text-red-800 border-red-200";
        case "Baja medica":
            return "bg-orange-100 text-orange-800 border-orange-200";
        case "De Vacaciones":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "En permiso":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "Baja Definitiva":
            return "bg-gray-100 text-gray-800 border-gray-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

export default function DeleteFuncionarioPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);

    const { data: funcionario, isLoading, error } = useFuncionario(id);
    const deleteFuncionarioMutation = useDeleteFuncionario();
    const restoreFuncionarioMutation = useRestoreFuncionario();

    const [isConfirming, setIsConfirming] = useState(false);

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !funcionario) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                </div>
                <Alert variant="destructive">
                    <AlertDescription>
                        {error?.message || "No se pudo cargar la información del funcionario"}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const nombreCompleto = [
        funcionario.primer_nombre,
        funcionario.segundo_nombre,
        funcionario.primer_apellido,
        funcionario.segundo_apellido,
    ]
        .filter(Boolean)
        .join(" ");

    const isDeleted = !!funcionario.deleted_at;

    const handleDelete = () => {
        if (!isConfirming) {
            setIsConfirming(true);
            return;
        }

        deleteFuncionarioMutation.mutate(funcionario.id, {
            onSuccess: () => {
                router.push("/dashboard/funcionarios");
            },
        });
    };

    const handleRestore = () => {
        if (!isConfirming) {
            setIsConfirming(true);
            return;
        }

        restoreFuncionarioMutation.mutate(funcionario.id, {
            onSuccess: () => {
                router.push(`/dashboard/funcionarios/${funcionario.id}`);
            },
        });
    };

    const isPending = deleteFuncionarioMutation.isPending || restoreFuncionarioMutation.isPending;
    const mutationError = deleteFuncionarioMutation.error || restoreFuncionarioMutation.error;

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {isDeleted ? (
                            <>
                                <RefreshCw className="h-6 w-6 text-orange-600" />
                                Restaurar Funcionario
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-6 w-6 text-red-600" />
                                Eliminar Funcionario
                            </>
                        )}
                    </h1>
                    <p className="text-muted-foreground">{nombreCompleto}</p>
                </div>
            </div>

            {/* Información del funcionario */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Información del Funcionario
                    </CardTitle>
                    <CardDescription>
                        Revise la información antes de {isDeleted ? "restaurar" : "eliminar"} al funcionario
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                            <p className="font-medium">{nombreCompleto}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Carnet de Identidad</p>
                            <p>
                                {funcionario.numero_carnet
                                    ? `${funcionario.numero_carnet} ${funcionario.expedido}`
                                    : "No registrado"
                                }
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Grado Jerárquico</p>
                            <p>{funcionario.grado_jerarquico}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Estado Actual</p>
                            <UIBadge className={getEstadoColor(funcionario.estado_funcionario)}>
                                {funcionario.estado_funcionario}
                            </UIBadge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Número de Escalafón</p>
                            <p>{funcionario.numero_escalafon || "No registrado"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p>{funcionario.usuario?.email || "Sin cuenta de usuario"}</p>
                        </div>
                    </div>

                    {/* Información del usuario asociado */}
                    {funcionario.usuario && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-medium flex items-center gap-2 mb-3">
                                    <Mail className="h-4 w-4" />
                                    Cuenta de Usuario Asociada
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="font-mono text-sm">{funcionario.usuario.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Rol</p>
                                        <p>{funcionario.usuario.rol?.nombre_rol || "Usuario"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Estado de Usuario</p>
                                        <UIBadge variant={funcionario.usuario.deleted_at ? "destructive" : "default"}>
                                            {funcionario.usuario.deleted_at ? "Eliminado" : "Activo"}
                                        </UIBadge>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Fechas del sistema */}
                    <Separator />
                    <div>
                        <h4 className="font-medium flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4" />
                            Información del Sistema
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fecha de Registro</p>
                                <p className="text-sm">
                                    {new Date(funcionario.created_at).toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                                <p className="text-sm">
                                    {new Date(funcionario.updated_at).toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                            {funcionario.deleted_at && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Fecha de Eliminación</p>
                                    <p className="text-sm">
                                        {new Date(funcionario.deleted_at).toLocaleDateString("es-ES", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmación */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Confirmación Requerida
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isDeleted ? (
                        <Alert>
                            <RefreshCw className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Acción de Restauración:</strong>
                                <br />
                                Al restaurar este funcionario se reactivará su acceso al sistema y su cuenta de usuario.
                                Podrá volver a iniciar sesión y realizar todas las funciones asignadas a su rol.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert variant="destructive">
                            <Trash2 className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Acción de Eliminación:</strong>
                                <br />
                                Al eliminar este funcionario se desactivará su cuenta de usuario y no podrá acceder al sistema.
                                Los datos se mantendrán en la base de datos pero no serán visibles en las listas normales.
                                Esta acción se puede revertir posteriormente.
                            </AlertDescription>
                        </Alert>
                    )}

                    {mutationError && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {mutationError.message || `Error al ${isDeleted ? 'restaurar' : 'eliminar'} el funcionario`}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        {isDeleted ? (
                            <Button
                                variant="default"
                                onClick={handleRestore}
                                disabled={isPending}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {isConfirming
                                    ? (restoreFuncionarioMutation.isPending ? "Restaurando..." : "Confirmar Restauración")
                                    : "Restaurar Funcionario"
                                }
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isPending}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {isConfirming
                                    ? (deleteFuncionarioMutation.isPending ? "Eliminando..." : "Confirmar Eliminación")
                                    : "Eliminar Funcionario"
                                }
                            </Button>
                        )}
                    </div>

                    {isConfirming && (
                        <p className="text-sm text-muted-foreground text-center">
                            Haga clic nuevamente en el botón para confirmar la acción
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}