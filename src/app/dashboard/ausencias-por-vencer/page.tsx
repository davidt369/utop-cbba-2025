"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AusenciaTable from '@/components/ausencias/ausencia-table';
import { useAusenciasPorMes } from '@/hooks/ausencias.queries';
import { AusenciaEditDialog } from '@/components/ausencias/ausencia-edit-dialog';
import AusenciaDeleteDialog from '@/components/ausencias/ausencia-delete-dialog';

interface Ausencia {
    id: number;
    funcionario?: any;
    tipo_ausencia?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    aprobado?: boolean;
    activo?: boolean;
    pdf_respaldo_ruta?: string | null;
    deleted_at?: string | null;
}


export default function Page() {
    const { data: ausencias = [], isLoading: loading, error } = useAusenciasPorMes();
    // Filtrar ausencias aprobadas y activas
    const ausenciasFiltradas = ausencias.filter((a: Ausencia) => a.activo && a.aprobado);
    const [notified, setNotified] = useState(false);
    useEffect(() => {
        if (!loading && !notified) {
            if (ausenciasFiltradas.length > 0) {
                toast(`Tienes ${ausenciasFiltradas.length} ausencia${ausenciasFiltradas.length > 1 ? 's' : ''} aprobada${ausenciasFiltradas.length > 1 ? 's' : ''} y activa${ausenciasFiltradas.length > 1 ? 's' : ''} que vencen este mes.`);
            } else {
                toast('No hay ausencias aprobadas y activas que expiren este mes.');
            }
            setNotified(true);
        }
    }, [loading, notified, ausenciasFiltradas]);

    return (
        <div className="space-y-4 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 max-w-screen-2xl mx-auto w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold">Lista de Ausencias que están por vencer este mes</h1>
                    <p className="text-sm text-muted-foreground">Administra las ausencias del personal</p>
                </div>
                <div className="text-sm text-muted-foreground">
                    {ausenciasFiltradas.length} ausencias aprobadas y activas
                </div>
            </div>

            <div className="border rounded-md p-2 sm:p-4 overflow-x-auto">
                {error && <div className="text-destructive">{(error as any)?.message || 'Error'}</div>}
                <AusenciaTable ausencias={ausencias} isLoading={loading} />
            </div>

            {/* Montar los diálogos globalmente en la página para que puedan abrirse desde la tabla */}
            <AusenciaEditDialog />
            <AusenciaDeleteDialog />
        </div>
    );
}