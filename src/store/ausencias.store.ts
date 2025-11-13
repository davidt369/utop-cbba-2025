import { create } from "zustand";
import { Ausencia } from "@/types/ausencia.types";

interface AusenciaStore {
  // Estados para los diálogos
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;

  // Estado para la ausencia seleccionada
  selectedAusencia: Ausencia | null;

  // Estados para filtros
  showDeleted: boolean;
  searchTerm: string;
  tipoFilter: string;
  estadoFilter: string; // 'todos' | 'activas' | 'inactivas'
  aprobadoFilter: string; // 'todos' | 'aprobadas' | 'pendientes'

  // Estados para paginación
  currentPage: number;
  itemsPerPage: number;

  // Estados para ordenamiento
  sortField: string; // 'funcionario' | 'tipo' | 'fecha_inicio' | 'fecha_fin' | 'estado' | 'aprobado'
  sortDirection: "asc" | "desc";

  // Acciones para los diálogos
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  openEditDialog: (ausencia: Ausencia) => void;
  closeEditDialog: () => void;

  openDeleteDialog: (ausencia: Ausencia) => void;
  closeDeleteDialog: () => void;

  // Acciones para filtros
  setShowDeleted: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  setTipoFilter: (tipo: string) => void;
  setEstadoFilter: (estado: string) => void;
  setAprobadoFilter: (aprobado: string) => void;
  clearFilters: () => void;

  // Acciones para paginación
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: (totalPages: number) => void;

  // Acciones para ordenamiento
  setSortField: (field: string) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
  toggleSort: (field: string) => void;

  // Función para resetear todo el estado
  reset: () => void;
}

const useAusenciaStore = create<AusenciaStore>((set) => ({
  // Estados iniciales para los diálogos
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,

  // Estado inicial para la ausencia seleccionada
  selectedAusencia: null,

  // Estados iniciales para filtros
  showDeleted: false,
  searchTerm: "",
  tipoFilter: "todos",
  estadoFilter: "todos",
  aprobadoFilter: "todos",

  // Estados iniciales para paginación
  currentPage: 1,
  itemsPerPage: 10,

  // Estados iniciales para ordenamiento
  sortField: "fecha_inicio",
  sortDirection: "desc",

  // Acciones para los diálogos
  openCreateDialog: () =>
    set({
      isCreateDialogOpen: true,
      selectedAusencia: null,
    }),

  closeCreateDialog: () =>
    set({
      isCreateDialogOpen: false,
      selectedAusencia: null,
    }),

  openEditDialog: (ausencia: Ausencia) =>
    set({
      isEditDialogOpen: true,
      selectedAusencia: ausencia,
    }),

  closeEditDialog: () =>
    set({
      isEditDialogOpen: false,
      selectedAusencia: null,
    }),

  openDeleteDialog: (ausencia: Ausencia) =>
    set({
      isDeleteDialogOpen: true,
      selectedAusencia: ausencia,
    }),

  closeDeleteDialog: () =>
    set({
      isDeleteDialogOpen: false,
      selectedAusencia: null,
    }),

  // Acciones para filtros
  setShowDeleted: (show: boolean) => set({ showDeleted: show }),

  setSearchTerm: (term: string) =>
    set({
      searchTerm: term,
      currentPage: 1, // Reset pagination cuando cambia la búsqueda
    }),

  setTipoFilter: (tipo: string) =>
    set({
      tipoFilter: tipo,
      currentPage: 1, // Reset pagination cuando cambia el filtro
    }),

  setEstadoFilter: (estado: string) =>
    set({
      estadoFilter: estado,
      currentPage: 1, // Reset pagination cuando cambia el filtro
    }),

  setAprobadoFilter: (aprobado: string) =>
    set({
      aprobadoFilter: aprobado,
      currentPage: 1, // Reset pagination cuando cambia el filtro
    }),

  clearFilters: () =>
    set({
      searchTerm: "",
      tipoFilter: "todos",
      estadoFilter: "todos",
      aprobadoFilter: "todos",
      currentPage: 1, // Reset pagination cuando se limpian filtros
    }),

  // Acciones para paginación
  setCurrentPage: (page: number) => set({ currentPage: page }),

  setItemsPerPage: (items: number) =>
    set({
      itemsPerPage: items,
      currentPage: 1, // Reset a la primera página cuando cambia items por página
    }),

  nextPage: () =>
    set((state) => ({
      currentPage: state.currentPage + 1,
    })),

  prevPage: () =>
    set((state) => ({
      currentPage: Math.max(1, state.currentPage - 1),
    })),

  goToFirstPage: () => set({ currentPage: 1 }),

  goToLastPage: (totalPages: number) => set({ currentPage: totalPages }),

  // Acciones para ordenamiento
  setSortField: (field: string) =>
    set({
      sortField: field,
      currentPage: 1, // Reset pagination cuando cambia el ordenamiento
    }),

  setSortDirection: (direction: "asc" | "desc") =>
    set({
      sortDirection: direction,
      currentPage: 1, // Reset pagination cuando cambia el ordenamiento
    }),

  toggleSort: (field: string) =>
    set((state) => ({
      sortField: field,
      sortDirection:
        state.sortField === field && state.sortDirection === "asc"
          ? "desc"
          : "asc",
      currentPage: 1, // Reset pagination cuando cambia el ordenamiento
    })),

  // Función para resetear todo el estado
  reset: () =>
    set({
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      isDeleteDialogOpen: false,
      selectedAusencia: null,
      showDeleted: false,
      searchTerm: "",
      tipoFilter: "todos",
      estadoFilter: "todos",
      aprobadoFilter: "todos",
      currentPage: 1,
      itemsPerPage: 10,
      sortField: "fecha_inicio",
      sortDirection: "desc",
    }),
}));

export default useAusenciaStore;
