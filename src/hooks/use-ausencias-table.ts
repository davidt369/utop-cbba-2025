import { useMemo } from "react";
import { Ausencia } from "@/types/ausencia.types";
import useAusenciaStore from "@/store/ausencias.store";

export const useAusenciasTable = (ausencias: Ausencia[]) => {
  const {
    searchTerm,
    tipoFilter,
    estadoFilter,
    aprobadoFilter,
    showDeleted,
    currentPage,
    itemsPerPage,
    sortField,
    sortDirection,
  } = useAusenciaStore();

  // Filtrar ausencias
  const filteredAusencias = useMemo(() => {
    return ausencias.filter((ausencia) => {
      // Filtro por término de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesFuncionario = ausencia.funcionario?.nombre_completo
          ?.toLowerCase()
          .includes(searchLower);
        const matchesCarnet = ausencia.funcionario?.numero_carnet
          ?.toLowerCase()
          .includes(searchLower);
        const matchesMotivo = ausencia.motivo
          ?.toLowerCase()
          .includes(searchLower);
        const matchesDescripcion = ausencia.descripcion
          ?.toLowerCase()
          .includes(searchLower);

        if (
          !matchesFuncionario &&
          !matchesCarnet &&
          !matchesMotivo &&
          !matchesDescripcion
        ) {
          return false;
        }
      }

      // Filtro por tipo
      if (tipoFilter !== "todos" && ausencia.tipo_ausencia !== tipoFilter) {
        return false;
      }

      // Filtro por estado activo/inactivo
      if (estadoFilter === "activas" && !ausencia.activo) {
        return false;
      }
      if (estadoFilter === "inactivas" && ausencia.activo) {
        return false;
      }

      // Filtro por aprobación
      if (aprobadoFilter === "aprobadas" && !ausencia.aprobado) {
        return false;
      }
      if (aprobadoFilter === "pendientes" && ausencia.aprobado) {
        return false;
      }

      // Filtro por eliminados
      if (showDeleted) {
        // Si showDeleted es true, mostrar SOLO las eliminadas
        if (!ausencia.deleted_at) {
          return false;
        }
      } else {
        // Si showDeleted es false, mostrar SOLO las NO eliminadas
        if (ausencia.deleted_at) {
          return false;
        }
      }

      return true;
    });
  }, [
    ausencias,
    searchTerm,
    tipoFilter,
    estadoFilter,
    aprobadoFilter,
    showDeleted,
  ]);

  // Ordenar ausencias
  const sortedAusencias = useMemo(() => {
    const sorted = [...filteredAusencias].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "funcionario":
          aValue = a.funcionario?.nombre_completo || "";
          bValue = b.funcionario?.nombre_completo || "";
          break;
        case "tipo":
          aValue = a.tipo_ausencia;
          bValue = b.tipo_ausencia;
          break;
        case "fecha_inicio":
          aValue = new Date(a.fecha_inicio);
          bValue = new Date(b.fecha_inicio);
          break;
        case "fecha_fin":
          aValue = new Date(a.fecha_fin);
          bValue = new Date(b.fecha_fin);
          break;
        case "estado":
          aValue = a.activo ? 1 : 0;
          bValue = b.activo ? 1 : 0;
          break;
        case "aprobado":
          aValue = a.aprobado ? 1 : 0;
          bValue = b.aprobado ? 1 : 0;
          break;
        case "duracion":
          const calculateDays = (inicio: string, fin: string) => {
            const parseDate = (dateStr: string) => {
              if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = dateStr.split("-").map(Number);
                return new Date(year, month - 1, day);
              }
              return new Date(dateStr);
            };
            const start = parseDate(inicio);
            const end = parseDate(fin);
            return Math.ceil(
              Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            );
          };
          aValue = calculateDays(a.fecha_inicio, a.fecha_fin);
          bValue = calculateDays(b.fecha_inicio, b.fecha_fin);
          break;
        default:
          aValue = a.fecha_inicio;
          bValue = b.fecha_inicio;
      }

      // Manejo de valores null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === "asc" ? -1 : 1;
      if (bValue == null) return sortDirection === "asc" ? 1 : -1;

      // Comparación
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredAusencias, sortField, sortDirection]);

  // Paginación
  const totalItems = sortedAusencias.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAusencias = sortedAusencias.slice(startIndex, endIndex);

  // Información de paginación
  const paginationInfo = {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, totalItems),
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  return {
    ausencias: paginatedAusencias,
    filteredTotal: totalItems,
    paginationInfo,
  };
};
