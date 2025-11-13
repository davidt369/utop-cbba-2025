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
import { Trash2, X } from "lucide-react";

import { useSancionesStore } from "@/store/sanciones.store";
import { useDeleteSancion } from "@/hooks/sanciones.queries";
import { formatDate } from "@/lib/utils";

export function SancionDeleteDialog() {
  const { isDeleteDialogOpen, selectedSancion, closeDeleteDialog } = useSancionesStore();
  const deleteSancionMutation = useDeleteSancion();

  const handleConfirm = () => {
    if (!selectedSancion) return;

    deleteSancionMutation.mutate(selectedSancion.id, {
      onSuccess: () => {
        closeDeleteDialog();
      },
    });
  };

  if (!selectedSancion) return null;

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Eliminar Sanción
          </DialogTitle>
          <DialogDescription>
            ¿Está seguro que desea eliminar la sanción del funcionario{" "}
            <span className="font-semibold">{selectedSancion.funcionario.nombre_completo}</span>?
            Esta acción se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Detalles de la sanción:</h4>
          <ul className="text-sm space-y-1">
            <li><span className="font-medium">Tipo:</span> {selectedSancion.tipo_sancion}</li>
            <li><span className="font-medium">Estado:</span> {selectedSancion.activa ? "Activa" : "Inactiva"}</li>
            {selectedSancion.fecha_inicio && (
              <li><span className="font-medium">Fecha inicio:</span> {formatDate(selectedSancion.fecha_inicio)}</li>
            )}
            {selectedSancion.fecha_fin && (
              <li><span className="font-medium">Fecha fin:</span> {formatDate(selectedSancion.fecha_fin)}</li>
            )}
            {selectedSancion.descripcion && (
              <li><span className="font-medium">Descripción:</span> {selectedSancion.descripcion}</li>
            )}
          </ul>
        </div>

        {deleteSancionMutation.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {deleteSancionMutation.error.message}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeDeleteDialog}
            disabled={deleteSancionMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteSancionMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteSancionMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}