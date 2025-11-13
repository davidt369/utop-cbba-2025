"use client"

import { useState, useMemo } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Use compatible worker configuration - match the API version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
  document: {
    title: string
    filename: string
  }
}

export function PDFViewer({ document }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize options to prevent unnecessary reloads
  const options = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  }), [])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  function onDocumentLoadError(error: Error) {
    setError(error.message)
    setLoading(false)
    console.error('Error loading PDF:', error)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            Página {pageNumber} de {numPages || "..."}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((prev) => Math.min(numPages, prev + 1))}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto bg-muted/50 rounded-lg p-4">
        <div className="flex justify-center">
          <Document
            file={`/documentos/${document.filename}`}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            options={options}
            loading={
              <div className="flex flex-col items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                <p className="mt-4 text-sm text-muted-foreground">Cargando documento...</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">Error al cargar el documento</p>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-4">
                  {error || "No se pudo cargar el archivo PDF. Verifica que el archivo existe y es válido."}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Archivo: <code className="bg-muted px-2 py-1 rounded">{document.filename}</code>
                </p>
                <Button
                  onClick={() => window.open(`/documentos/${document.filename}`, '_blank')}
                  className="mt-2"
                  variant="outline"
                >
                  Abrir en nueva ventana
                </Button>
              </div>
            }
          >
            <Page pageNumber={pageNumber} scale={scale} renderTextLayer={true} renderAnnotationLayer={true} />
          </Document>
        </div>
      </div>
    </div>
  )
}

function FileText({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
