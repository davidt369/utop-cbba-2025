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
        <Card>
            <CardHeader>
                <CardTitle>Historial de sesiones</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex flex-col md:flex-row md:items-end md:gap-3 gap-2">
                    <div className="flex-1">
                        <label className="text-sm text-muted-foreground">Email</label>
                        <Input
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div style={{ minWidth: 180 }}>
                        <label className="text-sm text-muted-foreground">Estado</label>
                        <Select value={status} onValueChange={(v: string) => setStatus(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="successful">Exitosos</SelectItem>
                                <SelectItem value="failed">Fallidos</SelectItem>
                                <SelectItem value="locked">Bloqueados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Button onClick={() => fetchLogs()} className="mt-2 md:mt-6">
                            Filtrar
                        </Button>
                    </div>
                </div>

                {loading && <div className="py-6 text-center text-sm text-muted-foreground">Cargando…</div>}

                {!loading && logs && (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>IP</TableHead>
                                    <TableHead>Dispositivo</TableHead>
                                    <TableHead>SO / Navegador</TableHead>
                                    <TableHead>Inicio</TableHead>
                                    <TableHead>Fin</TableHead>

                                    <TableHead>Estado</TableHead>

                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs?.data?.length ? (
                                    logs.data.map((l: any) => (
                                        <TableRow key={l.id}>
                                            <TableCell>{l.email}</TableCell>
                                            <TableCell>{l.rol?.nombre_rol ?? '-'}</TableCell>
                                            <TableCell>{l.ip_address}</TableCell>
                                            <TableCell>{l.device_type}</TableCell>
                                            <TableCell>{l.os} / {l.browser}</TableCell>
                                            <TableCell>{l.login_at ? formatDateTime(l.login_at) : '-'}</TableCell>
                                            <TableCell>{l.logout_at ? formatDateTime(l.logout_at) : '-'}</TableCell>



                                            <TableCell className="capitalize">{l.status}</TableCell>

                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="h-24 text-center">
                                            No se encontraron resultados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>

                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
