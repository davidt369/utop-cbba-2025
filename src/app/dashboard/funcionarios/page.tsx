'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Plus,
    Users,
    UserCheck,
    UserX,
    Calendar,
    AlertTriangle,
    Activity,
    Clock,
    Bed,
    Shield
} from 'lucide-react';
import { useFuncionarios, useFuncionariosEstadisticas } from '@/hooks/funcionarios.queries';
import { useFuncionariosStore } from '@/store/funcionarios.store';
import { FuncionariosTable } from '@/components/funcionarios/funcionarios-table';

import { FuncionarioCreateDialog, FuncionarioEditDialog, FuncionarioDeleteDialog } from '@/components/funcionarios';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

export default function FuncionariosPage() {
    const { data: funcionarios, isLoading, error } = useFuncionarios(true); // Siempre incluir eliminados para poder filtrarlos
    const { data: funcionariosStats, isLoading: isLoadingStats } = useFuncionariosEstadisticas();
    const {
        openCreateDialog,
        showDeleted,
        searchTerm,
        estadoFilter,
        setShowDeleted,
        setSearchTerm,
        setEstadoFilter,
    } = useFuncionariosStore();

    // Filtrar datos basándose en los filtros del store
    const filteredData = useMemo(() => {
        if (!funcionarios) return [];
        return funcionarios.filter((funcionario) => {
            // Filtro por eliminados
            const isDeleted = !!funcionario.deleted_at;
            if (showDeleted && !isDeleted) {
                return false; // Si showDeleted está activo, solo mostrar eliminados
            }
            if (!showDeleted && isDeleted) {
                return false; // Si showDeleted está inactivo, solo mostrar no eliminados
            }

            // Filtro por término de búsqueda
            if (searchTerm) {
                const nombreCompleto = [
                    funcionario.primer_nombre,
                    funcionario.segundo_nombre,
                    funcionario.primer_apellido,
                    funcionario.segundo_apellido,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const termino = searchTerm.toLowerCase();

                if (
                    !nombreCompleto.includes(termino) &&
                    !funcionario.numero_carnet?.toLowerCase().includes(termino) &&
                    !funcionario.usuario?.email.toLowerCase().includes(termino) &&
                    !funcionario.grado_jerarquico.toLowerCase().includes(termino)
                ) {
                    return false;
                }
            }

            // Filtro por estado
            if (estadoFilter && estadoFilter !== "all" && funcionario.estado_funcionario !== estadoFilter) {
                return false;
            }

            return true;
        });
    }, [funcionarios, showDeleted, searchTerm, estadoFilter]);

    if (isLoading || isLoadingStats) {
        return (
            <div className="container mx-auto p-6 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-36" />
                </div>

                {/* Skeleton para cards de estadísticas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-7 w-16" />
                            </CardContent>
                        </Card>
                    ))}
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
                        Error al cargar los funcionarios: {error.message}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Función helper para obtener el ícono y color de cada estado
    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case 'Activo':
                return { icon: Activity, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
            case 'Suspendido':
                return { icon: UserX, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
            case 'Baja medica':
                return { icon: Bed, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
            case 'De Vacaciones':
                return { icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' };
            case 'En permiso':
                return { icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
            case 'Baja Definitiva':
                return { icon: AlertTriangle, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
            default:
                return { icon: Users, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
        }
    };

    return (
        <>
            <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6 space-y-8">                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 sm:px-6 pt-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Funcionarios</h1>
                        <p className="text-muted-foreground">
                            Administra los funcionarios de la institución y sus cuentas de usuario
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Funcionario
                    </Button>
                </div>

                {/* Estadísticas generales */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-2 sm:px-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-sm font-medium">Total de Funcionarios</CardTitle>
                                <CardDescription>Funcionarios registrados</CardDescription>
                            </div>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{funcionariosStats?.total || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-sm font-medium">Funcionarios Activos</CardTitle>
                                <CardDescription>En servicio actual</CardDescription>
                            </div>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {funcionariosStats?.counts?.Activo || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Funcionarios en servicio activo
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-sm font-medium">De Vacaciones</CardTitle>
                                <CardDescription>Funcionarios de vacaciones</CardDescription>
                            </div>
                            <Calendar className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {funcionariosStats?.counts?.['De Vacaciones'] || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Funcionarios en período vacacional
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-sm font-medium">Con Problemas</CardTitle>
                                <CardDescription>Suspendidos y bajas</CardDescription>
                            </div>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {(funcionariosStats?.counts?.Suspendido || 0) +
                                    (funcionariosStats?.counts?.['Baja Definitiva'] || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Funcionarios suspendidos o dados de baja
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Distribución por estados */}
                <Card className="mx-2 sm:mx-6">
                    <CardHeader>
                        <CardTitle>Distribución por Estados</CardTitle>
                        <CardDescription>
                            Resumen de funcionarios según su estado actual
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {funcionariosStats?.counts && Object.entries(funcionariosStats.counts).map(([estado, count], idx) => {
                                const { icon: Icon } = getEstadoIcon(estado);
                                const colorIndex = (idx % 5) + 1;
                                const chartVar = `--chart-${colorIndex}`;
                                return (
                                    <div
                                        key={estado}
                                        className={`flex items-center justify-between p-4 rounded-lg border bg-[var(${chartVar})]/10 border-[var(${chartVar})]`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`h-5 w-5 text-[var(${chartVar})]`} />
                                            <div>
                                                <p className="font-medium">{estado}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {count} funcionario{count !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`text-[var(${chartVar})]`}>
                                            {count}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de funcionarios */}
                <Card className="mx-2 sm:mx-6">
                    <CardHeader>
                        <CardTitle>Lista de Funcionarios</CardTitle>
                        <CardDescription>
                            Gestiona todos los funcionarios de la institución
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FuncionariosTable
                            data={filteredData}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            estadoFilter={estadoFilter}
                            setEstadoFilter={setEstadoFilter}
                            showDeleted={showDeleted}
                            setShowDeleted={setShowDeleted}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Diálogos */}
            <FuncionarioCreateDialog />
            <FuncionarioEditDialog />
            <FuncionarioDeleteDialog />
        </>
    );
}