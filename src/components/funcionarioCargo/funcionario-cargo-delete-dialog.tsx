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
import { useFuncionarioCargoStore } from "@/store/funcionarioCargo.store";
import { useDeleteFuncionarioCargo } from "@/hooks/funcionarioCargo.queries";

export function FuncionarioCargoDeleteDialog() {
    const { isDeleteDialogOpen, selectedFuncionarioCargo, closeDeleteDialog } = useFuncionarioCargoStore();
    const deleteFuncionarioCargoMutation = useDeleteFuncionarioCargo();

    const handleDelete = () => {
        if (!selectedFuncionarioCargo) return;

        deleteFuncionarioCargoMutation.mutate(selectedFuncionarioCargo.id, {
            onSuccess: () => {
                closeDeleteDialog();
            },
        });
    };

    if (!selectedFuncionarioCargo) return null;

    return (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-500" />
                        Eliminar Funcionario-Cargo
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        ¿Está seguro de que desea eliminar esta asignación?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3">
                    <div className="bg-muted p-3 rounded-md">
                        <div className="font-medium">
                            <span className="text-muted-foreground">Funcionario:</span>{" "}
                            {selectedFuncionarioCargo.funcionario.nombre_completo}
                        </div>
                        <div className="font-medium">
                            <span className="text-muted-foreground">Cargo:</span>{" "}
                            {selectedFuncionarioCargo.cargo.nombre_cargo}
                        </div>
                        <div className="font-medium">
                            <span className="text-muted-foreground">Área:</span>{" "}
                            {selectedFuncionarioCargo.tipo_area}
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Esta acción se puede deshacer posteriormente.
                    </div>
                </div>

                {deleteFuncionarioCargoMutation.error && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {deleteFuncionarioCargoMutation.error.message || "Error al eliminar la asignación"}
                        </AlertDescription>
                    </Alert>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteFuncionarioCargoMutation.isPending}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteFuncionarioCargoMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {deleteFuncionarioCargoMutation.isPending ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}