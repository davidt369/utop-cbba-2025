'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Shield, UserCheck, Crown } from 'lucide-react';
import { useUsuarios, useUsuariosEstadisticas } from '@/hooks/usuarios.queries';
import { useUsuariosStore } from '@/store/usuarios.store';
import { UsuariosTable } from '@/components/usuarios/usuarios-table';
import { UsuarioDialog } from '@/components/usuarios/usuario-dialog';
import { UsuarioEditDialog } from '@/components/usuarios/usuario-edit-dialog';
import { UsuarioDeleteDialog } from '@/components/usuarios/usuario-delete-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { redirect } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function UsuariosPage() {

    const user = useAuthStore(state => state.user)
    const { data: usuarios, isLoading, error } = useUsuarios();
    const { data: usuariosStats, isLoading: isLoadingStats } = useUsuariosEstadisticas();
    const { openCreateDialog, isCreateDialogOpen, isEditDialogOpen, isDeleteDialogOpen } = useUsuariosStore();
    if (user?.rol?.nombre_rol !== 'SuperAdministrador') redirect('/dashboard');
    if (isLoading || isLoadingStats) {
        return (
            <div className="container mx-auto p-6 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertDescription>
                        Error al cargar los usuarios: {error.message}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground">
                        Administra los usuarios del sistema y sus permisos
                    </p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
                            <CardDescription>Usuarios activos en el sistema</CardDescription>
                        </div>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usuariosStats?.total || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-sm font-medium">SuperAdministradores</CardTitle>
                            <CardDescription>Acceso completo al sistema</CardDescription>
                        </div>
                        <Crown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{usuariosStats?.superAdministradores || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Gestión completa de usuarios, roles y configuración del sistema
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                            <CardDescription>Gestión de recursos humanos</CardDescription>
                        </div>
                        <Shield className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{usuariosStats?.administradores || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Administración de funcionarios, cargos, ausencias y documentos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                            <CardDescription>Acceso a información personal</CardDescription>
                        </div>
                        <UserCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{usuariosStats?.usuarios || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Consulta de datos personales, cargos, ausencias y documentos propios
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Usuarios</CardTitle>
                    <CardDescription>
                        Gestiona los usuarios administradores del sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UsuariosTable data={usuarios || []} />
                </CardContent>
            </Card>

            {/* Dialogs */}
            {isCreateDialogOpen && <UsuarioDialog />}
            {isEditDialogOpen && <UsuarioEditDialog />}
            {isDeleteDialogOpen && <UsuarioDeleteDialog />}
        </div>
    );
}