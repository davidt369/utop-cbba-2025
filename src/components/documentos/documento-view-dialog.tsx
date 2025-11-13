"use client";

import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Download, User, FileText, MapPin, Camera, Check, X, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { useDocumentoStore } from "@/store/documento.store";
import type { TipoDocumento } from "@/types/documento.types";

// Mapeo de iconos por tipo de documento
const getIconByTipo = (tipo: TipoDocumento) => {
  const iconClass = "h-6 w-6";
  switch (tipo) {
    case 'Foto de perfil':
      return <User className={iconClass} />;
    case 'Memorandum destino':
      return <FileText className={iconClass} />;
    case 'Foto ubicación / croquis':
      return <MapPin className={iconClass} />;
    case 'Foto AVC04':
      return <Camera className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
};

// Mapeo de colores por tipo de documento
const getColorByTipo = (tipo: TipoDocumento) => {
  switch (tipo) {
    case 'Foto de perfil':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Memorandum destino':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Foto ubicación / croquis':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Foto AVC04':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function DocumentoViewDialog() {
  const { isViewDialogOpen, closeViewDialog, selectedDocumento } = useDocumentoStore();

  if (!selectedDocumento) return null;

  const isDeleted = !!selectedDocumento.deleted_at;

  // Función para descargar la imagen directamente
  const handleDownload = async () => {
    if (!selectedDocumento.url_archivo) return;
    
    try {
      const response = await fetch(selectedDocumento.url_archivo);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generar nombre de archivo basado en el documento
      const extension = selectedDocumento.url_archivo.split('.').pop() || 'jpg';
      const fileName = `${selectedDocumento.tipo_documento.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDocumento.funcionario.nombre_completo.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
      // Fallback: abrir en nueva ventana
      window.open(selectedDocumento.url_archivo, '_blank');
    }
  };

  return (
    <Dialog open={isViewDialogOpen} onOpenChange={closeViewDialog}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalles del Documento</DialogTitle>
          <DialogDescription>
            Información completa del documento seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tipo de documento */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getColorByTipo(selectedDocumento.tipo_documento)} flex-shrink-0`}>
              {getIconByTipo(selectedDocumento.tipo_documento)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{selectedDocumento.tipo_documento}</h3>
              <p className="text-sm text-muted-foreground">Tipo de documento</p>
            </div>
          </div>

          <Separator />

          {/* Grid responsive para información principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda - Información básica */}
            <div className="space-y-6">
              {/* Información del funcionario */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Funcionario
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  {selectedDocumento.funcionario.nombre_completo}
                </p>
              </div>

              {/* Estados */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Estado de Aprobación</h4>
                  <div className="flex items-center space-x-2">
                    {selectedDocumento.aprobado ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Aprobado
                        </Badge>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-yellow-600" />
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Pendiente
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                {isDeleted && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Estado del Documento</h4>
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                      Eliminado
                    </Badge>
                  </div>
                )}
              </div>

              {/* Fechas */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Fecha de Creación</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                    {format(new Date(selectedDocumento.created_at), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Última Actualización</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                    {format(new Date(selectedDocumento.updated_at), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>

                {isDeleted && selectedDocumento.deleted_at && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-red-600">Fecha de Eliminación</h4>
                    <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
                      {format(new Date(selectedDocumento.deleted_at), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha - Archivo/Imagen */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Imagen del Documento
              </h4>
              
              {selectedDocumento.tiene_archivo && selectedDocumento.url_archivo ? (
                <div className="space-y-4">
                  {/* Previsualización de la imagen */}
                  <div className="relative w-full">
                    <div className="aspect-square w-full max-w-sm mx-auto">
                      <img
                        src={selectedDocumento.url_archivo}
                        alt={`${selectedDocumento.tipo_documento} - ${selectedDocumento.funcionario.nombre_completo}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => window.open(selectedDocumento.url_archivo!, '_blank')}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.image-fallback')) {
                            target.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'w-full h-full bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200 image-fallback';
                            fallback.innerHTML = `
                              <div class="text-center p-4">
                                <svg class="h-12 w-12 text-gray-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                                </svg>
                                <p class="text-sm text-gray-500">Error al cargar la imagen</p>
                              </div>
                            `;
                            parent.appendChild(fallback);
                          } else if (parent) {
                            target.style.display = 'none';
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Haz clic en la imagen para verla en tamaño completo
                    </p>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedDocumento.url_archivo!, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square w-full max-w-sm mx-auto bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <div className="text-center p-6">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">
                      No hay imagen disponible
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Este documento no tiene una imagen asociada
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={closeViewDialog} className="w-full sm:w-auto">
            Cerrar
          </Button>
          {selectedDocumento.url_archivo && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* <Button 
                onClick={handleDownload}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Imagen
              </Button> */}
              <Button 
                variant="outline" 
                onClick={() => window.open(selectedDocumento.url_archivo!, '_blank')}
                className="w-full sm:w-auto"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver en Nueva Ventana
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}