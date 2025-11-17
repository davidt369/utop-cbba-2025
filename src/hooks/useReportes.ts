import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";

export interface ReporteConfig {
  url: string;
  filename: string;
  tipo: "pdf" | "excel";
}

export const useReportes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Actualizado para incluir faltasDisciplinarias y comisiones

  const downloadReport = async (config: ReporteConfig) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

      // Construir URL sin token para testing
      const fullUrl = `${apiUrl}${config.url}`;
      // Intentar descargar como blob para no navegar lejos de la página
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = config.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      return true;
    } catch (error) {
      console.error("Error al descargar reporte:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Métodos de conveniencia para diferentes tipos de reportes
  const reportes = {
    dashboard: {
      pdf: () =>
        downloadReport({
          url: "/reportes/dashboard/pdf",
          filename: `dashboard_general_${
            new Date().toISOString().split("T")[0]
          }.pdf`,
          tipo: "pdf",
        }),
      excel: () =>
        downloadReport({
          url: "/reportes/estadisticas/excel",
          filename: `estadisticas_generales_${
            new Date().toISOString().split("T")[0]
          }.xlsx`,
          tipo: "excel",
        }),
    },
    funcionarios: {
      pdf: (estado: string = "todos") =>
        downloadReport({
          url: `/reportes/funcionarios/pdf/${estado}`,
          filename: `funcionarios_${estado}_${
            new Date().toISOString().split("T")[0]
          }.pdf`,
          tipo: "pdf",
        }),
      excel: (estado: string = "todos") =>
        downloadReport({
          url: `/reportes/funcionarios/excel/${estado}`,
          filename: `funcionarios_${estado}_${
            new Date().toISOString().split("T")[0]
          }.xlsx`,
          tipo: "excel",
        }),
    },
    ausencias: {
      pdf: (estado: string = "pendientes") =>
        downloadReport({
          url: `/reportes/ausencias/pdf/${estado}`,
          filename: `ausencias_${estado}_${
            new Date().toISOString().split("T")[0]
          }.pdf`,
          tipo: "pdf",
        }),
      excel: (estado: string = "pendientes") =>
        downloadReport({
          url: `/reportes/ausencias/excel/${estado}`,
          filename: `ausencias_${estado}_${
            new Date().toISOString().split("T")[0]
          }.xlsx`,
          tipo: "excel",
        }),
    },
    sanciones: {
      pdf: (estado: string = "activas") =>
        downloadReport({
          url: `/reportes/sanciones/pdf/${estado}`,
          filename: `sanciones_${estado}_${
            new Date().toISOString().split("T")[0]
          }.pdf`,
          tipo: "pdf",
        }),
      excel: (estado: string = "activas") =>
        downloadReport({
          url: `/reportes/sanciones/excel/${estado}`,
          filename: `sanciones_${estado}_${
            new Date().toISOString().split("T")[0]
          }.xlsx`,
          tipo: "excel",
        }),
    },
    faltasDisciplinarias: {
      pdf: (estado: string = "activas") =>
        downloadReport({
          url: `/reportes/faltas-disciplinarias/pdf/${estado}`,
          filename: `faltas_disciplinarias_${estado}_${
            new Date().toISOString().split("T")[0]
          }.pdf`,
          tipo: "pdf",
        }),
      excel: (estado: string = "activas") =>
        downloadReport({
          url: `/reportes/faltas-disciplinarias/excel/${estado}`,
          filename: `faltas_disciplinarias_${estado}_${
            new Date().toISOString().split("T")[0]
          }.xlsx`,
          tipo: "excel",
        }),
    },
    comisiones: {
      pdf: (estado: string = "activas") =>
        downloadReport({
          url: `/reportes/comisiones/pdf/${estado}`,
          filename: `comisiones_${estado}_${
            new Date().toISOString().split("T")[0]
          }.pdf`,
          tipo: "pdf",
        }),
      excel: (estado: string = "activas") =>
        downloadReport({
          url: `/reportes/comisiones/excel/${estado}`,
          filename: `comisiones_${estado}_${
            new Date().toISOString().split("T")[0]
          }.xlsx`,
          tipo: "excel",
        }),
    },
  };

  return {
    downloadReport,
    reportes,
    loading,
    error,
  };
};
