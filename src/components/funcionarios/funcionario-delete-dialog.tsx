"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle } from "lucide-react";
import { useFuncionariosStore } from "@/store/funcionarios.store";
import { useDeleteFuncionario, useRestoreFuncionario } from "@/hooks/funcionarios.queries";

export function FuncionarioDeleteDialog() {
    const { isDeleteDialogOpen, selectedFuncionario, closeDeleteDialog } = useFuncionariosStore();
    const deleteFuncionarioMutation = useDeleteFuncionario();
    const restoreFuncionarioMutation = useRestoreFuncionario();

    if (!selectedFuncionario) return null;

    const isDeleted = !!selectedFuncionario.deleted_at;
    const nombreCompleto = [
        selectedFuncionario.primer_nombre,
        selectedFuncionario.segundo_nombre,
        selectedFuncionario.primer_apellido,
        selectedFuncionario.segundo_apellido,
    ]
        .filter(Boolean)
        .join(" ");

    const handleDelete = () => {
        deleteFuncionarioMutation.mutate(selectedFuncionario.id, {
            onSuccess: () => {
                closeDeleteDialog();
            },
        });
    };

    const handleRestore = () => {
        restoreFuncionarioMutation.mutate(selectedFuncionario.id, {
            onSuccess: () => {
                closeDeleteDialog();
            },
        });
    };

    const isPending = deleteFuncionarioMutation.isPending || restoreFuncionarioMutation.isPending;
    const error = deleteFuncionarioMutation.error || restoreFuncionarioMutation.error;

    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isDeleted ? (
                            <>
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                Restaurar Funcionario
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-5 w-5 text-red-500" />
                                Eliminar Funcionario
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isDeleted ? (
                            <>
                                ¿Está seguro que desea restaurar al funcionario{" "}
                                <span className="font-semibold">{nombreCompleto}</span>?
                                <br />
                                <br />
                                Esta acción restaurará el funcionario y su cuenta de usuario asociada,
                                permitiendo que puedan acceder al sistema nuevamente.
                            </>
                        ) : (
                            <>
                                ¿Está seguro que desea eliminar al funcionario{" "}
                                <span className="font-semibold">{nombreCompleto}</span>?
                                <br />
                                <br />
                                Esta acción eliminará el funcionario y su cuenta de usuario asociada.
                                Los datos se mantendrán en el sistema pero no serán visibles en las listas normales.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* Información adicional del funcionario */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="font-medium">Carnet:</span>{" "}
                            {selectedFuncionario.numero_carnet ?
                                `${selectedFuncionario.numero_carnet} ${selectedFuncionario.expedido}` :
                                "Sin carnet"
                            }
                        </div>
                        <div>
                            <span className="font-medium">Grado:</span>{" "}
                            {selectedFuncionario.grado_jerarquico}
                        </div>
                        <div>
                            <span className="font-medium">Estado:</span>{" "}
                            {selectedFuncionario.estado_funcionario}
                        </div>
                        <div>
                            <span className="font-medium">Email:</span>{" "}
                            {selectedFuncionario.usuario?.email || "Sin usuario"}
                        </div>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error.message || `Error al ${isDeleted ? 'restaurar' : 'eliminar'} el funcionario`}
                        </AlertDescription>
                    </Alert>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={closeDeleteDialog}
                        disabled={isPending}
                    >
                        Cancelar
                    </Button>
                    {isDeleted ? (
                        <Button
                            type="button"
                            onClick={handleRestore}
                            disabled={isPending}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {restoreFuncionarioMutation.isPending ? "Restaurando..." : "Restaurar"}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {deleteFuncionarioMutation.isPending ? "Eliminando..." : "Eliminar"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}