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
import { Badge } from "@/components/ui/badge";
import { Eye, X, Calendar, User, FileText, AlertTriangle, Clock, Download } from "lucide-react";

import { useSancionesStore } from "@/store/sanciones.store";
import { TIPO_SANCION_LABELS, ESTADO_SANCION_COLORS } from "@/types/sancion.types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PDFLink } from "@/components/sanciones/pdf-viewer";

export function SancionViewDialog() {
  const { isViewDialogOpen, selectedSancion, closeViewDialog } = useSancionesStore();

  if (!selectedSancion) return null;



  const getEstadoBadge = (sancion: typeof selectedSancion) => {
    if (sancion.deleted_at) {
      return <Badge variant="destructive">Eliminada</Badge>;
    }

    const estadoClass = ESTADO_SANCION_COLORS[sancion.estado_sancion as keyof typeof ESTADO_SANCION_COLORS] || "text-gray-600 bg-gray-50";

    return (
      <Badge
        variant="outline"
        className={estadoClass}
      >
        {sancion.activa ? "Activa" : "Inactiva"}
      </Badge>
    );
  };

  return (
    <Dialog open={isViewDialogOpen} onOpenChange={closeViewDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalles de la Sanción
          </DialogTitle>
          <DialogDescription>
            Información completa de la sanción
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del funcionario */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Funcionario</h4>
            </div>
            <p className="text-blue-800 font-semibold">{selectedSancion.funcionario.nombre_completo}</p>
            <p className="text-blue-700 text-sm">
              Estado actual: {selectedSancion.funcionario.estado_funcionario}
            </p>
          </div>

          {/* Información de la sanción */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-medium">Tipo de Sanción:</span>
              </div>
              <Badge variant="outline" className="text-red-600 bg-red-50">
                {TIPO_SANCION_LABELS[selectedSancion.tipo_sancion] || selectedSancion.tipo_sancion}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Estado:</span>
              </div>
              {getEstadoBadge(selectedSancion)}
            </div>

            {selectedSancion.fecha_inicio && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Fecha de Inicio:</span>
                </div>
                <span className="text-gray-700">
                  {formatDate(selectedSancion.fecha_inicio)}
                </span>
              </div>
            )}

            {selectedSancion.fecha_fin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Fecha de Fin:</span>
                </div>
                <span className="text-gray-700">
                  {formatDate(selectedSancion.fecha_fin)}
                </span>
              </div>
            )}

            {selectedSancion.duracion_dias && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Duración:</span>
                </div>
                <span className="text-gray-700">
                  {selectedSancion.duracion_dias} días
                </span>
              </div>
            )}

            {selectedSancion.descripcion && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Descripción:</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedSancion.descripcion}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PDF de Respaldo */}
          {selectedSancion.pdf_respaldo_ruta && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-medium">PDF de Respaldo:</span>
              </div>
              <div className="flex items-center justify-center">
                <PDFLink
                  sancionId={selectedSancion.id}
                  pdfFileName={selectedSancion.pdf_respaldo_ruta.split('/').pop()}
                  className="text-blue-600 border-blue-200 hover:bg-blue-100"
                />
              </div>
            </div>
          )}

          {/* Información de auditoría */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Información de Auditoría</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Creada:</span>
                <p className="text-gray-700">
                  {formatDateTime(selectedSancion.created_at)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Última actualización:</span>
                <p className="text-gray-700">
                  {formatDateTime(selectedSancion.updated_at)}
                </p>
              </div>
              {selectedSancion.deleted_at && (
                <div className="col-span-2">
                  <span className="font-medium text-red-600">Eliminada:</span>
                  <p className="text-red-700">
                    {formatDateTime(selectedSancion.deleted_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={closeViewDialog}>
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}