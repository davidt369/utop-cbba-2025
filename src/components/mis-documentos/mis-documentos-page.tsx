'use client';

import { useState } from 'react';
import { FileText, Upload, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MisDocumentosStats } from './mis-documentos-stats';
import { MisDocumentosTable } from './mis-documentos-table';
import { SubirDocumento } from './subir-documento';
import { useMisDocumentos, useSubirDocumento } from '@/hooks/mis-documentos.queries';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '../ui/card';

type Vista = 'lista' | 'subir';

interface MisDocumentosPageProps {
  className?: string;
}

export function MisDocumentosPage({ className }: MisDocumentosPageProps) {
  const [vista, setVista] = useState<Vista>('lista');
  const [tipoDocumentoSeleccionado, setTipoDocumentoSeleccionado] = useState<string>('');

  const {
    data: documentosData,
    isLoading,
    error,
    refetch
  } = useMisDocumentos();

  const {
    mutateAsync: subirDocumento,
    isPending: isUploading,
    error: uploadError
  } = useSubirDocumento();

  const handleSubirDocumento = (tipo: string) => {
    setTipoDocumentoSeleccionado(tipo);
    setVista('subir');
  };

  const handleUpload = async (archivo: File, tipo: string) => {
    try {
      await subirDocumento({ archivo, tipo_documento: tipo });
      setVista('lista');
      setTipoDocumentoSeleccionado('');
      await refetch();
    } catch (error) {
      // Error manejado por el hook
      console.error('Error al subir documento:', error);
    }
  };

  const handleCancelarSubida = () => {
    setVista('lista');
    setTipoDocumentoSeleccionado('');
  };

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar los documentos: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {vista === 'subir' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelarSubida}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                <h1 className="text-xl sm:text-2xl font-bold">
                  {vista === 'lista' ? 'Mis Documentos' : `Subir ${tipoDocumentoSeleccionado}`}
                </h1>
              </div>
            </div>

            {vista === 'lista' && documentosData && documentosData.tipos_faltantes.length > 0 && (
              <Button
                onClick={() => handleSubirDocumento(documentosData.tipos_faltantes[0])}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            )}
          </div>

          {/* Error de subida */}
          {uploadError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                Error al subir el documento: {uploadError.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Contenido principal */}
          <div className="space-y-6">
            {vista === 'lista' && (
              <>
                {/* Estadísticas */}
                <MisDocumentosStats
                  estadisticas={documentosData?.estadisticas}
                  isLoading={isLoading}
                />

                {/* Tabla de documentos */}
                <MisDocumentosTable
                  documentos={documentosData?.data || []}
                  tiposFaltantes={documentosData?.tipos_faltantes || []}
                  isLoading={isLoading}
                  onSubirDocumento={handleSubirDocumento}
                />
              </>
            )}

            {vista === 'subir' && tipoDocumentoSeleccionado && (
              <SubirDocumento
                tipoDocumento={tipoDocumentoSeleccionado}
                onSubir={handleUpload}
                onCancelar={handleCancelarSubida}
                isUploading={isUploading}
              />
            )}
          </div>

          {/* Estado vacío mejorado */}
          {vista === 'lista' && !isLoading && documentosData &&
            documentosData.data.length === 0 && documentosData.tipos_faltantes.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-muted-foreground mb-2">
                  Sistema de documentos no disponible
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  No se pueden cargar los tipos de documentos requeridos
                </p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}