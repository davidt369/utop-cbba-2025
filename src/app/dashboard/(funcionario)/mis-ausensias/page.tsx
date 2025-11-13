

'use client';

import { useState, useMemo } from 'react';
import { Calendar, CalendarCheck, CalendarDays, Clock, Send, CheckCircle, XCircle, AlertCircle, Activity, FileText, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMisAusencias } from '@/hooks/mi-perfil.queries';
import { SolicitarAusenciaDialog } from '@/components/mi-perfil/solicitar-ausencia-dialog';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function MisAusenciasPage() {
    const { data, isLoading, error } = useMisAusencias();
    const [showSolicitarDialog, setShowSolicitarDialog] = useState(false);

    // Procesamiento de datos para estadísticas
    const ausenciasActivas = useMemo(() => {
        if (!data?.ausencias) return [];
        return data.ausencias.filter(ausencia => ausencia.activo);
    }, [data?.ausencias]);

    const ausenciasPendientes = useMemo(() => {
        if (!data?.ausencias) return [];
        return data.ausencias.filter(ausencia => !ausencia.aprobado);
    }, [data?.ausencias]);

    const getEstadoBadge = (ausencia: any) => {
        if (!ausencia.aprobado) {
            return <Badge variant="secondary">Pendiente</Badge>;
        }
        if (ausencia.activo) {
            return <Badge variant="default">Activa</Badge>;
        }
        return <Badge variant="outline">Finalizada</Badge>;
    };

    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'Baja Médica':
                return 'text-red-600';
            case 'Vacaciones':
                return 'text-green-600';
            default:
                return 'text-blue-600';
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-48" />
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
                        Error al cargar la información de ausencias: {error.message}
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
                    <h1 className="text-3xl font-bold tracking-tight">Mis Ausencias</h1>
                    <p className="text-muted-foreground">
                        Gestiona tus permisos y bajas médicas
                    </p>
                </div>
                <Button onClick={() => setShowSolicitarDialog(true)}>
                    <Send className="mr-2 h-4 w-4" />
                    Solicitar Ausencia
                </Button>
            </div>

            {/* Estadísticas generales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Total de Ausencias</CardDescription>
                            <CardTitle className="text-sm font-medium">Solicitadas</CardTitle>
                        </div>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estadisticas?.total_ausencias || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Ausencias Activas</CardDescription>
                            <CardTitle className="text-sm font-medium">En curso</CardTitle>
                        </div>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estadisticas?.ausencias_activas || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Pendientes</CardDescription>
                            <CardTitle className="text-sm font-medium">Por aprobar</CardTitle>
                        </div>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estadisticas?.ausencias_pendientes || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Días este Año</CardDescription>
                            <CardTitle className="text-sm font-medium">Acumulados</CardTitle>
                        </div>
                        <CalendarDays className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estadisticas?.dias_ausencia_año || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Distribución por tipo */}
            <div className="grid gap-4 md:grid-cols-2 px-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Permisos</CardDescription>
                            <CardTitle className="text-sm font-medium">Solicitados</CardTitle>
                        </div>
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estadisticas?.permisos || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardDescription>Bajas Médicas</CardDescription>
                            <CardTitle className="text-sm font-medium">Solicitadas</CardTitle>
                        </div>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estadisticas?.bajas_medicas || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Ausencia Actual */}
            {estadisticas?.ausencia_actual && (
                <div className="px-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-500" />
                                Ausencia Actual
                            </CardTitle>
                            <CardDescription>
                                Tu ausencia activa actualmente
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                                        <p className={`text-base font-semibold ${getTipoColor(estadisticas.ausencia_actual.tipo_ausencia)}`}>
                                            {estadisticas.ausencia_actual.tipo_ausencia}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Motivo</label>
                                        <p className="text-sm">{estadisticas.ausencia_actual.motivo || 'Sin motivo especificado'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                        <div className="mt-1">
                                            {getEstadoBadge(estadisticas.ausencia_actual)}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Fecha de Inicio</label>
                                        <p className="text-sm">{formatDate(estadisticas.ausencia_actual.fecha_inicio)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Fecha de Fin</label>
                                        <p className="text-sm">{formatDate(estadisticas.ausencia_actual.fecha_fin)}</p>
                                    </div>
                                    {estadisticas.ausencia_actual.descripcion && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                                            <p className="text-sm">{estadisticas.ausencia_actual.descripcion}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Historial de Ausencias */}
            <div className="px-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Historial de Ausencias
                        </CardTitle>
                        <CardDescription>
                            Todas tus solicitudes de ausencia (actuales e históricas)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data?.ausencias && data.ausencias.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Motivo</TableHead>
                                            <TableHead>Fecha Inicio</TableHead>
                                            <TableHead>Fecha Fin</TableHead>
                                            <TableHead>Duración</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Solicitado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.ausencias.map((ausencia) => {
                                            const inicio = new Date(ausencia.fecha_inicio);
                                            const fin = new Date(ausencia.fecha_fin);
                                            const duracion = Math.abs(fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24) + 1;

                                            return (
                                                <TableRow key={ausencia.id}>
                                                    <TableCell>
                                                        <span className={`font-medium ${getTipoColor(ausencia.tipo_ausencia)}`}>
                                                            {ausencia.tipo_ausencia}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{ausencia.motivo || 'Sin motivo'}</div>
                                                            {ausencia.descripcion && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {ausencia.descripcion}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{formatDate(ausencia.fecha_inicio)}</TableCell>
                                                    <TableCell>{formatDate(ausencia.fecha_fin)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {duracion} {duracion === 1 ? 'día' : 'días'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getEstadoBadge(ausencia)}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {formatDate(ausencia.created_at)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No tienes ausencias registradas</p>
                                <p className="text-sm">Solicita tu primera ausencia usando el botón "Solicitar Ausencia"</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Diálogo para solicitar ausencia */}
            <SolicitarAusenciaDialog
                isOpen={showSolicitarDialog}
                onClose={() => setShowSolicitarDialog(false)}
            />
        </div>
    );
}   