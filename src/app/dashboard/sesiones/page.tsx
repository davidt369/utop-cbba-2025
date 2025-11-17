"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { formatDateTime, formatDate, formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';

export default function Page() {
    return <SessionHistory />;
}

function SessionHistory() {
    const [logs, setLogs] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('all');

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchLogs(page = 1) {
        setLoading(true);
        try {
            const params: any = { per_page: 20 };
            if (email) params.email = email;
            if (status !== "all") params.status = status;

            const res = await api.get('/auth/session-logs', { params });
            setLogs(res.data);
        } catch (err: any) {
            console.error('Error al obtener session-logs', err?.response?.status, err?.response?.data ?? err?.message);
            setLogs(null);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <Card className="w-full max-w-7xl mx-auto">
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-xl sm:text-2xl">Historial de sesiones</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {/* Filtros - Mobile First Corregido */}
                    <div className="mb-6 space-y-4">
                        {/* Fila 1: Email */}
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground font-medium">Email</label>
                            <Input
                                placeholder="Filtrar por email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Fila 2: Estado y Botón en misma línea en móvil */}
                        <div className="flex flex-col xs:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm text-muted-foreground font-medium">Estado</label>
                                <Select value={status} onValueChange={(v: string) => setStatus(v)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="successful">Exitosos</SelectItem>
                                        <SelectItem value="failed">Fallidos</SelectItem>
                                        <SelectItem value="locked">Bloqueados</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end space-y-2 pt-2 xs:pt-0">
                                <Button
                                    onClick={() => fetchLogs()}
                                    className="w-full xs:w-auto h-10"
                                >
                                    Filtrar
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            Cargando…
                        </div>
                    )}

                    {/* Tabla - Mobile First */}
                    {!loading && logs && (
                        <div className="rounded-md border overflow-hidden">
                            {/* Vista móvil - Cards */}
                            <div className="sm:hidden space-y-3 p-3">
                                {logs?.data?.length ? (
                                    logs.data.map((l: any) => (
                                        <div key={l.id} className="border rounded-lg p-3 space-y-2 bg-card">
                                            {/* Header con Email y Estado */}
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="font-medium text-foreground text-sm truncate flex-1">
                                                    {l.email}
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full capitalize shrink-0 ${l.status === 'successful'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                        : l.status === 'failed'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                    }`}>
                                                    {l.status}
                                                </span>
                                            </div>

                                            {/* Información en grid */}
                                            <div className="grid grid-cols-1 gap-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Rol:</span>
                                                    <span className="font-medium text-right">{l.rol?.nombre_rol ?? '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">IP:</span>
                                                    <span className="font-medium text-right">{l.ip_address}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Dispositivo:</span>
                                                    <span className="font-medium text-right">{l.device_type}</span>
                                                </div>
                                            </div>

                                            {/* Sistema operativo y navegador */}
                                            <div className="text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Sistema:</span>
                                                    <span className="font-medium text-right">{l.os}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Navegador:</span>
                                                    <span className="font-medium text-right">{l.browser}</span>
                                                </div>
                                            </div>

                                            {/* Fechas */}
                                            <div className="grid grid-cols-1 gap-1 text-sm pt-2 border-t">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Inicio:</span>
                                                    <span className="font-medium text-right text-xs">
                                                        {l.login_at ? formatDateTime(l.login_at) : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Fin:</span>
                                                    <span className="font-medium text-right text-xs">
                                                        {l.logout_at ? formatDateTime(l.logout_at) : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No se encontraron resultados.
                                    </div>
                                )}
                            </div>

                            {/* Vista desktop - Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[180px]">Email</TableHead>
                                            <TableHead className="min-w-[120px]">Rol</TableHead>
                                            <TableHead className="min-w-[120px]">IP</TableHead>
                                            <TableHead className="min-w-[120px]">Dispositivo</TableHead>
                                            <TableHead className="min-w-[150px]">SO / Navegador</TableHead>
                                            <TableHead className="min-w-[160px]">Inicio</TableHead>
                                            <TableHead className="min-w-[160px]">Fin</TableHead>
                                            <TableHead className="min-w-[100px]">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs?.data?.length ? (
                                            logs.data.map((l: any) => (
                                                <TableRow key={l.id}>
                                                    <TableCell className="font-medium">{l.email}</TableCell>
                                                    <TableCell>{l.rol?.nombre_rol ?? '-'}</TableCell>
                                                    <TableCell>{l.ip_address}</TableCell>
                                                    <TableCell>{l.device_type}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{l.os}</span>
                                                            <span className="text-sm text-muted-foreground">{l.browser}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {l.login_at ? formatDateTime(l.login_at) : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {l.logout_at ? formatDateTime(l.logout_at) : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${l.status === 'successful'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                : l.status === 'failed'
                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                            }`}>
                                                            {l.status}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-24 text-center">
                                                    No se encontraron resultados.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}