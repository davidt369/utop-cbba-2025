"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, RefreshCw, User, FileText, Shield, Phone, MapPin, CreditCard, Calendar, Badge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useFuncionario, useDeleteFuncionario, useRestoreFuncionario } from "@/hooks/funcionarios.queries";
import { FuncionarioEditDialog } from "@/components/funcionarios/funcionario-edit-dialog";
import { FuncionarioDeleteDialog } from "@/components/funcionarios/funcionario-delete-dialog";
import { useFuncionariosStore } from "@/store/funcionarios.store";
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

export default function FuncionarioDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id as string);

    const { openEditDialog, openDeleteDialog } = useFuncionariosStore();
    const { data: funcionario, isLoading, error } = useFuncionario(id);

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-32" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
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

    const handleEdit = () => {
        openEditDialog(funcionario);
    };

    const handleDelete = () => {
        openDeleteDialog(funcionario);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
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
                        <h1 className="text-2xl font-bold">{nombreCompleto}</h1>
                        <p className="text-muted-foreground">{funcionario.grado_jerarquico}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isDeleted && (
                        <UIBadge variant="destructive" className="mr-2">
                            Eliminado
                        </UIBadge>
                    )}
                    <UIBadge className={getEstadoColor(funcionario.estado_funcionario)}>
                        {funcionario.estado_funcionario}
                    </UIBadge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEdit}
                        disabled={isDeleted}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                    <Button
                        variant={isDeleted ? "default" : "destructive"}
                        size="sm"
                        onClick={handleDelete}
                    >
                        {isDeleted ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Restaurar
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Información del funcionario */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Información Personal */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Información Personal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                            <p className="font-medium">{nombreCompleto}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Sexo</p>
                            <p>{funcionario.sexo === "M" ? "Masculino" : "Femenino"}</p>
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
                    </CardContent>
                </Card>

                {/* Información Profesional */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Badge className="h-5 w-5" />
                            Información Profesional
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Grado Jerárquico</p>
                            <p className="font-medium">{funcionario.grado_jerarquico}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Estado</p>
                            <UIBadge className={getEstadoColor(funcionario.estado_funcionario)}>
                                {funcionario.estado_funcionario}
                            </UIBadge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Número de Escalafón</p>
                            <p>{funcionario.numero_escalafon || "No registrado"}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Información de Contacto */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="h-5 w-5" />
                            Información de Contacto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Número de Celular</p>
                            <p>{funcionario.numero_celular || "No registrado"}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                            <p className="text-sm">{funcionario.direccion || "No registrada"}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Información Bancaria */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Información Bancaria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Número de Cuenta</p>
                            <p>{funcionario.numero_cuenta_bancaria || "No registrada"}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Información de Usuario */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Cuenta de Usuario
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {funcionario.usuario ? (
                            <>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="font-mono text-sm">{funcionario.usuario.email}</p>
                                </div>
                                <Separator />
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
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-muted-foreground text-sm">
                                    Este funcionario no tiene cuenta de usuario asignada
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Información del Sistema */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Información del Sistema
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
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
                        <Separator />
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
                            <>
                                <Separator />
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
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialogs */}
            <FuncionarioEditDialog />
            <FuncionarioDeleteDialog />
        </div>
    );
}