'use client';

import { Plus, RefreshCw, TrendingUp, Users, Building2, Calendar, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useCambioDestinoStore } from '@/store/cambio-destino.store';
import {
    useCambioDestinoEstadisticas,
    useFuncionariosConDestinoActivo,
    useFuncionariosSinDestinoActivo
} from '@/hooks/cambio-destino.queries';
import { CambioDestinoTable } from '@/components/cambio-destino/cambio-destino-table';
import { CambioDestinoCreateDialog } from '@/components/cambio-destino/cambio-destino-create-dialog';
import { CambioDestinoEditDialog } from '@/components/cambio-destino/cambio-destino-edit-dialog';
import { CambioDestinoDeleteDialog } from '@/components/cambio-destino/cambio-destino-delete-dialog';
import { CambioDestinoRestoreDialog } from '@/components/cambio-destino/cambio-destino-restore-dialog';
import { CambioDestinoViewDialog } from '@/components/cambio-destino/cambio-destino-view-dialog';

export default function CambioDestinoPage() {
    const { openCreateDialog, showDeleted } = useCambioDestinoStore();
    const {
        data: estadisticas,
        isLoading: loadingEstadisticas,
        refetch: refetchEstadisticas
    } = useCambioDestinoEstadisticas(showDeleted);

    const {
        data: funcionariosConDestino,
        isLoading: loadingConDestino,
        refetch: refetchConDestino
    } = useFuncionariosConDestinoActivo();

    const {
        data: funcionariosSinDestino,
        isLoading: loadingSinDestino,
        refetch: refetchSinDestino
    } = useFuncionariosSinDestinoActivo();

    const handleRefresh = () => {
        refetchEstadisticas();
        refetchConDestino();
        refetchSinDestino();
    };

    return (
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Cambios de Destino</h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Gestione los cambios de destino de funcionarios en el sistema.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar
                    </Button>
                    <Button onClick={openCreateDialog} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Cambio de Destino
                    </Button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cambios</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loadingEstadisticas ? (
                                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                                estadisticas?.total || 0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Cambios de destino registrados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Activos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loadingEstadisticas ? (
                                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                                estadisticas?.activos || 0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Cambios activos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loadingEstadisticas ? (
                                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                                estadisticas?.inactivos || 0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Cambios inactivos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Eliminados</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loadingEstadisticas ? (
                                <div className="h-7 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                                estadisticas?.eliminados || 0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Registros eliminados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Estadísticas adicionales */}
            {estadisticas && !loadingEstadisticas && (
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    {/* Cambios por mes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Cambios por Mes</CardTitle>
                            <CardDescription>Últimos 6 meses de actividad</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {estadisticas.cambios_por_mes.length > 0 ? (
                                    estadisticas.cambios_por_mes.map((item) => (
                                        <div key={item.mes} className="flex items-center justify-between">
                                            <span className="text-sm font-medium truncate">{item.mes}</span>
                                            <span className="text-sm text-muted-foreground">{item.total} cambios</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unidades más populares */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Unidades Más Populares</CardTitle>
                            <CardDescription>Top 5 unidades de destino</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {estadisticas.unidades_populares.length > 0 ? (
                                    estadisticas.unidades_populares.map((item) => (
                                        <div key={item.unidad} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <span className="text-sm font-medium truncate">{item.unidad}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                {item.total} cambios
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Sección de funcionarios por estado de destino */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {/* Funcionarios con destino activo */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-green-600" />
                                <div>
                                    <CardTitle className="text-base">Funcionarios con Destino Activo</CardTitle>
                                    <CardDescription className="text-xs">
                                        Personal que tiene un destino asignado y activo
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                                {funcionariosConDestino?.length || 0}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingConDestino ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-4 bg-muted animate-pulse rounded w-3/4" />
                                ))}
                            </div>
                        ) : funcionariosConDestino && funcionariosConDestino.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {funcionariosConDestino.slice(0, 5).map((funcionario) => (
                                    <div key={funcionario.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                                        <div className="font-medium truncate">
                                            {funcionario.nombre_completo}
                                            <span className="text-muted-foreground ml-2">({funcionario.numero_carnet})</span>
                                        </div>
                                        {funcionario.destino_actual && (
                                            <span className="text-xs text-muted-foreground truncate sm:max-w-[120px]">
                                                {funcionario.destino_actual.unidad}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {funcionariosConDestino.length > 5 && (
                                    <p className="text-xs text-muted-foreground text-center pt-2">
                                        +{funcionariosConDestino.length - 5} más...
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No hay funcionarios con destino activo</p>
                        )}
                    </CardContent>
                </Card>

                {/* Funcionarios sin destino activo */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <UserX className="h-5 w-5 text-orange-600" />
                                <div>
                                    <CardTitle className="text-base">Funcionarios sin Destino Activo</CardTitle>
                                    <CardDescription className="text-xs">
                                        Personal disponible para asignar nuevos destinos
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                                {funcionariosSinDestino?.length || 0}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingSinDestino ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-4 bg-muted animate-pulse rounded w-3/4" />
                                ))}
                            </div>
                        ) : funcionariosSinDestino && funcionariosSinDestino.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {funcionariosSinDestino.slice(0, 5).map((funcionario) => (
                                    <div key={funcionario.id} className="flex items-center justify-between text-sm">
                                        <span className="font-medium truncate">{funcionario.nombre_completo}</span>
                                        <span className="text-muted-foreground">({funcionario.numero_carnet})</span>
                                    </div>
                                ))}
                                {funcionariosSinDestino.length > 5 && (
                                    <p className="text-xs text-muted-foreground text-center pt-2">
                                        +{funcionariosSinDestino.length - 5} más...
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Todos los funcionarios tienen destino activo</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de cambios de destino */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Cambios de Destino</CardTitle>
                    <CardDescription>
                        Gestione todos los cambios de destino registrados en el sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CambioDestinoTable />
                </CardContent>
            </Card>

            {/* Diálogos */}
            <CambioDestinoCreateDialog />
            <CambioDestinoEditDialog />
            <CambioDestinoDeleteDialog />
            <CambioDestinoRestoreDialog />
            <CambioDestinoViewDialog />
        </div>
    );
}