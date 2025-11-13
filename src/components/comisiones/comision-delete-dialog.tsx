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
import { AlertTriangle } from "lucide-react";

import { useComisionStore } from "@/store/comision.store";
import { useDeleteComision } from "@/hooks/comision.queries";

export function ComisionDeleteDialog() {
  const { isDeleteDialogOpen, selectedComision, closeDeleteDialog } = useComisionStore();
  const deleteMutation = useDeleteComision();

  const handleDelete = () => {
    if (selectedComision) {
      deleteMutation.mutate(selectedComision.id, {
        onSuccess: () => {
          closeDeleteDialog();
        },
      });
    }
  };

  if (!selectedComision) return null;

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Eliminar Comisión
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar esta comisión? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Funcionario:</span> {selectedComision.funcionario.nombre_completo}
            </p>
            {selectedComision.descripcion && (
              <p className="text-sm mt-2">
                <span className="font-medium">Descripción:</span> {selectedComision.descripcion}
              </p>
            )}
            <p className="text-sm mt-2">
              <span className="font-medium">Periodo:</span> {new Date(selectedComision.fecha_inicio).toLocaleDateString()} - {new Date(selectedComision.fecha_fin).toLocaleDateString()}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeDeleteDialog}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}