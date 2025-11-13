'use client';

import { useMemo } from 'react';
import { Plus, Briefcase, Calendar, Activity, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useCargos, useCargosStats } from '@/hooks/cargo.queries';
import { useCargosStore } from '@/store/cargos.store';
import { CargoCreateDialog } from '@/components/cargos/cargo-create-dialog';
import { CargoEditDialog } from '@/components/cargos/cargo-edit-dialog';
import { CargoDeleteDialog } from '@/components/cargos/cargo-delete-dialog';
import { CargoTable } from '@/components/cargos/cargo-table';

export default function CargosPage() {
    const { data: cargos, isLoading, error } = useCargos(true);
    const { data: cargosStats, isLoading: isLoadingStats } = useCargosStats();
    const {
        openCreateDialog,
        showDeleted,
        searchTerm,
        setShowDeleted,
        setSearchTerm,
    } = useCargosStore();

    // Filtrar datos basándose en los filtros del store
    const filteredData = useMemo(() => {
        if (!cargos) return [];
        return cargos.filter((cargo) => {
            // Filtro por eliminados
            const isDeleted = !!cargo.deleted_at;
            if (showDeleted && !isDeleted) {
                return false;
            }
            if (!showDeleted && isDeleted) {
                return false;
            }
            if (searchTerm) {
                const termino = searchTerm.toLowerCase();
                if (
                    !cargo.nombre_cargo.toLowerCase().includes(termino) &&
                    !(cargo.descripcion?.toLowerCase().includes(termino))
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [cargos, showDeleted, searchTerm]);

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
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertDescription>
                        Error al cargar los cargos: {error.message}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <>
            <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Cargos</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Administra los cargos disponibles en la institución
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Cargo
                    </Button>
                </div>
                {/* Estadísticas generales */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardDescription>Total de Cargos</CardDescription>
                                <CardTitle className="text-sm font-medium">Registrados</CardTitle>
                            </div>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{cargosStats?.total || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardDescription>Cargos Activos</CardDescription>
                                <CardTitle className="text-sm font-medium">En uso</CardTitle>
                            </div>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {cargosStats?.activos || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {cargosStats?.total ?
                                    `${Math.round((cargosStats.activos / cargosStats.total) * 100)}% del total`
                                    : '0% del total'
                                }
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardDescription>Cargos Eliminados</CardDescription>
                                <CardTitle className="text-sm font-medium">Archivados</CardTitle>
                            </div>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {cargosStats?.eliminados || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Pueden ser restaurados
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardDescription>Creados este mes</CardDescription>
                                <CardTitle className="text-sm font-medium">Nuevos</CardTitle>
                            </div>
                            <Calendar className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {cargosStats?.crecimiento_mes?.[cargosStats.crecimiento_mes.length - 1]?.total || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Cargos creados recientemente
                            </p>
                        </CardContent>
                    </Card>
                </div>
                {/* Gráfico de crecimiento */}
                {cargosStats?.crecimiento_mes && cargosStats.crecimiento_mes.length > 0 && (
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Crecimiento de Cargos</CardTitle>
                            <CardDescription>
                                Nuevos cargos creados en los últimos 6 meses
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                                {cargosStats.crecimiento_mes.map((item, idx) => (
                                    <Card key={item.mes} className="bg-card border-border">
                                        <CardContent className="p-4">
                                            <div className="text-center">
                                                <div className="text-sm text-muted-foreground mb-1">
                                                    {item.mes}
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-lg font-bold px-3 py-1"
                                                    style={{
                                                        backgroundColor: `hsl(var(--chart-${(idx % 5) + 1}) / 0.1)`,
                                                        color: `hsl(var(--chart-${(idx % 5) + 1}))`
                                                    }}
                                                >
                                                    {item.total}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
                {/* Tabla de cargos */}
                <Card className="w-full overflow-x-auto">
                    <CardHeader>
                        <CardTitle>Lista de Cargos</CardTitle>
                        <CardDescription>
                            Gestiona todos los cargos de la institución
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CargoTable
                            data={filteredData}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            showDeleted={showDeleted}
                            setShowDeleted={setShowDeleted}
                        />
                    </CardContent>
                </Card>
            </div>
            {/* Diálogos */}
            <CargoCreateDialog />
            <CargoEditDialog />
            <CargoDeleteDialog />
        </>
    );
}