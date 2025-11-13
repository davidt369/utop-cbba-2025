"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useComisionesPorMes } from '@/hooks/comision.queries';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/comisiones/comision-columns';
import { ComisionEditDialog } from '@/components/comisiones/comision-edit-dialog';
import { ComisionDeleteDialog } from '@/components/comisiones/comision-delete-dialog';
import type { Comision } from '@/types/comision.types';

export default function Page() {
    const { data: comisiones = [], isLoading, error } = useComisionesPorMes();
    // Filtrar solo comisiones con estado 'activa'
    const comisionesActivas = comisiones.filter((c: Comision) => c.estado_comision === 'activa');
    const [notified, setNotified] = useState(false);

    useEffect(() => {
        if (!isLoading && !notified) {
            if (comisionesActivas.length > 0) {
                toast(`Tienes ${comisionesActivas.length} comisión${comisionesActivas.length > 1 ? 'es' : ''} activa${comisionesActivas.length > 1 ? 's' : ''} que vencen este mes.`);
            } else {
                toast('No hay comisiones activas que expiren este mes.');
            }
            setNotified(true);
        }
    }, [isLoading, notified, comisionesActivas]);

    // Crear una copia segura localmente: si la API devuelve fechas 'YYYY-MM-DD' las convertimos a 'YYYY-MM-DDT12:00:00'
    // para evitar que new Date(...) muestre el día anterior por zona horaria.
    const safeComisiones = comisiones.map((c: any) => ({
        ...c,
        fecha_inicio: typeof c.fecha_inicio === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.fecha_inicio) ? `${c.fecha_inicio}T12:00:00` : c.fecha_inicio,
        fecha_fin: typeof c.fecha_fin === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.fecha_fin) ? `${c.fecha_fin}T12:00:00` : c.fecha_fin,
    }));

    return (
        <div className="space-y-4 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 max-w-screen-2xl mx-auto w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold">Comisiones con fin este mes</h1>
                    <p className="text-sm text-muted-foreground">Listado de comisiones cuyo <strong>fecha_fin</strong> cae en el mes actual.</p>
                </div>
                <div className="text-sm text-muted-foreground">{comisiones.length} items</div>
            </div>

            <div className="border rounded-md p-2 sm:p-4 overflow-x-auto">
                {isLoading && <div>Cargando...</div>}
                {error && <div className="text-destructive">{(error as any)?.message || 'Error'}</div>}

                <div className="overflow-auto">
                    {/* Reutilizamos el DataTable principal con las columnas definidas para comisiones
                        Esto permite aprovechar la columna de acciones (editar/eliminar) tal cual está definida */}
                    <DataTable columns={columns} data={safeComisiones.filter((c: Comision) => c.estado_comision === 'activa')} searchKey="descripcion" />
                </div>
            </div>

            {/* Montar los diálogos de edición/eliminación para que las acciones del menú funcionen */}
            <ComisionEditDialog />
            <ComisionDeleteDialog />
        </div>
    );
}