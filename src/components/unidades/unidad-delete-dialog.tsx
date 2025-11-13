"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2 } from "lucide-react";
import { useUnidadStore } from "@/store/unidad.store";
import { useDeleteUnidad } from "@/hooks/unidad.queries";

export function UnidadDeleteDialog() {
    const { isDeleteDialogOpen, selectedUnidad, closeDeleteDialog } = useUnidadStore();
    const deleteUnidadMutation = useDeleteUnidad();

    const handleDelete = () => {
        if (!selectedUnidad) return;

        deleteUnidadMutation.mutate(selectedUnidad.id, {
            onSuccess: () => {
                closeDeleteDialog();
            },
        });
    };

    if (!selectedUnidad) return null;

    return (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-500" />
                        Eliminar Unidad
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Está seguro de que desea eliminar esta unidad?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3">
                    <div className="bg-muted p-3 rounded-md">
                        <div className="font-medium">
                            <span className="text-muted-foreground">Unidad:</span>{" "}
                            {selectedUnidad.nombre_unidad}
                        </div>
                        {selectedUnidad.descripcion && (
                            <div className="text-sm text-muted-foreground mt-1">
                                {selectedUnidad.descripcion}
                            </div>
                        )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Esta acción se puede deshacer posteriormente.
                    </div>
                </div>

                {deleteUnidadMutation.error && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {deleteUnidadMutation.error.message || "Error al eliminar la unidad"}
                        </AlertDescription>
                    </Alert>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteUnidadMutation.isPending}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteUnidadMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {deleteUnidadMutation.isPending ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}