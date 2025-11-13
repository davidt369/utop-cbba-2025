'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw } from 'lucide-react';
import { useCambioDestinoStore } from '@/store/cambio-destino.store';
import { useRestoreCambioDestino } from '@/hooks/cambio-destino.queries';

export function CambioDestinoRestoreDialog() {
    const { isRestoreDialogOpen, closeRestoreDialog, cambioDestinoToRestore } = useCambioDestinoStore();
    const { mutate: restoreCambioDestino, isPending } = useRestoreCambioDestino();

    const handleRestore = () => {
        if (!cambioDestinoToRestore) return;

        restoreCambioDestino(cambioDestinoToRestore.id, {
            onSuccess: () => {
                closeRestoreDialog();
            },
        });
    };

    if (!cambioDestinoToRestore) return null;

    return (
        <AlertDialog open={isRestoreDialogOpen} onOpenChange={closeRestoreDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-green-600" />
                        Restaurar Cambio de Destino
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Está seguro que desea restaurar este cambio de destino?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-3 space-y-2">
                        <div>
                            <span className="font-medium">Funcionario:</span>{' '}
                            {cambioDestinoToRestore.funcionario.nombre_completo}
                        </div>
                        <div>
                            <span className="font-medium">Unidad de Destino:</span>{' '}
                            {cambioDestinoToRestore.unidad_destino.nombre_unidad}
                        </div>
                        <div>
                            <span className="font-medium">Fecha:</span>{' '}
                            {new Date(cambioDestinoToRestore.fecha_destino + 'T00:00:00').toLocaleDateString()}
                        </div>
                        <div>
                            <span className="font-medium">Motivo:</span>{' '}
                            {cambioDestinoToRestore.motivo_cambio}
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        El cambio de destino volverá a estar disponible en el sistema.
                    </div>
                </div>

                <AlertDialogHeader>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant="default"
                            onClick={handleRestore}
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Restaurar
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}