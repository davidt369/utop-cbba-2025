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
import { RotateCcw, X } from "lucide-react";

import { useSancionesStore } from "@/store/sanciones.store";
import { useRestoreSancion } from "@/hooks/sanciones.queries";
import { formatDate } from "@/lib/utils";

export function SancionRestoreDialog() {
  const { isRestoreDialogOpen, selectedSancion, closeRestoreDialog } = useSancionesStore();
  const restoreSancionMutation = useRestoreSancion();

  const handleConfirm = () => {
    if (!selectedSancion) return;

    restoreSancionMutation.mutate(selectedSancion.id, {
      onSuccess: () => {
        closeRestoreDialog();
      },
    });
  };

  if (!selectedSancion) return null;

  return (
    <Dialog open={isRestoreDialogOpen} onOpenChange={closeRestoreDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-green-500" />
            Restaurar Sanción
          </DialogTitle>
          <DialogDescription>
            ¿Está seguro que desea restaurar la sanción del funcionario{" "}
            <span className="font-semibold">{selectedSancion.funcionario.nombre_completo}</span>?
            La sanción volverá a estar disponible en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg border">
          <h4 className="font-medium mb-2 text-foreground">Detalles de la sanción:</h4>
          <ul className="text-sm space-y-1">
            <li><span className="font-medium text-foreground">Tipo:</span> <span className="text-muted-foreground">{selectedSancion.tipo_sancion}</span></li>
            <li><span className="font-medium text-foreground">Estado:</span> <span className="text-muted-foreground">{selectedSancion.activa ? "Activa" : "Inactiva"}</span></li>
            {selectedSancion.fecha_inicio && (
              <li><span className="font-medium text-foreground">Fecha inicio:</span> <span className="text-muted-foreground">{formatDate(selectedSancion.fecha_inicio)}</span></li>
            )}
            {selectedSancion.fecha_fin && (
              <li><span className="font-medium text-foreground">Fecha fin:</span> <span className="text-muted-foreground">{formatDate(selectedSancion.fecha_fin)}</span></li>
            )}
            {selectedSancion.descripcion && (
              <li><span className="font-medium text-foreground">Descripción:</span> <span className="text-muted-foreground">{selectedSancion.descripcion}</span></li>
            )}
          </ul>
        </div>

        {restoreSancionMutation.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {restoreSancionMutation.error.message}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeRestoreDialog}
            disabled={restoreSancionMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={restoreSancionMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {restoreSancionMutation.isPending ? "Restaurando..." : "Restaurar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}