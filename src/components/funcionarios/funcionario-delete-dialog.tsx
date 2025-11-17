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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, AlertTriangle } from "lucide-react";
import { useFuncionariosStore } from "@/store/funcionarios.store";
import { useDeleteFuncionario, useRestoreFuncionario } from "@/hooks/funcionarios.queries";
import { useState } from "react";
import { toast } from "sonner";

export function FuncionarioDeleteDialog() {
    const { isDeleteDialogOpen, selectedFuncionario, closeDeleteDialog } = useFuncionariosStore();
    const deleteFuncionarioMutation = useDeleteFuncionario();
    const restoreFuncionarioMutation = useRestoreFuncionario();
    const [motivoEliminacion, setMotivoEliminacion] = useState("");
    const [errorMotivo, setErrorMotivo] = useState("");

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
        // Validar motivo
        if (!motivoEliminacion.trim()) {
            setErrorMotivo("El motivo de eliminación es obligatorio");
            return;
        }

        if (motivoEliminacion.trim().length < 10) {
            setErrorMotivo("El motivo debe tener al menos 10 caracteres");
            return;
        }

        setErrorMotivo("");
        deleteFuncionarioMutation.mutate(
            { id: selectedFuncionario.id, motivo_eliminacion: motivoEliminacion },
            {
                onSuccess: () => {
                    setMotivoEliminacion("");
                    closeDeleteDialog();
                    toast.success("Funcionario eliminado", {
                        description: `${nombreCompleto} ha sido eliminado correctamente.`,
                    });
                },
                onError: (error: any) => {
                    toast.error("Error al eliminar", {
                        description: error.response?.data?.message || error.message || "No se pudo eliminar el funcionario.",
                    });
                },
            }
        );
    };

    const handleRestore = () => {
        restoreFuncionarioMutation.mutate(selectedFuncionario.id, {
            onSuccess: () => {
                closeDeleteDialog();
                toast.success("Funcionario restaurado", {
                    description: `${nombreCompleto} ha sido restaurado correctamente.`,
                });
            },
            onError: (error: any) => {
                toast.error("Error al restaurar", {
                    description: error.response?.data?.message || error.message || "No se pudo restaurar el funcionario.",
                });
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

                {/* Alerta de advertencia */}
                {!isDeleted && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            <strong>¡Atención!</strong> Esta acción eliminará permanentemente el registro del funcionario
                            y su cuenta de usuario. Debe proporcionar un motivo detallado.
                        </AlertDescription>
                    </Alert>
                )}

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

                {/* Campo de motivo de eliminación */}
                {!isDeleted && (
                    <div className="space-y-2">
                        <Label htmlFor="motivo" className="text-sm font-medium">
                            Motivo de eliminación <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="motivo"
                            placeholder="Ingrese el motivo detallado de la eliminación (mínimo 10 caracteres)..."
                            value={motivoEliminacion}
                            onChange={(e) => {
                                setMotivoEliminacion(e.target.value);
                                setErrorMotivo("");
                            }}
                            className={errorMotivo ? "border-red-500" : ""}
                            rows={4}
                        />
                        {errorMotivo && (
                            <p className="text-sm text-red-500">{errorMotivo}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {motivoEliminacion.length}/255 caracteres
                        </p>
                    </div>
                )}

                {/* Mostrar motivo si está eliminado */}
                {isDeleted && selectedFuncionario.motivo_eliminacion && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Motivo de eliminación:</Label>
                        <div className="bg-muted p-3 rounded-md text-sm">
                            {selectedFuncionario.motivo_eliminacion}
                        </div>
                    </div>
                )}

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