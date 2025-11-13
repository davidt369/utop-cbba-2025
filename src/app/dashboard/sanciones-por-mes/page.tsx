"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSancionesPorMes } from '@/hooks/sanciones.queries';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useReportes } from '@/hooks/useReportes';
import { SancionCreateDialog } from '@/components/sanciones/sancion-create-dialog';
import { SancionEditDialog } from '@/components/sanciones/sancion-edit-dialog';
import { SancionDeleteDialog } from '@/components/sanciones/sancion-delete-dialog';
import { SancionRestoreDialog } from '@/components/sanciones/sancion-restore-dialog';
import { SancionViewDialog } from '@/components/sanciones/sancion-view-dialog';
import { SancionTable } from '@/components/sanciones/sancion-table';

export default function Page() {
    const { data: sanciones = [], isLoading, error } = useSancionesPorMes();
    // Filtrar solo sanciones activas que vencen este mes
    const sancionesActivas = sanciones.filter(s => s.activa);
    const [notified, setNotified] = useState(false);
    const router = useRouter();
    const { downloadReport } = useReportes();

    useEffect(() => {
        if (!isLoading && !notified) {
            if (sancionesActivas.length > 0) {
                toast(`Tienes ${sancionesActivas.length} sancion${sancionesActivas.length > 1 ? 'es' : ''} activ${sancionesActivas.length > 1 ? 'as' : 'a'} que vencen este mes.`);
            } else {
                toast('No hay sanciones activas que expiren este mes.');
            }
            setNotified(true);
        }
    }, [isLoading, notified, sancionesActivas]);

    return (
        <div className="space-y-4 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 max-w-screen-2xl mx-auto w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold">Sanciones con fin este mes</h1>
                    <p className="text-sm text-muted-foreground">Listado de sanciones cuyo <strong>fecha_fin</strong> cae en el mes actual.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <div className="text-sm text-muted-foreground sm:mr-4 mb-2 sm:mb-0">{sanciones.length} items</div>

                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} title="Actualizar" className="w-full sm:w-auto">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push('/dashboard/sanciones')}>Ver lista completa</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadReport({ url: '/reportes/sanciones/excel/activas', filename: `sanciones_mes_actual_${new Date().toISOString().split('T')[0]}.xlsx`, tipo: 'excel' })}>Exportar Excel</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/dashboard/sanciones?show_deleted=1')}>Mostrar eliminados</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="border rounded-md p-2 sm:p-4 overflow-x-auto">
                {error && <div className="text-destructive">{(error as any)?.message || 'Error'}</div>}
                <SancionTable data={sanciones} />
            </div>

            {/* Diálogos necesarios para acciones desde la tabla */}
            <SancionCreateDialog />
            <SancionEditDialog />
            <SancionDeleteDialog />
            <SancionRestoreDialog />
            <SancionViewDialog />
        </div>
    );
}
