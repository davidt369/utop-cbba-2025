'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getToken } from '@/store/auth.store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Importar react-pdf dinámicamente para evitar problemas de SSR
const Document = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Document })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96"><Loader2 className="h-6 w-6 animate-spin" /></div>
});

const Page = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Page })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96"><Loader2 className="h-6 w-6 animate-spin" /></div>
});

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

export function PDFViewer({ isOpen, onClose, pdfUrl, title = "Visualizar PDF" }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);

  // Configurar PDF.js cuando el componente se monte
  useEffect(() => {
    // Configurar PDF.js dinámicamente
    const configurePdf = async () => {
      if (typeof window !== 'undefined') {
        const { pdfjs } = await import('react-pdf');
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
        }
      }
    };

    configurePdf();
  }, []);

  // Cargar PDF con autenticación cuando se abre el viewer
  useEffect(() => {
    if (isOpen && pdfUrl && !pdfData) {
      const loadPdf = async () => {
        try {
          setLoading(true);
          setError(null);

          console.log('🔍 Cargando PDF desde:', pdfUrl);

          // Obtener el token usando la función oficial
          const token = getToken();

          console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
          console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'null');

          // Hacer fetch con autenticación
          const response = await fetch(pdfUrl, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Accept': 'application/pdf',
            },
          });

          console.log('📡 Respuesta del servidor:', response.status, response.statusText);
          console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            // Leer el cuerpo de la respuesta para ver el error
            const errorText = await response.text();
            console.log('❌ Cuerpo de error:', errorText);
            throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
          }

          // Convertir a blob y crear URL temporal
          const blob = await response.blob();
          console.log('📄 Blob creado, tamaño:', blob.size, 'bytes');

          const blobUrl = URL.createObjectURL(blob);
          console.log('🔗 URL temporal creada:', blobUrl);

          setPdfData(blobUrl);
          // El loading se establecerá a false en onDocumentLoadSuccess
        } catch (err) {
          console.error('❌ Error al cargar PDF:', err);
          setError(err instanceof Error ? err.message : 'Error al cargar el PDF');
          setLoading(false);
        }
      };

      loadPdf();
    }
  }, [isOpen, pdfUrl, pdfData]);

  // Limpiar blob URL cuando se cierre
  useEffect(() => {
    return () => {
      if (pdfData) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [pdfData]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('✅ PDF cargado exitosamente, páginas:', numPages);
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('❌ Error al cargar documento PDF:', error);
    setError('Error al cargar el PDF: ' + error.message);
    setLoading(false);
  }

  const goToPrevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPage => Math.min(prevPage + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  const downloadPDF = () => {
    if (pdfData) {
      const link = document.createElement('a');
      link.href = pdfData;
      link.download = `pdf-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetAndClose = () => {
    setPageNumber(1);
    setScale(1.0);
    setLoading(true);
    setError(null);
    if (pdfData) {
      URL.revokeObjectURL(pdfData);
      setPdfData(null);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Visualizador de PDF integrado
          </DialogDescription>
        </DialogHeader>

        {/* Controles */}
        <div className="flex items-center justify-between px-6 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1 || loading}
              size="sm"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Badge variant="secondary" className="px-3">
              {loading ? '...' : `${pageNumber} / ${numPages}`}
            </Badge>

            <Button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages || loading}
              size="sm"
              variant="outline"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={zoomOut}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Badge variant="outline" className="px-3">
              {Math.round(scale * 100)}%
            </Badge>

            <Button
              onClick={zoomIn}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button
              onClick={downloadPDF}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Descargar
            </Button>
          </div>
        </div>

        {/* Contenido del PDF */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Cargando PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center text-destructive">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && pdfData && (
            <div className="flex justify-center">
              <Document
                file={pdfData}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-96 text-destructive">
                    <div className="text-center">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm">Error al cargar el documento</p>
                    </div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  loading={
                    <div className="flex items-center justify-center h-96">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-96 text-destructive">
                      <div className="text-center">
                        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm">Error al cargar la página</p>
                      </div>
                    </div>
                  }
                />
              </Document>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para mostrar un botón/link de PDF
interface PDFLinkProps {
  ausenciaId: number;
  pdfFileName?: string;
  className?: string;
}

export function PDFLink({ ausenciaId, pdfFileName, className = "" }: PDFLinkProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  const pdfUrl = `${baseUrl}/auth/ausencias/${ausenciaId}/pdf`;
  const displayName = pdfFileName || `PDF-${ausenciaId}`;

  const downloadPDF = async () => {
    try {
      setIsDownloading(true);

      // Obtener el token usando la función oficial
      const token = getToken();

      if (!token) {
        alert('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        return;
      }

      // Hacer fetch con autenticación
      const response = await fetch(pdfUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
          return;
        }
        if (response.status === 404) {
          alert('El archivo PDF no fue encontrado.');
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Convertir a blob
      const blob = await response.blob();

      // Crear URL temporal y descargar
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = displayName.endsWith('.pdf') ? displayName : `${displayName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar URL temporal
      URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el PDF. Por favor, intenta nuevamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={downloadPDF}
      disabled={isDownloading}
      className={`text-blue-600 hover:text-blue-800 ${className}`}
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <FileText className="h-4 w-4 mr-1" />
      )}
      {isDownloading ? 'Descargando...' : displayName}
    </Button>
  );
}