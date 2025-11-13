'use client';

import React, { useMemo } from 'react';
import { Plus, Users, Building, Activity, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useFuncionarioCargos, useFuncionarioCargoStats } from '@/hooks/funcionarioCargo.queries';
import { useFuncionarioCargoStore } from '@/store/funcionarioCargo.store';
import { FuncionarioCargoCreateDialog } from '@/components/funcionarioCargo/funcionario-cargo-create-dialog';
import { FuncionarioCargoEditDialog } from '@/components/funcionarioCargo/funcionario-cargo-edit-dialog';
import { FuncionarioCargoDeleteDialog } from '@/components/funcionarioCargo/funcionario-cargo-delete-dialog';
import { FuncionarioCargoBulkDialog } from '@/components/funcionarioCargo/funcionario-cargo-bulk-dialog';
import { FuncionarioCargoTable } from '@/components/funcionarioCargo/funcionario-cargo-table';

// Helper para íconos por tipo de área
const getTipoAreaIcon = (tipoArea: string) => {
    if (tipoArea === 'Administrativa') {
        return { icon: Building, color: 'text-blue-600' };
    } else if (tipoArea === 'Operativa') {
        return { icon: Activity, color: 'text-green-600' };
    }
    return { icon: Users, color: 'text-muted-foreground' };
};

export default function FuncionarioCargosPage() {
    const { data: funcionarioCargos, isLoading, error } = useFuncionarioCargos(true);
    const { data: funcionarioCargoStats, isLoading: isLoadingStats } = useFuncionarioCargoStats();
    const {
        openCreateDialog,
        openBulkDialog,
        showDeleted,
        searchTerm,
        tipoAreaFilter,
        setShowDeleted,
        setSearchTerm,
        setTipoAreaFilter,
    } = useFuncionarioCargoStore();

    const filteredData = useMemo(() => {
        if (!funcionarioCargos) return [];
        return funcionarioCargos.filter((funcionarioCargo) => {
            const isDeleted = !!funcionarioCargo.deleted_at;
            if (showDeleted && !isDeleted) return false;
            if (!showDeleted && isDeleted) return false;

            if (searchTerm) {
                const termino = searchTerm.toLowerCase();
                if (
                    !funcionarioCargo.funcionario.nombre_completo.toLowerCase().includes(termino) &&
                    !funcionarioCargo.cargo.nombre_cargo.toLowerCase().includes(termino) &&
                    !funcionarioCargo.tipo_area.toLowerCase().includes(termino)
                ) {
                    return false;
                }
            }

            if (tipoAreaFilter && tipoAreaFilter !== 'all' && funcionarioCargo.tipo_area !== tipoAreaFilter) {
                return false;
            }

            return true;
        });
    }, [funcionarioCargos, showDeleted, searchTerm, tipoAreaFilter]);

    // Estado de carga
    if (isLoading || isLoadingStats) {
        return (
            <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 sm:w-64" />
                        <Skeleton className="h-4 w-56 sm:w-96" />
                    </div>
                    <Skeleton className="h-10 w-32 sm:w-36" />
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-20" />
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
                        <Skeleton className="h-6 w-32 sm:w-48" />
                        <Skeleton className="h-4 w-40 sm:w-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Diálogos (aunque no se usan en loading, es seguro dejarlos) */}
                <FuncionarioCargoCreateDialog />
                <FuncionarioCargoBulkDialog />
                <FuncionarioCargoEditDialog />
                <FuncionarioCargoDeleteDialog />
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div className="w-full max-w-screen-2xl mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        No se pudieron cargar los datos de funcionario-cargos. Por favor, intenta nuevamente más tarde.
                    </AlertDescription>
                </Alert>
                <div className="mt-6">
                    <Button onClick={() => window.location.reload()}>
                        Reintentar
                    </Button>
                </div>

                {/* Diálogos */}
                <FuncionarioCargoCreateDialog />
                <FuncionarioCargoBulkDialog />
                <FuncionarioCargoEditDialog />
                <FuncionarioCargoDeleteDialog />
            </div>
        );
    }

    // Estado exitoso
    return (
        <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Funcionario-Cargos</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Administra las asignaciones de cargos a funcionarios. Un funcionario puede tener múltiples cargos y un cargo puede ser asignado a múltiples funcionarios.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button onClick={openCreateDialog} variant="default" className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Asignación
                    </Button>
                    <Button onClick={openBulkDialog} variant="secondary" className="w-full sm:w-auto">
                        <Users className="mr-2 h-4 w-4" />
                        Asignación Masiva
                    </Button>
                </div>
            </div>

            {/* Estadísticas generales */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Total Asignaciones</CardDescription>
                            <CardTitle className="text-sm font-medium">Funcionario-Cargos</CardTitle>
                        </div>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{funcionarioCargoStats?.total || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Área Administrativa</CardDescription>
                            <CardTitle className="text-sm font-medium">Asignaciones</CardTitle>
                        </div>
                        <Building className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {funcionarioCargoStats?.counts.Administrativa || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {funcionarioCargoStats?.total
                                ? `${Math.round((funcionarioCargoStats.counts.Administrativa / funcionarioCargoStats.total) * 100)}% del total`
                                : '0% del total'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Área Operativa</CardDescription>
                            <CardTitle className="text-sm font-medium">Asignaciones</CardTitle>
                        </div>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {funcionarioCargoStats?.counts.Operativa || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {funcionarioCargoStats?.total
                                ? `${Math.round((funcionarioCargoStats.counts.Operativa / funcionarioCargoStats.total) * 100)}% del total`
                                : '0% del total'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Promedio</CardDescription>
                            <CardTitle className="text-sm font-medium">Por Área</CardTitle>
                        </div>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {funcionarioCargoStats?.total ? Math.round(funcionarioCargoStats.total / 2) : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Distribución promedio</p>
                    </CardContent>
                </Card>
            </div>

            {/* Distribución por tipo de área */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Distribución por Tipo de Área</CardTitle>
                    <CardDescription>Resumen de asignaciones según el tipo de área</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {['Administrativa', 'Operativa'].map((tipoArea) => {
                            const { icon: Icon, color } = getTipoAreaIcon(tipoArea);
                            const count = funcionarioCargoStats?.counts[tipoArea as keyof typeof funcionarioCargoStats.counts] || 0;

                            return (
                                <Card key={tipoArea} className="bg-card border-border">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className="p-2 rounded-lg border"
                                                    style={{
                                                        backgroundColor: `hsl(var(--chart-${tipoArea === 'Administrativa' ? '1' : '2'}) / 0.1)`,
                                                        borderColor: `hsl(var(--chart-${tipoArea === 'Administrativa' ? '1' : '2'}) / 0.2)`,
                                                    }}
                                                >
                                                    <Icon
                                                        className={`h-6 w-6`}
                                                        style={{
                                                            color: `hsl(var(--chart-${tipoArea === 'Administrativa' ? '1' : '2'}))`,
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-base sm:text-lg font-semibold">{tipoArea}</h3>
                                                    <p className="text-xs sm:text-sm text-muted-foreground">{count} asignaciones</p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="text-base sm:text-lg font-bold px-3 py-1"
                                                style={{
                                                    backgroundColor: `hsl(var(--chart-${tipoArea === 'Administrativa' ? '1' : '2'}) / 0.1)`,
                                                    color: `hsl(var(--chart-${tipoArea === 'Administrativa' ? '1' : '2'}))`,
                                                }}
                                            >
                                                {count}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de funcionario-cargos */}
            <Card className="w-full overflow-x-auto">
                <CardHeader>
                    <CardTitle>Lista de Funcionario-Cargos</CardTitle>
                    <CardDescription>
                        Gestiona todas las asignaciones de cargos. Múltiples asignaciones permitidas por funcionario y cargo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FuncionarioCargoTable
                        data={filteredData}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        tipoAreaFilter={tipoAreaFilter}
                        setTipoAreaFilter={setTipoAreaFilter}
                        showDeleted={showDeleted}
                        setShowDeleted={setShowDeleted}
                    />
                </CardContent>
            </Card>

            {/* Diálogos */}
            <FuncionarioCargoCreateDialog />
            <FuncionarioCargoBulkDialog />
            <FuncionarioCargoEditDialog />
            <FuncionarioCargoDeleteDialog />
        </div>
    );
}