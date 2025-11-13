'use client';

import { useMemo } from 'react';
import { Plus, Building2, Activity, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useUnidades, useUnidadesStats } from '@/hooks/unidad.queries';
import { useUnidadStore } from '@/store/unidad.store';
import { UnidadCreateDialog } from '@/components/unidades/unidad-create-dialog';
import { UnidadEditDialog } from '@/components/unidades/unidad-edit-dialog';
import { UnidadDeleteDialog } from '@/components/unidades/unidad-delete-dialog';
import { UnidadTable } from '@/components/unidades/unidad-table';

export default function UnidadesPage() {
    const { data: unidades, isLoading, error } = useUnidades(true);
    const { data: unidadesStats, isLoading: isLoadingStats } = useUnidadesStats();
    const {
        openCreateDialog,
        showDeleted,
        searchTerm,
        setShowDeleted,
        setSearchTerm,
    } = useUnidadStore();

    const filteredData = useMemo(() => {
        if (!unidades) return [];
        return unidades.filter((unidad) => {
            const isDeleted = !!unidad.deleted_at;
            if (showDeleted && !isDeleted) return false;
            if (!showDeleted && isDeleted) return false;

            if (searchTerm) {
                const termino = searchTerm.toLowerCase();
                if (
                    !unidad.nombre_unidad.toLowerCase().includes(termino) &&
                    !(unidad.descripcion?.toLowerCase().includes(termino))
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [unidades, showDeleted, searchTerm]);

    if (isLoading || isLoadingStats) {
        return (
            <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-36" />
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
            <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Alert variant="destructive">
                    <AlertDescription>
                        Error al cargar las unidades: {error.message}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <>
            <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Unidades</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Administra las unidades organizacionales de la institución
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Unidad
                    </Button>
                </div>

                {/* Estadísticas generales */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardDescription>Total de Unidades</CardDescription>
                                <CardTitle className="text-sm font-medium">Registradas</CardTitle>
                            </div>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{unidadesStats?.total || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardDescription>Unidades Activas</CardDescription>
                                <CardTitle className="text-sm font-medium">En uso</CardTitle>
                            </div>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {unidadesStats?.activos || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {unidadesStats?.total
                                    ? `${Math.round((unidadesStats.activos / unidadesStats.total) * 100)}% del total`
                                    : '0% del total'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardDescription>Unidades Eliminadas</CardDescription>
                                <CardTitle className="text-sm font-medium">Archivadas</CardTitle>
                            </div>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {unidadesStats?.eliminados || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Pueden ser restauradas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardDescription>Creadas este mes</CardDescription>
                                <CardTitle className="text-sm font-medium">Nuevas</CardTitle>
                            </div>
                            <Calendar className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {unidadesStats?.crecimiento_mes?.[unidadesStats.crecimiento_mes.length - 1]?.total || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Unidades creadas recientemente</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráfico de crecimiento */}
                {unidadesStats?.crecimiento_mes && unidadesStats.crecimiento_mes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Crecimiento de Unidades</CardTitle>
                            <CardDescription>
                                Nuevas unidades creadas en los últimos 6 meses
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                {unidadesStats.crecimiento_mes.map((item, idx) => (
                                    <Card key={item.mes} className="bg-card border-border">
                                        <CardContent className="p-3 sm:p-4 text-center">
                                            <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                                                {new Date(item.mes + '-01').toLocaleDateString('es-ES', {
                                                    month: 'short',
                                                    year: '2-digit',
                                                })}
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="text-base font-bold px-2 py-1"
                                                style={{
                                                    backgroundColor: `hsl(var(--chart-${(idx % 5) + 1}) / 0.1)`,
                                                    color: `hsl(var(--chart-${(idx % 5) + 1}))`,
                                                }}
                                            >
                                                {item.total}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabla de unidades */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Unidades</CardTitle>
                        <CardDescription>
                            Gestiona todas las unidades de la institución
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UnidadTable
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
            <UnidadCreateDialog />
            <UnidadEditDialog />
            <UnidadDeleteDialog />
        </>
    );
}