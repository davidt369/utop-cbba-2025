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
import { useCargosStore } from "@/store/cargos.store";
import { useDeleteCargo } from "@/hooks/cargo.queries";

export function CargoDeleteDialog() {
    const { isDeleteDialogOpen, selectedCargo, closeDeleteDialog } = useCargosStore();
    const deleteCargoMutation = useDeleteCargo();

    const handleDelete = () => {
        if (!selectedCargo) return;

        deleteCargoMutation.mutate(selectedCargo.id, {
            onSuccess: () => {
                closeDeleteDialog();
            },
        });
    };

    if (!selectedCargo) return null;

    return (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-500" />
                        Eliminar Cargo
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Está seguro de que desea eliminar este cargo?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3">
                    <div className="bg-muted p-3 rounded-md">
                        <div className="font-medium">
                            <span className="text-muted-foreground">Nombre:</span>{" "}
                            {selectedCargo.nombre_cargo}
                        </div>
                        {selectedCargo.descripcion && (
                            <div className="font-medium">
                                <span className="text-muted-foreground">Descripción:</span>{" "}
                                {selectedCargo.descripcion}
                            </div>
                        )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Esta acción se puede deshacer posteriormente.
                    </div>
                </div>

                {deleteCargoMutation.error && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {deleteCargoMutation.error.message || "Error al eliminar el cargo"}
                        </AlertDescription>
                    </Alert>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteCargoMutation.isPending}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteCargoMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {deleteCargoMutation.isPending ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}