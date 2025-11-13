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
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { useFaltaDisciplinariaStore } from "@/store/falta-disciplinaria.store";
import { useDeleteFaltaDisciplinaria } from "@/hooks/falta-disciplinaria.queries";

export function FaltaDisciplinariaDeleteDialog() {
  const { isDeleteDialogOpen, selectedFalta, closeDeleteDialog } = useFaltaDisciplinariaStore();
  const deleteFaltaMutation = useDeleteFaltaDisciplinaria();

  const handleDelete = () => {
    if (!selectedFalta) return;

    deleteFaltaMutation.mutate(selectedFalta.id, {
      onSuccess: () => {
        closeDeleteDialog();
      },
    });
  };

  const handleClose = () => {
    closeDeleteDialog();
  };

  if (!selectedFalta) return null;

  // Función para parsear fecha de manera robusta
  const formatDateFromString = (dateString: string | Date | undefined): string => {
    if (!dateString) return "Fecha no disponible";
    
    try {
      let date: Date;
      
      // Si ya es un objeto Date
      if (dateString instanceof Date) {
        date = dateString;
      }
      // Si es formato YYYY-MM-DD
      else if (typeof dateString === 'string' && dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      }
      // Otros formatos
      else {
        date = new Date(dateString);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Eliminar Falta Disciplinaria
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                ¿Estás seguro de que deseas eliminar esta falta disciplinaria? Esta acción no se puede deshacer.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="font-semibold">Funcionario:</span>{" "}
                    {selectedFalta.funcionario.nombre_completo}
                  </div>
                  <div>
                    <span className="font-semibold">Tipo de Gravedad:</span>{" "}
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedFalta.tipo_gravedad === "Leve" 
                        ? "bg-green-100 text-green-800"
                        : selectedFalta.tipo_gravedad === "Grave"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {selectedFalta.tipo_gravedad}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Fecha:</span>{" "}
                    {formatDateFromString(selectedFalta.fecha_falta)}
                  </div>
                  <div>
                    <span className="font-semibold">Descripción:</span>
                    <p className="mt-1 text-gray-600 text-xs max-h-20 overflow-y-auto">
                      {selectedFalta.descripcion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteFaltaMutation.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {deleteFaltaMutation.error.message}
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleClose}
            disabled={deleteFaltaMutation.isPending}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteFaltaMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteFaltaMutation.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}