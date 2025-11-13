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
import { Loader2, Trash2 } from 'lucide-react';
import { useCambioDestinoStore } from '@/store/cambio-destino.store';
import { useDeleteCambioDestino } from '@/hooks/cambio-destino.queries';

export function CambioDestinoDeleteDialog() {
    const { isDeleteDialogOpen, closeDeleteDialog, cambioDestinoToDelete } = useCambioDestinoStore();
    const { mutate: deleteCambioDestino, isPending } = useDeleteCambioDestino();

    const handleDelete = () => {
        if (!cambioDestinoToDelete) return;

        deleteCambioDestino(cambioDestinoToDelete.id, {
            onSuccess: () => {
                closeDeleteDialog();
            },
        });
    };

    if (!cambioDestinoToDelete) return null;

    return (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                        Eliminar Cambio de Destino
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Está seguro que desea eliminar este cambio de destino?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-3 space-y-2">
                        <div>
                            <span className="font-medium">Funcionario:</span>{' '}
                            {cambioDestinoToDelete.funcionario.nombre_completo}
                        </div>
                        <div>
                            <span className="font-medium">Unidad de Destino:</span>{' '}
                            {cambioDestinoToDelete.unidad_destino.nombre_unidad}
                        </div>
                        <div>
                            <span className="font-medium">Fecha:</span>{' '}
                            {new Date(cambioDestinoToDelete.fecha_destino + 'T00:00:00').toLocaleDateString()}
                        </div>
                        <div>
                            <span className="font-medium">Motivo:</span>{' '}
                            {cambioDestinoToDelete.motivo_cambio}
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Esta acción se puede deshacer posteriormente restaurando el registro.
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
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Eliminar
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}