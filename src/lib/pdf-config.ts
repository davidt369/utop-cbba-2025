// Configuración para react-pdf
import { pdfjs } from "react-pdf";

// Configurar el worker de PDF.js solo en el cliente
export const configurePdfJs = () => {
  if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  }
};

// Configurar inmediatamente si está en el navegador
if (typeof window !== "undefined") {
  configurePdfJs();
}
