
'use client';

import { useMemo } from 'react';
import { Briefcase, Calendar, Building, Users, Clock, Activity, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMisCargos } from '@/hooks/mi-perfil.queries';
import { formatDate } from '@/lib/utils';

export default function MisCargosPage() {
    const { data, isLoading, error } = useMisCargos();

    // Procesamiento de datos para estadísticas
    const cargosActivos = useMemo(() => {
        if (!data?.cargos) return [];
        return data.cargos.filter(cargo => cargo.activo);
    }, [data?.cargos]);

    const cargosHistoricos = useMemo(() => {
        if (!data?.cargos) return [];
        return data.cargos.filter(cargo => !cargo.activo);
    }, [data?.cargos]);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>

                {/* Skeleton para cards de estadísticas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertDescription>
                        Error al cargar la información de cargos: {error.message}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const estadisticas = data?.estadisticas;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Mis Cargos</h1>
                    <p className="text-muted-foreground">
                        Información de tus cargos actuales e históricos
                    </p>
                </div>
            </div>

            {/* Estadísticas generales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Total de Cargos</CardDescription>
                            <CardTitle className="text-sm font-medium">Asignados</CardTitle>
                        </div>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estadisticas?.total_cargos || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Cargos Activos</CardDescription>
                            <CardTitle className="text-sm font-medium">Actuales</CardTitle>
                        </div>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estadisticas?.cargos_activos || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Unidades</CardDescription>
                            <CardTitle className="text-sm font-medium">Trabajadas</CardTitle>
                        </div>
                        <Building className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estadisticas?.unidades_trabajadas || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Tiempo en Cargo</CardDescription>
                            <CardTitle className="text-sm font-medium">Actual</CardTitle>
                        </div>
                        <Clock className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {estadisticas?.tiempo_en_cargo_actual || 'N/A'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Distribución por área */}
            <div className="grid gap-4 md:grid-cols-2 px-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Área Administrativa</CardDescription>
                            <CardTitle className="text-sm font-medium">Cargos</CardTitle>
                        </div>
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estadisticas?.cargos_administrativos || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Área Operativa</CardDescription>
                            <CardTitle className="text-sm font-medium">Cargos</CardTitle>
                        </div>
                        <Users className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estadisticas?.cargos_operativos || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Cargo Actual */}
            {estadisticas?.cargo_actual && (
                <div className="px-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-500" />
                                Cargo Actual
                            </CardTitle>
                            <CardDescription>
                                Información de tu cargo activo actual
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                                        <p className="text-base font-semibold">{estadisticas.cargo_actual.cargo.nombre}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                                        <p className="text-sm">{estadisticas.cargo_actual.cargo.descripcion || 'Sin descripción'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Nivel Jerárquico</label>
                                        <p className="text-sm">{estadisticas.cargo_actual.cargo.nivel_jerarquico}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Unidad</label>
                                        <p className="text-base font-semibold">{estadisticas.cargo_actual.cargo.unidad.nombre}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Área</label>
                                        <Badge variant={estadisticas.cargo_actual.cargo.area_tipo === 'Administrativa' ? 'default' : 'secondary'}>
                                            {estadisticas.cargo_actual.cargo.area_tipo}
                                        </Badge>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Fecha de Asignación</label>
                                        <p className="text-sm">{formatDate(estadisticas.cargo_actual.fecha_asignacion)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Historial de Cargos */}
            <div className="px-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Historial de Cargos
                        </CardTitle>
                        <CardDescription>
                            Todos tus cargos asignados (actuales e históricos)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data?.cargos && data.cargos.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cargo</TableHead>
                                            <TableHead>Unidad</TableHead>
                                            <TableHead>Área</TableHead>
                                            <TableHead>Nivel Jerárquico</TableHead>
                                            <TableHead>Fecha Asignación</TableHead>
                                            <TableHead>Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.cargos.map((cargo) => (
                                            <TableRow key={cargo.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{cargo.cargo.nombre}</div>
                                                        {cargo.cargo.descripcion && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {cargo.cargo.descripcion}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{cargo.cargo.unidad.nombre}</div>
                                                        {cargo.cargo.unidad.tipo && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {cargo.cargo.unidad.tipo}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={cargo.cargo.area_tipo === 'Administrativa' ? 'default' : 'secondary'}>
                                                        {cargo.cargo.area_tipo}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{cargo.cargo.nivel_jerarquico}</TableCell>
                                                <TableCell>{formatDate(cargo.fecha_asignacion)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={cargo.activo ? 'default' : 'secondary'}>
                                                        {cargo.activo ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No tienes cargos asignados
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}