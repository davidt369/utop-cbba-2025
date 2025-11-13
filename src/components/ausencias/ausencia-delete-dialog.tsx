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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDeleteAusencia, useRestoreAusencia } from '@/hooks/ausencias.queries';
import useAusenciaStore from '@/store/ausencias.store';

export default function AusenciaDeleteDialog() {
  const {
    isDeleteDialogOpen,
    selectedAusencia,
    closeDeleteDialog,
  } = useAusenciaStore();

  const deleteMutation = useDeleteAusencia();
  const restoreMutation = useRestoreAusencia();

  const isDeleted = selectedAusencia?.deleted_at !== null;
  const isLoading = deleteMutation.isPending || restoreMutation.isPending;

  const handleDelete = async () => {
    if (!selectedAusencia) return;

    try {
      await deleteMutation.mutateAsync(selectedAusencia.id);
      closeDeleteDialog();
    } catch (error) {
      console.error('Error al eliminar ausencia:', error);
    }
  };

  const handleRestore = async () => {
    if (!selectedAusencia) return;

    try {
      await restoreMutation.mutateAsync(selectedAusencia.id);
      closeDeleteDialog();
    } catch (error) {
      console.error('Error al restaurar ausencia:', error);
    }
  };

  if (!selectedAusencia) return null;

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isDeleted ? (
              <>
                <RotateCcw className="h-5 w-5 text-green-600" />
                Restaurar Ausencia
              </>
            ) : (
              <>
                Eliminar Ausencia
              </>
            )}
          </AlertDialogTitle>
          {isDeleted ? (
            <> 
              <AlertDialogDescription className="text-left">
                ¿Estás seguro de que quieres <strong>restaurar</strong> esta ausencia?
              </AlertDialogDescription>
              <div className="bg-muted/50 p-3 rounded-md mt-2">
                <div className="space-y-1 text-sm">
                  <span><strong>Funcionario:</strong> {selectedAusencia.funcionario?.nombre_completo}</span>
                  <span><strong>Tipo:</strong> {selectedAusencia.tipo_ausencia}</span>
                  <span><strong>Período:</strong> {format(new Date(selectedAusencia.fecha_inicio), 'PPP', { locale: es })} - {format(new Date(selectedAusencia.fecha_fin), 'PPP', { locale: es })}</span>
                  {selectedAusencia.motivo && <span><strong>Motivo:</strong> {selectedAusencia.motivo}</span>}
                </div>
              </div>
              <AlertDialogDescription className="text-left mt-2">
                La ausencia volverá a estar disponible en el sistema.
              </AlertDialogDescription>
            </>
          ) : (
            <>
              <AlertDialogDescription className="text-left">
                ¿Estás seguro de que quieres <strong>eliminar</strong> esta ausencia?
              </AlertDialogDescription>
              <div className="bg-muted/50 p-3 rounded-md mt-2">
                <div className="space-y-1 text-sm">
                  <span><strong>Funcionario:</strong> {selectedAusencia.funcionario?.nombre_completo}</span>
                  <span><strong>Tipo:</strong> {selectedAusencia.tipo_ausencia}</span>
                  <span><strong>Período:</strong> {format(new Date(selectedAusencia.fecha_inicio), 'PPP', { locale: es })} - {format(new Date(selectedAusencia.fecha_fin), 'PPP', { locale: es })}</span>
                  {selectedAusencia.motivo && <span><strong>Motivo:</strong> {selectedAusencia.motivo}</span>}
                </div>
              </div>
              <AlertDialogDescription className="text-left mt-2">
                Esta acción se puede deshacer posteriormente.
              </AlertDialogDescription>
            </>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>

          {isDeleted ? (
            <Button
              onClick={handleRestore}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurar
            </Button>
          ) : (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}