"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, FileText, AlertCircle } from "lucide-react"

interface SimplePDFViewerProps {
    document: {
        title: string
        filename: string
    }
}

export function SimplePDFViewer({ document }: SimplePDFViewerProps) {
    const [iframeError, setIframeError] = useState(false)
    const pdfUrl = `/documentos/${document.filename}`

    const handleDownload = () => {
        const link = window.document.createElement('a')
        link.href = pdfUrl
        link.download = document.filename
        link.target = '_blank'
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
    }

    const handleOpenInNewTab = () => {
        window.open(pdfUrl, '_blank')
    }

    return (
        <div className="flex flex-col h-full">
            {/* Controls */}
            <div className="flex items-center justify-between gap-3 p-2 bg-muted rounded-md mb-1 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="font-medium text-xs truncate">{document.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{document.filename}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={handleDownload} className="h-7 px-2 text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        Descargar
                    </Button>
                    <Button variant="default" size="sm" onClick={handleOpenInNewTab} className="h-7 px-2 text-xs">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Abrir
                    </Button>
                </div>
            </div>

            {/* PDF Embed */}
            <div className="flex-1 min-h-0 overflow-hidden rounded-md border">
                {iframeError ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No se pudo cargar el PDF</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            El navegador no puede mostrar este PDF directamente.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Descargar
                            </Button>
                            <Button onClick={handleOpenInNewTab}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir en nueva ventana
                            </Button>
                        </div>
                    </div>
                ) : (
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title={document.title}
                        loading="lazy"
                        allow="fullscreen"
                        style={{ border: 'none' }}
                        onError={() => setIframeError(true)}
                    />
                )}
            </div>
        </div>
    )
}